import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type {
  UserAuthSaveOrUpdateDto,
  UserAuthViewDto,
  UserProfile,
  UserRole,
} from "@api";
import {
  enterBypassApi,
  getSessionApi,
  loginWithPasswordApi,
  logoutApi,
  registerUserApi,
  requestPasswordResetApi,
  saveProfileApi,
} from "@api";
import { isAuthBypassEnabled } from "./authBypass";
import { normalizeSession } from "@helpers";

export type AuthPageProps = {
  session: UserAuthViewDto | null;
  loading: boolean;
};

type AuthContextValue = {
  session: UserAuthViewDto | null;
  loading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<UserAuthViewDto | null>;
  /** Self-service signup at /register only — clears session; do not use for psychologist patient modal. */
  registerPublicAccount: (payload: UserAuthSaveOrUpdateDto) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<UserAuthViewDto | null>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; message?: string }>;
  refreshSession: () => Promise<void>;
  enterBypass: (role: UserRole) => Promise<UserAuthViewDto>;
  isAuthBypassEnabled: typeof isAuthBypassEnabled;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialAuth?: AuthPageProps;
};

export const AuthProvider = ({ children, initialAuth }: AuthProviderProps) => {
  const hydratedFromPageProps = useRef(false);

  const [session, setSession] = useState<UserAuthViewDto | null>(() =>
    normalizeSession(initialAuth?.session)
  );
  const [loading, setLoading] = useState(initialAuth?.loading ?? true);

  useEffect(() => {
    if (initialAuth === undefined || hydratedFromPageProps.current) {
      return;
    }
    hydratedFromPageProps.current = true;
    setLoading(initialAuth.loading);
    const next = normalizeSession(initialAuth.session);
    if (next) {
      setSession(next);
    } else if (!initialAuth.loading) {
      setSession(null);
    }
  }, [initialAuth]);

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const refreshSession = useCallback(async () => {
    if (sessionRef.current === null) {
      setLoading(true);
    }
    const currentSession = normalizeSession(await getSessionApi());
    setSession(currentSession);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialAuth === undefined) {
      void refreshSession();
    }
  }, [initialAuth, refreshSession]);

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const loggedUser = normalizeSession(await loginWithPasswordApi(email, password));
    setSession(loggedUser);
    return loggedUser;
  }, []);

  const registerPublicAccount = useCallback(async (payload: UserAuthSaveOrUpdateDto) => {
    await registerUserApi(payload);
    await logoutApi();
    setSession(null);
  }, []);

  const saveProfile = useCallback(async (profile: UserProfile) => {
    const updated = normalizeSession(await saveProfileApi(profile));
    if (updated) {
      setSession(updated);
    }
    return updated;
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return requestPasswordResetApi(email);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setSession(null);
  }, []);

  const enterBypass = useCallback(async (role: UserRole) => {
    const user = normalizeSession(await enterBypassApi(role));
    if (!user) {
      throw new Error("Bypass session is invalid");
    }
    setSession(user);
    return user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      loginWithPassword,
      registerPublicAccount,
      saveProfile,
      logout,
      requestPasswordReset,
      refreshSession,
      enterBypass,
      isAuthBypassEnabled,
    }),
    [
      session,
      loading,
      loginWithPassword,
      registerPublicAccount,
      saveProfile,
      logout,
      requestPasswordReset,
      refreshSession,
      enterBypass,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
