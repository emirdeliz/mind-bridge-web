import React, { ReactNode } from 'react';

export interface RowProps {
  children: ReactNode;
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

export const Row = ({
  children,
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
}: RowProps) => {
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

  const rowClasses = [
    'w-full flex flex-row flex-wrap',
    'row',
    marginClasses,
    paddingClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div {...props} className={rowClasses}>
      {children}
    </div>
  );
};
