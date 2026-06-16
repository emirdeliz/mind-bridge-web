import { useCallback, useEffect, useRef, useState } from 'react';

import type { PsychologistPatientPaymentsSummaryDto } from '@api';
import {
  deletePsychologistPatientPaymentApi,
  getPsychologistPatientPaymentsApi,
  upsertPsychologistPatientPaymentApi,
  type UpsertPatientPaymentPayload,
  ApiError,
} from '@api';
import { shouldSilentReload, type ReloadOptions } from '@helpers';
import { useAuth } from '@services';

export const usePsychologistPatientPayments = (
  billingMonth?: string | null
) => {
  const { session } = useAuth();
  const [summary, setSummary] =
    useState<PsychologistPatientPaymentsSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const summaryRef = useRef(summary);
  summaryRef.current = summary;

  const load = useCallback(
    async (options?: ReloadOptions) => {
      if (!session || session.role !== 'psychologist') {
        setSummary(null);
        setLoading(false);
        return;
      }

      const silent = shouldSilentReload(options, summaryRef.current !== null);
      if (!silent) {
        setLoading(true);
      }
      setError('');

      try {
        const data = await getPsychologistPatientPaymentsApi(
          billingMonth ?? undefined
        );
        setSummary(data);
      } catch (loadError) {
        setSummary(null);
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : loadError instanceof Error
              ? loadError.message
              : 'Failed to load patient payments'
        );
      } finally {
        setLoading(false);
      }
    },
    [billingMonth, session]
  );

  useEffect(() => {
    void load({ silent: false });
  }, [load]);

  const savePayment = useCallback(
    async (payload: UpsertPatientPaymentPayload) => {
      setSaving(true);
      setError('');
      try {
        await upsertPsychologistPatientPaymentApi(payload);
        await load({ silent: true });
      } catch (saveError) {
        setError(
          saveError instanceof ApiError
            ? saveError.message
            : saveError instanceof Error
              ? saveError.message
              : 'Failed to save payment'
        );
        throw saveError;
      } finally {
        setSaving(false);
      }
    },
    [load]
  );

  const removePayment = useCallback(
    async (paymentId: string) => {
      setSaving(true);
      setError('');
      try {
        await deletePsychologistPatientPaymentApi(paymentId);
        await load({ silent: true });
      } catch (deleteError) {
        setError(
          deleteError instanceof ApiError
            ? deleteError.message
            : deleteError instanceof Error
              ? deleteError.message
              : 'Failed to delete payment'
        );
        throw deleteError;
      } finally {
        setSaving(false);
      }
    },
    [load]
  );

  return {
    summary,
    loading,
    saving,
    error,
    reload: load,
    savePayment,
    removePayment,
  };
};
