import type { UserAuthViewDto, UserRole } from "@api";

/** UI flag only — server must set AUTH_BYPASS=true for bypass API/cookies. */
export const isAuthBypassEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export const createBypassSession = (role: UserRole): UserAuthViewDto => ({
  id: `bypass-${role}`,
  email: role === "patient" ? "demo.patient@mindbridge.app" : "demo.psychologist@mindbridge.app",
  role,
  provider: "password",
  profile: {
    fullName: role === "patient" ? "Paciente Demo" : "Psicólogo Demo",
    age: "",
    address: "Endereço demo",
    phone: "+55 11 90000-0000",
    language: "pt",
  },
});
