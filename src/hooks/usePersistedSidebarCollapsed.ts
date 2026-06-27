'use client';

import { useCallback, useEffect, useState } from 'react';

import { MOBILE_MAX_WIDTH_QUERY, useMatchMedia } from './useMatchMedia';

export const usePersistedSidebarCollapsed = (storageKey: string) => {
  const isMobile = useMatchMedia(MOBILE_MAX_WIDTH_QUERY);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, [isMobile, storageKey]);

  const toggleCollapsed = useCallback(() => {
    if (isMobile) {
      return;
    }

    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(storageKey, String(next));
      return next;
    });
  }, [isMobile, storageKey]);

  return {
    isMobile,
    collapsed,
    showCollapsedNav: !isMobile && collapsed,
    toggleCollapsed,
  };
};
