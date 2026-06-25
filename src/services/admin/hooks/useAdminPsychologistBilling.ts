'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PsychologistBillingSummaryDto } from '@api';
import { getAdminPsychologistBillingApi } from '@api';

export const useAdminPsychologistBilling = (
  psychologistId?: string,
  billingMonth?: string | null
) => {
  const [billing, setBilling] = useState<PsychologistBillingSummaryDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!psychologistId) {
      setBilling(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getAdminPsychologistBillingApi(
        psychologistId,
        billingMonth
      );
      setBilling(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load billing'
      );
      setBilling(null);
    } finally {
      setLoading(false);
    }
  }, [billingMonth, psychologistId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { billing, loading, error, reload };
};
