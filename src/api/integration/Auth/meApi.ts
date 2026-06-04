import type { AppLanguage, UserProfile, UserRole } from '@api';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type MeProfileResponse = {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  age: string | null;
  address: string | null;
  phone: string | null;
  language: AppLanguage | null;
};

type MeResponse = {
  id: string;
  email: string;
  role: UserRole;
  profile: MeProfileResponse | null;
};

/** Browser-only; session is loaded via /api/auth/session on the server. */
export const fetchMeApi = async () => {
  const response = await apiRequest<MeResponse>('/me');
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
