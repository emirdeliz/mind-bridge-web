const LIST_PREFIX_PATTERN = /^(?:[-•*]\s*|\d+[.)]\s*)/;

const HEADER_PATTERN = /^(resumo|resumen|summary)\s+(de|of)\s+/i;
const CONVERSATION_PATTERN = /^(conversa|conversación|conversation)\s+\d+/i;

export const isEnumeratedInsightTitle = (title: string): boolean => {
  const normalized = title.trim().toLowerCase();

  return (
    normalized.includes("padr") ||
    normalized.includes("patron") ||
    normalized.includes("pattern") ||
    normalized.includes("ação") ||
    normalized.includes("acao") ||
    normalized.includes("accion") ||
    normalized.includes("action") ||
    normalized.includes("recomend")
  );
};

export const normalizeListItem = (item: string): string =>
  item.trim().replace(LIST_PREFIX_PATTERN, "").trim();

export const parseInsightListItems = (body: string): string[] => {
  const trimmed = body.trim();
  if (!trimmed) {
    return [];
  }

  const byLine = trimmed
    .split(/\r?\n+/)
    .map(normalizeListItem)
    .filter(Boolean);

  if (byLine.length > 1) {
    return byLine;
  }

  const byBullet = trimmed
    .split(/\s*·\s*/)
    .map(normalizeListItem)
    .filter(Boolean);

  if (byBullet.length > 1) {
    return byBullet;
  }

  return [normalizeListItem(trimmed)];
};

export const parseInteractionSummary = (
  body: string,
): { header: string | null; items: string[] } => {
  const lines = body
    .trim()
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { header: null, items: [] };
  }

  if (lines.length === 1) {
    const parts = parseInsightListItems(body);

    if (parts.length > 1 && HEADER_PATTERN.test(parts[0])) {
      return { header: parts[0], items: parts.slice(1) };
    }

    if (parts.some((part) => CONVERSATION_PATTERN.test(part))) {
      const headerIndex = parts.findIndex((part) => HEADER_PATTERN.test(part));
      if (headerIndex >= 0) {
        return {
          header: parts[headerIndex],
          items: parts.filter((_, index) => index !== headerIndex),
        };
      }
      return { header: null, items: parts };
    }

    return { header: parts[0], items: [] };
  }

  const [first, ...rest] = lines;

  if (HEADER_PATTERN.test(first) && rest.length > 0) {
    return { header: first, items: rest.map(normalizeListItem) };
  }

  if (CONVERSATION_PATTERN.test(first)) {
    return { header: null, items: lines.map(normalizeListItem) };
  }

  return { header: first, items: rest.map(normalizeListItem) };
};
