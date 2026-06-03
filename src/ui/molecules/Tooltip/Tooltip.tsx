// @ts-nocheck
import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
  useImperativeHandle,
  CSSProperties,
  forwardRef,
  ReactNode,
  RefObject,
} from 'react';
import { withFloat } from '@atoms';
import type { GenericObject } from '@types';
import { filterDOMProps } from '@helpers';

export interface TooltipProps {
  invisible?: boolean;
  width?: number;
  minWidth?: number;
  /** When false, floating layer is not height-clamped to the viewport (no vertical scroll inside the float). */
  clampToViewport?: boolean;
  /** When false, tooltip width follows content only (no min-width from the trigger). */
  matchAnchorMinWidth?: boolean;
  title: any;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  style?: CSSProperties;
  _floatingElementAnchor?: HTMLDivElement;
  _floatingElementStyle?: CSSProperties;
  children?: ReactNode;
  hideArrow?: boolean;
  onMouseOver?: VoidFunction;
  onMouseLeave?: VoidFunction;
  ref?: RefObject<HTMLDivElement>;
}

const ARROW_SIZE = 7;
const ARROW_HALF = ARROW_SIZE;

const TooltipPopup = withFloat((props: GenericObject) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [arrowStyle, setArrowStyle] = useState<CSSProperties>({});
  const {
    title,
    hideArrow,
    top,
    bottom,
    left,
    right,
    width,
    minWidth,
    style: styleProp,
    _floatingElementAnchor,
    _floatingElementStyle,
    onMouseOver,
    onMouseLeave,
  } = props as unknown as TooltipProps;

  const isArrowVertical = !left && !right;
  /** Tooltip acima do anchor — seta na borda inferior apontando para baixo. */
  const arrowOnBottomEdge = Boolean(top);
  /** Tooltip abaixo do anchor (ou padrão) — seta na borda superior apontando para cima. */
  const arrowOnTopEdge = Boolean(bottom || (!top && !bottom && !left && !right));

  const updateArrowPosition = useCallback(() => {
    if (!popupRef.current || !_floatingElementAnchor) return;

    const popupRect = popupRef.current.getBoundingClientRect();
    const anchorRect = _floatingElementAnchor.getBoundingClientRect();

    if (isArrowVertical) {
      const anchorCenterX =
        anchorRect.left + anchorRect.width / 2 - popupRect.left;
      const clampedLeft = Math.max(
        ARROW_HALF,
        Math.min(popupRect.width - ARROW_HALF, anchorCenterX),
      );
      setArrowStyle(
        arrowOnBottomEdge
          ? { left: clampedLeft, bottom: -ARROW_HALF, top: 'auto', transform: 'translateX(-50%)' }
          : { left: clampedLeft, top: -ARROW_HALF, bottom: 'auto', transform: 'translateX(-50%)' },
      );
      return;
    }

    const anchorCenterY =
      anchorRect.top + anchorRect.height / 2 - popupRect.top;
    const clampedTop = Math.max(
      ARROW_HALF,
      Math.min(popupRect.height - ARROW_HALF, anchorCenterY),
    );
    setArrowStyle(
      right
        ? { top: clampedTop, left: -ARROW_HALF, transform: 'translateY(-50%)' }
        : { top: clampedTop, right: -ARROW_HALF, transform: 'translateY(-50%)' },
    );
  }, [
    _floatingElementAnchor,
    _floatingElementStyle,
    isArrowVertical,
    arrowOnBottomEdge,
    bottom,
    left,
    right,
    top,
  ]);

  useLayoutEffect(() => {
    updateArrowPosition();

    const popup = popupRef.current;
    if (!popup) return;

    const resizeObserver = new ResizeObserver(updateArrowPosition);
    resizeObserver.observe(popup);

    const handleViewportChange = () => updateArrowPosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [updateArrowPosition]);

  const arrowClass = arrowOnBottomEdge
    ? 'mb-tooltip-arrow-bottom'
    : arrowOnTopEdge
      ? 'mb-tooltip-arrow-top'
      : right
        ? 'mb-tooltip-arrow-right'
        : 'mb-tooltip-arrow-left';

  const contentStyle: CSSProperties = {
    ...(minWidth != null ? { minWidth } : {}),
    ...(width ? { width, maxWidth: width } : {}),
    ...(styleProp ?? {}),
  };
  const domProps = filterDOMProps(props);

  return (
    <div ref={popupRef} className="mb-tooltip-shell">
      <div
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
        className="mb-tooltip"
        style={contentStyle}
        {...domProps}
      >
        {title}
      </div>
      {!hideArrow ? (
        <div className={arrowClass} style={arrowStyle} data-testid="tooltip-arrow" />
      ) : null}
    </div>
  );
});

interface TooltipRefObject {
  open: (
    div: HTMLDivElement | null,
    top?: boolean,
    bottom?: boolean,
    left?: boolean,
    right?: boolean
  ) => void;
  close: VoidFunction;
  isOpen: () => boolean;
}

export const Tooltip = forwardRef<TooltipRefObject, TooltipProps>((props, ref) => {
    const refTooltip = useRef<TooltipRefObject | undefined>(undefined);
    const refDivContents = useRef<HTMLDivElement>(null);
    const [timeOutId, setTimeOutId] = useState<NodeJS.Timeout | null>();
    const { top, bottom, left, right, title, invisible, children } =
      props;

    const open = () => {
      if (refTooltip.current && !refTooltip.current?.isOpen()) {
        refTooltip.current.open(
          refDivContents.current,
          top,
          bottom,
          left,
          right
        );
      }
    };

    const close = () => {
      if (refTooltip.current) {
        refTooltip.current.close();
      }
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
      isOpen: () => refTooltip.current?.isOpen() ?? false,
    }));

    const extraTooltipProps = {
      onMouseLeave: () => close(),
      onMouseOver: () => {
        if (timeOutId) {
          clearTimeout(timeOutId);
          setTimeOutId(null);
        }
      },
    };

    const isMobile = false;
    return (
      <>
        {title && !invisible && (
          <TooltipPopup
            {...props}
            {...extraTooltipProps}
            clampToViewport={props.clampToViewport ?? false}
            matchAnchorMinWidth={props.matchAnchorMinWidth ?? false}
            ref={refTooltip}
          />
        )}
        <div
          onMouseOver={() => !isMobile && open()}
          onMouseMove={() => !isMobile && open()}
          onMouseDown={(e) => !isMobile && e.stopPropagation()}
          onMouseLeave={() => !isMobile && close()}
          onTouchEnd={() => open()}
          ref={refDivContents}
          className="inline-block"
        >
          {children}
        </div>
      </>
    );
  }
);
