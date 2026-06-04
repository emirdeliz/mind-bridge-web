import type { UserAuthViewDto, UserProfile } from '@api';
import { keysToCamel } from '@helpers';

import { serverApiRequest } from '../http/serverApiRequest';

type MeProfileResponse = {
  id: string;
  email: string;
  role: UserAuthViewDto['role'];
  fullName: string | null;
  age: string | null;
  address: string | null;
  phone: string | null;
  language: UserProfile['language'] | null;
};

type MeResponse = {
  id: string;
  email: string;
  role: UserAuthViewDto['role'];
  profile: MeProfileResponse | null;
};

export const fetchMeFromToken = async (accessToken: string) => {
  const response = await serverApiRequest<MeResponse>('/me', { accessToken });
  const data = keysToCamel<MeResponse>(response);
  const profileRow = data.profile;

  const profile: UserProfile = {
    fullName: profileRow?.fullName ?? '',
    age: profileRow?.age ?? '',
    address: profileRow?.address ?? '',
    phone: profileRow?.phone ?? '',
    language: profileRow?.language ?? 'pt',
  };

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    profile,
  };
};

export const buildUserAuthView = async (
  accessToken: string
): Promise<UserAuthViewDto | null> => {
  try {
    const me = await fetchMeFromToken(accessToken);
    return {
      id: me.id,
      email: me.email,
      role: me.role,
      provider: 'password',
      profile: me.profile,
    };
  } catch {
    return null;
  }
};

/** Safe for JSON props and /api/auth/session — never includes accessToken. */
export const toPublicSession = (session: UserAuthViewDto): UserAuthViewDto => ({
  id: session.id,
  email: session.email,
  role: session.role,
  provider: session.provider,
  profile: session.profile,
});
