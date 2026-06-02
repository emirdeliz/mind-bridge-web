import React, { ReactNode } from 'react';

export interface FlexProps {
  children: ReactNode;
  justifyStart?: boolean;
  justifyEnd?: boolean;
  justifyCenter?: boolean;
  justifySpaceBetween?: boolean;
  justifySpaceAround?: boolean;
  justifyInitial?: boolean;
  alignStart?: boolean;
  alignEnd?: boolean;
  alignCenter?: boolean;
  alignSpaceBetween?: boolean;
  alignSpaceAround?: boolean;
  alignBaseline?: boolean;
  alignInitial?: boolean;
  col?: boolean;
  row?: boolean;
  wrap?: boolean;
  wFull?: boolean;
  hFull?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  role?: string;
  flex1?: boolean;
  overflowY?: boolean;
  gap?: number;
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

export const Flex = ({ 
  wrap, 
  justifyStart,
  justifyEnd,
  justifyCenter,
  justifySpaceBetween,
  justifySpaceAround,
  justifyInitial,
  alignStart,
  alignEnd,
  alignCenter,
  alignSpaceBetween,
  alignSpaceAround,
  alignBaseline,
  alignInitial,
  col,
  row,
  wFull,
  hFull,
  maxWidth,
  maxHeight,
  flex1,
  overflowY,
  gap,
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
}: FlexProps) => {
  // Construir classes de flexbox
  const flexDirection = col ? 'flex-col' : row ? 'flex-row' : 'flex-row';
  const flexWrap = wrap ? 'flex-wrap' : 'flex-nowrap';
  
  // Justify content
  const justifyClasses = [
    justifyStart && 'justify-start',
    justifyEnd && 'justify-end',
    justifyCenter && 'justify-center',
    justifySpaceBetween && 'justify-between',
    justifySpaceAround && 'justify-around',
    justifyInitial && 'justify-initial',
  ].filter(Boolean)[0] || 'justify-start';

  // Align items
  const alignClasses = [
    alignStart && 'items-start',
    alignEnd && 'items-end',
    alignCenter && 'items-center',
    alignSpaceBetween && 'items-stretch',
    alignSpaceAround && 'items-stretch',
    alignBaseline && 'items-baseline',
    alignInitial && 'items-initial',
  ].filter(Boolean)[0] || 'items-start';

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

  const containerClasses = [
    'flex',
    flexDirection,
    flexWrap,
    justifyClasses,
    alignClasses,
    wFull && 'w-full',
    hFull && 'h-full',
    flex1 && 'flex-1',
    overflowY && 'overflow-y-auto',
    marginClasses,
    paddingClasses,
    maxWidth ? `max-w-[${maxWidth}]` : '',
    maxHeight ? `max-h-[${maxHeight}]` : '',
    gap ? `gap-[${gap}px]` : '',
  ].filter(Boolean).join(' ');

  return (
    <div {...props} className={containerClasses}>
      {props.children}
    </div>
  );
};

Flex.Row = (props: FlexProps) => {
  return <Flex {...props} row />;
};

Flex.Col = (props: FlexProps) => {
  return <Flex {...props} col />;
};

Flex.Center = (props: FlexProps) => {
  return <Flex {...props} justifyCenter alignCenter />;
};
