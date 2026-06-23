import React, { memo, ReactNode } from 'react';
import { Icon, IconProps } from '@atoms';

interface AlertBaseProps {
  children: ReactNode;
}

export interface AlertProps extends AlertBaseProps {
  before?: ReactNode;
}

const AlertComponent = memo(({ before, children }: AlertProps) => (
  <div className='mb-alert-warning'>
    {before}
    <div className='flex-1 leading-relaxed'>{children}</div>
  </div>
));

export const Alert = (props: AlertProps) => <AlertComponent {...props} />;
Alert.Info = memo(({ children }: AlertBaseProps & IconProps) => (
  <AlertComponent before={<Icon.InfoCircle p2 nm />}>{children}</AlertComponent>
));
