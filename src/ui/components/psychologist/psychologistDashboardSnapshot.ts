import type { DashboardSnapshotDto } from '@api';
import { MB_COLORS } from '@constants';

export type DashboardChartSeries = {
  name: string;
  data: number[];
  color?: string;
};

export type DashboardDonutItem = {
  name: string;
  value: number;
  color?: string;
};

export type PsychologistDashboardSnapshot = DashboardSnapshotDto;

export const emptyDashboardSnapshot = (): PsychologistDashboardSnapshot => ({
  moodTrendCategories: [],
  moodTrendSeries: [],
  weeklyInteractionCategories: [],
  weeklyInteractionSeries: [],
  interactionChannels: [],
  moodDiaryAdherencePercent: 0,
  clinicalThemeCategories: [],
  clinicalThemeSeries: [],
  lastUpdatedAt: new Date().toISOString(),
});

export const getDashboardChannelTotal = (
  snapshot: PsychologistDashboardSnapshot
): number =>
  snapshot.interactionChannels.reduce((sum, item) => sum + item.value, 0);

/** Ajuste leve dos indicadores após encerrar sessão (estado em memória). */
export const bumpDashboardSnapshot = (
  current: PsychologistDashboardSnapshot
): PsychologistDashboardSnapshot => {
  const moodData = [...(current.moodTrendSeries[0]?.data ?? [])];
  if (moodData.length > 0) {
    const lastIndex = moodData.length - 1;
    moodData[lastIndex] = Math.min(
      10,
      Number((moodData[lastIndex] + 0.4).toFixed(1))
    );
  }

  const weeklyData = [...(current.weeklyInteractionSeries[0]?.data ?? [])];
  const todayIndex = 6;
  if (weeklyData.length > todayIndex) {
    weeklyData[todayIndex] = weeklyData[todayIndex] + 1;
  }

  const channels = current.interactionChannels.map((channel) =>
    channel.name === 'Texto'
      ? { ...channel, value: channel.value + 1 }
      : { ...channel }
  );

  const clinicalData = [...(current.clinicalThemeSeries[0]?.data ?? [])];
  if (clinicalData.length > 0) {
    clinicalData[0] = clinicalData[0] + 1;
  }

  return {
    ...current,
    moodTrendSeries: [
      {
        name: current.moodTrendSeries[0]?.name ?? 'Humor médio',
        data: moodData,
        color: current.moodTrendSeries[0]?.color ?? MB_COLORS.accent,
      },
    ],
    weeklyInteractionSeries: [
      {
        name: current.weeklyInteractionSeries[0]?.name ?? 'Interações',
        data: weeklyData,
        color: current.weeklyInteractionSeries[0]?.color ?? MB_COLORS.primary,
      },
    ],
    interactionChannels: channels,
    moodDiaryAdherencePercent: Math.min(
      100,
      current.moodDiaryAdherencePercent + 6
    ),
    clinicalThemeSeries: [
      {
        name: current.clinicalThemeSeries[0]?.name ?? 'Menções',
        data: clinicalData,
        color: current.clinicalThemeSeries[0]?.color ?? MB_COLORS.violet,
      },
    ],
    lastUpdatedAt: new Date().toISOString(),
  };
};
