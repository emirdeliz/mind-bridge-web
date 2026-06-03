import { translateTemplate } from "@i18n/utils/translateTemplate";

export type TranslateFn = (key: string) => string;

const blockedPatterns = [
  /suicid/i,
  /self-harm/i,
  /kill/i,
  /hate/i,
  /racis/i,
  /discrimin/i,
];

export const hasUnsafeContent = (input: string): boolean =>
  blockedPatterns.some((pattern) => pattern.test(input));

export const safeAgentResponse = (
  userInput: string,
  psychologistContext: string,
  t: TranslateFn,
): string => {
  if (hasUnsafeContent(userInput)) {
    return t("AI_AGENT_UNSAFE_RESPONSE");
  }

  const prefix = psychologistContext.trim()
    ? `${translateTemplate(t("AI_AGENT_CARE_PLAN_PREFIX"), { context: psychologistContext.trim() })} `
    : "";

  return `${prefix}${t("AI_AGENT_DEFAULT_RESPONSE")}`;
};
