import { apiRequest } from '../../http/apiClient';

export const logPatientMoodDiaryApi = async (
  moodScore: number,
  source: 'web' | 'app' = 'web'
): Promise<void> => {
  await apiRequest('/patient/mood-diary', {
    method: 'POST',
    body: { moodScore, source },
  });
};

export const logPatientInteractionApi = async (
  channel: 'text' | 'audio' | 'notification',
  source: 'web' | 'app' = 'web'
): Promise<void> => {
  await apiRequest('/patient/interactions', {
    method: 'POST',
    body: { channel, source },
  });
};
