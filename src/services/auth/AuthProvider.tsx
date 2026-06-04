import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

export type AuthPageProps = {
  session: UserAuthViewDto | null;
  loading: boolean;
};

type AuthContextValue = {
  session: UserAuthViewDto | null;
  loading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<UserAuthViewDto | null>;
  registerUser: (payload: UserAuthSaveOrUpdateDto) => Promise<UserAuthViewDto>;
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
  const [session, setSession] = useState<UserAuthViewDto | null>(
    initialAuth?.session ?? null
  );
  const [loading, setLoading] = useState(initialAuth?.loading ?? true);

  useEffect(() => {
    if (initialAuth) {
      setSession(initialAuth.session);
      setLoading(initialAuth.loading);
    }
  }, [initialAuth]);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    const currentSession = await getSessionApi();
    setSession(currentSession);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialAuth === undefined) {
      void refreshSession();
    }
  }, [initialAuth, refreshSession]);

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const loggedUser = await loginWithPasswordApi(email, password);
    setSession(loggedUser);
    return loggedUser;
  }, []);

  const registerUser = useCallback(async (payload: UserAuthSaveOrUpdateDto) => {
    const createdUser = await registerUserApi(payload);
    setSession(createdUser);
    return createdUser;
  }, []);

  const saveProfile = useCallback(async (profile: UserProfile) => {
    const updated = await saveProfileApi(profile);
    setSession(updated);
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
    const user = await enterBypassApi(role);
    setSession(user);
    return user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      loginWithPassword,
      registerUser,
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
      registerUser,
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
