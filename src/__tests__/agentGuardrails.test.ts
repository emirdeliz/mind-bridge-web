import { hasUnsafeContent, safeAgentResponse } from "@services/ai/agentGuardrails";

describe("agentGuardrails", () => {
  it("flags unsafe content", () => {
    expect(hasUnsafeContent("I hate everyone")).toBe(true);
  });

  it("returns safe guidance for regular input", () => {
    const response = safeAgentResponse("I had a hard day", "Encourage calm breathing");
    expect(response).toContain("Encourage calm breathing");
  });
});
