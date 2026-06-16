import { useCallback } from 'react';

export const useOnClickOutside = () => {
  const appendEventOutsideOnWindow = useCallback(
    (element: HTMLElement, handler: () => void) => {
      const onMouseDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target || element.contains(target)) return;
        handler();
        document.removeEventListener('mousedown', onMouseDown);
      };

      document.addEventListener('mousedown', onMouseDown);
    },
    []
  );

  return { appendEventOutsideOnWindow };
};
