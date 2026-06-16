import { useLayoutEffect, useRef } from 'react';

export const useChatAutoScroll = (deps: unknown[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useLayoutEffect(() => {
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
