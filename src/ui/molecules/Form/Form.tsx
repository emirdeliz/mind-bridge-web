import React, { ReactNode } from 'react';

import { Flex } from '@atoms';

interface FormChildrenProps {
  children: ReactNode;
  onSubmit?: (evt: React.SyntheticEvent) => void;
}

export const Form = ({ children, onSubmit }: FormChildrenProps) => (
  <form className='modal-form w-full' onSubmit={onSubmit}>
    <Flex col wFull gap6 alignStretch>
      {children}
    </Flex>
  </form>
);
