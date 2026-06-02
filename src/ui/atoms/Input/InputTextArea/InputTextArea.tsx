import React from 'react';
import { InputProps } from '../Input';

const TEXT_AREA_MAX_LENGTH = 65_535;

export const InputTextArea = ({ maxLength, rows, dataTestId, hasError, ...props }: InputProps) => {
  const id = String(props.id);

  const textareaClasses = [
    'w-full',
    !rows && 'min-h-[80px]', // Altura mínima para textareas (apenas se rows não definido)
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
    'resize-vertical', // Apenas redimensionamento vertical
    hasError && 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200',
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