import { ReactNode, useCallback, useRef } from 'react';

interface InfiniteScrollProps {
  loading?: boolean;
  children: Array<ReactNode>;
  onLoadNewPage: VoidFunction;
}

export const InfiniteScroll = ({
  children,
  loading,
  onLoadNewPage,
}: InfiniteScrollProps) => {
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          onLoadNewPage();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, onLoadNewPage]
  );

  return children.map((child, i) => {
    return (
      <div
        key={i}
        ref={i === children.length - 1 ? lastPostElementRef : undefined}
      >
        {child}
      </div>
    );
  });
};
