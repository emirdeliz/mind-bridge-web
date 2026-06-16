import type { AppLanguage, PsychologistChatShortcutDto } from '@api';

export const resolveChatShortcutTranslation = (
  shortcut: PsychologistChatShortcutDto,
  language: AppLanguage
) => shortcut.translations[language] ?? shortcut.translations.pt;
