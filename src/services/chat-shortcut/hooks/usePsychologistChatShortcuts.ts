import { useCallback, useEffect, useState } from 'react';

import type { AppLanguage, PsychologistChatShortcutDto, SavePsychologistChatShortcutDto } from '@api';
import {
  createPsychologistChatShortcutApi,
  deletePsychologistChatShortcutApi,
  getPsychologistChatShortcutsApi,
  updatePsychologistChatShortcutApi,
} from '@api';

export const usePsychologistChatShortcuts = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const [shortcuts, setShortcuts] = useState<PsychologistChatShortcutDto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getPsychologistChatShortcutsApi();
      setShortcuts(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load chat shortcuts');
      setShortcuts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createShortcut = useCallback(async (payload: SavePsychologistChatShortcutDto) => {
    setSaving(true);
    setError('');
    try {
      const created = await createPsychologistChatShortcutApi(payload);
      setShortcuts((current) => [...current, created].sort((a, b) => a.sortOrder - b.sortOrder));
      return created;
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'Failed to create chat shortcut';
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, []);

  const createShortcuts = useCallback(async (payloads: SavePsychologistChatShortcutDto[]) => {
    if (!payloads.length) {
      return [];
    }

    setSaving(true);
    setError('');
    const created: PsychologistChatShortcutDto[] = [];

    try {
      for (const payload of payloads) {
        const item = await createPsychologistChatShortcutApi(payload);
        created.push(item);
      }

      setShortcuts((current) =>
        [...current, ...created].sort((a, b) => a.sortOrder - b.sortOrder),
      );
      return created;
    } catch (saveError) {
      if (created.length > 0) {
        setShortcuts((current) =>
          [...current, ...created].sort((a, b) => a.sortOrder - b.sortOrder),
        );
      }
      const message =
        saveError instanceof Error ? saveError.message : 'Failed to create chat shortcuts';
      setError(message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateShortcut = useCallback(
    async (shortcutId: string, payload: SavePsychologistChatShortcutDto) => {
      setSaving(true);
      setError('');
      try {
        const updated = await updatePsychologistChatShortcutApi(shortcutId, payload);
        setShortcuts((current) =>
          current
            .map((entry) => (entry.id === shortcutId ? updated : entry))
            .sort((a, b) => a.sortOrder - b.sortOrder),
        );
        return updated;
      } catch (saveError) {
        const message =
          saveError instanceof Error ? saveError.message : 'Failed to update chat shortcut';
        setError(message);
        throw saveError;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const removeShortcut = useCallback(async (shortcutId: string) => {
    setSaving(true);
    setError('');
    try {
      await deletePsychologistChatShortcutApi(shortcutId);
      setShortcuts((current) => current.filter((entry) => entry.id !== shortcutId));
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : 'Failed to delete chat shortcut';
      setError(message);
      throw deleteError;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    shortcuts,
    loading,
    saving,
    error,
    reload,
    createShortcut,
    createShortcuts,
    updateShortcut,
    removeShortcut,
  };
};

export type { AppLanguage };
