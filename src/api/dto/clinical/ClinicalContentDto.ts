export type ClinicalChatMessageDto = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  createdAt: string;
  interactionId?: string;
  isInteractionStart?: boolean;
  isInteractionEnd?: boolean;
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

export type LikertDimensionId = 'mood' | 'anxiety' | 'sleep' | 'wellbeing';

export const LIKERT_DIMENSION_IDS: LikertDimensionId[] = [
  'mood',
  'anxiety',
  'sleep',
  'wellbeing',
];

export type LikertCheckInDto = {
  scores: Partial<Record<LikertDimensionId, number>>;
  updatedAt: string | null;
};

export type PatientAnamnesisDto = {
  chiefComplaint: string;
  currentHistory: string;
  personalHistory: string;
  familyHistory: string;
  socialHistory: string;
  medicalPsychiatricHistory: string;
  lifeHabits: string;
  emotionalBehavioral: string;
  therapeuticGoals: string;
  psychologistNotes: string;
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
  likertCheckIn: LikertCheckInDto | null;
  anamnesis: PatientAnamnesisDto;
};
