import { useEffect, useState } from 'react';

export const MOBILE_MAX_WIDTH_QUERY = '(max-width: 767px)';

const readMatchMedia = (query: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(query).matches;
};

export const useMatchMedia = (query: string): boolean => {
  const [matches, setMatches] = useState(() => readMatchMedia(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [query]);

  return matches;
};
