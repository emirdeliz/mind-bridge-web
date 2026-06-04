import type { SupabaseClient } from '@supabase/supabase-js';

import type { UserAuthViewDto, UserProfile, UserRole } from '@api';

type ProfileRow = {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  age: string | null;
  address: string | null;
  phone: string | null;
  language: UserProfile['language'] | null;
};

const mapProfileRow = (row: ProfileRow): UserProfile => ({
  fullName: row.full_name ?? '',
  age: row.age ?? '',
  address: row.address ?? '',
  phone: row.phone ?? '',
  language: row.language ?? 'pt',
});

const isUserRole = (value: unknown): value is UserRole =>
  value === 'patient' || value === 'psychologist';

/** Loads session from Supabase Auth + profiles (no mind-bridge-be required). */
export const buildUserAuthViewFromSupabase = async (
  supabase: SupabaseClient,
  accessToken: string
): Promise<UserAuthViewDto | null> => {
  const { data: userData, error: userError } =
    await supabase.auth.getUser(accessToken);

  if (userError || !userData.user?.id || !userData.user.email) {
    return null;
  }

  const { data: row, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, age, address, phone, language')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError || !row || !isUserRole(row.role)) {
    return null;
  }

  const profile = mapProfileRow(row as ProfileRow);

  return {
    id: userData.user.id,
    email: userData.user.email,
    role: row.role,
    provider: 'password',
    profile,
  };
};

/** @deprecated Use buildUserAuthViewFromSupabase — kept as alias for auth routes. */
export const buildUserAuthView = async (
  supabase: SupabaseClient,
  accessToken: string
): Promise<UserAuthViewDto | null> =>
  buildUserAuthViewFromSupabase(supabase, accessToken);

/** Safe for JSON props and /api/auth/session — never includes accessToken. */
export const toPublicSession = (session: UserAuthViewDto): UserAuthViewDto => ({
  id: session.id,
  email: session.email,
  role: session.role,
  provider: session.provider,
  profile: session.profile,
});
