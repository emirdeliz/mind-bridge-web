'use client';

import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  applyHotspotTreemapValueColors,
  HOTSPOT_TREEMAP_COLOR_RANGE,
} from '@helpers/dashboard-assessment';
import { formatNumberForIrisAppLanguage } from '@helpers';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';

export interface ChartTreemapItem {
  name: string;
  value: number;
  children?: ChartTreemapItem[];
  itemStyle?: { color?: string; borderWidth?: number; borderColor?: string };
}

function applyTreemapValueColors(
  items: ChartTreemapItem[],
  colorRange: [string, string],
): ChartTreemapItem[] {
  const values: number[] = [];
  const collect = (nodes: ChartTreemapItem[]) => {
    for (const n of nodes) {
      if (n.children?.length) collect(n.children);
      else values.push(n.value);
    }
  };
  collect(items);
  if (values.length === 0) return items;

  const flat = items.filter((n) => !n.children?.length);
  const colored = applyHotspotTreemapValueColors(
    flat.map((n) => ({ name: n.name, value: n.value })),
    colorRange,
  );
  const byName = new Map(colored.map((c) => [c.name, c.itemStyle.color]));

  const mapNode = (n: ChartTreemapItem): ChartTreemapItem => {
    if (n.children?.length) {
      return { ...n, children: n.children.map(mapNode) };
    }
    const color = byName.get(n.name);
    return color
      ? { ...n, itemStyle: { ...n.itemStyle, color } }
      : n;
  };
  return items.map(mapNode);
}

export interface ChartTreemapProps {
  data: ChartTreemapItem[];
  title?: string;
  colorRange?: [string, string];
  hideWhenEmpty?: boolean;
  height?: string | number;
  /** Chave i18n para o rótulo do valor no tooltip (ex.: métrica de hotspot). Default: `CHART_TREEMAP_TOOLTIP_VALUE`. */
  tooltipValueLabelKey?: string;
  /** Zoom/arrastar no treemap (ECharts `roam`). Default: desligado. */
  roam?: boolean | 'scale' | 'move';
}

export const ChartTreemap = memo(({
  data,
  title,
  colorRange = HOTSPOT_TREEMAP_COLOR_RANGE,
  hideWhenEmpty = true,
  height = 360,
  tooltipValueLabelKey = 'CHART_TREEMAP_TOOLTIP_VALUE',
  roam = false,
}: ChartTreemapProps) => {
  const { t, language } = useI18n();

  const hasData = useMemo(
    () => !hideWhenEmpty || data.length > 0,
    [data, hideWhenEmpty],
  );

  const dataWithColors = useMemo(
    () => applyTreemapValueColors(data, colorRange),
    [data, colorRange],
  );

  const option = useMemo(() => ({
    title: title
      ? { text: title, left: 'center', top: 8, textStyle: { fontSize: 14 } }
      : undefined,
    tooltip: {
      formatter: (params: { name?: string; value?: number | number[] }) => {
        const name = params.name ?? '';
        const raw = params.value;
        const v = typeof raw === 'number' ? raw : Array.isArray(raw) ? Number(raw[0]) : 0;
        const formatted = Number.isFinite(v)
          ? formatNumberForIrisAppLanguage(v, language, { maximumFractionDigits: 2 })
          : String(raw ?? '');
        return `<strong>${name}</strong><br/>${t(tooltipValueLabelKey)}: ${formatted}`;
      },
    },
    series: [
      {
        type: 'treemap',
        roam,
        data: dataWithColors,
        visibleMin: 200,
        label: { show: true, formatter: '{b}', fontSize: 11 },
        upperLabel: { show: true, height: 28, fontSize: 12, fontWeight: 600 },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        breadcrumb: { show: false },
        levels: [
          {
            itemStyle: { borderColor: '#555', borderWidth: 4, gapWidth: 4 },
            upperLabel: { show: false },
          },
          {
            itemStyle: { borderColorSaturation: 0.7, gapWidth: 2, borderWidth: 2 },
          },
        ],
      },
    ],
  }), [dataWithColors, title, tooltipValueLabelKey, t, language, roam]);

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
        notMerge
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
});

ChartTreemap.displayName = 'ChartTreemap';
