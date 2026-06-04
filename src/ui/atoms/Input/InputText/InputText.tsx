import React, { ChangeEvent, useMemo } from 'react';
import * as helpers from '@helpers';
import { filterInputDomProps } from '@helpers/filterDomProps';
import { applyMaskMaybe, InputProps } from '../Input';

const INPUT_TEXT_MAX_LENGTH_DEFAULT = 255;
const INPUT_CPF_MAX_LENGTH_DEFAULT = 14;
const INPUT_RG_MAX_LENGTH_DEFAULT = 12;
const INPUT_CNPJ_MAX_LENGTH_DEFAULT = 18;
const INPUT_PHONE_MAX_LENGTH_DEFAULT = 15;
const INPUT_BARCODE_MAX_LENGTH_DEFAULT = 55;

const getMaxLength = ({
  cpf,
  cnpj,
  rg,
  phone,
  barcode,
  maxLength,
}: InputProps) => {
  switch (true) {
    case cpf:
      return INPUT_CPF_MAX_LENGTH_DEFAULT;
    case cnpj:
      return INPUT_CNPJ_MAX_LENGTH_DEFAULT;
    case phone:
      return INPUT_PHONE_MAX_LENGTH_DEFAULT;
    case barcode:
      return INPUT_BARCODE_MAX_LENGTH_DEFAULT;
    case rg:
      return INPUT_RG_MAX_LENGTH_DEFAULT;
    default:
      return maxLength || INPUT_TEXT_MAX_LENGTH_DEFAULT;
  }
};

export const InputText = ({
  dataTestId,
  cpf,
  cnpj,
  rg,
  phone,
  barcode,
  password,
  digitsOnly,
  onChange,
  hasError,
  type,
  ...props
}: InputProps & { type?: string }) => {
  const id = String(props.id || '');
  const maxLength = useMemo(
    () => getMaxLength({ cpf, cnpj, rg, phone, barcode, maxLength: props.maxLength }),
    [cpf, cnpj, rg, phone, barcode, props.maxLength]
  );
  const value = useMemo(
    () => applyMaskMaybe(props.value, { cpf, cnpj, rg, phone, barcode }),
    [cpf, cnpj, rg, phone, barcode, props.value]
  );

  const inputClasses = ['mb-field block w-full min-w-0', 'input-focus-primary', hasError && 'mb-field-error']
    .filter(Boolean)
    .join(' ');

  const domProps = filterInputDomProps(props);

  const inputType = digitsOnly ? 'text' : password ? 'password' : type || 'text';

  return (
    <input
      {...domProps}
      id={id}
      type={inputType}
      inputMode={digitsOnly ? 'numeric' : domProps.inputMode}
      autoComplete={digitsOnly ? 'off' : domProps.autoComplete}
      maxLength={maxLength || INPUT_TEXT_MAX_LENGTH_DEFAULT}
      data-error={hasError ? 'true' : 'false'}
      value={String(value)}
      className={inputClasses}
      onChange={(e) => {
        const eventMask = { ...e };
        if (eventMask.target && (cpf || cnpj || phone || barcode || digitsOnly)) {
          let valueMask = helpers.getNumbersOfString(e.target.value);
          if (digitsOnly && maxLength) {
            valueMask = valueMask.slice(0, maxLength);
          }
          eventMask.target.value = valueMask;
        }
        onChange &&
          onChange(
            eventMask as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          );
      }}
    />
  );
};