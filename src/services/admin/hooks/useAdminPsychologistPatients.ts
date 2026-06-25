'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  AdminPatientInteractionPeriod,
  AdminPsychologistPatientViewDto,
} from '@api';
import { listAdminPsychologistPatientsApi } from '@api';

export const useAdminPsychologistPatients = (psychologistId?: string) => {
  const [patients, setPatients] = useState<AdminPsychologistPatientViewDto[]>(
    []
  );
  const [interactionPeriod, setInteractionPeriod] =
    useState<AdminPatientInteractionPeriod>('month');
  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!psychologistId) {
      setPatients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await listAdminPsychologistPatientsApi(psychologistId, {
        name: search,
        includeDeleted,
        interactionPeriod,
      });
      setPatients(data.patients);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load patients'
      );
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [includeDeleted, interactionPeriod, psychologistId, search]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    patients,
    interactionPeriod,
    setInteractionPeriod,
    search,
    setSearch,
    includeDeleted,
    setIncludeDeleted,
    loading,
    error,
    reload,
  };
};
