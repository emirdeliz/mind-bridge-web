export type KnowledgeDocumentDto = {
  id: string;
  title: string;
  fileName: string;
  uploadedBy: string | null;
  chunkCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type UploadKnowledgeDocumentResponseDto = {
  document: KnowledgeDocumentDto;
  replaced: boolean;
};
