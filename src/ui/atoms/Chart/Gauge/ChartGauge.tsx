'use client';

import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';
import { MB_CHART_TEXT, mbChartTitleStyle } from '../chartDarkTheme';

export interface ChartGaugeProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  color?: string;
  valueSuffix?: string;
  decimals?: number;
  hideWhenEmpty?: boolean;
  height?: string | number;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

export const ChartGauge = memo(
  ({
    value,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    title,
    color = '#0090ff',
    valueSuffix = '',
    decimals = 0,
    hideWhenEmpty = true,
    height = 280,
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
        backgroundColor: 'transparent',
        title: title ? mbChartTitleStyle(title) : undefined,
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
              color: MB_CHART_TEXT,
            },
            data: [{ value: safeValue }],
          },
        ],
      };
    }, [value, min, max, title, color, valueSuffix, decimals]);

    const heightCss = typeof height === 'number' ? `${height}px` : height;

    if (!hasData) {
      return (
        <div className='mb-chart-empty' style={{ height: heightCss }}>
          <Flex.Center wFull hFull>
            <div className='mb-chart-empty-text'>{t('NO_DATA_AVAILABLE')}</div>
          </Flex.Center>
        </div>
      );
    }

    return (
      <div
        className='min-w-0 w-full'
        style={{ height: heightCss, position: 'relative' }}
      >
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    );
  }
);

ChartGauge.displayName = 'ChartGauge';
