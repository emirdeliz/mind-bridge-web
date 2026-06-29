'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  AiPromptTemplateListItemDto,
  AiPromptTokenDefinitionDto,
  AppLanguage,
  PromptTemplateModalItem,
} from '@api';
import {
  getAdminPromptTemplatesApi,
  getAdminPromptTokensApi,
  restoreAdminPromptTemplateApi,
  saveAdminPromptTemplateApi,
  testAdminPromptTemplateApi,
} from '@api';
import type { TestPromptTemplateBodyDto } from '@api';

export const useAdminPromptTemplates = () => {
  const [templates, setTemplates] = useState<AiPromptTemplateListItemDto[]>(
    []
  );
  const [tokens, setTokens] = useState<AiPromptTokenDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [templateList, tokenList] = await Promise.all([
        getAdminPromptTemplatesApi(),
        getAdminPromptTokensApi(),
      ]);
      setTemplates(templateList);
      setTokens(tokenList);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load prompt templates'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveTemplate = useCallback(
    async (key: string, content: string, sourceLanguage: AppLanguage) => {
      setSaving(true);
      setError('');
      try {
        const updated = await saveAdminPromptTemplateApi(key, {
          content,
          sourceLanguage,
        });
        setTemplates((current) =>
          current.map((template) =>
            template.key === updated.key ? updated : template
          )
        );
        return updated;
      } catch (saveError) {
        const message =
          saveError instanceof Error
            ? saveError.message
            : 'Failed to save prompt template';
        setError(message);
        throw saveError;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const restoreTemplate = useCallback(async (key: string) => {
    setSaving(true);
    setError('');
    try {
      const restored = await restoreAdminPromptTemplateApi(key);
      setTemplates((current) =>
        current.map((template) =>
          template.key === restored.key ? restored : template
        )
      );
      return restored;
    } catch (restoreError) {
      const message =
        restoreError instanceof Error
          ? restoreError.message
          : 'Failed to restore prompt template';
      setError(message);
      throw restoreError;
    } finally {
      setSaving(false);
    }
  }, []);

  const testTemplate = useCallback(
    async (key: string, body: TestPromptTemplateBodyDto) => {
      setTesting(true);
      setError('');
      try {
        return await testAdminPromptTemplateApi(key, body);
      } catch (testError) {
        const message =
          testError instanceof Error
            ? testError.message
            : 'Failed to test prompt template';
        setError(message);
        throw testError;
      } finally {
        setTesting(false);
      }
    },
    []
  );

  return {
    templates,
    tokens,
    loading,
    saving,
    testing,
    error,
    reload: load,
    saveTemplate,
    restoreTemplate,
    testTemplate,
  };
};

export const resolvePromptEditorContent = (
  template: PromptTemplateModalItem,
  language: AppLanguage
): string =>
  template.override?.[language] ??
  template.defaultContent[language] ??
  template.defaultContent.pt ??
  '';
