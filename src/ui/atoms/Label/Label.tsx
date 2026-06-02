import React, { ReactNode } from 'react';

export interface LabelProps {
  children: ReactNode;
  target?: string | number;
  fw3?: boolean;
  n2?: boolean;
  fs3?: boolean;
  error?: boolean;
  disabled?: boolean;
}

export const Label = ({ children, target, fw3, n2, fs3, error, disabled, ...props }: LabelProps) => {
  const labelClasses = [
    'block font-medium',
    'text-gray-700',
    'transition-colors duration-200',
    // Tamanhos
    n2 && 'text-2xl',
    fs3 && 'text-lg',
    !n2 && !fs3 && 'text-sm',
    // Pesos da fonte
    fw3 && 'font-light',
    !fw3 && 'font-medium',
    // Estados
    error && 'text-red-600',
    disabled && 'text-gray-400 cursor-not-allowed',
    // Hover
    !disabled && !error && 'hover:text-gray-800',
  ].filter(Boolean).join(' ');

  return (
    <label className={labelClasses} htmlFor={String(target)} {...props}>
      {children}
    </label>
  );
};
