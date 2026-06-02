import {
  type AuthProvider,
  type UserAuthSaveOrUpdateDto,
  type UserAuthViewDto,
  type UserProfile,
} from "@api/dto/auth/AuthDto";

const USERS_KEY = "mindbridge.users";
const SESSION_KEY = "mindbridge.session";

const providerMockData: Record<
  Exclude<AuthProvider, "password">,
  Omit<UserProfile, "age"> & { age?: string; emailHint: string }
> = {
  google: {
    fullName: "Google User",
    address: "Address from Google",
    phone: "+55 11 99999-0001",
    age: "30",
    emailHint: "google.user@mindbridge.app",
  },
  facebook: {
    fullName: "Facebook User",
    address: "Address from Facebook",
    phone: "+55 11 99999-0002",
    emailHint: "facebook.user@mindbridge.app",
  },
};

const getUsers = (): UserAuthViewDto[] => {
  if (typeof window === "undefined") return [];
  return JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "[]") as UserAuthViewDto[];
};

const saveUsers = (users: UserAuthViewDto[]): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loginWithPasswordApi = async (
  email: string,
  password: string,
): Promise<UserAuthViewDto | null> => {
  const users = getUsers();
  const found = users.find((user) => user.email === email);
  if (!found || password.trim().length < 4) return null;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(found));
  return found;
};

export const loginWithProviderApi = async (
  provider: Exclude<AuthProvider, "password">,
  role: UserAuthViewDto["role"],
): Promise<UserAuthViewDto> => {
  const users = getUsers();
  const mocked = providerMockData[provider];
  const existing = users.find((item) => item.email === mocked.emailHint && item.role === role);
  if (existing) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(existing));
    return existing;
  }

  const created: UserAuthViewDto = {
    id: crypto.randomUUID(),
    email: mocked.emailHint,
    role,
    provider,
    profile: {
      fullName: mocked.fullName,
      age: mocked.age ?? "",
      address: mocked.address,
      phone: mocked.phone,
    },
  };
  saveUsers([...users, created]);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(created));
  return created;
};

export const registerUserApi = async (
  payload: UserAuthSaveOrUpdateDto,
): Promise<UserAuthViewDto> => {
  const users = getUsers();
  const created: UserAuthViewDto = {
    id: crypto.randomUUID(),
    email: payload.email,
    role: payload.role,
    provider: payload.provider,
    profile: {
      fullName: "",
      age: "",
      address: "",
      phone: "",
    },
  };

  saveUsers([...users, created]);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(created));
  return created;
};

export const getSessionApi = async (): Promise<UserAuthViewDto | null> => {
  if (typeof window === "undefined") return null;
  return JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null") as UserAuthViewDto | null;
};

export const saveProfileApi = async (
  profile: UserProfile,
): Promise<UserAuthViewDto | null> => {
  const session = await getSessionApi();
  if (!session) return null;
  const users = getUsers().map((user) =>
    user.id === session.id ? { ...user, profile: { ...profile } } : user,
  );
  saveUsers(users);
  const updated = users.find((user) => user.id === session.id) ?? null;
  if (updated) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  }
  return updated;
};

export const logoutApi = async (): Promise<void> => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
};
