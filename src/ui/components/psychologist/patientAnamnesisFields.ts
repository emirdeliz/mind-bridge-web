import type { PatientAnamnesisDto } from '@api';

export type PatientAnamnesisFieldKey = keyof PatientAnamnesisDto;

export const PATIENT_ANAMNESIS_FIELDS: {
  key: PatientAnamnesisFieldKey;
  labelKey: string;
  placeholderKey: string;
}[] = [
  {
    key: 'chiefComplaint',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_CHIEF_COMPLAINT',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_CHIEF_COMPLAINT_PLACEHOLDER',
  },
  {
    key: 'currentHistory',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_CURRENT_HISTORY',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_CURRENT_HISTORY_PLACEHOLDER',
  },
  {
    key: 'personalHistory',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_PERSONAL_HISTORY',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_PERSONAL_HISTORY_PLACEHOLDER',
  },
  {
    key: 'familyHistory',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_FAMILY_HISTORY',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_FAMILY_HISTORY_PLACEHOLDER',
  },
  {
    key: 'socialHistory',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_SOCIAL_HISTORY',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_SOCIAL_HISTORY_PLACEHOLDER',
  },
  {
    key: 'medicalPsychiatricHistory',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_MEDICAL_PSYCHIATRIC',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_MEDICAL_PSYCHIATRIC_PLACEHOLDER',
  },
  {
    key: 'lifeHabits',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_LIFE_HABITS',
    placeholderKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_LIFE_HABITS_PLACEHOLDER',
  },
  {
    key: 'emotionalBehavioral',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_EMOTIONAL_BEHAVIORAL',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_EMOTIONAL_BEHAVIORAL_PLACEHOLDER',
  },
  {
    key: 'therapeuticGoals',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_THERAPEUTIC_GOALS',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_THERAPEUTIC_GOALS_PLACEHOLDER',
  },
  {
    key: 'psychologistNotes',
    labelKey: 'PSYCHOLOGIST_PATIENTS_ANAMNESIS_PSYCHOLOGIST_NOTES',
    placeholderKey:
      'PSYCHOLOGIST_PATIENTS_ANAMNESIS_PSYCHOLOGIST_NOTES_PLACEHOLDER',
  },
];
