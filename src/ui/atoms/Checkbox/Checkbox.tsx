import React from 'react';
import { GenericObject } from '@types';

export interface CheckboxProps<T> {
  id?: string;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = <T extends GenericObject>({
  id,
  checked = false,
  disabled = false,
  label,
  onChange,
}: CheckboxProps<T>) => {
  const checkboxClasses = [
    'h-4 w-4 shrink-0',
    'checkbox-primary-theme',
    'rounded border-gray-300 bg-gray-100',
    'focus:ring-2',
    disabled && 'cursor-not-allowed opacity-60',
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [
    'flex items-center gap-2',
    'text-sm font-medium text-mb-text',
    disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
  ].join(' ');

  return (
    <label className={labelClasses}>
      <input
        className={checkboxClasses}
        id={id}
        type='checkbox'
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
};
