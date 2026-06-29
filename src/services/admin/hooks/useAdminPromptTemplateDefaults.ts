'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  AiPromptTemplateDefaultListItemDto,
  AiPromptTokenDefinitionDto,
  AppLanguage,
  PromptTemplateModalItem,
} from '@api';
import {
  getAdminPromptTemplateDefaultsApi,
  getAdminPromptTokensApi,
  saveAdminPromptTemplateDefaultApi,
  testAdminPromptTemplateDefaultApi,
} from '@api';
import type { TestPromptTemplateBodyDto } from '@api';

export const useAdminPromptTemplateDefaults = () => {
  const [templates, setTemplates] = useState<
    AiPromptTemplateDefaultListItemDto[]
  >([]);
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
        getAdminPromptTemplateDefaultsApi(),
        getAdminPromptTokensApi(),
      ]);
      setTemplates(templateList);
      setTokens(tokenList);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load prompt defaults'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveDefault = useCallback(
    async (key: string, content: string, sourceLanguage: AppLanguage) => {
      setSaving(true);
      setError('');
      try {
        const updated = await saveAdminPromptTemplateDefaultApi(key, {
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
            : 'Failed to save prompt default';
        setError(message);
        throw saveError;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const testDefault = useCallback(
    async (key: string, body: TestPromptTemplateBodyDto) => {
      setTesting(true);
      setError('');
      try {
        return await testAdminPromptTemplateDefaultApi(key, body);
      } catch (testError) {
        const message =
          testError instanceof Error
            ? testError.message
            : 'Failed to test prompt default';
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
    saveDefault,
    testDefault,
  };
};

export const resolvePromptDefaultEditorContent = (
  template: PromptTemplateModalItem,
  language: AppLanguage
): string =>
  template.defaultContent[language] ??
  template.defaultContent.pt ??
  '';
