'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import type { AppLanguage, PsychologistBillablePatientDto } from '@api';
import { Button, Flex, Title } from '@atoms';
import {
  formatCentsAsCurrencyForAppLanguage,
  formatCurrencyForAppLanguage,
  formatDateAsDDMMYYYYAndTime,
  localeForAppLanguage,
} from '@helpers';
import { translateTemplate, useI18n } from '@i18n';
import { Card, ChartCard, PageLoader, Table } from '@molecules';
import { AppShell, DashboardSectionTitle } from '@templates';
import {
  canNavigateToPreviousBillingMonth,
  previousBillingMonth,
  usePsychologistBilling,
} from '@services';

import { usePsychologistGuard } from './usePsychologistGuard';

type BillablePatientTableRow = PsychologistBillablePatientDto & {
  actions: null;
};

const ChartLine = dynamic(
  () => import('../../atoms/Chart/Line/ChartLine').then((mod) => mod.ChartLine),
  { ssr: false }
);
const ChartBarVertical = dynamic(
  () =>
    import('../../atoms/Chart/BarVertical/ChartBarVertical').then(
      (mod) => mod.ChartBarVertical
    ),
  { ssr: false }
);

const formatBillingMonth = (
  billingMonth: string,
  language: AppLanguage
): string => {
  const date = new Date(`${billingMonth}T12:00:00.000Z`);
  return new Intl.DateTimeFormat(localeForAppLanguage(language), {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

export const PsychologistBillingPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();
  const [selectedBillingMonth, setSelectedBillingMonth] = useState<
    string | null
  >(null);
  const {
    billing,
    loading: billingLoading,
    error,
  } = usePsychologistBilling(selectedBillingMonth);
  const history = useMemo(
    () => billing?.history ?? [],
    [billing?.history]
  );
  const oldestBillingMonth = history[0]?.billingMonth;
  const canGoToPreviousMonth = billing?.billingMonth
    ? canNavigateToPreviousBillingMonth(
        billing.billingMonth,
        oldestBillingMonth
      )
    : false;
  const monthCategories = useMemo(
    () =>
      history.map((entry) => formatBillingMonth(entry.billingMonth, language)),
    [history, language]
  );
  const netCostSeries = useMemo(
    () => [
      {
        name: t('PSYCHOLOGIST_BILLING_CHART_COST'),
        data: history.map((entry) =>
          Number((entry.netAmountCents / 100).toFixed(2))
        ),
        color: '#818cf8',
        smooth: true,
        areaStyle: true,
      },
    ],
    [history, t]
  );
  const patientCountSeries = useMemo(
    () => [
      {
        name: t('PSYCHOLOGIST_BILLING_CHART_PATIENTS'),
        data: history.map((entry) => entry.enabledPatientCount),
        color: '#5eead4',
      },
    ],
    [history, t]
  );
  const currency = billing?.currency ?? 'BRL';
  const formatCostTooltipValue = useMemo(
    () => (value: number) =>
      formatCurrencyForAppLanguage(value, language, currency),
    [language, currency]
  );

  const formatBillingDateTime = useCallback(
    (value: string | null) =>
      value ? formatDateAsDDMMYYYYAndTime(value) : '—',
    []
  );

  const resolvePatientStatusLabel = useCallback(
    (patient: PsychologistBillablePatientDto) => {
      if (patient.isCurrentlyEnabled) {
        return t('PSYCHOLOGIST_BILLING_PATIENT_STATUS_ACTIVE');
      }

      if (patient.deactivatedDuringMonth) {
        return t('PSYCHOLOGIST_BILLING_PATIENT_STATUS_DEACTIVATED_IN_MONTH');
      }

      return t('PSYCHOLOGIST_BILLING_PATIENT_STATUS_INACTIVE');
    },
    [t]
  );

  const billablePatientsTableData = useMemo((): BillablePatientTableRow[] => {
    return (billing?.billablePatients ?? []).map((patient) => ({
      ...patient,
      actions: null,
    }));
  }, [billing?.billablePatients]);

  const billablePatientsColumns = useMemo(
    () => [
      {
        key: 'fullName' as const,
        label: t('PSYCHOLOGIST_BILLING_PATIENTS_COL_NAME'),
      },
      {
        key: 'enabledAt' as const,
        label: t('PSYCHOLOGIST_BILLING_PATIENTS_COL_ENABLED_AT'),
        dateAndTime: true,
      },
      {
        key: 'disabledAt' as const,
        label: t('PSYCHOLOGIST_BILLING_PATIENTS_COL_DISABLED_AT'),
        customCellRender: (row: BillablePatientTableRow) => (
          <Title s2 white>
            {formatBillingDateTime(row.disabledAt)}
          </Title>
        ),
      },
      {
        key: 'patientId' as const,
        label: t('PSYCHOLOGIST_BILLING_PATIENTS_COL_STATUS'),
        disableSort: true,
        customCellRender: (row: BillablePatientTableRow) => (
          <Title
            s2
            white={row.isCurrentlyEnabled}
            textAccent={row.deactivatedDuringMonth}
          >
            {resolvePatientStatusLabel(row)}
          </Title>
        ),
      },
    ],
    [formatBillingDateTime, resolvePatientStatusLabel, t]
  );

  const billablePatientsMonthLabel = billing?.billingMonth
    ? formatBillingMonth(billing.billingMonth, language)
    : '';

  const billingPeriodTitle = billing?.isCurrentMonth
    ? t('PSYCHOLOGIST_BILLING_CURRENT_MONTH')
    : translateTemplate(t('PSYCHOLOGIST_BILLING_SELECTED_MONTH'), {
        month: billablePatientsMonthLabel,
      });

  const goToPreviousMonth = () => {
    if (!billing?.billingMonth || !canGoToPreviousMonth) {
      return;
    }

    setSelectedBillingMonth(previousBillingMonth(billing.billingMonth));
  };

  const goToCurrentMonth = () => {
    setSelectedBillingMonth(null);
  };

  if (!isPsychologist && !guardLoading) {
    return null;
  }

  const showFullPageLoader = guardLoading || (billingLoading && !billing);
  const showContentLoader =
    !showFullPageLoader && billingLoading && billing !== null;

  const unitPrice = billing
    ? formatCentsAsCurrencyForAppLanguage(
        billing.unitPriceCents,
        language,
        currency
      )
    : '—';
  const grossAmount = billing
    ? formatCentsAsCurrencyForAppLanguage(
        billing.grossAmountCents,
        language,
        currency
      )
    : '—';
  const discountAmount = billing
    ? formatCentsAsCurrencyForAppLanguage(
        billing.discountAmountCents,
        language,
        currency
      )
    : '—';
  const netAmount = billing
    ? formatCentsAsCurrencyForAppLanguage(
        billing.netAmountCents,
        language,
        currency
      )
    : '—';

  return (
    <AppShell
      title={t('PSYCHOLOGIST_BILLING_TITLE')}
      subtitle={t('PSYCHOLOGIST_BILLING_SUBTITLE')}
      variant='dashboard'
    >
      <Flex row wFull alignCenter wrap justifySpaceBetween gap4>
        <Flex row alignCenter wrap gap4>
          <Button
            type='button'
            variant='secondary'
            onClick={() => void router.push('/psychologist/patients')}
          >
            {t('BACK_TO_PSYCHOLOGIST_PATIENTS')}
          </Button>
          <Button
            type='button'
            variant='secondary'
            onClick={() => void router.push('/psychologist/patient-payments')}
          >
            {t('PSYCHOLOGIST_PATIENT_PAYMENTS_GO_TO_PAYMENTS')}
          </Button>
        </Flex>
        <Flex row alignCenter wrap gap4>
          <Button
            type='button'
            variant='secondary'
            disabled={!canGoToPreviousMonth || billingLoading}
            onClick={goToPreviousMonth}
          >
            {t('PSYCHOLOGIST_BILLING_PREVIOUS_MONTH')}
          </Button>
          {!billing?.isCurrentMonth ? (
            <Button
              type='button'
              variant='primary'
              disabled={billingLoading}
              onClick={goToCurrentMonth}
            >
              {t('PSYCHOLOGIST_BILLING_BACK_TO_CURRENT_MONTH')}
            </Button>
          ) : null}
        </Flex>
      </Flex>

      {showFullPageLoader ? (
        <PageLoader />
      ) : (
        <>
          {error ? (
            <Title s1 gray>
              {error}
            </Title>
          ) : null}

          {showContentLoader ? (
            <PageLoader />
          ) : (
            <Flex col wFull gap4>
              <div className='mb-chart-card-row'>
                <Card padding='lg' shadow='md'>
                  <DashboardSectionTitle
                    title={billingPeriodTitle}
                    tooltip={t('TOOLTIP_PSYCHOLOGIST_BILLING_CURRENT')}
                  />
                  <Flex col wFull gap2>
                    <Title s1 gray>
                      {translateTemplate(
                        t('PSYCHOLOGIST_BILLING_ENABLED_PATIENTS'),
                        {
                          count: String(billing?.enabledPatientCount ?? 0),
                        }
                      )}
                    </Title>
                    {billing?.isCurrentMonth &&
                    (billing?.currentlyEnabledPatientCount ?? 0) !==
                      (billing?.enabledPatientCount ?? 0) ? (
                      <Title hint gray>
                        {translateTemplate(
                          t('PSYCHOLOGIST_BILLING_CURRENTLY_ENABLED_PATIENTS'),
                          {
                            count: String(
                              billing?.currentlyEnabledPatientCount ?? 0
                            ),
                          }
                        )}
                      </Title>
                    ) : null}
                    <Title s1 gray>
                      {translateTemplate(t('PSYCHOLOGIST_BILLING_UNIT_PRICE'), {
                        price: unitPrice,
                      })}
                    </Title>
                    <Title s1 gray>
                      {translateTemplate(
                        t('PSYCHOLOGIST_BILLING_GROSS_AMOUNT'),
                        {
                          amount: grossAmount,
                        }
                      )}
                    </Title>
                    {billing?.discount ? (
                      <Title hint gray>
                        {translateTemplate(
                          t('PSYCHOLOGIST_BILLING_DISCOUNT_APPLIED'),
                          {
                            percent: String(billing.discount.discountPercent),
                            label:
                              billing.discount.label ??
                              t('PSYCHOLOGIST_BILLING_DISCOUNT_DEFAULT_LABEL'),
                          }
                        )}{' '}
                        <Title s2 error inline>
                          -{discountAmount}
                        </Title>
                      </Title>
                    ) : (
                      <Title s1 gray>
                        {t('PSYCHOLOGIST_BILLING_NO_DISCOUNT')}
                      </Title>
                    )}
                    <Title fs3 fw3>
                      {translateTemplate(t('PSYCHOLOGIST_BILLING_NET_AMOUNT'), {
                        amount: netAmount,
                      })}
                    </Title>
                  </Flex>
                </Card>
                <Card padding='lg' shadow='md'>
                  <DashboardSectionTitle
                    title={t('PSYCHOLOGIST_BILLING_FORMULA_TITLE')}
                    tooltip={t('TOOLTIP_PSYCHOLOGIST_BILLING_FORMULA')}
                  />
                  <Title s1 gray>
                    {t('PSYCHOLOGIST_BILLING_FORMULA_BODY')}
                  </Title>
                </Card>
              </div>

              <ChartCard
                title={t('PSYCHOLOGIST_BILLING_COST_EVOLUTION')}
                tooltip={t('TOOLTIP_PSYCHOLOGIST_BILLING_COST_CHART')}
              >
                <ChartLine
                  categories={monthCategories}
                  series={netCostSeries}
                  formatTooltipValue={formatCostTooltipValue}
                  hideWhenEmpty={false}
                  height={300}
                />
              </ChartCard>

              <ChartCard
                title={t('PSYCHOLOGIST_BILLING_PATIENTS_EVOLUTION')}
                tooltip={t('TOOLTIP_PSYCHOLOGIST_BILLING_PATIENTS_CHART')}
              >
                <ChartBarVertical
                  categories={monthCategories}
                  series={patientCountSeries}
                  hideWhenEmpty={false}
                  height={300}
                />
              </ChartCard>

              <Card padding='lg' shadow='md'>
                <DashboardSectionTitle
                  title={translateTemplate(
                    t('PSYCHOLOGIST_BILLING_PATIENTS_DETAIL_TITLE'),
                    {
                      month: billablePatientsMonthLabel,
                    }
                  )}
                  tooltip={t('TOOLTIP_PSYCHOLOGIST_BILLING_PATIENTS_DETAIL')}
                />
                {billablePatientsTableData.length === 0 ? (
                  <Title s1 gray>
                    {t('PSYCHOLOGIST_BILLING_PATIENTS_EMPTY')}
                  </Title>
                ) : (
                  <Table<BillablePatientTableRow>
                    variant='dark'
                    columns={billablePatientsColumns}
                    dataSource={billablePatientsTableData}
                    sortable
                  />
                )}
              </Card>
            </Flex>
          )}
        </>
      )}
    </AppShell>
  );
};
