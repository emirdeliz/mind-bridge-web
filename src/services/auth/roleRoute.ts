import type { UserRole } from "@api";

export const getRoleRoute = (role: UserRole): string =>
  role === 'psychologist' ? '/psychologist/patients' : '/patient';

export const getProfileRoute = (role: UserRole): string => `${getRoleRoute(role)}/profile`;
