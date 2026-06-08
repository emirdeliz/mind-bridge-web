import type { AppLanguage } from '../../dto/auth/AuthDto';
import { apiRequest } from '../../http/apiClient';

type ChatResponse = {
  message: string;
};

export const postPatientChatApi = async (
  message: string,
  careContext?: string,
  language?: AppLanguage
): Promise<string> => {
  const response = await apiRequest<ChatResponse>('/ai/patient/chat', {
    method: 'POST',
    body: { message, careContext, language },
  });
  return response.message;
};

export const postPsychologistChatApi = async (
  patientId: string,
  message: string,
  clinicalContext?: string,
  language?: AppLanguage,
  sessionConsiderations?: string
): Promise<string> => {
  const response = await apiRequest<ChatResponse>('/ai/psychologist/chat', {
    method: 'POST',
    body: { patientId, message, clinicalContext, sessionConsiderations, language },
  });
  return response.message;
};
