import type { AppLanguage } from '@api';
import { ApiError } from '../../http/apiClient';

type TranscribeSpeechResponse = {
  transcript: string;
};

const extensionForMimeType = (mimeType: string): string => {
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
};

export const transcribeSpeechUploadApi = async (
  proxyPath: string,
  audio: Blob,
  language: AppLanguage
): Promise<string> => {
  const mimeType = audio.type || 'audio/webm';
  const formData = new FormData();
  formData.append(
    'audio',
    audio,
    `recording.${extensionForMimeType(mimeType)}`
  );
  formData.append('language', language);

  const response = await fetch(proxyPath, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
    transcript?: string;
  };

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error ?? payload.message ?? `Request failed (${response.status})`
    );
  }

  return payload.transcript?.trim() ?? '';
};
