import React, { ReactNode } from 'react';

export interface FormErrorProps {
  children: ReactNode;
  error?: string;
  margin?: string;
  mt?: string;
  mr?: string;
  mb?: string;
  ml?: string;
  mx?: string;
  my?: string;
}

export const FormError = ({ 
  children, 
  error,
  margin,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  ...props 
}: FormErrorProps) => {
  const marginClasses = [
    margin && `m-${margin}`,
    mt && `mt-${mt}`,
    mr && `mr-${mr}`,
    mb && `mb-${mb}`,
    ml && `ml-${ml}`,
    mx && `mx-${mx}`,
    my && `my-${my}`,
  ].filter(Boolean).join(' ');

  if (!error) {
    return <div className={marginClasses}>{children}</div>;
  }

  return (
    <div className={marginClasses}>
      {children}
      <div className="mt-2 text-sm font-medium text-mb-danger">
        {error}
      </div>
    </div>
  );
};
