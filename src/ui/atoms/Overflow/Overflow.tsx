import { Flex } from '@atoms';
import React, { ReactNode } from 'react';

export interface OverflowProps {
  children: ReactNode;
}

export const Overflow = ({ children }: OverflowProps) => {
  return (
    <Flex wFull hFull>
      <div className='w-full h-full overflow-hidden'>
        <div className='w-full h-full overflow-auto'>{children}</div>
      </div>
    </Flex>
  );
};
