'use client';

import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';

export interface ChartBarVerticalSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartBarVerticalProps {
  categories: string[];
  series: ChartBarVerticalSeries[];
  title?: string;
  unit?: string;
  stacked?: boolean;
  hideWhenEmpty?: boolean;
  height?: string | number;
}

export const ChartBarVertical = memo(({
  categories,
  series,
  title,
  unit = '',
  stacked = false,
  hideWhenEmpty = true,
  height = 280,
}: ChartBarVerticalProps) => {
  const { t } = useI18n();

  const hasData = useMemo(
    () =>
      !hideWhenEmpty ||
      (categories.length > 0 && series.some((s) => s.data.some((v) => v > 0))),
    [categories, series, hideWhenEmpty],
  );

  const option = useMemo(() => ({
    title: title
      ? { text: title, left: 'center', top: 8, textStyle: { fontSize: 14 } }
      : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: unit
        ? (params: { seriesName: string; value: number }[]) =>
            params.map((p) => `${p.seriesName}: ${p.value}${unit}`).join('<br/>')
        : undefined,
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: series.length > 1 ? '14%' : '6%',
      containLabel: true,
    },
    legend: series.length > 1 ? { bottom: 0 } : { show: false },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { overflow: 'truncate', width: 80 },
    },
    yAxis: { type: 'value' },
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      stack: stacked ? 'total' : undefined,
      data: s.data,
      itemStyle: s.color ? { color: s.color } : undefined,
    })),
  }), [categories, series, title, unit, stacked]);

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center w-full bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <Flex.Center wFull hFull>
          <div className="text-gray-500 text-sm font-medium">{t('NO_DATA_AVAILABLE')}</div>
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
});

ChartBarVertical.displayName = 'ChartBarVertical';
