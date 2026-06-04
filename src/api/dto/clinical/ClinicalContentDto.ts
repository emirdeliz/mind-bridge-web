export type ClinicalChatMessageDto = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  createdAt: string;
};

export type SessionNoteEntryDto = {
  id: string;
  label: string;
  sessionDate: string;
  content: string;
  agenticSummary?: string;
  isCurrent?: boolean;
};

export type SessionInsightDto = {
  title: string;
  body: string;
};

export type DashboardChartSeriesDto = {
  name: string;
  data: number[];
  color?: string;
};

export type DashboardDonutItemDto = {
  name: string;
  value: number;
  color?: string;
};

export type DashboardSnapshotDto = {
  moodTrendCategories: string[];
  moodTrendSeries: DashboardChartSeriesDto[];
  weeklyInteractionCategories: string[];
  weeklyInteractionSeries: DashboardChartSeriesDto[];
  interactionChannels: DashboardDonutItemDto[];
  moodDiaryAdherencePercent: number;
  clinicalThemeCategories: string[];
  clinicalThemeSeries: DashboardChartSeriesDto[];
  lastUpdatedAt: string;
};

export type PatientClinicalContentDto = {
  patientId: string;
  dashboardSnapshot: DashboardSnapshotDto;
  sessionContext: string | null;
  sessionNotes: SessionNoteEntryDto[];
  sessionInsights: SessionInsightDto[];
  psychologistSummary: string | null;
  psychologistChatSeed: ClinicalChatMessageDto[];
  patientChatSeed: ClinicalChatMessageDto[];
  patientSummary: string | null;
};
