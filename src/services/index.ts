export * from "./auth/hooks/useAuth";
export * from "./billing";
export * from "./clinical";
export * from "./patient";
export * from "./scheduling";
export * from "./auth/authBypass";
export * from "./auth/roleRoute";
export * from "./ai/hooks/useAiAgent";
export * from "./ai/agentGuardrails";

export type { ChatMessage } from "./ai/hooks/useAiAgent";

export type ActorChipVariant = "agent" | "human" | "system";

export const actorChipVariant = (actor: string): ActorChipVariant => {
  if (actor.toLowerCase().includes("agent")) return "agent";
  if (actor.toLowerCase().includes("system")) return "system";
  return "human";
};
