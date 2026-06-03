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
  const selectClasses = ['mb-field', 'h-12', 'cursor-pointer', 'input-focus-primary'].join(' ');

  const optionClasses = ['bg-mb-surface text-mb-text'].join(' ');

  return (
    <select
      className={`${selectClasses} block w-full`}
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
