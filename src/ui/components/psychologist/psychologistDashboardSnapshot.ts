import {
  MOCK_CLINICAL_THEME_CATEGORIES,
  MOCK_CLINICAL_THEME_SERIES,
  MOCK_INTERACTION_CHANNELS,
  MOCK_MOOD_DIARY_ADHERENCE_PERCENT,
  MOCK_MOOD_TREND_CATEGORIES,
  MOCK_MOOD_TREND_SERIES,
  MOCK_WEEKLY_INTERACTION_CATEGORIES,
  MOCK_WEEKLY_INTERACTION_SERIES,
} from "./psychologistMockData";

const DASHBOARD_STORAGE_KEY = "mb.psychologist.dashboard";

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

export type PsychologistDashboardSnapshot = {
  moodTrendCategories: string[];
  moodTrendSeries: DashboardChartSeries[];
  weeklyInteractionCategories: string[];
  weeklyInteractionSeries: DashboardChartSeries[];
  interactionChannels: DashboardDonutItem[];
  moodDiaryAdherencePercent: number;
  clinicalThemeCategories: string[];
  clinicalThemeSeries: DashboardChartSeries[];
  lastUpdatedAt: string;
};

const cloneDefaultSnapshot = (): PsychologistDashboardSnapshot => ({
  moodTrendCategories: [...MOCK_MOOD_TREND_CATEGORIES],
  moodTrendSeries: MOCK_MOOD_TREND_SERIES.map((series) => ({
    ...series,
    data: [...series.data],
  })),
  weeklyInteractionCategories: [...MOCK_WEEKLY_INTERACTION_CATEGORIES],
  weeklyInteractionSeries: MOCK_WEEKLY_INTERACTION_SERIES.map((series) => ({
    ...series,
    data: [...series.data],
  })),
  interactionChannels: MOCK_INTERACTION_CHANNELS.map((item) => ({ ...item })),
  moodDiaryAdherencePercent: MOCK_MOOD_DIARY_ADHERENCE_PERCENT,
  clinicalThemeCategories: [...MOCK_CLINICAL_THEME_CATEGORIES],
  clinicalThemeSeries: MOCK_CLINICAL_THEME_SERIES.map((series) => ({
    ...series,
    data: [...series.data],
  })),
  lastUpdatedAt: new Date().toISOString(),
});

export const loadPsychologistDashboardSnapshot = (): PsychologistDashboardSnapshot => {
  if (typeof window === "undefined") {
    return cloneDefaultSnapshot();
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
    if (!raw) return cloneDefaultSnapshot();
    const parsed = JSON.parse(raw) as PsychologistDashboardSnapshot;
    return {
      ...cloneDefaultSnapshot(),
      ...parsed,
      moodTrendCategories: parsed.moodTrendCategories ?? MOCK_MOOD_TREND_CATEGORIES,
      moodTrendSeries: parsed.moodTrendSeries ?? cloneDefaultSnapshot().moodTrendSeries,
      weeklyInteractionCategories:
        parsed.weeklyInteractionCategories ?? MOCK_WEEKLY_INTERACTION_CATEGORIES,
      weeklyInteractionSeries:
        parsed.weeklyInteractionSeries ?? cloneDefaultSnapshot().weeklyInteractionSeries,
      interactionChannels: parsed.interactionChannels ?? cloneDefaultSnapshot().interactionChannels,
      moodDiaryAdherencePercent:
        parsed.moodDiaryAdherencePercent ?? MOCK_MOOD_DIARY_ADHERENCE_PERCENT,
      clinicalThemeCategories:
        parsed.clinicalThemeCategories ?? MOCK_CLINICAL_THEME_CATEGORIES,
      clinicalThemeSeries: parsed.clinicalThemeSeries ?? cloneDefaultSnapshot().clinicalThemeSeries,
    };
  } catch {
    return cloneDefaultSnapshot();
  }
};

const persistSnapshot = (snapshot: PsychologistDashboardSnapshot) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(snapshot));
};

/** Simula atualização dos indicadores após encerrar uma sessão. */
export const refreshPsychologistDashboardAfterSession = (): PsychologistDashboardSnapshot => {
  const current = loadPsychologistDashboardSnapshot();
  const moodData = [...(current.moodTrendSeries[0]?.data ?? [])];
  if (moodData.length > 0) {
    const lastIndex = moodData.length - 1;
    moodData[lastIndex] = Math.min(10, Number((moodData[lastIndex] + 0.4).toFixed(1)));
  }

  const weeklyData = [...(current.weeklyInteractionSeries[0]?.data ?? [])];
  const todayIndex = 6;
  if (weeklyData.length > todayIndex) {
    weeklyData[todayIndex] = weeklyData[todayIndex] + 1;
  }

  const channels = current.interactionChannels.map((channel) =>
    channel.name === "Texto" ? { ...channel, value: channel.value + 1 } : { ...channel },
  );
  const channelTotal = channels.reduce((sum, item) => sum + item.value, 0);

  const clinicalData = [...(current.clinicalThemeSeries[0]?.data ?? [])];
  if (clinicalData.length > 0) {
    clinicalData[0] = clinicalData[0] + 1;
  }

  const updated: PsychologistDashboardSnapshot = {
    ...current,
    moodTrendSeries: [
      {
        name: current.moodTrendSeries[0]?.name ?? "Humor médio",
        data: moodData,
        color: current.moodTrendSeries[0]?.color ?? "#5eead4",
      },
    ],
    weeklyInteractionSeries: [
      {
        name: current.weeklyInteractionSeries[0]?.name ?? "Interações",
        data: weeklyData,
        color: current.weeklyInteractionSeries[0]?.color ?? "#818cf8",
      },
    ],
    interactionChannels: channels,
    moodDiaryAdherencePercent: Math.min(100, current.moodDiaryAdherencePercent + 6),
    clinicalThemeSeries: [
      {
        name: current.clinicalThemeSeries[0]?.name ?? "Menções",
        data: clinicalData,
        color: current.clinicalThemeSeries[0]?.color ?? "#a78bfa",
      },
    ],
    lastUpdatedAt: new Date().toISOString(),
  };

  persistSnapshot(updated);
  return updated;
};

export const getDashboardChannelTotal = (snapshot: PsychologistDashboardSnapshot): number =>
  snapshot.interactionChannels.reduce((sum, item) => sum + item.value, 0);
