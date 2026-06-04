import { apiRequest } from '../../http/apiClient';

type ChatResponse = {
  message: string;
};

export const postPatientChatApi = async (
  message: string,
  careContext?: string
): Promise<string> => {
  const response = await apiRequest<ChatResponse>('/ai/patient/chat', {
    method: 'POST',
    body: { message, careContext },
  });
  return response.message;
};

export const postPsychologistChatApi = async (
  patientId: string,
  message: string,
  clinicalContext?: string
): Promise<string> => {
  const response = await apiRequest<ChatResponse>('/ai/psychologist/chat', {
    method: 'POST',
    body: { patientId, message, clinicalContext },
  });
  return response.message;
};
