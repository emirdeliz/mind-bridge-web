import { FocusEvent, ReactNode } from 'react';

interface SelectOption { 
  label: string;
  value: string | number;
}

export interface SelectProps {
  id?: string;
  dataTestId?: string;
  clickable?: boolean;
  value?: string | number;
  hasError?: boolean;
  disabled?: boolean;
  options: Array<SelectOption>;
  children?: ReactNode;
  onChange?: (value: string | number) => void;
  onBlur?: (e: FocusEvent<HTMLSelectElement>) => void;
}

export const Select = ({
  dataTestId = 'input-atom-select',
  clickable = true,
  value,
  children,
  options,
  onChange,
  disabled,
  ...props
}: SelectProps) => {
  const selectClasses = [
    'w-full',
    'h-12', // Altura padronizada (48px)
    'min-h-[48px]', // Altura mínima garantida
    'border border-gray-300', // Borda restaurada com cor correta
    'rounded-md',
    'bg-white text-gray-900',
    'input-focus-primary',
    'disabled:bg-gray-100 disabled:cursor-not-allowed',
  ].join(' ');

  const optionClasses = [
    'px-3 py-2',
    'text-gray-900',
  ].join(' ');

  return (
    <select
      className={selectClasses}
      role="select"
      data-testid={dataTestId}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        e.stopPropagation();
        if (clickable && onChange) {
          onChange(e.target.value);
        }
      }}
      {...props}
    >
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          role="option"
          className={optionClasses}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
};
