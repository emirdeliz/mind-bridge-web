import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from '@hooks';

export const useChatAutoScroll = (deps: unknown[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useIsomorphicLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    node.scrollTo({
      top: node.scrollHeight,
      behavior: isInitialMount.current ? 'auto' : 'smooth',
    });
    isInitialMount.current = false;
  }, deps);

  return scrollRef;
};
