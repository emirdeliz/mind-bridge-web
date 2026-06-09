/** Example context templates for the psychologist AI context modal (i18n suffix: _LABEL / _TEXT). */
export const PSYCHOLOGIST_PATIENT_CONTEXT_EXAMPLE_IDS = [
  'TRIGGERS',
  'SOCIAL_ANXIETY',
  'MOOD_SLEEP',
  'WORK_STRESS',
  'EMOTIONAL_AWARENESS',
] as const;

export type PsychologistPatientContextExampleId =
  (typeof PSYCHOLOGIST_PATIENT_CONTEXT_EXAMPLE_IDS)[number];

export const psychologistPatientContextExampleI18nKey = (
  id: PsychologistPatientContextExampleId,
  part: 'LABEL' | 'TEXT'
): string => `PSYCHOLOGIST_PATIENTS_CONTEXT_EXAMPLE_${id}_${part}`;
