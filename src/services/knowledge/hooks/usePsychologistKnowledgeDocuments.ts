import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import type { KnowledgeDocumentDto } from '@api';
import {
  deleteKnowledgeDocumentApi,
  getKnowledgeDocumentsApi,
  uploadKnowledgeDocumentApi,
} from '@api';
import {
  DEFAULT_KNOWLEDGE_MAX_FILE_BYTES,
  hasKnowledgeDocumentsAwaitingIndex,
} from '@helpers';

const KNOWLEDGE_INDEX_POLL_INTERVAL_MS = 4000;

export const usePsychologistKnowledgeDocuments = (options?: {
  enabled?: boolean;
}) => {
  const enabled = options?.enabled ?? true;
  const [documents, setDocuments] = useState<KnowledgeDocumentDto[]>([]);
  const [maxFileBytes, setMaxFileBytes] = useState(
    DEFAULT_KNOWLEDGE_MAX_FILE_BYTES
  );
  const [loading, setLoading] = useState(enabled);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const documentsRef = useRef(documents);

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  const reload = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!enabled) {
        return;
      }

      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
      }
      setError('');
      try {
        const data = await getKnowledgeDocumentsApi();
        setDocuments(data.documents);
        if (data.maxFileBytes > 0) {
          setMaxFileBytes(data.maxFileBytes);
        }
      } catch (loadError) {
        if (!silent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Failed to load knowledge documents'
          );
          setDocuments([]);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!enabled || !hasKnowledgeDocumentsAwaitingIndex(documentsRef.current)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (hasKnowledgeDocumentsAwaitingIndex(documentsRef.current)) {
        void reload({ silent: true });
      }
    }, KNOWLEDGE_INDEX_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [documents, enabled, reload]);

  const refreshStatus = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setRefreshing(true);
    try {
      await reload({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }, [enabled, reload]);

  const uploadDocument = useCallback(async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const result = await uploadKnowledgeDocumentApi(file);
      setDocuments((current) => {
        const withoutSameName = current.filter(
          (entry) =>
            entry.fileName.toLowerCase() !==
            result.document.fileName.toLowerCase()
        );
        return [result.document, ...withoutSameName].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      return result;
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : 'Failed to upload knowledge document';
      setError(message);
      throw uploadError;
    } finally {
      setUploading(false);
    }
  }, []);

  const removeDocument = useCallback(async (documentId: string) => {
    setDeleting(true);
    setError('');
    try {
      await deleteKnowledgeDocumentApi(documentId);
      setDocuments((current) =>
        current.filter((entry) => entry.id !== documentId)
      );
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete knowledge document';
      setError(message);
      throw deleteError;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    documents,
    maxFileBytes,
    loading,
    uploading,
    deleting,
    refreshing,
    error,
    reload,
    refreshStatus,
    uploadDocument,
    removeDocument,
  };
};

export const useKnowledgeFilePicker = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingResolver = useRef<((file: File | null) => void) | null>(null);

  const pickFile = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      pendingResolver.current = resolve;
      inputRef.current?.click();
    });
  }, []);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    pendingResolver.current?.(file);
    pendingResolver.current = null;
  }, []);

  return {
    inputRef,
    pickFile,
    handleChange,
  };
};
