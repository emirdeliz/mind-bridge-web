import {
  type AuthProvider,
  type UserAuthSaveOrUpdateDto,
  type UserAuthViewDto,
  type UserProfile,
  type UserRole,
} from '@api';
import { phoneDigits } from '@helpers';
import { fetchMeApi } from './meApi';
import { getSupabaseClient } from '../supabaseClient';
import { isAuthBypassEnabled } from '../../../services/auth/authBypass';

const USERS_KEY = 'mindbridge.users';
const SESSION_KEY = 'mindbridge.session';

const providerMockData: Record<
  Exclude<AuthProvider, 'password'>,
  Omit<UserProfile, 'age'> & { age?: string; emailHint: string }
> = {
  google: {
    fullName: 'Google User',
    address: 'Address from Google',
    phone: '+55 11 99999-0001',
    age: '30',
    emailHint: 'google.user@mindbridge.app',
  },
  facebook: {
    fullName: 'Facebook User',
    address: 'Address from Facebook',
    phone: '+55 11 99999-0002',
    age: '30',
    emailHint: 'facebook.user@mindbridge.app',
  },
};

const getUsers = (): UserAuthViewDto[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]') as UserAuthViewDto[];
};

const saveUsers = (users: UserAuthViewDto[]): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const persistSession = (session: UserAuthViewDto): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const buildSessionFromSupabase = async (
  accessToken: string
): Promise<UserAuthViewDto | null> => {
  const me = await fetchMeApi(accessToken);
  return {
    id: me.id,
    email: me.email,
    role: me.role,
    provider: 'password',
    profile: me.profile,
    accessToken,
  };
};

export const loginWithPasswordApi = async (
  email: string,
  password: string
): Promise<UserAuthViewDto | null> => {
  if (isAuthBypassEnabled()) {
    const users = getUsers();
    const found = users.find((user) => user.email === email);
    if (!found || password.trim().length < 4) return null;
    persistSession(found);
    return found;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session?.access_token) {
    return null;
  }

  try {
    const session = await buildSessionFromSupabase(data.session.access_token);
    if (!session) return null;
    persistSession(session);
    return session;
  } catch {
    await supabase.auth.signOut();
    return null;
  }
};

export const loginWithProviderApi = async (
  provider: Exclude<AuthProvider, 'password'>,
  role: UserAuthViewDto['role']
): Promise<UserAuthViewDto> => {
  const users = getUsers();
  const mocked = providerMockData[provider];
  const existing = users.find(
    (item) => item.email === mocked.emailHint && item.role === role
  );
  if (existing) {
    persistSession(existing);
    return existing;
  }

  const created: UserAuthViewDto = {
    id: crypto.randomUUID(),
    email: mocked.emailHint,
    role,
    provider,
    profile: {
      fullName: mocked.fullName,
      age: mocked.age ?? '',
      address: mocked.address,
      phone: mocked.phone,
      language: 'pt',
    },
  };
  saveUsers([...users, created]);
  persistSession(created);
  return created;
};

export const registerUserApi = async (
  payload: UserAuthSaveOrUpdateDto
): Promise<UserAuthViewDto> => {
  if (isAuthBypassEnabled()) {
    const users = getUsers();
    const created: UserAuthViewDto = {
      id: crypto.randomUUID(),
      email: payload.email,
      role: payload.role,
      provider: payload.provider,
      profile: {
        fullName: '',
        age: '',
        address: '',
        phone: phoneDigits(payload.phone),
        language: 'pt',
      },
    };

    saveUsers([...users, created]);
    persistSession(created);
    return created;
  }

  const supabase = getSupabaseClient();
  const password = payload.password?.trim();

  if (!password) {
    throw new Error('Password is required');
  }

  const normalizedPhone = phoneDigits(payload.phone);

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password,
    options: {
      data: { role: payload.role, phone: normalizedPhone },
    },
  });

  if (error || !data.session?.access_token || !data.user?.id) {
    throw new Error(error?.message ?? 'Registration failed');
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      phone: normalizedPhone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const session = await buildSessionFromSupabase(data.session.access_token);
  if (!session) {
    throw new Error('Failed to load user profile after registration');
  }
  persistSession(session);
  return session;
};

export const getSessionApi = async (): Promise<UserAuthViewDto | null> => {
  if (typeof window === 'undefined') return null;

  if (isAuthBypassEnabled()) {
    return JSON.parse(
      window.localStorage.getItem(SESSION_KEY) ?? 'null'
    ) as UserAuthViewDto | null;
  }

  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }

  try {
    const session = await buildSessionFromSupabase(accessToken);
    if (!session) {
      await supabase.auth.signOut();
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    persistSession(session);
    return session;
  } catch {
    await supabase.auth.signOut();
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const saveProfileApi = async (
  profile: UserProfile
): Promise<UserAuthViewDto | null> => {
  const session = await getSessionApi();
  if (!session) return null;

  if (isAuthBypassEnabled()) {
    const users = getUsers().map((user) =>
      user.id === session.id ? { ...user, profile: { ...profile } } : user
    );
    saveUsers(users);
    const updated = users.find((user) => user.id === session.id) ?? null;
    if (updated) {
      persistSession(updated);
    }
    return updated;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: profile.fullName,
      age: profile.age,
      address: profile.address,
      phone: profile.phone,
      language: profile.language ?? 'pt',
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.id);

  if (error) {
    return null;
  }

  const refreshed = await buildSessionFromSupabase(session.accessToken!);
  if (!refreshed) {
    return null;
  }
  persistSession(refreshed);
  return refreshed;
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

  const supabase = getSupabaseClient();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
    redirectTo,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
};

export const logoutApi = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);

  if (!isAuthBypassEnabled()) {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  }
};
