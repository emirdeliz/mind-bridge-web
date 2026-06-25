'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AdminPsychologistListItemDto } from '@api';
import { listAdminPsychologistsApi } from '@api';

export const useAdminPsychologists = () => {
  const [psychologists, setPsychologists] = useState<
    AdminPsychologistListItemDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminPsychologistsApi();
      setPsychologists(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load psychologists'
      );
      setPsychologists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { psychologists, loading, error, reload };
};
