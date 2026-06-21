import { formatCurrencyForAppLanguage } from './formatNumber';

export * from './caseTransform';
export {
  formatCentsAsCurrencyForAppLanguage,
  formatCurrencyForAppLanguage,
  formatNumberForAppLanguage,
  formatNumberForIrisAppLanguage,
  localeForAppLanguage,
} from './formatNumber';
export {
  filterDOMProps,
  filterInputDomProps,
  filterLabelDomProps,
  filterButtonDomProps,
  omitProps,
  INPUT_CUSTOM_PROP_KEYS,
} from './filterDomProps';
export {
  DEFAULT_KNOWLEDGE_MAX_FILE_BYTES,
  formatKnowledgeMaxFileSizeMb,
  isKnowledgeFileWithinSizeLimit,
  resolveKnowledgeMaxFileBytes,
} from './knowledgeFileLimits';
export {
  hasKnowledgeDocumentsAwaitingIndex,
  isKnowledgeDocumentIndexed,
  isKnowledgeDocumentIndexing,
  type KnowledgeDocumentIndexStatus,
} from './knowledgeIndexStatus';
export {
  countLikertAnswers,
  likertAnchorHighKey,
  likertAnchorLowKey,
  likertQuestionKey,
} from './likertCheckInLabels';
export {
  getLikertCheckInDateKey,
  getLocalDateKey,
  isLikertCheckInForToday,
  resolveLikertCheckInForToday,
} from './likertCheckInDay';
export { actorChipVariant, type ActorChipVariant } from './actorChip';
export {
  billingMonthFromDate,
  canNavigateToPreviousBillingMonth,
  previousBillingMonth,
} from './billingMonthNavigation';
export { resolveChatShortcutTranslation } from './chatShortcutTranslation';
export { shouldSilentReload, type ReloadOptions } from './reloadOptions';
export { normalizeSession } from './sessionUtils';
export * from './schedulingDateUtils';
export {
  applyOptimisticMove,
  syncAppointmentsAfterMove,
} from './schedulingOptimisticMove';
export {
  isEnumeratedInsightTitle,
  normalizeListItem,
  parseInsightListItems,
  parseInteractionSummary,
} from './enumeratedTextList';

export const getProfileInitials = (
  fullName: string,
  fallback = '??'
): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

export const getNumbersOfString = (value: string): string =>
  value.replace(/\D/g, '');

export const phoneDigits = (phone: string | null | undefined): string =>
  (phone ?? '').replace(/\D/g, '');

/** Senha inicial do paciente (cadastro pelo psicólogo): exatamente 5 caracteres alfanuméricos. */
export const PATIENT_INITIAL_PASSWORD_REGEX = /^[a-zA-Z0-9]{5}$/;

export const isValidPatientInitialPassword = (
  password: string | null | undefined
): boolean => PATIENT_INITIAL_PASSWORD_REGEX.test(password ?? '');

export const isValidPhone = (phone: string | null | undefined): boolean => {
  const digits = phoneDigits(phone);
  return digits.length >= 10 && digits.length <= 11;
};

export const maskCPF = (value: string): string => value;
export const maskCNPJ = (value: string): string => value;
/** Celular BR: (DD) XXXXX-XXXX (11 dígitos) ou (DD) XXXX-XXXX (10 dígitos). */
export const maskPhone = (value: string): string => {
  const digits = getNumbersOfString(value).slice(0, 11);
  if (!digits.length) {
    return '';
  }
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};
export const maskBarcode = (value: string): string => value;
export const maskRG = (value: string): string => value;
export const maskCountryState = (value: string): string => value;
export const maskMoney = (value: number | string): string => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    const stripped = value.replace(/[^\d,]/g, '');
    if (!stripped) {
      return '';
    }

    const [integerRaw, decimalRaw = ''] = stripped.split(',');
    const integerDigits = integerRaw.replace(/\D/g, '');
    const decimalDigits = decimalRaw.replace(/\D/g, '').slice(0, 2);

    if (!integerDigits && !decimalDigits) {
      return '';
    }

    const integerPart = integerDigits
      ? Number(integerDigits).toLocaleString('pt-BR')
      : '0';

    if (stripped.includes(',') || decimalDigits.length > 0) {
      return `R$ ${integerPart},${decimalDigits.padEnd(2, '0').slice(0, 2)}`;
    }

    return `R$ ${integerPart}`;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return '';
  }

  return numeric.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDateAsDDMMYYYY = (value: Date | string): string =>
  (value instanceof Date ? value : new Date(value)).toLocaleDateString('pt-BR');

export const formatDateAsYYYYMMDD = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const maskDate = (value: string): string => value;

export const parseStringDDMMYYYYToDate = (value: string): Date =>
  new Date(value);

export const checkingIfDateIsGreaterThanAnotherIgnoringTime = (
  first: Date,
  second: Date
): boolean => {
  const toDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return toDay(first) > toDay(second);
};

export const WeekLabel = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda',
  TUESDAY: 'Terca',
  WEDNESDAY: 'Quarta',
  THURSDAY: 'Quinta',
  FRIDAY: 'Sexta',
  SATURDAY: 'Sabado',
} as const;

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const getMonthByIndex = (index: number) => ({
  label: MONTH_LABELS[index] ?? '',
});

export const applyCorrectDateByLimitOfDaysOnMonth = (
  date: Date,
  { month }: { month: number }
): Date => new Date(date.getFullYear(), month, Math.min(date.getDate(), 28));

export const accessAtributeObjectByPath = <T extends Record<string, unknown>>(
  object: T,
  path: string
): unknown =>
  path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, object);

export const formatDateAsDDMMYYYYAndTime = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  return `${formatDateAsDDMMYYYY(date)} ${date.toLocaleTimeString('pt-BR')}`;
};

export const formatNumberAsCurrency = (value: number): string =>
  formatCurrencyForAppLanguage(value, 'pt');

export const formatStringOrNumberAsCnpj = (value: string | number): string =>
  String(value);
