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
  profile: UserProfile;
  accessToken?: string;
}

export interface UserAuthSaveOrUpdateDto {
  email: string;
  password?: string;
  role: UserRole;
  provider: AuthProvider;
}
