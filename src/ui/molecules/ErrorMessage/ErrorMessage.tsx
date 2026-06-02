import React from 'react';

interface ErrorMessageProps {
  error: string;
}

export const ErrorMessage = ({ error }: ErrorMessageProps) => {
  const errorClasses = [
    'text-red-600 text-sm font-medium',
    'bg-red-50 border border-red-200',
    'rounded-md px-3 py-2',
    'mt-2',
  ].join(' ');

  return <div className={errorClasses}>{error}</div>;
};

export default ErrorMessage;
