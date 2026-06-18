'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type MobileSidebarNavContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const MobileSidebarNavContext = createContext<MobileSidebarNavContextValue | null>(
  null,
);

export const MobileSidebarNavProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

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
