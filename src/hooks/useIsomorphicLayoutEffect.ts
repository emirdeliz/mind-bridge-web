import { useEffect, useLayoutEffect } from 'react';

/** useLayoutEffect on the client; useEffect during SSR to avoid hydration warnings. */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
