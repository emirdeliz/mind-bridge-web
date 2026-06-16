'use client';

import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';

export interface ChartSpiderIndicator {
  name: string;
  max: number;
}

export interface ChartSpiderSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartSpiderProps {
  indicators: ChartSpiderIndicator[];
  series: ChartSpiderSeries[];
  title?: string;
  hideWhenEmpty?: boolean;
  height?: string | number;
}

export const ChartSpider = memo(
  ({
    indicators,
    series,
    title,
    hideWhenEmpty = true,
    height = 320,
  }: ChartSpiderProps) => {
    const { t } = useI18n();

    const hasData = useMemo(
      () =>
        !hideWhenEmpty ||
        (series.length > 0 && series.some((s) => s.data.some((v) => v > 0))),
      [series, hideWhenEmpty]
    );

    const option = useMemo(
      () => ({
        title: title
          ? { text: title, left: 'center', top: 8, textStyle: { fontSize: 14 } }
          : undefined,
        tooltip: { trigger: 'item' },
        legend:
          series.length > 1
            ? { bottom: 0, data: series.map((s) => s.name) }
            : { show: false },
        radar: {
          indicator: indicators,
          radius: '64%',
          center: ['50%', series.length > 1 ? '48%' : '52%'],
          splitArea: {
            show: true,
            areaStyle: { color: ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.04)'] },
          },
          axisName: { fontSize: 12 },
        },
        series: [
          {
            type: 'radar',
            data: series.map((s) => ({
              name: s.name,
              value: s.data,
              lineStyle: s.color ? { color: s.color, width: 2 } : { width: 2 },
              itemStyle: s.color ? { color: s.color } : undefined,
              areaStyle: { opacity: 0.18 },
            })),
          },
        ],
      }),
      [indicators, series, title]
    );

    if (!hasData) {
      return (
        <div
          className='flex items-center justify-center w-full bg-gray-50 rounded-lg'
          style={{ height }}
        >
          <Flex.Center wFull hFull>
            <div className='text-gray-500 text-sm font-medium'>
              {t('NO_DATA_AVAILABLE')}
            </div>
          </Flex.Center>
        </div>
      );
    }

    return (
      <div style={{ width: '100%', height }}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>
    );
  }
);

ChartSpider.displayName = 'ChartSpider';
