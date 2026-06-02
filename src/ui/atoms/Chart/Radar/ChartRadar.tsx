import { memo, useCallback, useRef } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import '../chartConfig';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'nearest' as const,
    intersect: true,
  },
  layout: {
    padding: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      min: 0,
      max: 10,
      ticks: {
        stepSize: 2,
        showLabelBackdrop: false,
        font: {
          size: 14,
        },
      },
      grid: {
        circular: false,
        color: "#ddd",
      },
      angleLines: {
        color: "#ccc",
      },
      pointLabels: {
        font: {
          size: 15,
          weight: '500',
        },
        color: "#333",
        padding: 8,
      },
      animation: true,
    },
  },
};

export interface ChartRadarPointClickData {
  labelIndex: number;
  label: string | string[];
  datasetIndex: number;
  datasetLabel: string;
  value: number;
  metadata?: unknown;
}

type PointStyleString = 'circle' | 'cross' | 'crossRot' | 'dash' | 'line' | 'rect' | 'rectRounded' | 'rectRot' | 'star' | 'triangle';
type PointStyleValue = PointStyleString | HTMLImageElement | HTMLCanvasElement;

interface ChartRadarDataset {
  label: string;
  data: Array<number>;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderDash?: number[];
  metadata?: Array<unknown>;
  pointHitRadius?: number;
  pointRadius?: number | number[];
  pointBackgroundColor?: string | string[];
  pointBorderColor?: string | string[];
  pointBorderWidth?: number | number[];
  pointStyle?: PointStyleValue | PointStyleValue[];
  interactive?: boolean; // Set to false to disable click events for this dataset
}

interface ChartRadarProps {
  data: {
    labels: Array<string | string[]>;
    datasets: Array<ChartRadarDataset>;
  };
  onPointClick?: (pointData: ChartRadarPointClickData) => void;
}

export const ChartRadar = memo(({ data, onPointClick }: ChartRadarProps) => {
  const { t } = useI18n();
  const chartRef = useRef<ChartJS<'radar'>>(null);

  const hasData = data.labels.length > 0 && data.datasets.some(dataset =>
    dataset.data.some(value => value !== null && value !== undefined && value !== 0)
  );

  // useCallback ensures proper closure over data when component re-renders
  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current || !onPointClick) return;

    // Use Chart.js native method with explicit mode for precise element detection
    const elements = chartRef.current.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: true },
      false
    );

    if (elements.length === 0) return;

    // Get the nearest element (first one returned by 'nearest' mode)
    const element = elements[0];
    const datasetIndex = element.datasetIndex;
    const dataset = data.datasets[datasetIndex];

    // Skip non-interactive datasets (e.g., Meta)
    if (dataset.interactive === false) {
      return;
    }

    const labelIndex = element.index;
    const label = data.labels[labelIndex];
    const value = dataset.data[labelIndex];
    const metadata = dataset.metadata?.[labelIndex];

    onPointClick({
      labelIndex,
      label,
      datasetIndex,
      datasetLabel: dataset.label,
      value,
      metadata,
    });
  }, [data, onPointClick]);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-lg">
        <Flex.Center wFull hFull>
          <div className="text-gray-500 text-lg font-medium">{t('NO_DATA_AVAILABLE')}</div>
        </Flex.Center>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Legenda customizada flutuante - sobrepõe o gráfico */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        zIndex: 10,
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '8px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '6px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
      }}>
        {data.datasets.map((dataset, index) => {
          const isDashed = dataset.borderDash && dataset.borderDash.length > 0;
          const strokeDasharray = isDashed ? dataset.borderDash.join(' ') : undefined;

          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Linha com bolinha no meio: -●- (tracejada se borderDash existir) */}
              <svg width="24" height="10" style={{ flexShrink: 0 }}>
                {/* Linha esquerda */}
                <line
                  x1="0"
                  y1="5"
                  x2="8"
                  y2="5"
                  stroke={dataset.borderColor || '#000'}
                  strokeWidth="2"
                  strokeDasharray={strokeDasharray}
                />
                {/* Bolinha no meio */}
                <circle cx="12" cy="5" r="3" fill={dataset.borderColor || '#000'} />
                {/* Linha direita */}
                <line
                  x1="16"
                  y1="5"
                  x2="24"
                  y2="5"
                  stroke={dataset.borderColor || '#000'}
                  strokeWidth="2"
                  strokeDasharray={strokeDasharray}
                />
              </svg>
              <span style={{ fontSize: '12px', color: '#000', fontWeight: 500 }}>
                {dataset.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart - fills 100% of the space */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Radar
          ref={chartRef}
          data={data}
          options={radarOptions}
          onClick={onPointClick ? handleClick : undefined}
        />
      </div>
    </div>
  );
});