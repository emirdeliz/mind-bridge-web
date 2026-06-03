import type { UserAuthViewDto, UserRole } from "@api";

const SESSION_KEY = "mindbridge.session";

/** Temporary dev bypass — disable with NEXT_PUBLIC_AUTH_BYPASS=false */
export const isAuthBypassEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_AUTH_BYPASS !== "false";

export const createBypassSession = (role: UserRole): UserAuthViewDto => ({
  id: `bypass-${role}`,
  email: role === "patient" ? "demo.patient@mindbridge.app" : "demo.psychologist@mindbridge.app",
  role,
  provider: "password",
  profile: {
    fullName: role === "patient" ? "Paciente Demo" : "Psicólogo Demo",
    age: "30",
    address: "Endereço demo",
    phone: "+55 11 90000-0000",
  },
});

export const persistBypassSession = (role: UserRole): UserAuthViewDto => {
  const session = createBypassSession(role);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
};
