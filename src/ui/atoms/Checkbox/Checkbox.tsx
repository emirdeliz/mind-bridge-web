import React from 'react';
import { GenericObject } from '@types';

export interface CheckboxProps<T> {
  id?: string;
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = <T extends GenericObject> ({ id, checked = false, disabled = false, label, onChange }: CheckboxProps<T>) => {
  const checkboxWrapperClasses = [
    'flex items-center gap-2',
  ].join(' ');

  const checkboxClasses = [
    'w-4 h-4',
    'checkbox-primary-theme',
    'bg-gray-100',
    'border-gray-300',
    'rounded',
    'focus:ring-2',
  ].join(' ');

  const labelClasses = [
    'text-sm font-medium text-gray-700',
    'cursor-pointer',
  ].join(' ');

  return (
    <div className={checkboxWrapperClasses}>
      <input
        className={checkboxClasses}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)}
      />
      {label && <label className={labelClasses} htmlFor={id}>{label}</label>}
    </div>
  );
};