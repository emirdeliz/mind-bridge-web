'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { MOBILE_MAX_WIDTH_QUERY, useMatchMedia } from '@hooks';

type MobileSidebarNavContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const MobileSidebarNavContext = createContext<MobileSidebarNavContextValue | null>(
  null,
);

export const MobileSidebarNavProvider = ({ children }: { children: ReactNode }) => {
  const isMobile = useMatchMedia(MOBILE_MAX_WIDTH_QUERY);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, isOpen]);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
    }),
    [close, isOpen, open],
  );

  return (
    <MobileSidebarNavContext.Provider value={value}>
      {children}
    </MobileSidebarNavContext.Provider>
  );
};

export const useMobileSidebarNav = (): MobileSidebarNavContextValue => {
  const context = useContext(MobileSidebarNavContext);
  if (!context) {
    throw new Error('useMobileSidebarNav must be used within MobileSidebarNavProvider');
  }
  return context;
};

export const useMobileSidebarNavOptional = (): MobileSidebarNavContextValue | null =>
  useContext(MobileSidebarNavContext);
