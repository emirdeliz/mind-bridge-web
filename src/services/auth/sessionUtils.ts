import type { UserAuthViewDto, UserRole } from '@api';

const isUserRole = (value: unknown): value is UserRole =>
  value === 'patient' || value === 'psychologist';

/** Ensures SSR/client session objects always have role + profile before use in the UI. */
export const normalizeSession = (
  value: UserAuthViewDto | null | undefined
): UserAuthViewDto | null => {
  if (!value?.id || !value.email || !isUserRole(value.role)) {
    return null;
  }

  const profile = value.profile ?? {
    fullName: '',
    age: '',
    address: '',
    phone: '',
    language: 'pt' as const,
  };

  return {
    id: value.id,
    email: value.email,
    role: value.role,
    provider: value.provider ?? 'password',
    isAdmin: value.isAdmin ?? false,
    profile: {
      fullName: profile.fullName ?? '',
      age: profile.age ?? '',
      address: profile.address ?? '',
      phone: profile.phone ?? '',
      language: profile.language ?? 'pt',
    },
  };
};
