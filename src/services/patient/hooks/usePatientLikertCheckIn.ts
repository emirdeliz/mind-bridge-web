import { useCallback, useEffect, useRef, useState } from 'react';

import type { LikertCheckInDto, LikertDimensionId } from '@api';
import { LIKERT_DIMENSION_IDS } from '@api';
import { savePatientLikertCheckInApi } from '@api';
import { countLikertAnswers } from '@helpers';
import { useI18n } from '@i18n';

const SAVE_DEBOUNCE_MS = 500;
const SAVED_STATUS_MS = 2500;

export type LikertSaveStatus = 'idle' | 'saving' | 'saved';

type UsePatientLikertCheckInOptions = {
  checkIn: LikertCheckInDto | null;
  onCheckInChange?: (checkIn: LikertCheckInDto | null) => void;
};

const buildOptimisticCheckIn = (
  scores: Partial<Record<LikertDimensionId, number>>,
  previous: LikertCheckInDto | null,
): LikertCheckInDto => ({
  scores,
  updatedAt: previous?.updatedAt ?? null,
});

const scoresMatch = (
  left: Partial<Record<LikertDimensionId, number>>,
  right: Partial<Record<LikertDimensionId, number>>,
): boolean => JSON.stringify(left) === JSON.stringify(right);

export const usePatientLikertCheckIn = ({
  checkIn,
  onCheckInChange,
}: UsePatientLikertCheckInOptions) => {
  const { t } = useI18n();
  const [scores, setScores] = useState<
    Partial<Record<LikertDimensionId, number>>
  >(() => checkIn?.scores ?? {});
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<LikertSaveStatus>('idle');

  const scoresRef = useRef(scores);
  const checkInRef = useRef(checkIn);
  const saveTimeoutRef = useRef<number | null>(null);
  const savedStatusTimeoutRef = useRef<number | null>(null);
  const saveInFlightRef = useRef(false);
  const pendingFlushRef = useRef(false);
  const onCheckInChangeRef = useRef(onCheckInChange);
  const lastPersistedCheckInRef = useRef<LikertCheckInDto | null>(checkIn);

  scoresRef.current = scores;
  checkInRef.current = checkIn;

  useEffect(() => {
    onCheckInChangeRef.current = onCheckInChange;
  }, [onCheckInChange]);

  useEffect(() => {
    setScores(checkIn?.scores ?? {});
    if (checkIn?.updatedAt) {
      lastPersistedCheckInRef.current = checkIn;
    }
  }, [checkIn?.updatedAt]);

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
    setSaveStatus('saving');

    try {
      const saved = await savePatientLikertCheckInApi(payload);
      if (saved) {
        const persistedCheckIn: LikertCheckInDto = {
          scores: payload,
          updatedAt: saved.updatedAt,
        };
        lastPersistedCheckInRef.current = persistedCheckIn;

        if (scoresMatch(payload, scoresRef.current)) {
          onCheckInChangeRef.current?.(persistedCheckIn);
        }
      }
      setSaveStatus('saved');

      if (savedStatusTimeoutRef.current !== null) {
        window.clearTimeout(savedStatusTimeoutRef.current);
      }
      savedStatusTimeoutRef.current = window.setTimeout(() => {
        setSaveStatus('idle');
      }, SAVED_STATUS_MS);
    } catch (saveError) {
      setSaveStatus('idle');
      setError(
        saveError instanceof Error ? saveError.message : t('LIKERT_SAVE_ERROR')
      );

      const rollback = lastPersistedCheckInRef.current;
      setScores(rollback?.scores ?? {});
      scoresRef.current = rollback?.scores ?? {};
      onCheckInChangeRef.current?.(rollback);
    } finally {
      saveInFlightRef.current = false;
      if (pendingFlushRef.current) {
        pendingFlushRef.current = false;
        void flushSave();
      }
    }
  }, [t]);

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
    []
  );

  const selectScore = useCallback(
    (dimension: LikertDimensionId, value: number) => {
      const nextScores = { ...scoresRef.current, [dimension]: value };
      scoresRef.current = nextScores;
      setScores(nextScores);

      onCheckInChangeRef.current?.(
        buildOptimisticCheckIn(nextScores, checkInRef.current)
      );
      scheduleSave();
    },
    [scheduleSave]
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
