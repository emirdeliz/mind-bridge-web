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

export const safeAgentResponse = (userInput: string, psychologistContext: string): string => {
  if (hasUnsafeContent(userInput)) {
    return "I cannot respond to harmful or discriminatory content. If this is an urgent safety concern, please seek immediate professional help.";
  }

  const promptPrefix = psychologistContext.trim()
    ? `Based on your care plan: ${psychologistContext.trim()}. `
    : "";

  return `${promptPrefix}Thank you for sharing this. Can you tell me more about how you felt before and after this situation?`;
};
