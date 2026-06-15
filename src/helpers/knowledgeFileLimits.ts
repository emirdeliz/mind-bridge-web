export const DEFAULT_KNOWLEDGE_MAX_FILE_BYTES = 10_485_760;

export const resolveKnowledgeMaxFileBytes = (
  value: string | undefined
): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_KNOWLEDGE_MAX_FILE_BYTES;
  }
  return Math.floor(parsed);
};

export const formatKnowledgeMaxFileSizeMb = (maxFileBytes: number): string => {
  const megabytes = maxFileBytes / (1024 * 1024);
  return Number.isInteger(megabytes) ? String(megabytes) : megabytes.toFixed(1);
};

export const isKnowledgeFileWithinSizeLimit = (
  fileSizeBytes: number,
  maxFileBytes: number
): boolean => fileSizeBytes > 0 && fileSizeBytes <= maxFileBytes;
