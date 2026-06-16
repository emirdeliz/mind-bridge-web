import React, { MouseEvent, ReactNode, RefObject, useRef } from 'react';
import { TitleProps } from '..';
import { Icon, IconProps } from '../Icon/Icon';

export interface LinkProps extends Omit<TitleProps, 'id'> {
  children?: ReactNode;
  id?: string;
  href?: string;
  target?: string;
  role?: string;
  rel?: string;
  dataTestId?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLLabelElement>) => void;
  noUnderline?: boolean;
}

export interface LinkIconProps extends LinkProps, IconProps {}

export const Link = ({
  children,
  dataTestId,
  noUnderline,
  ...props
}: LinkProps) => {
  const linkClasses = [
    'text-primary-theme',
    'hover:text-primary-theme-dark',
    'cursor-pointer',
    'transition-colors duration-200',
    noUnderline ? '' : 'underline',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a className={linkClasses} data-testid={dataTestId} {...props}>
      {children}
    </a>
  );
};

Link.Icon = ({ children, ...props }: LinkIconProps) => (
  <Link {...props}>
    <Icon {...{ ...props, onClick: undefined }} /> {children}
  </Link>
);

interface LinkUploadProps extends LinkProps {
  accept?: string;
  onChange: (file?: File) => void;
}

Link.Upload = ({ children, accept, onChange, ...props }: LinkUploadProps) => {
  const linkUploadClasses = [
    'inline-flex items-center gap-2',
    'text-primary-theme hover:text-primary-theme-dark',
    'cursor-pointer',
    'transition-colors duration-200',
  ].join(' ');

  const linkInputUploadClasses = ['hidden'].join(' ');

  return (
    <label className={linkUploadClasses}>
      <input
        type='file'
        className={linkInputUploadClasses}
        onChange={(e) => onChange(e.target.files?.[0])}
        accept={accept}
      />
      {children}
    </label>
  );
};
