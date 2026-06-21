import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';

import type { LikertCheckInDto, LikertDimensionId } from '@api';
import { LIKERT_DIMENSION_IDS } from '@api';
import { savePatientLikertCheckInApi } from '@api';
import {
  countLikertAnswers,
  getLocalDateKey,
  resolveLikertCheckInForToday,
} from '@helpers';
import { useI18n } from '@i18n';

const SAVE_DEBOUNCE_MS = 500;
const SAVED_STATUS_MS = 2500;
const DAY_ROLLOVER_CHECK_MS = 60_000;

export type LikertSaveStatus = 'idle' | 'saving' | 'saved';

type UsePatientLikertCheckInOptions = {
  checkIn: LikertCheckInDto | null;
  onCheckInChange?: (checkIn: LikertCheckInDto | null) => void;
};

const buildOptimisticCheckIn = (
  scores: Partial<Record<LikertDimensionId, number>>,
  previous: LikertCheckInDto | null,
  localDate: string
): LikertCheckInDto => ({
  scores,
  updatedAt: previous?.updatedAt ?? null,
  checkInDate: localDate,
});

const scoresMatch = (
  left: Partial<Record<LikertDimensionId, number>>,
  right: Partial<Record<LikertDimensionId, number>>
): boolean => JSON.stringify(left) === JSON.stringify(right);

const resetLikertForNewDay = (
  localDateKeyRef: MutableRefObject<string>,
  scoresRef: MutableRefObject<Partial<Record<LikertDimensionId, number>>>,
  lastPersistedCheckInRef: MutableRefObject<LikertCheckInDto | null>,
  setScores: Dispatch<SetStateAction<Partial<Record<LikertDimensionId, number>>>>,
  setSaveStatus: Dispatch<SetStateAction<LikertSaveStatus>>,
  setError: Dispatch<SetStateAction<string>>,
  onCheckInChange?: (checkIn: LikertCheckInDto | null) => void
): void => {
  const today = getLocalDateKey();
  if (today === localDateKeyRef.current) {
    return;
  }

  localDateKeyRef.current = today;
  scoresRef.current = {};
  lastPersistedCheckInRef.current = null;
  setScores({});
  setSaveStatus('idle');
  setError('');
  onCheckInChange?.(null);
};

export const usePatientLikertCheckIn = ({
  checkIn,
  onCheckInChange,
}: UsePatientLikertCheckInOptions) => {
  const { t } = useI18n();
  const todayCheckIn = resolveLikertCheckInForToday(checkIn);
  const [scores, setScores] = useState<
    Partial<Record<LikertDimensionId, number>>
  >(() => todayCheckIn?.scores ?? {});
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState<LikertSaveStatus>('idle');

  const scoresRef = useRef(scores);
  const checkInRef = useRef(checkIn);
  const localDateKeyRef = useRef(getLocalDateKey());
  const saveTimeoutRef = useRef<number | null>(null);
  const savedStatusTimeoutRef = useRef<number | null>(null);
  const saveInFlightRef = useRef(false);
  const pendingFlushRef = useRef(false);
  const onCheckInChangeRef = useRef(onCheckInChange);
  const lastPersistedCheckInRef = useRef<LikertCheckInDto | null>(todayCheckIn);

  scoresRef.current = scores;
  checkInRef.current = checkIn;

  useEffect(() => {
    onCheckInChangeRef.current = onCheckInChange;
  }, [onCheckInChange]);

  useEffect(() => {
    const syncedCheckIn = resolveLikertCheckInForToday(checkIn);
    setScores(syncedCheckIn?.scores ?? {});
    scoresRef.current = syncedCheckIn?.scores ?? {};
    lastPersistedCheckInRef.current = syncedCheckIn;
  }, [checkIn?.updatedAt, checkIn?.checkInDate]);

  useEffect(() => {
    const checkDayRollover = () => {
      resetLikertForNewDay(
        localDateKeyRef,
        scoresRef,
        lastPersistedCheckInRef,
        setScores,
        setSaveStatus,
        setError,
        onCheckInChangeRef.current
      );
    };

    checkDayRollover();

    const intervalId = window.setInterval(checkDayRollover, DAY_ROLLOVER_CHECK_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDayRollover();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
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

    const localDate = getLocalDateKey();
    localDateKeyRef.current = localDate;
    saveInFlightRef.current = true;
    setError('');
    setSaveStatus('saving');

    try {
      const saved = await savePatientLikertCheckInApi(payload, localDate);
      if (saved) {
        const persistedCheckIn: LikertCheckInDto = {
          scores: saved.scores,
          updatedAt: saved.updatedAt,
          checkInDate: saved.checkInDate ?? localDate,
        };
        lastPersistedCheckInRef.current = persistedCheckIn;

        if (scoresMatch(payload, scoresRef.current)) {
          setScores(persistedCheckIn.scores);
          scoresRef.current = persistedCheckIn.scores;
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
      const localDate = getLocalDateKey();
      localDateKeyRef.current = localDate;

      const nextScores = { ...scoresRef.current, [dimension]: value };
      scoresRef.current = nextScores;
      setScores(nextScores);

      onCheckInChangeRef.current?.(
        buildOptimisticCheckIn(
          nextScores,
          lastPersistedCheckInRef.current ?? checkInRef.current,
          localDate
        )
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
