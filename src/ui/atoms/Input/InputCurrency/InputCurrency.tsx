import * as helpers from '@helpers';
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { applyMaskMaybe, InputProps } from '../Input';

const INPUT_CURRENCY_MAX_LENGTH_DEFAULT = 12;

export const InputCurrency = ({
  maxLength,
  dataTestId,
  onChange,
  onKeyDown,
  hasError,
  ...props
}: InputProps) => {
  const [valueAsString, setValueAsString] = useState<number | string>(props.value as number || 0);
  const id = useMemo(() => String(props.id), [props.id]);
  const value = useMemo(
    () => applyMaskMaybe(valueAsString, { currency: true }),
    [valueAsString]
  );

  // Sync internal state when props.value changes externally
  useEffect(() => {
    if (props.value !== undefined && props.value !== valueAsString) {
      setValueAsString(props.value as number);
    }
  }, [props.value]);
  
  const inputClasses = [
    'w-full',
    'h-12', // Altura padronizada (48px)
    'min-h-[48px]', // Altura mínima garantida
    'bg-white text-gray-900',
    'border border-gray-300', // Borda restaurada com cor correta
    'outline-none rounded-lg',
    'px-4 py-3', // Padding padronizado (16px horizontal, 12px vertical)
    'text-base',
    'font-poppins',
    'transition-all duration-200 ease-in-out',
    'placeholder:text-gray-400 placeholder:font-normal',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'input-focus-primary',
    hasError && 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200',
  ].filter(Boolean).join(' ');

  return (
    <input
      {...props}
      id={id}
      value={value}
      maxLength={maxLength || INPUT_CURRENCY_MAX_LENGTH_DEFAULT}
      data-testid={dataTestId || ''}
      className={inputClasses}
      onKeyDown={onKeyDown}
      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Normalize decimal separator: convert dot to comma for Brazilian locale
        const normalizedValue = e.target.value.replace(/\.(?=\d{0,2}$)/, ',');
        setValueAsString(normalizedValue);
      }}
      onBlur={(e) => {
        const eventAsNumber = {
          ...e,
          target: {
            ...e?.target,
            value: e.target.value
              ? Number(value.replace(/\./g, '').replace(',', '.').replace('R$', '').trim())
              : '',
          },
        } as ChangeEvent<HTMLInputElement>;

        onChange && onChange(eventAsNumber);
      }}
    />
  );
};