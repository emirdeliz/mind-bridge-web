import React from 'react';

export interface DotProps {
  xss?: boolean;
  xs?: boolean;
  sm?: boolean;
  nm?: boolean;
  outlined?: boolean;
  white?: boolean;
  p3?: boolean;
  red?: boolean;
  green?: boolean;
  blue?: boolean;
  gray?: boolean;
}

export const Dot = ({ 
  xss, 
  xs, 
  sm, 
  nm, 
  outlined, 
  white, 
  p3, 
  red,
  green,
  blue,
  gray,
  ...props 
}: DotProps) => {
  const dotClasses = [
    'inline-block rounded-full',
    // Tamanhos
    xss && 'w-2 h-2',
    xs && 'w-3 h-3',
    sm && 'w-4 h-4',
    nm && 'w-6 h-6',
    // Estilo
    outlined ? 'border-current bg-transparent' : 'bg-current',
    // Cores
    white && 'text-white',
    red && 'text-red-500',
    green && 'text-green-500',
    blue && 'text-blue-500',
    gray && 'text-gray-500',
    // Padding
    p3 && 'p-3',
    // Fallback para cor padrão se nenhuma cor específica for definida
    !white && !red && !green && !blue && !gray && 'text-gray-400',
  ].filter(Boolean).join(' ');

  return (
    <span className={dotClasses} {...props} />
  );
};

Dot.Xss = (props: DotProps) => <Dot {...props} xss />;
Dot.Xs = (props: DotProps) => <Dot {...props} xs />;
Dot.Sm = (props: DotProps) => <Dot {...props} sm />;
Dot.Nm = (props: DotProps) => <Dot {...props} nm />;
Dot.Outlined = (props: DotProps) => <Dot {...props} outlined />;
