import type { PatientClinicalContentDto } from '../../dto/clinical/ClinicalContentDto';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type ClinicalContentResponse = {
  content: PatientClinicalContentDto;
};

export const getPatientClinicalContentApi =
  async (): Promise<PatientClinicalContentDto> => {
    const response = await apiRequest<ClinicalContentResponse>(
      '/patient/clinical-content'
    );
    return keysToCamel<ClinicalContentResponse>(response).content;
  };

export const getPsychologistPatientClinicalContentApi = async (
  patientId: string
): Promise<PatientClinicalContentDto> => {
  const response = await apiRequest<ClinicalContentResponse>(
    `/psychologist/patients/${patientId}/clinical-content`
  );
  return keysToCamel<ClinicalContentResponse>(response).content;
};

export type UpdatePsychologistClinicalSessionDto = {
  sessionContext?: string | null;
  currentSessionNoteContent?: string | null;
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
