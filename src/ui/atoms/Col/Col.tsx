import React, { memo, ReactNode, useEffect, useState } from 'react';

export type ColSize =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12';

export interface ColProps {
  de?: ColSize;
  mobiles?: ColSize;
  mobilem?: ColSize;
  mobilel?: ColSize;
  tablet?: ColSize;
  laptop?: ColSize;
  desktop?: ColSize;
  auto?: boolean;
  children?: ReactNode;
  className?: string;
  // Margens
  m?: string;
  mt?: string;
  mr?: string;
  mb?: string;
  ml?: string;
  mx?: string;
  my?: string;
  // Padding
  p?: string;
  pt?: string;
  pr?: string;
  pb?: string;
  pl?: string;
  px?: string;
  py?: string;
}

const ColBase = memo(({
  children,
  de,
  mobiles,
  mobilem,
  mobilel,
  tablet,
  laptop,
  desktop,
  auto,
  className,
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  p,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
  ...props
}: ColProps) => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Construir classes de grid responsivo
  const getGridClasses = () => {
    if (auto) {
      return 'flex-1 max-w-full';
    }

    // Mapear tamanhos para classes Tailwind
    const sizeMap: Record<ColSize, string> = {
      '1': 'w-1/12',
      '2': 'w-2/12',
      '3': 'w-3/12',
      '4': 'w-4/12',
      '5': 'w-5/12',
      '6': 'w-6/12',
      '7': 'w-7/12',
      '8': 'w-8/12',
      '9': 'w-9/12',
      '10': 'w-10/12',
      '11': 'w-11/12',
      '12': 'w-full',
    };

    // Classes base
    let classes = ['min-h-px', 'box-border'];

    // Desktop (padrão)
    if (de) {
      classes.push(sizeMap[de]);
    }

    // Mobile S (320px)
    if (mobiles) {
      classes.push(`sm:${sizeMap[mobiles]}`);
    }

    // Mobile M (375px)
    if (mobilem) {
      classes.push(`sm:${sizeMap[mobilem]}`);
    }

    // Mobile L (425px)
    if (mobilel) {
      classes.push(`md:${sizeMap[mobilel]}`);
    }

    // Tablet (768px)
    if (tablet) {
      classes.push(`lg:${sizeMap[tablet]}`);
    }

    // Laptop (1024px)
    if (laptop) {
      classes.push(`xl:${sizeMap[laptop]}`);
    }

    // Desktop (1440px)
    if (desktop) {
      classes.push(`2xl:${sizeMap[desktop]}`);
    }

    return classes.join(' ');
  };

  // Construir margens
  const marginClasses = [
    m && `m-${m}`,
    mt && `mt-${mt}`,
    mr && `mr-${mr}`,
    mb && `mb-${mb}`,
    ml && `ml-${ml}`,
    mx && `mx-${mx}`,
    my && `my-${my}`,
  ].filter(Boolean).join(' ');

  // Construir padding
  const paddingClasses = [
    p && `p-${p}`,
    pt && `pt-${pt}`,
    pr && `pr-${pr}`,
    pb && `pb-${pb}`,
    pl && `pl-${pl}`,
    px && `px-${px}`,
    py && `py-${py}`,
  ].filter(Boolean).join(' ');

  const colClasses = [
    getGridClasses(),
    marginClasses,
    paddingClasses,
    'px-2', // Padding horizontal padrão para espaçamento entre colunas
    className,
  ].filter(Boolean).join(' ');

  return (
    <div {...props} className={colClasses}>
      {children}
    </div>
  );
});

export const Col = (props: ColProps) => <ColBase {...props} />;
Col.C1 = (props: ColProps) => <Col {...props} de="1" />;
Col.C2 = (props: ColProps) => <Col {...props} de="2" />;
Col.C3 = (props: ColProps) => <Col {...props} de="3" />;
Col.C4 = (props: ColProps) => <Col {...props} de="4" />;
Col.C5 = (props: ColProps) => <Col {...props} de="5" />;
Col.C6 = (props: ColProps) => <Col {...props} de="6" />;
Col.C7 = (props: ColProps) => <Col {...props} de="7" />;
Col.C8 = (props: ColProps) => <Col {...props} de="8" />;
Col.C9 = (props: ColProps) => <Col {...props} de="9" />;
Col.C10 = (props: ColProps) => <Col {...props} de="10" />;
Col.C11 = (props: ColProps) => <Col {...props} de="11" />;
Col.C12 = (props: ColProps) => <Col {...props} de="12" />;
Col.Auto = (props: ColProps) => <Col {...props} auto />;
