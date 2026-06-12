import type { ClinicalChatMessageDto } from '../dto/clinical/ClinicalContentDto';
import type { AppLanguage } from '../dto/auth/AuthDto';
import { ApiError } from './apiClient';

export type AiStreamEvent =
  | { type: 'delta'; delta: string }
  | { type: 'done'; message: string; messages?: ClinicalChatMessageDto[] }
  | { type: 'error'; error: string };

const buildProxyUrl = (
  path: string,
  query?: Record<string, string | boolean | number | undefined>
): string => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(
    `/api/backend/${normalizedPath}`,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.pathname + url.search;
};

const parseSseBuffer = (
  buffer: string,
  onEvent: (event: AiStreamEvent) => void
): string => {
  const lines = buffer.split('\n');
  const remainder = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.startsWith('data: ')) {
      continue;
    }

    const payload = line.slice(6).trim();
    if (!payload) {
      continue;
    }

    onEvent(JSON.parse(payload) as AiStreamEvent);
  }

  return remainder;
};

export const streamAiChatRequest = async (
  path: string,
  body: unknown,
  onEvent: (event: AiStreamEvent) => void
): Promise<AiStreamEvent | null> => {
  if (typeof window === 'undefined') {
    throw new Error('streamAiChatRequest is browser-only');
  }

  const url = buildProxyUrl(path, { stream: '1' });
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    throw new ApiError(
      response.status,
      payload.error ?? payload.message ?? `Request failed (${response.status})`
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new ApiError(500, 'Streaming is not supported in this browser');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let lastEvent: AiStreamEvent | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    buffer = parseSseBuffer(buffer, (event) => {
      lastEvent = event;
      onEvent(event);
      if (event.type === 'error') {
        throw new ApiError(500, event.error);
      }
    });
  }

  if (buffer.trim()) {
    parseSseBuffer(`${buffer}\n`, (event) => {
      lastEvent = event;
      onEvent(event);
      if (event.type === 'error') {
        throw new ApiError(500, event.error);
      }
    });
  }

  return lastEvent;
};

export type StreamPatientChatResult = {
  message: string;
  messages?: ClinicalChatMessageDto[];
};

export const streamPatientChatApi = async (
  message: string,
  language: AppLanguage | undefined,
  onDelta: (delta: string) => void
): Promise<StreamPatientChatResult> => {
  let finalMessage = '';
  let persistedMessages: ClinicalChatMessageDto[] | undefined;

  const lastEvent = await streamAiChatRequest(
    '/ai/patient/chat',
    { message, language },
    (event) => {
      if (event.type === 'delta') {
        onDelta(event.delta);
      }
      if (event.type === 'done') {
        finalMessage = event.message;
        persistedMessages = event.messages;
      }
    }
  );

  if (lastEvent?.type === 'done') {
    return {
      message: lastEvent.message,
      messages: lastEvent.messages,
    };
  }

  return { message: finalMessage, messages: persistedMessages };
};

export const streamPsychologistChatApi = async (
  patientId: string,
  message: string,
  clinicalContext: string | undefined,
  language: AppLanguage | undefined,
  sessionConsiderations: string | undefined,
  onDelta: (delta: string) => void
): Promise<string> => {
  let finalMessage = '';

  const lastEvent = await streamAiChatRequest(
    '/ai/psychologist/chat',
    {
      patientId,
      message,
      clinicalContext,
      sessionConsiderations,
      language,
    },
    (event) => {
      if (event.type === 'delta') {
        onDelta(event.delta);
      }
      if (event.type === 'done') {
        finalMessage = event.message;
      }
    }
  );

  if (lastEvent?.type === 'done') {
    return lastEvent.message;
  }

  return finalMessage;
};
