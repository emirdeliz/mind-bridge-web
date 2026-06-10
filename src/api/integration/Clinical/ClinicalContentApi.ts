import type { AppLanguage } from '../../dto/auth/AuthDto';
import type { PatientClinicalContentDto } from '../../dto/clinical/ClinicalContentDto';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type ClinicalContentResponse = {
  content: PatientClinicalContentDto;
};

const withLanguageQuery = (path: string, language?: AppLanguage): string =>
  language ? `${path}?language=${encodeURIComponent(language)}` : path;

export const getPatientClinicalContentApi = async (
  language?: AppLanguage
): Promise<PatientClinicalContentDto> => {
  const response = await apiRequest<ClinicalContentResponse>(
    withLanguageQuery('/patient/clinical-content', language)
  );
  return keysToCamel<ClinicalContentResponse>(response).content;
};

export const getPsychologistPatientClinicalContentApi = async (
  patientId: string,
  language?: AppLanguage
): Promise<PatientClinicalContentDto> => {
  const response = await apiRequest<ClinicalContentResponse>(
    withLanguageQuery(
      `/psychologist/patients/${patientId}/clinical-content`,
      language
    )
  );
  return keysToCamel<ClinicalContentResponse>(response).content;
};

export type UpdatePsychologistClinicalSessionDto = {
  sessionContext?: string | null;
  currentSessionNoteContent?: string | null;
  language?: AppLanguage;
};

export const savePsychologistPatientClinicalContentApi = async (
  patientId: string,
  data: UpdatePsychologistClinicalSessionDto
): Promise<PatientClinicalContentDto> => {
  const response = await apiRequest<ClinicalContentResponse>(
    `/psychologist/patients/${patientId}/clinical-content`,
    {
      method: 'PATCH',
      body: data,
    }
  );
  return keysToCamel<ClinicalContentResponse>(response).content;
};

export type EndPsychologistSessionDto = {
  currentSessionNoteContent?: string | null;
  language?: AppLanguage;
};

export const endPsychologistSessionApi = async (
  patientId: string,
  data: EndPsychologistSessionDto = {}
): Promise<PatientClinicalContentDto> => {
  const response = await apiRequest<ClinicalContentResponse>(
    `/psychologist/patients/${patientId}/end-session`,
    {
      method: 'POST',
      body: data,
    }
  );
  return keysToCamel<ClinicalContentResponse>(response).content;
};
