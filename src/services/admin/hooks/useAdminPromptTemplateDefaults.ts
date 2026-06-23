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
} from '@api';

export const useAdminPromptTemplateDefaults = () => {
  const [templates, setTemplates] = useState<
    AiPromptTemplateDefaultListItemDto[]
  >([]);
  const [tokens, setTokens] = useState<AiPromptTokenDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  return {
    templates,
    tokens,
    loading,
    saving,
    error,
    reload: load,
    saveDefault,
  };
};

export const resolvePromptDefaultEditorContent = (
  template: PromptTemplateModalItem,
  language: AppLanguage
): string =>
  template.defaultContent[language] ??
  template.defaultContent.pt ??
  '';
