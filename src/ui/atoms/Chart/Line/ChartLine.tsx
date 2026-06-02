'use client';

import type { EChartsType } from 'echarts';
import { memo, useLayoutEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';

export interface ChartLineSeries {
  name: string;
  data: number[];
  color?: string;
  smooth?: boolean;
  areaStyle?: boolean;
}

export interface ChartLineProps {
  categories: string[];
  series: ChartLineSeries[];
  title?: string;
  unit?: string;
  hideWhenEmpty?: boolean;
  height?: string | number;
}

export const ChartLine = memo(({
  categories,
  series,
  title,
  unit = '',
  hideWhenEmpty = true,
  height = 260,
}: ChartLineProps) => {
  const { t } = useI18n();
  const chartRef = useRef<InstanceType<typeof ReactECharts>>(null);

  const hasData = useMemo(
    () =>
      !hideWhenEmpty ||
      (categories.length > 0 && series.some((s) => s.data.some((v) => v > 0))),
    [categories, series, hideWhenEmpty],
  );

  /** One category → no line segment; ECharts would draw nothing with symbol hidden. */
  const showMarkers = categories.length <= 1;

  const option = useMemo(() => ({
    title: title
      ? { text: title, left: 'center', top: 8, textStyle: { fontSize: 14 } }
      : undefined,
    tooltip: {
      trigger: 'axis',
      formatter: unit
        ? (params: { axisValue: string; seriesName: string; value: number }[]) => {
            const header = params[0]?.axisValue ?? '';
            const rows = params.map((p) => `${p.seriesName}: ${p.value}${unit}`).join('<br/>');
            return `${header}<br/>${rows}`;
          }
        : undefined,
    },
    legend: series.length > 1 ? { bottom: 0 } : { show: false },
    grid: {
      top: '8%',
      left: '4%',
      right: '4%',
      bottom: series.length > 1 ? '14%' : '6%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categories,
      axisLabel: { rotate: categories.length > 8 ? 30 : 0 },
    },
    yAxis: { type: 'value' },
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: s.smooth ?? true,
      symbol: showMarkers ? 'circle' : 'none',
      symbolSize: showMarkers ? 8 : 0,
      lineStyle: { color: s.color, width: 2 },
      areaStyle: s.areaStyle ? { opacity: 0.12, color: s.color } : undefined,
    })),
  }), [categories, series, title, unit, showMarkers]);

  const heightCss = typeof height === 'number' ? `${height}px` : height;
  const categoryKey = useMemo(() => categories.join('\0'), [categories]);

  useLayoutEffect(() => {
    if (!hasData) return;
    const inst = chartRef.current?.getEchartsInstance?.();
    if (!inst) return;
    requestAnimationFrame(() => {
      try {
        inst.resize({ width: 'auto', height: 'auto' });
      } catch {
        inst.resize();
      }
    });
  }, [hasData, heightCss, categoryKey]);

  const handleChartReady = (instance: EChartsType) => {
    /** Após layout (grelha/flex), o primeiro init pode medir largura 0 ou estreita — alinha ao contentor. */
    const resize = () => {
      try {
        instance.resize({ width: 'auto', height: 'auto' });
      } catch {
        instance.resize();
      }
    };
    requestAnimationFrame(resize);
    setTimeout(resize, 0);
  };

  if (!hasData) {
    return (
      <div
        className="flex min-h-0 min-w-0 w-full items-center justify-center rounded-lg bg-gray-50"
        style={{ height }}
      >
        <Flex.Center wFull hFull>
          <div className="text-gray-500 text-sm font-medium">{t('NO_DATA_AVAILABLE')}</div>
        </Flex.Center>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full" style={{ height: heightCss }}>
      <ReactECharts
        ref={chartRef}
        className="min-w-0 w-full"
        option={option}
        style={{ height: '100%', width: '100%', display: 'block' }}
        opts={{ renderer: 'svg' }}
        onChartReady={handleChartReady}
      />
    </div>
  );
});

ChartLine.displayName = 'ChartLine';
