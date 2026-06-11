import { MouseEventHandler, ReactNode } from 'react';
import { filterButtonDomProps } from '@helpers';

export interface ButtonProps {
  children?: ReactNode;
  dataTestId?: string;
  clickable?: boolean;
  disabled?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  wFull?: boolean;
  link?: boolean;
  circle?: boolean;
  maxWidth?: string;
  minWidth?: string;
  title?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'submit' | 'reset' | 'button';
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  // Tamanhos
  xs?: boolean;
  sm?: boolean;
  nm?: boolean;
  lg?: boolean;
  xl?: boolean;
  // Margens
  m?: string;
  mt?: string;
  mr?: string;
  mb?: string;
  ml?: string;
  mx?: string;
  my?: boolean;
  // Props específicas
  default?: boolean;
  selected?: boolean;
  chip?: boolean;
}

export const Button = ({
  children,
  dataTestId = 'button-atom',
  clickable = true,
  disabled = false,
  onClick,
  title,
  type = 'button',
  rounded = false,
  outlined = false,
  wFull = false,
  circle = false,
  maxWidth,
  minWidth,
  variant = 'primary',
  xs = false,
  sm = false,
  nm = false,
  lg = false,
  xl = false,
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  default: defaultVariant = false,
  selected = false,
  chip = false,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || !clickable;

  // Construir classes Tailwind dinamicamente
  const sizeClasses = xs ? 'px-2 py-1 text-xs' : 
                     sm ? 'px-3 py-1.5 text-sm' : 
                     nm ? 'px-4 py-2 text-sm' :
                     lg ? 'px-6 py-3 text-base' : 
                     xl ? 'px-8 py-4 text-lg' : 'px-4 py-2 text-sm';
  
  const widthClasses = wFull ? 'w-full' : 'w-auto';
  const radiusClasses = circle ? 'rounded-full' : rounded ? 'rounded-lg' : 'rounded-md';
  
  // Variantes de cor - primary usa classes de tema CSS para permitir customização
  const variantClasses = {
    primary: outlined ? 'btn-primary-theme-outlined border-2' : 'btn-primary-theme',
    secondary: outlined
      ? 'border-mb-border text-mb-muted hover:border-mb-accent/50 hover:bg-mb-surface-elevated hover:text-mb-text'
      : 'bg-mb-surface-elevated text-mb-text hover:bg-mb-border border-mb-border',
    success: outlined ? 'border-green-600 text-green-600 hover:bg-green-50' : 'bg-green-600 text-white hover:bg-green-700',
    danger: outlined ? 'border-red-600 text-red-600 hover:bg-red-50' : 'bg-red-600 text-white hover:bg-red-700',
    warning: outlined ? 'border-yellow-600 text-yellow-600 hover:bg-yellow-50' : 'bg-yellow-600 text-white hover:bg-yellow-700',
    info: outlined ? 'border-cyan-600 text-cyan-600 hover:bg-cyan-50' : 'bg-cyan-600 text-white hover:bg-cyan-700',
  };

  const borderClasses = outlined ? 'border-2' : 'border-2 border-transparent';
  const opacityClasses = isDisabled ? 'opacity-50' : 'opacity-100';
  const cursorClasses = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';
  
  // Construir margens
  const marginClasses = [
    m && `m-${m}`,
    mt && `mt-${mt}`,
    mr && `mr-${mr}`,
    mb && `mb-${mb}`,
    ml && `ml-${ml}`,
    mx && `mx-${mx}`,
    my && 'my-2',
  ].filter(Boolean).join(' ');

  const chipClasses = chip
    ? 'rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide'
    : '';

  const selectedClasses = selected
    ? 'bg-mb-accent/20 text-mb-accent ring-1 ring-mb-accent/30'
    : chip
      ? 'text-mb-muted hover:bg-mb-surface-elevated hover:text-mb-text'
      : '';

  const buttonClasses = [
    'flex items-center justify-center',
    'font-medium font-poppins',
    sizeClasses,
    widthClasses,
    radiusClasses,
    borderClasses,
    opacityClasses,
    cursorClasses,
    marginClasses,
    chipClasses,
    chip ? selectedClasses : variantClasses[variant],
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-mb-accent/30',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transform hover:scale-105 active:scale-95',
    outlined ? 'bg-transparent' : '',
  ].filter(Boolean).join(' ');

  const domProps = filterButtonDomProps(props);

  return (
    <button
      {...domProps}
      title={title}
      disabled={isDisabled}
      data-testid={dataTestId}
      type={type}
      className={`${buttonClasses} ${maxWidth ? `max-w-[${maxWidth}]` : 'max-w-full'} ${minWidth ? `min-w-[${minWidth}]` : ''}`}
      onClick={(e) => {
        if (!isDisabled && onClick) {
          onClick(e);
        }
      }}
    >
      {children}
    </button>
  );
};

Button.Outlined = (props: ButtonProps) => <Button {...props} outlined />;
Button.Rounded = (props: ButtonProps) => <Button {...props} rounded />;
Button.Default = (props: ButtonProps) => <Button {...props} variant="secondary" />;
