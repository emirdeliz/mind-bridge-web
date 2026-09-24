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
    'mb-field block w-full min-w-0',
    'input-focus-primary',
    hasError && 'mb-field-error',
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
