export type KnowledgeDocumentIndexStatus =
  | 'pending'
  | 'indexing'
  | 'indexed'
  | 'failed';

export const isKnowledgeDocumentIndexed = (
  indexStatus: KnowledgeDocumentIndexStatus
): boolean => indexStatus === 'indexed';

export const isKnowledgeDocumentIndexing = (
  indexStatus: KnowledgeDocumentIndexStatus
): boolean => indexStatus === 'pending' || indexStatus === 'indexing';

export const hasKnowledgeDocumentsAwaitingIndex = (
  documents: Array<{ indexStatus: KnowledgeDocumentIndexStatus }>
): boolean =>
  documents.some((document) =>
    isKnowledgeDocumentIndexing(document.indexStatus)
  );
