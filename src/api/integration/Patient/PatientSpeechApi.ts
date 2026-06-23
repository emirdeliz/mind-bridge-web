import type { AppLanguage } from '@api';

import { transcribeSpeechUploadApi } from '../Speech/transcribeSpeechUpload';

const PROXY_PATH = '/api/backend/patient/speech/transcribe';

export const transcribePatientSpeechApi = async (
  audio: Blob,
  language: AppLanguage
): Promise<string> => transcribeSpeechUploadApi(PROXY_PATH, audio, language);
