import React from 'react';
import { filterInputDomProps } from '@helpers/filterDomProps';
import { InputProps } from '../Input';

const TEXT_AREA_MAX_LENGTH = 65_535;

export const InputTextArea = ({ maxLength, rows, dataTestId, hasError, disabled, readOnly, ...props }: InputProps) => {
  const id = String(props.id);
  const isReadonly = Boolean(disabled || readOnly);

  const textareaClasses = [
    'mb-field block w-full min-w-0',
    !rows && 'min-h-[80px]',
    'resize-y',
    'input-focus-primary',
    hasError && 'mb-field-error',
    isReadonly && 'mb-field-readonly',
  ].filter(Boolean).join(' ');

  const domProps = filterInputDomProps(props);

  return (
    <textarea
      {...domProps}
      id={id}
      rows={rows}
      disabled={disabled}
      readOnly={readOnly}
      data-testid={dataTestId || ''}
      value={String(props.value)}
      maxLength={maxLength || TEXT_AREA_MAX_LENGTH}
      className={textareaClasses}
    />
  );
};