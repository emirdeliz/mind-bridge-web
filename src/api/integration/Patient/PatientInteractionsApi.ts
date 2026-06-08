import { apiRequest } from '../../http/apiClient';

export const logPatientInteractionApi = async (
  channel: 'text' | 'audio' | 'notification',
  source: 'web' | 'app' = 'web'
): Promise<void> => {
  await apiRequest('/patient/interactions', {
    method: 'POST',
    body: { channel, source },
  });
};
