import type { ReactNode } from 'react';

import { Logo } from '@atoms';

import { Card } from '../Card/Card';

type AuthFormCardProps = {
  logoAlt: string;
  appName: string;
  children: ReactNode;
};

export const AuthFormCard = ({ logoAlt, appName, children }: AuthFormCardProps) => (
  <div className='mb-auth-login-card'>
    <div className='mb-auth-login-card-logo-frame'>
      <div className='mb-auth-login-card-logo-icon'>
        <Logo hero fitParent alt={logoAlt} />
      </div>
      <span className='mb-auth-login-card-app-name'>{appName}</span>
    </div>
    <Card padding='lg' shadow='md'>
      <div className='mb-auth-login-card-body'>{children}</div>
    </Card>
  </div>
);
