import React, { ChangeEvent, useMemo } from 'react';
import * as helpers from '@helpers';
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

  const inputClasses = [
    'w-full',
    'h-12', // Altura padronizada (48px)
    'min-h-[48px]', // Altura mínima garantida
    'outline-none rounded-lg',
    'px-4 py-3', // Padding padronizado (16px horizontal, 12px vertical)
    'text-base',
    'font-poppins',
    'transition-all duration-200 ease-in-out',
    'placeholder:text-gray-400 placeholder:font-normal',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'border border-gray-300', // Borda explícita com cor
    'bg-white text-gray-900',
    'input-focus-primary',
    hasError && 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200',
  ].filter(Boolean).join(' ');

  return (
    <input
      {...props}
      id={id}
      type={password ? 'password' : (type || 'text')}
      maxLength={maxLength || INPUT_TEXT_MAX_LENGTH_DEFAULT}
      data-error={hasError ? 'true' : 'false'}
      value={String(value)}
      className={inputClasses}
      onChange={(e) => {
        const eventMask = { ...e };
        if ((cpf || cnpj || phone || barcode) && eventMask.target) {
          const valueMask = helpers.getNumbersOfString(e?.target.value);
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