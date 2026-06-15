import {
  useCallback,
  useEffect,
  useRef,
  useState,
  startTransition,
} from 'react';

import type { LikertCheckInDto, LikertDimensionId } from '@api';
import { LIKERT_DIMENSION_IDS } from '@api';
import { savePatientLikertCheckInApi } from '@api';
import { countLikertAnswers } from '@helpers';
import { useI18n } from '@i18n';

const SAVE_DEBOUNCE_MS = 500;
const SAVED_STATUS_MS = 2500;

export type LikertSaveStatus = 'idle' | 'saving' | 'saved';

type UsePatientLikertCheckInOptions = {
  initialCheckIn: LikertCheckInDto | null;
  onSaved?: (checkIn: LikertCheckInDto | null) => void;
};

export const usePatientLikertCheckIn = ({
  initialCheckIn,
  onSaved,
}: UsePatientLikertCheckInOptions) => {
  const { t } = useI18n();
  const [scores, setScores] = useState<Partial<Record<LikertDimensionId, number>>>(
    () => initialCheckIn?.scores ?? {},
  );
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<LikertSaveStatus>('idle');

  const scoresRef = useRef(scores);
  const saveTimeoutRef = useRef<number | null>(null);
  const savedStatusTimeoutRef = useRef<number | null>(null);
  const saveInFlightRef = useRef(false);
  const pendingFlushRef = useRef(false);
  const onSavedRef = useRef(onSaved);

  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    setScores(initialCheckIn?.scores ?? {});
  }, [initialCheckIn?.updatedAt]);

  const setSaveStatusTransition = useCallback((status: LikertSaveStatus) => {
    startTransition(() => {
      setSaveStatus(status);
    });
  }, []);

  const flushSave = useCallback(async () => {
    if (saveInFlightRef.current) {
      pendingFlushRef.current = true;
      return;
    }

    const payload = scoresRef.current;
    if (!Object.keys(payload).length) {
      return;
    }

    saveInFlightRef.current = true;
    setError('');
    setSaveStatusTransition('saving');

    try {
      const saved = await savePatientLikertCheckInApi(payload);
      if (saved) {
        onSavedRef.current?.(saved);
      }
      setSaveStatusTransition('saved');

      if (savedStatusTimeoutRef.current !== null) {
        window.clearTimeout(savedStatusTimeoutRef.current);
      }
      savedStatusTimeoutRef.current = window.setTimeout(() => {
        setSaveStatusTransition('idle');
      }, SAVED_STATUS_MS);
    } catch (saveError) {
      setSaveStatusTransition('idle');
      setError(
        saveError instanceof Error ? saveError.message : t('LIKERT_SAVE_ERROR'),
      );
    } finally {
      saveInFlightRef.current = false;
      if (pendingFlushRef.current) {
        pendingFlushRef.current = false;
        void flushSave();
      }
    }
  }, [setSaveStatusTransition, t]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      void flushSave();
    }, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  useEffect(
    () => () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      if (savedStatusTimeoutRef.current !== null) {
        window.clearTimeout(savedStatusTimeoutRef.current);
      }
    },
    [],
  );

  const selectScore = useCallback(
    (dimension: LikertDimensionId, value: number) => {
      setScores((current) => {
        const next = { ...current, [dimension]: value };
        scoresRef.current = next;
        return next;
      });
      scheduleSave();
    },
    [scheduleSave],
  );

  const answeredCount = countLikertAnswers(scores, LIKERT_DIMENSION_IDS);

  return {
    scores,
    error,
    saveStatus,
    answeredCount,
    totalCount: LIKERT_DIMENSION_IDS.length,
    selectScore,
  };
};
