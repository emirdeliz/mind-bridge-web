import type { AppLanguage } from '@api';

export const SESSION_STORAGE_KEY = 'mindbridge.session';

export const APP_LANGUAGES: AppLanguage[] = ['en', 'pt', 'es'];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'EN',
  pt: 'PT-BR',
  es: 'ES',
};

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'pt';

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  value === 'en' || value === 'es' || value === 'pt';

export const getLanguageFromSessionStorage = (): AppLanguage | null => {
  if (typeof window === 'undefined') return null;
  try {
    const session = JSON.parse(
      window.localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null'
    ) as {
      profile?: { language?: unknown };
    } | null;
    const language = session?.profile?.language;
    return isAppLanguage(language) ? language : null;
  } catch {
    return null;
  }
};
