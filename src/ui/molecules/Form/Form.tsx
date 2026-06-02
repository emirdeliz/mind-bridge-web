import React, { ReactNode } from 'react';
import { Flex } from '@atoms';

interface FormChildrenProps {
  children: ReactNode;
  onSubmit?: (evt: React.SyntheticEvent) => void;
}

export const Form = ({ children, onSubmit, ...props }: FormChildrenProps) => {
  const formClasses = [
    'w-full',
    'space-y-6',
    'modal-form',
  ].join(' ');

  return (
    <form className={formClasses} onSubmit={onSubmit} {...props}>
      <div className="w-full space-y-6">{children}</div>
    </form>
  );
};
