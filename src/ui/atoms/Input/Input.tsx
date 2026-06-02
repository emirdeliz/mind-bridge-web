import * as helpers from '@helpers';
import React, {
  ChangeEvent,
  ClipboardEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  useMemo,
} from 'react';
import { Flex, FormControl } from '..';
import { InputText } from './InputText/InputText';
import { InputReadOnly } from './InputReadOnly/InputReadOnly';
import { InputNumber } from './InputNumber/InputNumber';
import { InputDate } from './InputDate/InputDate';
import { InputTextArea } from './InputTextArea/InputTextArea';
import { InputCurrency } from './InputCurrency/InputCurrency';

export interface InputProps extends FormControl {
  rg?: boolean;
  cpf?: boolean;
  cnpj?: boolean;
  currency?: boolean;
  phone?: boolean;
  barcode?: boolean;
  placeholder?: string;
  before?: ReactNode;
  after?: ReactNode;
  number?: boolean;
  decimal?: boolean;
  allowNegative?: boolean;
  textarea?: boolean;
  date?: boolean;
  maxLength?: number;
  minLength?: number;
  maxValue?: number;
  decimalPlaces?: number;
  rows?: number;
  alignCenter?: boolean;
  password?: boolean;
  id?: string | number;
  dataTestId?: string | number;
  readOnly?: boolean;
  transparent?: boolean;
  countryState?: boolean;
  onClick?: (e: MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPaste?: (e: ClipboardEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  autoComplete?: string;
  /** Referência a um `<datalist id="...">` (HTML5). */
  list?: string;
  type?: string;
  // Margens
  m?: string;
  mt?: string;
  mr?: string;
  mb?: string;
  ml?: string;
  mx?: string;
  my?: string;
  // Padding
  p?: string;
  pt?: string;
  pr?: string;
  pb?: string;
  pl?: string;
  px?: string;
  py?: string;
  // Font size
  fontSize?: string;
}

export const applyMaskMaybe = (
  value: string | number | Date | null | undefined | boolean,
  { cpf, cnpj, currency, barcode, phone, rg, countryState }: InputProps
) => {
  if (value === undefined) {
    return '';
  }
  const valueAsString = String(value);
  switch (true) {
    case cpf:
      return helpers.maskCPF(valueAsString);
    case cnpj:
      return helpers.maskCNPJ(valueAsString);
    case phone:
      return helpers.maskPhone(valueAsString);
    case barcode:
      return helpers.maskBarcode(valueAsString);
    case rg:
      return helpers.maskRG(valueAsString);
    case countryState:
      return helpers.maskCountryState(valueAsString);
    case currency:
      return helpers.maskMoney(value as number);
    default:
      return valueAsString;
  }
};

export const Input = ({
  number,
  textarea,
  date,
  after,
  before,
  readOnly,
  transparent,
  currency,
  decimal,
  allowNegative,
  decimalPlaces,
  maxValue,
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  p,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
  fontSize,
  ...props
}: InputProps) => {
  // Construir classes de margem e padding
  const marginClasses = [
    m && `m-${m}`,
    mt && `mt-${mt}`,
    mr && `mr-${mr}`,
    mb && `mb-${mb}`,
    ml && `ml-${ml}`,
    mx && `mx-${mx}`,
    my && `my-${my}`,
  ].filter(Boolean).join(' ');

  const paddingClasses = [
    p && `p-${p}`,
    pt && `pt-${pt}`,
    pr && `pr-${pr}`,
    pb && `pb-${pb}`,
    pl && `pl-${pl}`,
    px && `px-${px}`,
    py && `py-${py}`,
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'flex flex-1 rounded-md',
    'bg-transparent',
    marginClasses,
    paddingClasses,
  ].filter(Boolean).join(' ');

  const inputElement = useMemo(() => {
    switch (true) {
      case readOnly:
        return <InputReadOnly {...props} />;
      case number:
        return <InputNumber {...props} decimal={decimal} allowNegative={allowNegative} decimalPlaces={decimalPlaces} maxValue={maxValue} />;
      case currency:
        return <InputCurrency {...props} currency />;
      case date:
        return <InputDate {...props} />;
      case textarea:
        return <InputTextArea {...props} />;
      default:
        return <InputText {...props} />
    }
  }, [number, textarea, date, readOnly, props, currency, decimal, allowNegative, decimalPlaces, maxValue]);

  return (
    <div className={containerClasses}>
      {before && <Flex.Center ml="2">{before}</Flex.Center>}
      {inputElement}
      {after && <Flex.Center mr="2">{after}</Flex.Center>}
    </div>
  );
};

Input.Number = (props: InputProps) => <Input {...props} number />;
Input.Currency = (props: InputProps) => <Input {...props} currency />;
Input.Phone = (props: InputProps) => <Input {...props} phone />;
Input.Cpf = (props: InputProps) => <Input {...props} cpf />;
Input.Cnpj = (props: InputProps) => <Input {...props} cnpj />;
Input.Barcode = (props: InputProps) => <Input {...props} barcode />;
Input.TextArea = (props: InputProps) => <Input {...props} textarea />;
