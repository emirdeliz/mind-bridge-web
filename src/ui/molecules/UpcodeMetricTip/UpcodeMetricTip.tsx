import { ReactNode } from 'react';
import { Icon } from '@atoms';
import {
  useUpcodeMetricTip,
  useUpcodeMetricTipActionPrefix,
  type UpcodeMetricTipData,
  type UpcodeTipColor,
} from '@constants';
import { Tooltip } from '../Tooltip/Tooltip';

const RANGE_COLOR_CLASSES: Record<UpcodeTipColor, string> = {
  green: 'bg-green-500/20 text-green-200 border-green-400/40',
  yellow: 'bg-yellow-500/20 text-yellow-100 border-yellow-400/40',
  orange: 'bg-orange-500/20 text-orange-100 border-orange-400/40',
  red: 'bg-red-500/20 text-red-100 border-red-400/40',
  gray: 'bg-neutral-500/30 text-neutral-200 border-neutral-400/40',
  blue: 'bg-blue-500/20 text-blue-100 border-blue-400/40',
};

export interface UpcodeMetricTipProps {
  metricKey: string;
  data?: UpcodeMetricTipData;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  width?: number;
  children?: ReactNode;
  iconSize?: 'xs' | 'sm' | 'md';
  hideIfMissing?: boolean;
  className?: string;
}

interface BodyProps {
  data: UpcodeMetricTipData;
  actionPrefix: string;
}

const Body = ({ data, actionPrefix }: BodyProps) => (
  <div className="space-y-2.5 text-left">
    <div className="text-sm font-semibold text-white">{data.title}</div>

    <div className="text-xs leading-snug text-neutral-200">{data.definition}</div>

    {data.ranges && data.ranges.length > 0 && (
      <div className="flex flex-wrap gap-1">
        {data.ranges.map((r) => (
          <span
            key={r.label}
            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium leading-none ${RANGE_COLOR_CLASSES[r.color]}`}
          >
            <span className="opacity-70">{r.range}</span>
            <span>·</span>
            <span>{r.label}</span>
          </span>
        ))}
      </div>
    )}

    <div className="border-l-2 border-blue-300 pl-2 text-xs italic leading-snug text-blue-50">
      <span className="not-italic">💡 </span>
      {data.insight}
    </div>

    {data.action && (
      <div className="border-l-2 border-amber-300 pl-2 text-xs leading-snug text-amber-50">
        <span className="font-semibold">{actionPrefix}</span>
        {data.action}
      </div>
    )}
  </div>
);

export const UpcodeMetricTip = ({
  metricKey,
  data,
  placement = 'top',
  width = 360,
  children,
  iconSize = 'sm',
  hideIfMissing = false,
  className,
}: UpcodeMetricTipProps) => {
  const tipData = useUpcodeMetricTip(metricKey, data);
  const actionPrefix = useUpcodeMetricTipActionPrefix();

  if (!tipData) {
    if (hideIfMissing) return null;
    return <>{children ?? null}</>;
  }

  const positionProps = {
    top: placement === 'top',
    bottom: placement === 'bottom',
    left: placement === 'left',
    right: placement === 'right',
  };

  const iconFlags = {
    xxs: iconSize === 'xs',
    xs: iconSize === 'sm',
    sm: iconSize === 'md',
  };

  return (
    <Tooltip
      title={<Body data={tipData} actionPrefix={actionPrefix} />}
      width={width}
      clampToViewport={false}
      {...positionProps}
    >
      {children ?? (
        <span
          className={`inline-flex shrink-0 cursor-help align-middle text-neutral-400 hover:text-neutral-700 ${className ?? ''}`}
          aria-label={tipData.title}
          role="img"
        >
          <Icon.InfoCircle {...iconFlags} />
        </span>
      )}
    </Tooltip>
  );
};

UpcodeMetricTip.displayName = 'UpcodeMetricTip';
