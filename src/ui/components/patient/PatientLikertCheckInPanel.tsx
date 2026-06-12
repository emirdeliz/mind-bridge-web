import { useCallback, useEffect, useRef, useState } from "react";

import {
  LIKERT_DIMENSION_IDS,
  type LikertCheckInDto,
  type LikertDimensionId,
  savePatientLikertCheckInApi,
} from "@api";
import { Flex, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card } from "@molecules";
import { DashboardSectionTitle } from "@templates";

const LIKERT_SCALE = [1, 2, 3, 4, 5] as const;

const dimensionLabelKey = (dimension: LikertDimensionId): string =>
  `LIKERT_DIMENSION_${dimension.toUpperCase()}` as const;

type PatientLikertCheckInPanelProps = {
  initialCheckIn: LikertCheckInDto | null;
  onSaved?: (checkIn: LikertCheckInDto | null) => void;
};

export const PatientLikertCheckInPanel = ({
  initialCheckIn,
  onSaved,
}: PatientLikertCheckInPanelProps) => {
  const { t } = useI18n();
  const [scores, setScores] = useState<Partial<Record<LikertDimensionId, number>>>(
    () => initialCheckIn?.scores ?? {}
  );
  const [error, setError] = useState("");
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setScores(initialCheckIn?.scores ?? {});
  }, [initialCheckIn?.updatedAt]);

  const persistScores = useCallback(
    (nextScores: Partial<Record<LikertDimensionId, number>>) => {
      if (!Object.keys(nextScores).length) {
        return;
      }

      setError("");

      onSaved?.({
        scores: nextScores,
        updatedAt: new Date().toISOString(),
      });

      void savePatientLikertCheckInApi(nextScores)
        .then((saved) => {
          if (saved) {
            onSaved?.(saved);
          }
        })
        .catch((saveError) => {
          setError(
            saveError instanceof Error ? saveError.message : t("LIKERT_SAVE_ERROR")
          );
          if (initialCheckIn) {
            setScores(initialCheckIn.scores ?? {});
            onSaved?.(initialCheckIn);
            return;
          }
          setScores({});
          onSaved?.(null);
        });
    },
    [initialCheckIn, onSaved, t]
  );

  const scheduleSave = useCallback(
    (nextScores: Partial<Record<LikertDimensionId, number>>) => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = window.setTimeout(() => {
        void persistScores(nextScores);
      }, 400);
    },
    [persistScores]
  );

  useEffect(
    () => () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    },
    []
  );

  const handleSelect = (dimension: LikertDimensionId, value: number) => {
    const nextScores = { ...scores, [dimension]: value };
    setScores(nextScores);
    scheduleSave(nextScores);
  };

  return (
    <Card padding="lg" shadow="md">
      <DashboardSectionTitle
        title={t("LIKERT_CHECKIN_TITLE")}
        tooltip={t("TOOLTIP_LIKERT_CHECKIN")}
      />
      <Title s2 gray block mb4 leadingRelaxed>
        {t("LIKERT_CHECKIN_HINT")}
      </Title>
      <div className="grid w-full grid-cols-2 gap-4">
        {LIKERT_DIMENSION_IDS.map((dimension) => (
          <Flex col wFull gap2 key={dimension} alignStretch>
            <Title s2 fw3 block>
              {t(dimensionLabelKey(dimension))}
            </Title>
            <Flex row wFull wrap alignCenter gap2 role="radiogroup">
              {LIKERT_SCALE.map((value) => {
                const selected = scores[dimension] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${t(dimensionLabelKey(dimension))} ${value}`}
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                      selected
                        ? "border-mb-accent bg-mb-accent/20 text-mb-accent shadow-glow"
                        : "border-mb-border/80 bg-mb-surface/60 text-mb-text hover:border-mb-accent/40",
                    ].join(" ")}
                    onClick={() => handleSelect(dimension, value)}
                  >
                    {value}
                  </button>
                );
              })}
            </Flex>
          </Flex>
        ))}
      </div>
      {error ? (
        <Title s2 error block mt4>
          {error}
        </Title>
      ) : null}
    </Card>
  );
};
