import type { ReactNode } from 'react';

import { Flex } from '@atoms';
import type { MarginSpacingProps } from '@atoms';

export type FormActionsProps = MarginSpacingProps & {
  children: ReactNode;
};

/** Right-aligned row for primary/secondary form and modal action buttons. */
export const FormActions = ({ children, ...marginProps }: FormActionsProps) => (
  <Flex row wFull gap2 wrap justifyEnd alignCenter {...marginProps}>
    {children}
  </Flex>
);
