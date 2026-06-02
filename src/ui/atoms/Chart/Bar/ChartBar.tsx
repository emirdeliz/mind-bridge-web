import { memo } from 'react';
import { Bar } from 'react-chartjs-2';
import '../chartConfig';
import { useI18n } from '@i18n';
import { Flex } from '@atoms';


const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as 'bottom' | 'top',
      reverse: true,
      labels: {
        boxWidth: 5,
        boxHeight: 5,
        padding: 10,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      beginAtZero: true,
      min: 0,
      max: 10,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

interface ChartBarProps { 
  data: {
    labels: Array<string>,
    datasets: Array<{
      label: string,
      data: Array<number>,
      backgroundColor?: string
    }>
  }
}

export const ChartBar = memo(({ data }: ChartBarProps) => {
  const { t } = useI18n();

  const hasData = data.labels.length > 0 && data.datasets.some(dataset => 
    dataset.data.some(value => value !== null && value !== undefined && value !== 0)
  );

  if (!hasData) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-lg">
        <Flex.Center wFull hFull>
          <div className="text-gray-500 text-lg font-medium">{t('NO_DATA_AVAILABLE')}</div>
        </Flex.Center>
      </div>
    );
  }

  return <Bar data={data} options={options} />;
});