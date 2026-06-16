import type { ReactNode } from 'react';

import { Icon, Title } from '@atoms';

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  message,
  icon,
  className = '',
}: EmptyStateProps) => (
  <div className={`mb-empty-state ${className}`.trim()}>
    <span className='mb-empty-state-icon' aria-hidden>
      {icon ?? <Icon.InfoCircle sm />}
    </span>
    <Title s1 gray center block>
      {message}
    </Title>
  </div>
);
