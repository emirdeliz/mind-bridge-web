import type {
  DashboardSnapshotDto,
  PatientAnamnesisDto,
  PatientClinicalContentDto,
  SessionNoteEntryDto,
} from '@api';

const emptyPatientAnamnesis = (): PatientAnamnesisDto => ({
  chiefComplaint: '',
  currentHistory: '',
  personalHistory: '',
  familyHistory: '',
  socialHistory: '',
  medicalPsychiatricHistory: '',
  lifeHabits: '',
  emotionalBehavioral: '',
  therapeuticGoals: '',
  psychologistNotes: '',
});

export { emptyPatientAnamnesis };

const emptyDashboardSnapshot = (): DashboardSnapshotDto => ({
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

const formatSessionDateBr = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatSessionTimeBr = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const buildCurrentSessionNote = (): SessionNoteEntryDto => {
  const now = new Date();
  const sessionDate = formatSessionDateBr(now);
  const sessionTime = formatSessionTimeBr(now);

  return {
    id: `session-${now.toISOString().replace(/[:.]/g, '-')}`,
    label: `Sessão ${sessionDate} ${sessionTime} (atual)`,
    sessionDate,
    content: '',
    isCurrent: true,
  };
};

export const emptyClinicalContentForPatient = (
  patientId: string
): PatientClinicalContentDto => ({
  patientId,
  dashboardSnapshot: emptyDashboardSnapshot(),
  sessionContext: null,
  sessionNotes: [buildCurrentSessionNote()],
  sessionInsights: [],
  psychologistSummary: null,
  psychologistChatSeed: [],
  patientChatSeed: [],
  patientSummary: null,
  likertCheckIn: null,
  anamnesis: emptyPatientAnamnesis(),
});
