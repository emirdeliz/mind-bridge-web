import React from 'react';

export interface DividerProps {
  vertical?: boolean;
  thickness?: string;
  length?: string;
  n8?: boolean;
  n9?: boolean;
}

export const Divider = ({
  vertical = false,
  thickness = '1px',
  length = '100%',
  n8 = false,
  n9 = false,
  ...props
}: DividerProps) => {
  const getThickness = () => {
    if (n8) return '2px';
    if (n9) return '3px';
    return thickness;
  };

  const getColor = () => {
    if (n8) return 'bg-gray-200';
    if (n9) return 'bg-gray-300';
    return 'bg-gray-300';
  };

  const dividerClasses = [
    getColor(),
    vertical ? 'h-full' : 'w-full',
    vertical ? `w-[${getThickness()}]` : `w-[${length}]`,
    vertical ? `h-[${length}]` : `h-[${getThickness()}]`,
  ].join(' ');

  return <div className={dividerClasses} {...props} />;
};
