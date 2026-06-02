import { useCallback, useEffect, useState } from "react";

import type {
  AuthProvider,
  UserAuthSaveOrUpdateDto,
  UserAuthViewDto,
  UserProfile,
  UserRole,
} from "@api/dto/auth/AuthDto";
import {
  getSessionApi,
  loginWithPasswordApi,
  loginWithProviderApi,
  logoutApi,
  registerUserApi,
  saveProfileApi,
} from "@api/integration/Auth/AuthApi";

export const useAuth = () => {
  const [session, setSession] = useState<UserAuthViewDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    const currentSession = await getSessionApi();
    setSession(currentSession);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const loggedUser = await loginWithPasswordApi(email, password);
    setSession(loggedUser);
    return loggedUser;
  }, []);

  const loginWithProvider = useCallback(async (provider: Exclude<AuthProvider, "password">, role: UserRole) => {
    const loggedUser = await loginWithProviderApi(provider, role);
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

  const logout = useCallback(async () => {
    await logoutApi();
    setSession(null);
  }, []);

  return {
    session,
    loading,
    loginWithPassword,
    loginWithProvider,
    registerUser,
    saveProfile,
    logout,
    refreshSession,
  };
};
