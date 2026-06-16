import React, { ReactNode } from 'react';

import {
  buildMarginClasses,
  buildPaddingClasses,
  type MarginSpacingProps,
  type PaddingSpacingProps,
} from '../shared/spacingClasses';

export interface RowProps extends MarginSpacingProps, PaddingSpacingProps {
  children: ReactNode;
}

export const Row = ({ children, ...spacingProps }: RowProps) => {
  const rowClasses = [
    'flex flex-row',
    buildMarginClasses(spacingProps),
    buildPaddingClasses(spacingProps),
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={rowClasses}>{children}</div>;
};
