import type { UserRole } from "@api";

export const getRoleRoute = (role: UserRole): string =>
  role === "psychologist" ? "/psychologist" : "/patient";
