import type { AppLanguage } from '../../dto/auth/AuthDto';
import type { ClinicalChatMessageDto } from '../../dto/clinical/ClinicalContentDto';
import { apiRequest } from '../../http/apiClient';

type PatientChatResponse = {
  message: string;
  messages?: ClinicalChatMessageDto[];
};

type PsychologistChatResponse = {
  message: string;
};

export const postPatientChatApi = async (
  message: string,
  language?: AppLanguage
): Promise<PatientChatResponse> => {
  return apiRequest<PatientChatResponse>('/ai/patient/chat', {
    method: 'POST',
    body: { message, language },
  });
};

export const postPsychologistChatApi = async (
  patientId: string,
  message: string,
  clinicalContext?: string,
  language?: AppLanguage,
  sessionConsiderations?: string
): Promise<string> => {
  const response = await apiRequest<PsychologistChatResponse>('/ai/psychologist/chat', {
    method: 'POST',
    body: { patientId, message, clinicalContext, sessionConsiderations, language },
  });
  return response.message;
};
