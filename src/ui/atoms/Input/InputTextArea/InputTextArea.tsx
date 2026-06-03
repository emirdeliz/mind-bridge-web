import React from 'react';
import { InputProps } from '../Input';

const TEXT_AREA_MAX_LENGTH = 65_535;

export const InputTextArea = ({ maxLength, rows, dataTestId, hasError, ...props }: InputProps) => {
  const id = String(props.id);

  const textareaClasses = [
    'mb-field block w-full min-w-0',
    !rows && 'min-h-[80px]',
    'resize-y',
    'input-focus-primary',
    hasError && 'mb-field-error',
  ].filter(Boolean).join(' ');

  return (
    <textarea
      {...props}
      id={id}
      rows={rows}
      data-testid={dataTestId || ''}
      value={String(props.value)}
      maxLength={maxLength || TEXT_AREA_MAX_LENGTH}
      className={textareaClasses}
    />
  );
};