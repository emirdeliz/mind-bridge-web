import { hasUnsafeContent, safeAgentResponse } from '@services';

const t = (key: string): string => {
  const dictionary: Record<string, string> = {
    AI_AGENT_UNSAFE_RESPONSE: 'unsafe',
    AI_AGENT_CARE_PLAN_PREFIX: 'Based on your care plan: {{context}}.',
    AI_AGENT_DEFAULT_RESPONSE: 'default response',
  };
  return dictionary[key] ?? key;
};

describe('agentGuardrails', () => {
  it('flags unsafe content', () => {
    expect(hasUnsafeContent('I hate everyone')).toBe(true);
  });

  it('returns safe guidance for regular input', () => {
    const response = safeAgentResponse(
      'I had a hard day',
      'Encourage calm breathing',
      t
    );
    expect(response).toContain('Encourage calm breathing');
    expect(response).toContain('default response');
  });
});
