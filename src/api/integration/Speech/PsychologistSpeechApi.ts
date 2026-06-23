import type { AppLanguage } from '@api';

import { transcribeSpeechUploadApi } from './transcribeSpeechUpload';

const PROXY_PATH = '/api/backend/psychologist/speech/transcribe';

export const transcribePsychologistSpeechApi = async (
  audio: Blob,
  language: AppLanguage
): Promise<string> => transcribeSpeechUploadApi(PROXY_PATH, audio, language);
