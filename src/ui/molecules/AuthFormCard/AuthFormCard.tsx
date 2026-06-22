import type { ReactNode } from 'react';

import { Logo } from '@atoms';

import { Card } from '../Card/Card';

type AuthFormCardProps = {
  logoAlt: string;
  children: ReactNode;
};

export const AuthFormCard = ({ logoAlt, children }: AuthFormCardProps) => (
  <div className='mb-auth-login-card'>
    <div className='mb-auth-login-card-logo-frame'>
      <Logo hero fitParent alt={logoAlt} />
    </div>
    <Card padding='lg' shadow='md'>
      <div className='mb-auth-login-card-body'>{children}</div>
    </Card>
  </div>
);
