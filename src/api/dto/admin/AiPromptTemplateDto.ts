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

export type TestPromptTemplateBodyDto = {
  content: string;
  sourceLanguage: AppLanguage;
  testMessage: string;
  psychologistContext?: string;
  sessionConsiderations?: string;
  clinicalContext?: string;
};

export type TestPromptTemplateResultDto = {
  reply: string;
  resolvedPrompt: string;
};

export type TestPsychologistPromptTemplateBodyDto = TestPromptTemplateBodyDto;
export type TestPsychologistPromptTemplateResultDto = TestPromptTemplateResultDto;

export type PromptTemplateModalItem = {
  key: string;
  label: Record<AppLanguage, string>;
  description: Record<AppLanguage, string>;
  allowedTokens: string[];
  defaultContent: Record<AppLanguage, string>;
  override?: AiPromptTemplateTranslationsDto | null;
};
