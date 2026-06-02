export const filterDOMProps = <T extends Record<string, unknown>>(props: T): T => props;

export const getNumbersOfString = (value: string): string => value.replace(/\D/g, "");

export const maskCPF = (value: string): string => value;
export const maskCNPJ = (value: string): string => value;
export const maskPhone = (value: string): string => value;
export const maskBarcode = (value: string): string => value;
export const maskRG = (value: string): string => value;
export const maskCountryState = (value: string): string => value;
export const maskMoney = (value: number): string => String(value);

export const formatNumberForIrisAppLanguage = (value: number): string => String(value);

export const formatDateAsDDMMYYYY = (value: Date): string => value.toLocaleDateString("pt-BR");

export const maskDate = (value: string): string => value;

export const parseStringDDMMYYYYToDate = (value: string): Date => new Date(value);
