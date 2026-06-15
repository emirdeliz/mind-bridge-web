export type KnowledgeDocumentDto = {
  id: string;
  title: string;
  fileName: string;
  uploadedBy: string | null;
  chunkCount: number;
  status: 'active' | 'archived';
  indexStatus: 'pending' | 'indexing' | 'indexed' | 'failed';
  createdAt: string;
  updatedAt: string;
};

export type UploadKnowledgeDocumentResponseDto = {
  document: KnowledgeDocumentDto;
  replaced: boolean;
};
