'use client';

import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';

export interface ChartGaugeProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  color?: string;
  valueSuffix?: string;
  decimals?: number;
  hideWhenEmpty?: boolean;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

export const ChartGauge = memo(({
  value,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  title,
  color = '#0090ff',
  valueSuffix = '',
  decimals = 0,
  hideWhenEmpty = true,
}: ChartGaugeProps) => {
  const { t } = useI18n();

  const hasData = useMemo(() => {
    if (hideWhenEmpty) {
      const n = Number(value);
      return Number.isFinite(n);
    }
    return true;
  }, [value, hideWhenEmpty]);

  const option = useMemo(() => {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : min;
    const safeMin = Number.isFinite(Number(min)) ? Number(min) : DEFAULT_MIN;
    const safeMax = Number.isFinite(Number(max)) ? Number(max) : DEFAULT_MAX;

    return {
      title: title
        ? { text: title, left: 'center', top: 8, textStyle: { fontSize: 14 } }
        : undefined,
      series: [
        {
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          min: safeMin,
          max: safeMax,
          center: ['50%', '65%'],
          radius: '90%',
          progress: { show: true, width: 12, roundCap: true },
          axisLine: {
            roundCap: true,
            lineStyle: { width: 12 },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          anchor: { show: false },
          pointer: { show: false },
          detail: {
            valueAnimation: true,
            formatter: (v: number) =>
              (decimals > 0 ? v.toFixed(decimals) : String(v)) + valueSuffix,
            offsetCenter: [0, 0],
            fontSize: 24,
            fontWeight: 600,
            color: 'inherit',
          },
          data: [{ value: safeValue }],
        },
      ],
    };
  }, [value, min, max, title, color, valueSuffix, decimals]);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-lg min-h-[200px]">
        <Flex.Center wFull hFull>
          <div className="text-gray-500 text-lg font-medium">{t('NO_DATA_AVAILABLE')}</div>
        </Flex.Center>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px]" style={{ position: 'relative' }}>
      <ReactECharts
        option={option}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
});

ChartGauge.displayName = 'ChartGauge';
