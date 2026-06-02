import React, { memo, ReactNode } from 'react';
import { Icon, IconProps, Title } from '../../atoms';
import { filterDOMProps } from '@helpers';

interface AlertBaseProps {
  children: ReactNode;
}

export interface AlertProps extends AlertBaseProps {
  before?: ReactNode;
}

const AlertComponent = memo(({ before, children }: AlertProps) => {
  const alertClasses = [
    'flex flex-row items-center',
    'bg-primary-theme-100 text-primary-theme-dark',
    'rounded-md p-4',
  ].join(' ');

  const titleContainerClasses = [
    'flex-1',
  ].join(' ');

  return (
    <div className={alertClasses}>
      {before}
      <div className={titleContainerClasses}>
        <Title p2 center>{children}</Title>
      </div>
    </div>
  );
});

export const Alert = (props: AlertProps) => <AlertComponent {...props} />;
Alert.Info = memo(({ children }: AlertBaseProps & IconProps) => (
  <AlertComponent before={<Icon.InfoCircle p2 nm />}>{children}</AlertComponent>
));
