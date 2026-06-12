import type {
  PsychologistChatShortcutDto,
  SavePsychologistChatShortcutDto,
} from '../../dto/chat-shortcut/PsychologistChatShortcutDto';
import { apiRequest } from '../../http/apiClient';
import { keysToCamel } from '@helpers';

type ChatShortcutsListResponse = {
  shortcuts: PsychologistChatShortcutDto[];
};

type ChatShortcutResponse = {
  shortcut: PsychologistChatShortcutDto;
};

export const getPsychologistChatShortcutsApi = async (): Promise<PsychologistChatShortcutDto[]> => {
  const response = await apiRequest<ChatShortcutsListResponse>('/psychologist/chat-shortcuts');
  const data = keysToCamel<ChatShortcutsListResponse>(response);
  return data.shortcuts ?? [];
};

export const createPsychologistChatShortcutApi = async (
  payload: SavePsychologistChatShortcutDto,
): Promise<PsychologistChatShortcutDto> => {
  const response = await apiRequest<ChatShortcutResponse>('/psychologist/chat-shortcuts', {
    method: 'POST',
    body: payload,
  });
  return keysToCamel<ChatShortcutResponse>(response).shortcut;
};

export const updatePsychologistChatShortcutApi = async (
  shortcutId: string,
  payload: SavePsychologistChatShortcutDto,
): Promise<PsychologistChatShortcutDto> => {
  const response = await apiRequest<ChatShortcutResponse>(
    `/psychologist/chat-shortcuts/${shortcutId}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
  return keysToCamel<ChatShortcutResponse>(response).shortcut;
};

export const deletePsychologistChatShortcutApi = async (shortcutId: string): Promise<void> => {
  await apiRequest(`/psychologist/chat-shortcuts/${shortcutId}`, {
    method: 'DELETE',
  });
};
