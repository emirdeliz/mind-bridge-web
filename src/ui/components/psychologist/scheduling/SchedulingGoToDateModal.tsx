'use client';

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react';

import { Button, Flex, Icon, Overlay, Select, Title } from '@atoms';
import { localeForAppLanguage } from '@helpers';
import { useI18n } from '@i18n';
import { Card, FormActions, FormGroup } from '@molecules';
import { getWeekStartIsoForLocalDate } from '@services';

type SchedulingGoToDateModalProps = {
  visible: boolean;
  tzOffset: number;
  onClose: () => void;
  onGo: (weekStartIso: string) => void;
};

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));

const buildYearOptions = (centerYear: number) => {
  const startYear = centerYear - 5;
  const endYear = centerYear + 5;

  return Array.from({ length: endYear - startYear + 1 }, (_, index) => {
    const year = startYear + index;
    return {
      value: String(year),
      label: String(year),
    };
  });
};

export const SchedulingGoToDateModal = ({
  visible,
  tzOffset,
  onClose,
  onGo,
}: SchedulingGoToDateModalProps) => {
  const { t, language } = useI18n();
  const [month, setMonth] = useState(() => String(new Date().getMonth() + 1));
  const [day, setDay] = useState(() => String(new Date().getDate()));
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [referenceYear, setReferenceYear] = useState(() =>
    new Date().getFullYear()
  );
  const [formError, setFormError] = useState('');

  const monthOptions = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(localeForAppLanguage(language), {
      month: 'long',
    });

    return Array.from({ length: 12 }, (_, index) => ({
      value: String(index + 1),
      label: formatter.format(new Date(Date.UTC(2024, index, 1))),
    }));
  }, [language]);

  const yearOptions = useMemo(
    () => buildYearOptions(referenceYear),
    [referenceYear]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const current = new Date();
    const currentYear = current.getFullYear();
    setReferenceYear(currentYear);
    setMonth(String(current.getMonth() + 1));
    setDay(String(current.getDate()));
    setYear(String(currentYear));
    setFormError('');
  }, [visible]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const monthNumber = Number(month);
    const dayNumber = Number(day);
    const yearNumber = Number(year);
    const weekStartIso = getWeekStartIsoForLocalDate(
      monthNumber,
      dayNumber,
      yearNumber,
      tzOffset
    );

    if (!weekStartIso) {
      setFormError(t('PSYCHOLOGIST_SCHEDULING_GO_TO_DATE_ERROR'));
      return;
    }

    onGo(weekStartIso);
    onClose();
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  if (!visible) {
    return null;
  }

  return (
    <Overlay visible={visible} zIndex={40} onClick={onClose}>
      <div
        className='w-full max-w-md'
        onClick={stopPropagation}
        role='dialog'
        aria-modal='true'
        aria-labelledby='scheduling-go-to-date-title'
      >
        <Card padding='lg' shadow='xl'>
          <Flex col wFull gap5>
            <Flex row wFull alignStart justifySpaceBetween gap4>
              <Flex col wFull gap2 flex1>
                <Title
                  fs3
                  fw3
                  block
                  leadingRelaxed
                  id='scheduling-go-to-date-title'
                >
                  {t('PSYCHOLOGIST_SCHEDULING_GO_TO_TITLE')}
                </Title>
                <Title hint gray block leadingRelaxed>
                  {t('PSYCHOLOGIST_SCHEDULING_GO_TO_SUBTITLE')}
                </Title>
              </Flex>
              <Button
                type='button'
                variant='secondary'
                outlined
                circle
                title={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                onClick={onClose}
              >
                <Icon.Close sm />
              </Button>
            </Flex>

            <form className='w-full' onSubmit={handleSubmit} noValidate>
              {formError ? (
                <div
                  className='mb-4 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm font-medium text-mb-danger'
                  role='alert'
                >
                  {formError}
                </div>
              ) : null}

              <Flex row wFull gap4>
                <Flex flex1 wFull>
                  <FormGroup label={t('PSYCHOLOGIST_SCHEDULING_GO_TO_DAY')}>
                    <Select
                      value={day}
                      options={DAY_OPTIONS}
                      onChange={(value) => {
                        setDay(String(value));
                        setFormError('');
                      }}
                    />
                  </FormGroup>
                </Flex>
                <Flex flex1 wFull>
                  <FormGroup label={t('PSYCHOLOGIST_SCHEDULING_GO_TO_MONTH')}>
                    <Select
                      value={month}
                      options={monthOptions}
                      onChange={(value) => {
                        setMonth(String(value));
                        setFormError('');
                      }}
                    />
                  </FormGroup>
                </Flex>
                <Flex flex1 wFull>
                  <FormGroup label={t('PSYCHOLOGIST_SCHEDULING_GO_TO_YEAR')}>
                    <Select
                      value={year}
                      options={yearOptions}
                      onChange={(value) => {
                        setYear(String(value));
                        setFormError('');
                      }}
                    />
                  </FormGroup>
                </Flex>
              </Flex>

              <FormActions mt6>
                <Button
                  type='button'
                  variant='secondary'
                  outlined
                  onClick={onClose}
                >
                  {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                </Button>
                <Button type='submit' variant='primary'>
                  {t('PSYCHOLOGIST_SCHEDULING_GO_TO_ACTION')}
                </Button>
              </FormActions>
            </form>
          </Flex>
        </Card>
      </div>
    </Overlay>
  );
};
