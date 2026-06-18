import { useEffect } from 'react';

import {
  LIKERT_DIMENSION_IDS,
  type LikertCheckInDto,
  type LikertDimensionId,
} from '@api';
import {
  likertAnchorHighKey,
  likertAnchorLowKey,
  likertQuestionKey,
} from '@helpers';
import { Flex, Title } from '@atoms';
import { translateTemplate, useI18n } from '@i18n';
import { Card, useToast } from '@molecules';
import { usePatientLikertCheckIn } from '@services';
import { DashboardSectionTitle } from '@templates';

const LIKERT_SCALE = [1, 2, 3, 4, 5] as const;

const likertValueLabelKey = (value: number): string => `LIKERT_VALUE_${value}`;

type PatientLikertCheckInPanelProps = {
  checkIn: LikertCheckInDto | null;
  onCheckInChange?: (checkIn: LikertCheckInDto | null) => void;
};

export const PatientLikertCheckInPanel = ({
  checkIn,
  onCheckInChange,
}: PatientLikertCheckInPanelProps) => {
  const { t } = useI18n();
  const { showToastSuccess, showToastError } = useToast();
  const { scores, error, saveStatus, answeredCount, totalCount, selectScore } =
    usePatientLikertCheckIn({ checkIn, onCheckInChange });

  useEffect(() => {
    if (saveStatus === 'saved') {
      showToastSuccess({ message: t('LIKERT_SAVED') });
    }
  }, [saveStatus, showToastSuccess, t]);

  useEffect(() => {
    if (error) {
      showToastError({ message: error });
    }
  }, [error, showToastError]);

  const buildOptionAriaLabel = (
    dimension: LikertDimensionId,
    value: number
  ): string => {
    const question = t(likertQuestionKey(dimension));
    const valueLabel = t(likertValueLabelKey(value));
    const low = t(likertAnchorLowKey(dimension));
    const high = t(likertAnchorHighKey(dimension));
    return translateTemplate(t('LIKERT_OPTION_ARIA'), {
      question,
      value: String(value),
      valueLabel,
      low,
      high,
    });
  };

  return (
    <Card padding='lg' shadow='md'>
      <DashboardSectionTitle
        title={t('LIKERT_CHECKIN_TITLE')}
        tooltip={t('TOOLTIP_LIKERT_CHECKIN')}
      />
      <Flex col wFull gap2 mb4>
        <Title s1 gray block leadingRelaxed>
          {t('LIKERT_CHECKIN_HINT')}
        </Title>
        <Flex row wFull alignCenter justifySpaceBetween wrap gap2>
          <Title s1 gray block>
            {translateTemplate(t('LIKERT_PROGRESS'), {
              answered: answeredCount,
              total: totalCount,
            })}
          </Title>
          {saveStatus === 'saving' ? (
            <Title s1 gray block aria-live='polite'>
              {t('LIKERT_SAVING')}
            </Title>
          ) : null}
        </Flex>
      </Flex>

      <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
        {LIKERT_DIMENSION_IDS.map((dimension) => {
          const isAnswered = typeof scores[dimension] === 'number';
          const lowLabel = t(likertAnchorLowKey(dimension));
          const highLabel = t(likertAnchorHighKey(dimension));

          return (
            <div
              key={dimension}
              className={[
                'min-w-0 rounded-xl border p-4 transition-colors',
                isAnswered
                  ? 'border-mb-accent/30 bg-mb-accent/5'
                  : 'border-mb-border/60 bg-mb-surface/40',
              ].join(' ')}
            >
              <Flex col wFull gap2 alignStretch>
                <Title s2 fw3 block leadingRelaxed>
                  {t(likertQuestionKey(dimension))}
                </Title>

                <Flex row wFull alignCenter justifySpaceBetween gap2 wrap>
                  <Title s1 gray block>
                    1 · {lowLabel}
                  </Title>
                  <Title s1 gray block>
                    5 · {highLabel}
                  </Title>
                </Flex>

                <Flex
                  row
                  wFull
                  alignCenter
                  justifyCenter
                  gap1
                  role='radiogroup'
                >
                  {LIKERT_SCALE.map((value) => {
                    const selected = scores[dimension] === value;
                    return (
                      <button
                        key={value}
                        type='button'
                        role='radio'
                        aria-checked={selected}
                        aria-label={buildOptionAriaLabel(dimension, value)}
                        title={t(likertValueLabelKey(value))}
                        className={[
                          'flex h-10 w-10 flex-1 max-w-[2.75rem] items-center justify-center rounded-xl border text-sm font-semibold transition-colors sm:h-11 sm:w-11 sm:max-w-[3.25rem]',
                          selected
                            ? 'border-mb-accent bg-mb-accent/20 text-mb-accent shadow-glow'
                            : 'border-mb-border/80 bg-mb-surface/60 text-mb-text hover:border-mb-accent/40',
                        ].join(' ')}
                        onClick={() => selectScore(dimension, value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </Flex>
              </Flex>
            </div>
          );
        })}
      </div>

      {error ? (
        <Title as='p' s2 error block mt4>
          {error}
        </Title>
      ) : null}
    </Card>
  );
};
