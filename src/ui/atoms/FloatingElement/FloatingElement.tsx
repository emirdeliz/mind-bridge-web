// @ts-nocheck
import { GenericObject } from '@types';
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  CSSProperties,
  forwardRef,
  Ref,
  ReactElement,
  JSXElementConstructor,
} from 'react';
import { createPortal } from 'react-dom';
import { useIsomorphicLayoutEffect } from '@hooks';

interface FloatingElementProps {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  /** When false, does not cap height to the viewport or use overflow:auto (no inner scroll). */
  clampToViewport?: boolean;
  /** When false, the floating layer does not inherit a min-width from the anchor (e.g. tooltips). */
  matchAnchorMinWidth?: boolean;
  anchor?: HTMLElement | null;
  opened?: boolean;
  children: ReactElement<
    HTMLElement & { _floatingElementStyle: CSSProperties },
    string | JSXElementConstructor<GenericObject>
  >;
}

const FloatingElement = (props: FloatingElementProps) => {
  const [style, setStyle] = useState<CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    anchor,
    opened,
    top,
    bottom,
    left,
    right,
    clampToViewport = true,
    matchAnchorMinWidth = true,
  } = props;

  const updatePosition = useCallback(() => {
    if (!anchor || !containerRef.current) return;

    const anchorBounds = anchor.getBoundingClientRect();
    const containerBounds = containerRef.current.getBoundingClientRect();
    const tempStyle = getIdealPosition(
      anchorBounds,
      containerBounds,
      top,
      bottom,
      left,
      right,
      clampToViewport
    );
    if (matchAnchorMinWidth) {
      tempStyle.minWidth = anchor.offsetWidth - 20;
    }
    setStyle(tempStyle);
  }, [anchor, top, bottom, left, right, clampToViewport, matchAnchorMinWidth]);

  useIsomorphicLayoutEffect(() => {
    if (!opened) {
      setStyle({});
      return;
    }
    if (!anchor) return;

    updatePosition();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });
    resizeObserver.observe(container);

    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [opened, anchor, updatePosition]);

  const containerClasses = ['fixed z-50 font-sans'].join(' ');

  const dynamicStyles: CSSProperties = {
    ...style,
    minWidth:
      matchAnchorMinWidth && anchor ? anchor.offsetWidth - 20 : undefined,
    visibility:
      opened && style.top != null && style.left != null ? 'visible' : 'hidden',
  };

  return (
    <>
      {opened &&
        createPortal(
          <div
            className={containerClasses}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            ref={containerRef}
            style={dynamicStyles}
          >
            {React.isValidElement(props.children)
              ? React.cloneElement(props.children, {
                  _floatingElementAnchor: anchor ?? undefined,
                  _floatingElementStyle: style,
                } as GenericObject)
              : props.children}
          </div>,
          document.body
        )}
    </>
  );
};

const getIdealPosition = (
  anchorBounds: DOMRect,
  containerBounds: DOMRect,
  top?: boolean,
  bottom?: boolean,
  left?: boolean,
  right?: boolean,
  clampToViewport = true
) => {
  const { width, height } = containerBounds;
  const style = {} as CSSProperties;
  const offset = 10;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (right) {
    style.left = anchorBounds.left + anchorBounds.width + offset;
    style.top = anchorBounds.top;
  } else if (left) {
    style.left = anchorBounds.left - width - offset;
    style.top = anchorBounds.top;
  } else if (bottom) {
    style.left = anchorBounds.left;
    style.top = anchorBounds.top + anchorBounds.height + offset;
  } else if (top) {
    style.left = anchorBounds.left;
    style.top = anchorBounds.top - height - offset;
  } else {
    style.left = anchorBounds.left;
    style.top = anchorBounds.top + anchorBounds.height + offset;
  }

  if (
    width > 0 &&
    style.left != null &&
    style.left + width > viewportWidth - offset
  ) {
    style.left = viewportWidth - width - offset;
  }
  if (style.left != null && style.left < offset) {
    style.left = offset;
  }

  if (
    height > 0 &&
    style.top != null &&
    style.top + height > viewportHeight - offset
  ) {
    if (anchorBounds.top - height - offset >= 0) {
      style.top = anchorBounds.top - height - offset;
    } else {
      style.top = viewportHeight - height - offset;
    }
  }
  if (style.top != null && style.top < offset) {
    style.top = offset;
  }

  style.maxWidth = `${viewportWidth - offset * 2}px`;
  if (clampToViewport) {
    style.maxHeight = `${viewportHeight - offset * 2}px`;
    style.overflow = 'auto';
  } else {
    style.overflow = 'visible';
  }

  return style;
};

const withFloat = <T extends GenericObject>(
  Component: (args: GenericObject) => React.JSX.Element
) => {
  const ReffedComponent = (props: T, ref: Ref<GenericObject>) => {
    const [anchor, setAnchor] = useState<HTMLElement>();
    const [opened, setOpened] = useState<boolean>(false);

    useEffect(() => {
      const close = () => {
        if (opened) {
          setOpened(false);
        }
      };
      window.addEventListener('mousedown', close);
      window.addEventListener('mousewheel', close);
      window.addEventListener('resize', close);
      window.addEventListener('touchend', close);
      window.addEventListener('touchmove', close);
      return () => {
        window.removeEventListener('mousedown', close);
        window.removeEventListener('mousewheel', close);
        window.removeEventListener('resize', close);
        window.removeEventListener('touchmove', close);
        window.removeEventListener('touchend', close);
      };
    });

    useImperativeHandle(ref, () => ({
      close: () => setOpened(false),
      isOpen: () => opened,
      open: (a?: HTMLElement) => {
        setAnchor(a);
        setOpened(true);
      },
    }));

    return (
      <FloatingElement
        {...(props as GenericObject)}
        anchor={anchor}
        opened={opened}
      >
        <Component
          _floatingElementAnchor={anchor}
          close={() => setOpened(false)}
          {...(props as GenericObject)}
        />
      </FloatingElement>
    );
  };
  return forwardRef<GenericObject, T>(ReffedComponent as GenericObject);
};

export { FloatingElement, withFloat };
