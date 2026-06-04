import {
  type UserAuthSaveOrUpdateDto,
  type UserAuthViewDto,
  type UserProfile,
  type UserRole,
} from '@api';
import { isAuthBypassEnabled } from '../../../services/auth/authBypass';

type AuthSessionResponse = {
  session: UserAuthViewDto | null;
};

type AuthMutationResponse = {
  session: UserAuthViewDto;
};

type PasswordResetResponse = {
  ok: boolean;
  message?: string;
};

const authFetch = async <T>(
  path: string,
  init?: RequestInit
): Promise<T | null> => {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return null as T;
  }

  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? payload.message ?? 'Request failed');
  }

  return payload;
};

export const loginWithPasswordApi = async (
  email: string,
  password: string
): Promise<UserAuthViewDto | null> => {
  try {
    const data = await authFetch<AuthMutationResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data?.session ?? null;
  } catch {
    return null;
  }
};

export const registerUserApi = async (
  payload: UserAuthSaveOrUpdateDto
): Promise<UserAuthViewDto> => {
  const data = await authFetch<AuthMutationResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!data?.session) {
    throw new Error('Registration failed');
  }

  return data.session;
};

export const getSessionApi = async (): Promise<UserAuthViewDto | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const data = await authFetch<AuthSessionResponse>('/api/auth/session', {
    method: 'GET',
  });

  return data?.session ?? null;
};

export const saveProfileApi = async (
  profile: UserProfile
): Promise<UserAuthViewDto | null> => {
  try {
    const data = await authFetch<AuthMutationResponse>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
    return data?.session ?? null;
  } catch {
    return null;
  }
};

export const requestPasswordResetApi = async (
  email: string
): Promise<{ ok: boolean; message?: string }> => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { ok: false, message: 'Email is required' };
  }

  if (isAuthBypassEnabled()) {
    return { ok: false, message: 'Password reset is not available in demo mode' };
  }

  try {
    const data = await authFetch<PasswordResetResponse>('/api/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email: trimmed }),
    });
    return data ?? { ok: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return { ok: false, message };
  }
};

export const logoutApi = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }
  await authFetch('/api/auth/logout', { method: 'POST' });
};

export const enterBypassApi = async (role: UserRole): Promise<UserAuthViewDto> => {
  const data = await authFetch<AuthMutationResponse>('/api/auth/bypass', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });

  if (!data?.session) {
    throw new Error('Bypass failed');
  }

  return data.session;
};
