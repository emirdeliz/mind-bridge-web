'use client';

import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';
import { MB_CHART_MUTED, MB_CHART_TEXT, mbChartTitleStyle } from '../chartDarkTheme';

export interface ChartDonutDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface ChartDonutProps {
  data: ChartDonutDataItem[];
  title?: string;
  centerText?: string;
  showLegend?: boolean;
  hideWhenEmpty?: boolean;
  height?: string | number;
}

export const ChartDonut = memo(({
  data,
  title,
  centerText,
  showLegend = true,
  hideWhenEmpty = true,
  height = 280,
}: ChartDonutProps) => {
  const { t } = useI18n();

  const hasData = useMemo(() => {
    if (hideWhenEmpty) return data.length > 0 && data.some((d) => d.value > 0);
    return true;
  }, [data, hideWhenEmpty]);

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    title: title ? mbChartTitleStyle(title) : undefined,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: showLegend
      ? {
          orient: 'vertical',
          left: 'left',
          top: 'middle',
          textStyle: { fontSize: 12, color: MB_CHART_MUTED },
        }
      : { show: false },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: showLegend ? ['62%', '50%'] : ['50%', '50%'],
        avoidLabelOverlap: false,
        label: centerText
          ? {
              show: true,
              position: 'center',
              formatter: centerText,
              fontSize: 16,
              fontWeight: 600,
              color: MB_CHART_TEXT,
            }
          : { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 600 },
        },
        data: data.map((d) => ({
          value: d.value,
          name: d.name,
          itemStyle: d.color ? { color: d.color } : undefined,
        })),
      },
    ],
  }), [data, title, showLegend, centerText]);

  if (!hasData) {
    return (
      <div
        className="mb-chart-empty"
        style={{ height }}
      >
        <Flex.Center wFull hFull>
          <div className="mb-chart-empty-text">{t('NO_DATA_AVAILABLE')}</div>
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

ChartDonut.displayName = 'ChartDonut';
