const LIST_PREFIX_PATTERN = /^(?:[-•*]\s*|\d+[.)]\s*)/;
/** Split before "1. ", "2)", etc. when several items share one line. */
const INLINE_NUMBERED_SPLIT_PATTERN = /(?=(?:^|\s)\d+[.)]\s+)/;

const HEADER_PATTERN = /^(resumo|resumen|summary)\s+(de|of)\s+/i;
const CONVERSATION_PATTERN = /^(conversa|conversación|conversation)\s+\d+/i;

export const isEnumeratedInsightTitle = (title: string): boolean => {
  const normalized = title.trim().toLowerCase();

  return (
    normalized.includes('padr') ||
    normalized.includes('patron') ||
    normalized.includes('pattern') ||
    normalized.includes('ação') ||
    normalized.includes('acao') ||
    normalized.includes('accion') ||
    normalized.includes('action') ||
    normalized.includes('recomend')
  );
};

export const normalizeListItem = (item: string): string =>
  item.trim().replace(LIST_PREFIX_PATTERN, '').trim();

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

/**
 * Detects enumerated chat replies (numbered/bulleted) and returns list items.
 * Returns null when the text should render as a normal paragraph.
 */
export const parseEnumeratedChatItems = (body: string): string[] | null => {
  const trimmed = body.trim();
  if (!trimmed) {
    return null;
  }

  const lines = trimmed
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    const enumeratedLineCount = lines.filter((line) =>
      LIST_PREFIX_PATTERN.test(line)
    ).length;

    if (enumeratedLineCount >= 2) {
      return lines.map(normalizeListItem).filter(Boolean);
    }
  }

  const numberedMarkers = trimmed.match(/(?:^|\s)\d+[.)]\s+/g);
  if (numberedMarkers && numberedMarkers.length >= 2) {
    const parts = trimmed
      .split(INLINE_NUMBERED_SPLIT_PATTERN)
      .map((part) => part.trim())
      .filter(Boolean)
      .map(normalizeListItem)
      .filter(Boolean);

    if (parts.length >= 2 && parts.every((part) => part.length > 0)) {
      return parts;
    }
  }

  return null;
};

export const parseInteractionSummary = (
  body: string
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
