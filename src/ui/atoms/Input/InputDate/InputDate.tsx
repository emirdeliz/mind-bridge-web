import * as helpers from '@helpers';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { filterInputDomProps } from '@helpers';
import { InputProps } from '../Input';

export const InputDate = ({
  id,
  value,
  dataTestId,
  onChange,
  hasError,
  ...props
}: InputProps) => {
  const [valueAsString, setValueAsString] = useState<string>('');

  useEffect(() => {
    const valueFormatted = helpers.formatDateAsDDMMYYYY(value as Date);
    valueFormatted && setValueAsString(valueFormatted);
  }, [value]);

  const inputClasses = [
    'w-full',
    'h-12', // Altura padronizada (48px)
    'min-h-[48px]', // Altura mínima garantida
    'bg-white text-gray-900',
    'border border-gray-300', // Borda explícita com cor
    'outline-none rounded-lg',
    'px-4 py-3', // Padding padronizado (16px horizontal, 12px vertical)
    'text-base',
    'font-sans',
    'transition-all duration-200 ease-in-out',
    'placeholder:text-gray-400 placeholder:font-normal',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'input-focus-primary',
    hasError &&
      'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200',
  ]
    .filter(Boolean)
    .join(' ');

  const domProps = filterInputDomProps(props);

  return (
    <input
      {...domProps}
      id={String(id)}
      data-testid={dataTestId || ''}
      data-error={hasError ? 'true' : 'false'}
      value={valueAsString}
      className={inputClasses}
      onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const valueFormatted = helpers.maskDate(e.target.value);
        setValueAsString(valueFormatted);

        const valueAsDate = helpers.parseStringDDMMYYYYToDate(valueFormatted);
        onChange &&
          onChange({
            target: { valueAsDate },
          } as ChangeEvent<HTMLInputElement>);
      }}
    />
  );
};
