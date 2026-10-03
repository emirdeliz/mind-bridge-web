import type { AiPromptTokenDefinitionDto } from '@api';

export type PromptGuidanceDraft = {
  intro: string;
  /** Ordered list of enabled token keys */
  enabledTokens: string[];
};

const STANDALONE_TOKEN_LINE_RE = /^#([a-z][a-z0-9_]*)$/i;
const ANY_TOKEN_RE = /#([a-z][a-z0-9_]*)/gi;

export const parsePromptGuidanceDraft = (
  content: string,
  allowedTokens: string[]
): PromptGuidanceDraft => {
  const allowed = new Set(allowedTokens);
  const normalized = content.replace(/\r\n/g, '\n');

  if (!allowedTokens.length) {
    return {
      intro: normalized.trim(),
      enabledTokens: [],
    };
  }

  const lines = normalized.split('\n');
  const introLines: string[] = [];
  const enabledFromLines: string[] = [];
  let sawTokenLine = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = STANDALONE_TOKEN_LINE_RE.exec(trimmed);
    if (match && allowed.has(match[1])) {
      sawTokenLine = true;
      if (!enabledFromLines.includes(match[1])) {
        enabledFromLines.push(match[1]);
      }
      continue;
    }

    if (!sawTokenLine) {
      introLines.push(line);
    }
  }

  const enabledFromInline: string[] = [];
  for (const match of normalized.matchAll(ANY_TOKEN_RE)) {
    const key = match[1];
    if (
      allowed.has(key) &&
      !enabledFromLines.includes(key) &&
      !enabledFromInline.includes(key)
    ) {
      enabledFromInline.push(key);
    }
  }

  const enabledTokens =
    enabledFromLines.length || enabledFromInline.length
      ? [...enabledFromLines, ...enabledFromInline]
      : [...allowedTokens];

  return {
    intro: introLines.join('\n').trim(),
    enabledTokens,
  };
};

export const composePromptGuidanceDraft = (
  draft: PromptGuidanceDraft
): string => {
  const intro = draft.intro.trim();
  const tokenBlock = draft.enabledTokens
    .map((token) => `#${token}`)
    .join('\n\n');

  if (intro && tokenBlock) {
    return `${intro}\n\n${tokenBlock}`;
  }
  if (intro) {
    return intro;
  }
  return tokenBlock;
};

export const orderTokensForWizard = (
  tokens: AiPromptTokenDefinitionDto[],
  allowedTokens: string[],
  enabledTokens: string[]
): AiPromptTokenDefinitionDto[] => {
  const byKey = new Map(tokens.map((token) => [token.key, token]));
  const orderedKeys = [
    ...enabledTokens.filter((key) => allowedTokens.includes(key)),
    ...allowedTokens.filter((key) => !enabledTokens.includes(key)),
  ];

  return orderedKeys
    .map((key) => byKey.get(key))
    .filter((token): token is AiPromptTokenDefinitionDto => Boolean(token));
};

export const moveTokenInList = (
  tokens: string[],
  tokenKey: string,
  direction: -1 | 1
): string[] => {
  const index = tokens.indexOf(tokenKey);
  if (index < 0) {
    return tokens;
  }
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= tokens.length) {
    return tokens;
  }
  const next = [...tokens];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
};
