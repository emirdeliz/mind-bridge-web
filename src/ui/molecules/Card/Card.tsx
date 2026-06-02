import { ReactNode } from "react";

export interface CardProps { 
  children: ReactNode;
  maxWidth?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hover?: boolean;
}

export const Card = ({ 
  children, 
  maxWidth, 
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
  ...props 
}: CardProps ) => { 
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const cardClasses = [
    'flex w-full flex-col',
    'bg-white',
    'rounded-lg',
    shadowClasses[shadow],
    paddingClasses[padding],
    border && 'border border-gray-200',
    hover && 'hover:shadow-lg transition-shadow duration-200',
    'transition-all duration-200',
    maxWidth ? `max-w-[${maxWidth}]` : '',
  ].join(' ');

  return (
    <div {...props} className={cardClasses}>
      {children}
    </div>
  );
}