import type { UserRole } from "@api";

export const getRoleRoute = (role: UserRole | null | undefined): string => {
  if (role === "psychologist") {
    return "/psychologist/patients";
  }
  return "/patient";
};

export const getProfileRoute = (role: UserRole): string => `${getRoleRoute(role)}/profile`;
