'use client';

import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { formatNumberForIrisAppLanguage } from '@helpers';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';

/** Rótulo da linha extra do tooltip quando o ponto traz `impactScore` (√(CC×churn)) e não se passa `tooltipScoreLineLabel`. */
const SCATTER_TOOLTIP_SQRT_SCORE_LABEL: Record<'en' | 'es' | 'pt', string> = {
  pt: 'Score hotspot (√(CC×churn))',
  en: 'Hotspot score (√(CC×churn))',
  es: 'Puntuación hotspot (√(CC×churn))',
};

export interface ChartScatterPoint {
  name: string;
  x: number;
  y: number;
  size?: number;
  /** Valor numérico extra no tooltip; se omitido, usa `size` (3.º elemento de `value`). */
  impactScore?: number;
  color?: string;
}

export interface ChartScatterProps {
  data: ChartScatterPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  quadrants?: boolean;
  hideWhenEmpty?: boolean;
  height?: string | number;
  /** Rótulo da métrica extra no tooltip (ex. chave i18n resolvida no pai). Se omitido, usa rótulo por idioma para √SRT ou «Impacto». */
  tooltipScoreLineLabel?: string;
}

export const ChartScatter = memo(
  ({
    data,
    title,
    xAxisLabel = 'Esforço',
    yAxisLabel = 'Risco',
    quadrants = true,
    hideWhenEmpty = true,
    height = 360,
    tooltipScoreLineLabel,
  }: ChartScatterProps) => {
    const { t, language } = useI18n();

    const hasData = useMemo(
      () => !hideWhenEmpty || data.length > 0,
      [data, hideWhenEmpty]
    );

    const option = useMemo(
      () => ({
        title: title
          ? { text: title, left: 'center', top: 8, textStyle: { fontSize: 14 } }
          : undefined,
        tooltip: {
          trigger: 'item',
          formatter: (params: {
            data: { name: string; value: number[]; impactScore?: number };
          }) => {
            const [x, y, bubbleSize] = params.data.value;
            const impactRaw = params.data.impactScore ?? bubbleSize;
            const impactFormatted = Number.isFinite(impactRaw)
              ? formatNumberForIrisAppLanguage(impactRaw, language, {
                  maximumFractionDigits: 2,
                })
              : String(impactRaw);
            const metricLabel =
              tooltipScoreLineLabel ??
              (params.data.impactScore != null
                ? SCATTER_TOOLTIP_SQRT_SCORE_LABEL[language]
                : 'Impacto');
            return [
              `<strong>${params.data.name}</strong>`,
              `${xAxisLabel}: ${x}`,
              `${yAxisLabel}: ${y}`,
              `${metricLabel}: ${impactFormatted}`,
            ].join('<br/>');
          },
        },
        grid: {
          left: '8%',
          right: '10%',
          bottom: '10%',
          top: title ? '14%' : '8%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          name: xAxisLabel,
          nameLocation: 'middle',
          nameGap: 26,
          min: 0,
          max: 100,
          splitLine: { lineStyle: { type: 'dashed' } },
        },
        yAxis: {
          type: 'value',
          name: yAxisLabel,
          nameLocation: 'middle',
          nameGap: 32,
          min: 0,
          max: 100,
          splitLine: { lineStyle: { type: 'dashed' } },
        },
        series: [
          ...(quadrants
            ? [
                {
                  type: 'line',
                  silent: true,
                  markLine: {
                    silent: true,
                    symbol: 'none',
                    lineStyle: { type: 'dashed', color: '#ccc', width: 1 },
                    data: [{ xAxis: 50 }, { yAxis: 50 }],
                  },
                  data: [],
                },
              ]
            : []),
          {
            type: 'scatter',
            data: data.map((d) => ({
              value: [d.x, d.y, d.size ?? 20],
              name: d.name,
              ...(d.impactScore != null ? { impactScore: d.impactScore } : {}),
              itemStyle: d.color ? { color: d.color } : undefined,
            })),
            symbolSize: (val: number[]) =>
              Math.max(10, Math.min(42, (val[2] ?? 20) * 0.42)),
            label: {
              show: true,
              formatter: (params: { data: { name: string } }) =>
                params.data.name,
              position: 'right',
              fontSize: 11,
            },
          },
        ],
      }),
      [
        data,
        title,
        xAxisLabel,
        yAxisLabel,
        quadrants,
        language,
        tooltipScoreLineLabel,
      ]
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

ChartScatter.displayName = 'ChartScatter';
