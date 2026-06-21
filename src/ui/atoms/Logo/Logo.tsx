const LOGO_SRC = '/images/logo.svg';

const LOGO_SIZES = {
  sm: 28,
  md: 40,
  lg: 48,
  xl: 64,
  hero: 120,
} as const;

export type LogoProps = {
  alt?: string;
  className?: string;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  hero?: boolean;
};

const resolveLogoSize = ({
  sm,
  md,
  lg,
  xl,
  hero,
}: Pick<LogoProps, 'sm' | 'md' | 'lg' | 'xl' | 'hero'>): number => {
  if (hero) return LOGO_SIZES.hero;
  if (xl) return LOGO_SIZES.xl;
  if (lg) return LOGO_SIZES.lg;
  if (md) return LOGO_SIZES.md;
  if (sm) return LOGO_SIZES.sm;
  return LOGO_SIZES.md;
};

export const Logo = ({
  alt = 'Mind Bridge',
  className = '',
  sm,
  md,
  lg,
  xl,
  hero,
}: LogoProps) => {
  const size = resolveLogoSize({ sm, md, lg, xl, hero });

  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      className={['block shrink-0 object-contain', className]
        .filter(Boolean)
        .join(' ')}
      style={{ width: size, height: size }}
    />
  );
};
