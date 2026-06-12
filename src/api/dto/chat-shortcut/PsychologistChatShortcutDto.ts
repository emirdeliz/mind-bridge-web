import type { AppLanguage } from '../auth/AuthDto';

export type ChatShortcutTranslationDto = {
  label: string;
  message: string;
};

export type ChatShortcutTranslationsDto = Record<AppLanguage, ChatShortcutTranslationDto>;

export type PsychologistChatShortcutDto = {
  id: string;
  psychologistId: string;
  sortOrder: number;
  translations: ChatShortcutTranslationsDto;
  createdAt: string;
  updatedAt: string;
};

export type SavePsychologistChatShortcutDto = {
  label: string;
  message: string;
  sourceLanguage: AppLanguage;
};
