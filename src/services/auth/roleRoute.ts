import type { UserRole } from "@api";

export const getRoleRoute = (role: UserRole | null | undefined): string => {
  if (role === "psychologist") {
    return "/psychologist/patients";
  }
  return "/patient";
};

export const getProfileRoute = (role: UserRole): string => {
  if (role === "psychologist") {
    return "/psychologist/profile";
  }
  return "/patient/profile";
};

export const getBillingRoute = (role: UserRole): string | null => {
  if (role === "psychologist") {
    return "/psychologist/billing";
  }
  return null;
};

export const getPatientPaymentsRoute = (role: UserRole): string | null => {
  if (role === "psychologist") {
    return "/psychologist/patient-payments";
  }
  return null;
};

export const getSchedulingRoute = (role: UserRole): string | null => {
  if (role === "psychologist") {
    return "/psychologist/scheduling";
  }
  return null;
};
