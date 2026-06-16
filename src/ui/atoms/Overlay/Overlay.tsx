'use client';

import React, { ReactNode, useCallback, useRef } from 'react';
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
  const backdropPressRef = useRef(false);

  const handlePointerDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      backdropPressRef.current = event.target === event.currentTarget;
    },
    []
  );

  const handlePointerUp = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (
        onClick &&
        backdropPressRef.current &&
        event.target === event.currentTarget
      ) {
        onClick();
      }
      backdropPressRef.current = false;
    },
    [onClick]
  );

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
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
        >
          {children}
        </div>,
        globalThis.document?.body
      )
    : null;
};
