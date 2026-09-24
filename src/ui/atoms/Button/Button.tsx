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
  /** Icon-only control: no padding, border, or filled background. */
  icon?: boolean;
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
  icon = false,
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
  /** Circle buttons in this design system are icon-only controls. */
  const isIconButton = icon || circle;

  // Construir classes Tailwind dinamicamente
  const sizeClasses = isIconButton
    ? 'p-0'
    : xs
      ? 'h-8 px-2 py-0 text-xs'
      : sm
        ? 'h-9 px-3 py-0 text-sm'
        : nm
          ? 'h-10 px-4 py-0 text-sm'
          : lg
            ? 'h-12 px-6 py-0 text-base'
            : xl
              ? 'h-14 px-8 py-0 text-lg'
              : 'h-10 px-4 py-0 text-sm';

  const widthClasses = wFull ? 'w-full' : 'w-auto';
  const radiusClasses = isIconButton
    ? 'rounded-sm'
    : rounded
      ? 'rounded-lg'
      : 'rounded-md';

  // Variantes de cor - primary usa classes de tema CSS para permitir customização
  const variantClasses = isIconButton
    ? {
        primary: 'text-mb-accent hover:text-mb-accent/80',
        secondary: 'text-mb-muted hover:text-mb-text',
        success: 'text-emerald-400 hover:text-emerald-300',
        danger: 'text-red-400 hover:text-red-300',
        warning: 'text-amber-400 hover:text-amber-300',
        info: 'text-mb-primary hover:text-mb-primary-hover',
      }
    : {
        primary: outlined
          ? 'btn-primary-theme-outlined border-2'
          : 'btn-primary-theme',
        secondary: outlined
          ? 'border-mb-border text-mb-muted hover:border-mb-accent/50 hover:bg-mb-surface-elevated hover:text-mb-text'
          : 'bg-mb-surface-elevated text-mb-text hover:bg-mb-border border-mb-border',
        success: outlined
          ? 'border-emerald-500/60 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/10'
          : 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-600',
        danger: outlined
          ? 'border-mb-danger/60 text-red-300 hover:border-mb-danger hover:bg-red-500/10'
          : 'bg-red-600 text-white hover:bg-red-500 border-red-600',
        warning: outlined
          ? 'border-mb-warning/60 text-amber-200 hover:border-mb-warning hover:bg-amber-500/10'
          : 'bg-amber-600 text-white hover:bg-amber-500 border-amber-600',
        info: outlined
          ? 'border-mb-primary/50 text-mb-primary hover:border-mb-primary hover:bg-mb-primary/10'
          : 'bg-mb-primary text-white hover:bg-mb-primary-hover border-mb-primary',
      };

  const borderClasses = isIconButton
    ? 'border-0'
    : outlined
      ? 'border-2'
      : 'border-2 border-transparent';
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
  ]
    .filter(Boolean)
    .join(' ');

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
    'font-medium font-sans',
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
    isIconButton
      ? 'bg-transparent hover:opacity-80 active:opacity-70'
      : 'hover:brightness-110 active:brightness-95',
    outlined || isIconButton ? 'bg-transparent' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
Button.Default = (props: ButtonProps) => (
  <Button {...props} variant='secondary' />
);
