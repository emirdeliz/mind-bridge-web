'use client';

import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';
import {
  mbCategoryAxis,
  mbChartTitleStyle,
  mbValueAxis,
} from '../chartDarkTheme';

export interface ChartBarHorizontalSeries {
  name: string;
  data: number[];
  color?: string;
  /**
   * Optional stack id. Bars in series sharing the same `stack` value are
   * stacked on top of each other along the x-axis (e.g. severity slices per
   * file). Omit to keep the existing side-by-side layout.
   */
  stack?: string;
}

export interface ChartBarHorizontalProps {
  categories: string[];
  /**
   * Chaves únicas no eixo Y (ex. `file_path` completo). Quando há rótulos repetidos
   * (basename), o ECharts alinha mal barras × nomes; use isto com `formatCategoryLabel`.
   */
  categoryAxisKeys?: string[];
  /** Converte cada chave de `categoryAxisKeys` no texto do eixo. */
  formatCategoryLabel?: (axisKey: string) => string;
  series: ChartBarHorizontalSeries[];
  title?: string;
  unit?: string;
  showLabel?: boolean;
  hideWhenEmpty?: boolean;
  height?: string | number;
  /** ECharts `barCategoryGap` — maior = mais espaço entre categorias (linhas no bar horizontal). */
  barCategoryGap?: string | number;
  /** ECharts `barGap` — entre séries na mesma categoria (barras lado a lado). */
  barGap?: string | number;
  /** ECharts `legend.itemGap` quando a legenda está visível (ex.: várias severidades). */
  legendItemGap?: number;
}

export const ChartBarHorizontal = memo(
  ({
    categories,
    categoryAxisKeys,
    formatCategoryLabel,
    series,
    title,
    unit = '',
    showLabel = true,
    hideWhenEmpty = true,
    height = 320,
    barCategoryGap,
    barGap,
    legendItemGap,
  }: ChartBarHorizontalProps) => {
    const { t } = useI18n();

    const axisKeys = categoryAxisKeys?.length ? categoryAxisKeys : categories;

    const hasData = useMemo(
      () =>
        !hideWhenEmpty ||
        (axisKeys.length > 0 && series.some((s) => s.data.some((v) => v > 0))),
      [axisKeys, series, hideWhenEmpty]
    );

    const option = useMemo(
      () => ({
        backgroundColor: 'transparent',
        title: title ? mbChartTitleStyle(title) : undefined,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: unit
            ? (params: { seriesName: string; value: number }[]) =>
                params
                  .map((p) => `${p.seriesName}: ${p.value}${unit}`)
                  .join('<br/>')
            : undefined,
        },
        grid: {
          top: 0,
          left: '3%',
          right: showLabel ? '12%' : '6%',
          bottom: series.length > 1 ? '14%' : '4%',
          containLabel: true,
        },
        legend:
          series.length > 1
            ? {
                bottom: 0,
                ...(legendItemGap != null ? { itemGap: legendItemGap } : {}),
              }
            : { show: false },
        xAxis: mbValueAxis({ boundaryGap: [0, 0.05] }),
        yAxis: mbCategoryAxis({
          type: 'category',
          data: axisKeys,
          axisLabel: {
            overflow: 'truncate',
            width: 130,
            fontSize: 12,
            ...(formatCategoryLabel
              ? {
                  formatter: (value: string) =>
                    formatCategoryLabel(String(value)),
                }
              : {}),
          },
        }),
        series: series.map((s) => ({
          name: s.name,
          type: 'bar',
          data: s.data,
          stack: s.stack,
          itemStyle: s.color ? { color: s.color } : undefined,
          ...(barCategoryGap != null ? { barCategoryGap } : {}),
          ...(barGap != null ? { barGap } : {}),
          label: showLabel
            ? {
                show: true,
                position: 'right',
                formatter: unit ? `{c}${unit}` : '{c}',
              }
            : { show: false },
        })),
      }),
      [
        axisKeys,
        categories,
        formatCategoryLabel,
        series,
        title,
        unit,
        showLabel,
        barCategoryGap,
        barGap,
        legendItemGap,
      ]
    );

    if (!hasData) {
      return (
        <div className='mb-chart-empty' style={{ height }}>
          <Flex.Center wFull hFull>
            <div className='mb-chart-empty-text'>{t('NO_DATA_AVAILABLE')}</div>
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

ChartBarHorizontal.displayName = 'ChartBarHorizontal';
