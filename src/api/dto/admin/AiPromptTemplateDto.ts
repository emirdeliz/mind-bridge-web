import type { AppLanguage } from '../auth/AuthDto';

export type AiPromptTemplateTranslationsDto = Partial<
  Record<AppLanguage, string>
>;

export type AiPromptTokenDefinitionDto = {
  key: string;
  label: Record<AppLanguage, string>;
  description: Record<AppLanguage, string>;
  example: Record<AppLanguage, string>;
  source: Record<AppLanguage, string>;
  preview: Record<AppLanguage, string>;
};

export type AiPromptTemplateListItemDto = {
  key: string;
  category: string;
  label: Record<AppLanguage, string>;
  description: Record<AppLanguage, string>;
  allowedTokens: string[];
  defaultContent: Record<AppLanguage, string>;
  override: AiPromptTemplateTranslationsDto | null;
  isCustomized: boolean;
  updatedAt: string | null;
};

export type AiPromptTemplateDefaultListItemDto = {
  key: string;
  category: string;
  label: Record<AppLanguage, string>;
  description: Record<AppLanguage, string>;
  allowedTokens: string[];
  defaultContent: Record<AppLanguage, string>;
  updatedAt: string | null;
};

export type SaveAiPromptTemplateBodyDto = {
  content: string;
  sourceLanguage: AppLanguage;
};

export type PromptTemplateModalItem = {
  key: string;
  label: Record<AppLanguage, string>;
  description: Record<AppLanguage, string>;
  allowedTokens: string[];
  defaultContent: Record<AppLanguage, string>;
  override?: AiPromptTemplateTranslationsDto | null;
};
