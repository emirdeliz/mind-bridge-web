import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface OverlayProps {
  children?: ReactNode;
  visible?: boolean;
  maxWidth?: string;
  maxHeight?: string;
  zIndex?: number;
  onClick?: VoidFunction;
}

export const Overlay = ({ 
  children, 
  visible, 
  zIndex = 10,
  onClick,
  maxWidth,
  maxHeight,
  ...props 
}: OverlayProps) => {
  const overlayClasses = [
    'fixed inset-0',
    'bg-black bg-opacity-50',
    `z-[${zIndex}]`,
    'flex items-center justify-center',
    'p-4',
  ].join(' ');

  return visible && globalThis.document?.body
    ? createPortal(
        <div 
          {...props} 
          className={overlayClasses} 
          onClick={onClick}
        >
          {children}
        </div>, 
        globalThis.document?.body
      )
    : null;
};
