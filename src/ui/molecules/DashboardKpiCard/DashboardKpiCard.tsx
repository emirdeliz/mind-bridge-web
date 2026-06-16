import type { ReactNode } from 'react';

import { Title } from '@atoms';

interface DashboardKpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  accentColor?: string;
}

export const DashboardKpiCard = ({
  label,
  value,
  hint,
  accentColor = '#5eead4',
}: DashboardKpiCardProps) => (
  <div className='mb-kpi-card'>
    <div
      className='mb-kpi-card-accent'
      style={{ backgroundColor: accentColor }}
      aria-hidden
    />
    <Title s1 gray block mb2>
      {label}
    </Title>
    <div className='mb-kpi-card-value'>{value}</div>
    {hint ? (
      <Title s1 gray block mt2>
        {hint}
      </Title>
    ) : null}
  </div>
);
