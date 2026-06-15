export type UserRole = "patient" | "psychologist";
export type AuthProvider = "password" | "google" | "facebook";
export type AppLanguage = "en" | "es" | "pt";

export interface UserProfile {
  fullName: string;
  age: string;
  address: string;
  phone: string;
  language?: AppLanguage;
}

export interface UserAuthViewDto {
  id: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  isAdmin?: boolean;
  profile: UserProfile;
}

export interface UserAuthSaveOrUpdateDto {
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  provider: AuthProvider;
  inviteCode?: string;
  fullName?: string;
}
