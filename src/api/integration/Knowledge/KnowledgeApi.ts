import { ApiError } from '../../http/apiClient';
import type {
  KnowledgeDocumentDto,
  UploadKnowledgeDocumentResponseDto,
} from '../../dto/knowledge/KnowledgeDocumentDto';
import { keysToCamel, DEFAULT_KNOWLEDGE_MAX_FILE_BYTES } from '@helpers';

type KnowledgeDocumentsListResponse = {
  documents: KnowledgeDocumentDto[];
  maxFileBytes: number;
};

export type KnowledgeDocumentsListResult = {
  documents: KnowledgeDocumentDto[];
  maxFileBytes: number;
};

type KnowledgeDocumentResponse = {
  document: KnowledgeDocumentDto;
};

const buildProxyUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `/api/backend/${normalizedPath}`;
};

export const getKnowledgeDocumentsApi = async (): Promise<KnowledgeDocumentsListResult> => {
  const response = await fetch(buildProxyUrl('/knowledge/documents'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    documents?: KnowledgeDocumentDto[];
    maxFileBytes?: number;
    max_file_bytes?: number;
  };

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error ?? payload.message ?? `Request failed (${response.status})`,
    );
  }

  const data = keysToCamel<KnowledgeDocumentsListResponse>(payload);
  return {
    documents: data.documents ?? [],
    maxFileBytes: data.maxFileBytes ?? DEFAULT_KNOWLEDGE_MAX_FILE_BYTES,
  };
};

export const uploadKnowledgeDocumentApi = async (
  file: File,
): Promise<UploadKnowledgeDocumentResponseDto> => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch(buildProxyUrl('/knowledge/upload'), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    document?: KnowledgeDocumentDto;
    replaced?: boolean;
  };

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error ?? payload.message ?? `Request failed (${response.status})`,
    );
  }

  const data = keysToCamel<UploadKnowledgeDocumentResponseDto>(payload);
  if (!data.document) {
    throw new ApiError(response.status, 'Upload response missing document');
  }

  return data;
};

export const deleteKnowledgeDocumentApi = async (documentId: string): Promise<void> => {
  const response = await fetch(buildProxyUrl(`/knowledge/documents/${documentId}`), {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (response.status === 204) {
    return;
  }

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error ?? payload.message ?? `Request failed (${response.status})`,
    );
  }
};
