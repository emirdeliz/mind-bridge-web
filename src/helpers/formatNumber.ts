import type { AppLanguage } from '@api';

export const localeForAppLanguage = (language: AppLanguage): string => {
  switch (language) {
    case 'en':
      return 'en-US';
    case 'es':
      return 'es-ES';
    default:
      return 'pt-BR';
  }
};

export const formatNumberForAppLanguage = (
  value: number,
  language: AppLanguage,
  options?: Intl.NumberFormatOptions
): string =>
  new Intl.NumberFormat(localeForAppLanguage(language), options).format(value);

/** @deprecated Prefer `formatNumberForAppLanguage` — kept for existing chart components. */
export const formatNumberForIrisAppLanguage = formatNumberForAppLanguage;

export const formatCurrencyForAppLanguage = (
  value: number,
  language: AppLanguage,
  currency = 'BRL',
  options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'>
): string =>
  new Intl.NumberFormat(localeForAppLanguage(language), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    ...options,
  }).format(value);

export const formatCentsAsCurrencyForAppLanguage = (
  cents: number,
  language: AppLanguage,
  currency = 'BRL'
): string => formatCurrencyForAppLanguage(cents / 100, language, currency);
