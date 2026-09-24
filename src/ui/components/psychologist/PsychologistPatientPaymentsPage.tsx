'use client';

import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import type { AppLanguage, PatientPaymentRowDto } from '@api';
import { Button, Checkbox, Flex, Icon, Title } from '@atoms';
import {
  formatCentsAsCurrencyForAppLanguage,
  formatDateAsDDMMYYYYAndTime,
  localeForAppLanguage,
} from '@helpers';
import { translateTemplate, useI18n } from '@i18n';
import {
  Card,
  ChartCard,
  ConfirmModal,
  PageLoader,
  Table,
  Tooltip,
} from '@molecules';
import { AppShell, DashboardSectionTitle } from '@templates';
import {
  canNavigateToPreviousBillingMonth,
  previousBillingMonth,
  usePsychologistPatientPayments,
} from '@services';

import { PatientPaymentRegisterModal } from './PatientPaymentRegisterModal';
import { usePsychologistGuard } from './usePsychologistGuard';

const stopRowClick = (event: MouseEvent) => {
  event.stopPropagation();
};

type PatientPaymentTableRow = PatientPaymentRowDto & {
  actions: ReactNode;
};

const ChartDonut = dynamic(
  () =>
    import('../../atoms/Chart/Donut/ChartDonut').then((mod) => mod.ChartDonut),
  { ssr: false }
);

const formatBillingMonth = (
  billingMonth: string,
  language: AppLanguage
): string => {
  const date = new Date(`${billingMonth}T12:00:00.000Z`);
  return new Intl.DateTimeFormat(localeForAppLanguage(language), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const formatBillingMonthShort = (
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

const hasOutstandingDebt = (patient: PatientPaymentRowDto): boolean =>
  patient.unpaidBillingMonths.length > 0;

export const PsychologistPatientPaymentsPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();
  const [selectedBillingMonth, setSelectedBillingMonth] = useState<
    string | null
  >(null);
  const [registerPatient, setRegisterPatient] =
    useState<PatientPaymentRowDto | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [showOnlyNonCompliant, setShowOnlyNonCompliant] = useState(false);
  const { summary, loading, saving, error, savePayment, removePayment } =
    usePsychologistPatientPayments(selectedBillingMonth);

  const oldestBillingMonth = summary?.availableMonths[0];
  const canGoToPreviousMonth = summary?.billingMonth
    ? canNavigateToPreviousBillingMonth(
        summary.billingMonth,
        oldestBillingMonth
      )
    : false;

  const currency = summary?.currency ?? 'BRL';
  const monthLabel = summary?.billingMonth
    ? formatBillingMonth(summary.billingMonth, language)
    : '';

  const totalCollected = summary
    ? formatCentsAsCurrencyForAppLanguage(
        summary.totalCollectedCents,
        language,
        currency
      )
    : '—';

  const complianceChartData = useMemo(
    () => [
      {
        name: t('PSYCHOLOGIST_PATIENT_PAYMENTS_COMPLIANT'),
        value: summary?.compliantCount ?? 0,
        color: '#5eead4',
      },
      {
        name: t('PSYCHOLOGIST_PATIENT_PAYMENTS_NON_COMPLIANT'),
        value: summary?.nonCompliantCount ?? 0,
        color: '#f87171',
      },
    ],
    [summary?.compliantCount, summary?.nonCompliantCount, t]
  );

  const formatPaidAt = useCallback(
    (value: string | null | undefined) =>
      value ? formatDateAsDDMMYYYYAndTime(value) : '—',
    []
  );

  const formatUnpaidMonths = useCallback(
    (months: string[]) =>
      months
        .map((month) => formatBillingMonthShort(month, language))
        .join(', '),
    [language]
  );

  const buildRowActions = useCallback(
    (row: PatientPaymentRowDto): ReactNode => {
      if (!row.isBillableInSelectedMonth) {
        return null;
      }

      return (
        <div
          className='flex flex-row items-center justify-center gap-2'
          onClick={stopRowClick}
          role='presentation'
        >
          <Tooltip
            title={
              row.isCompliant
                ? t('PSYCHOLOGIST_PATIENT_PAYMENTS_ACTION_EDIT')
                : t('PSYCHOLOGIST_PATIENT_PAYMENTS_ACTION_REGISTER')
            }
            top
            minWidth={10}
          >
            <Button
              type='button'
              icon
              variant={row.isCompliant ? 'secondary' : 'primary'}
              clickable={!saving}
              onClick={() => setRegisterPatient(row)}
            >
              {row.isCompliant ? <Icon.Pencil nm /> : <Icon.Edit nm />}
            </Button>
          </Tooltip>
          {row.payment ? (
            <Tooltip
              title={t('PSYCHOLOGIST_PATIENT_PAYMENTS_ACTION_REMOVE')}
              top
              minWidth={10}
            >
              <Button
                type='button'
                icon
                variant='danger'
                clickable={!saving}
                onClick={() => setDeletePaymentId(row.payment!.id)}
              >
                <Icon.TrashEmpty nm />
              </Button>
            </Tooltip>
          ) : null}
        </div>
      );
    },
    [saving, t]
  );

  const filteredPatients = useMemo(() => {
    const patients = summary?.patients ?? [];
    if (showOnlyNonCompliant) {
      return patients.filter(hasOutstandingDebt);
    }
    return patients.filter((patient) => patient.isBillableInSelectedMonth);
  }, [showOnlyNonCompliant, summary?.patients]);

  const tableData = useMemo((): PatientPaymentTableRow[] => {
    return filteredPatients.map((patient) => ({
      ...patient,
      actions: buildRowActions(patient),
    }));
  }, [buildRowActions, filteredPatients]);

  const columns = useMemo(
    () => [
      {
        key: 'fullName' as const,
        label: t('PSYCHOLOGIST_PATIENT_PAYMENTS_COL_PATIENT'),
      },
      {
        key: 'isCompliant' as const,
        label: t('PSYCHOLOGIST_PATIENT_PAYMENTS_COL_STATUS'),
        disableSort: true,
        customCellRender: (row: PatientPaymentTableRow) => (
          <Flex col wFull gap1>
            <Title
              s2
              white={row.isCompliant && row.isBillableInSelectedMonth}
              textAccent={
                !row.isBillableInSelectedMonth ||
                (row.isBillableInSelectedMonth && !row.isCompliant)
              }
            >
              {!row.isBillableInSelectedMonth
                ? t('PSYCHOLOGIST_PATIENT_PAYMENTS_NOT_BILLABLE_IN_MONTH')
                : row.isCompliant
                  ? t('PSYCHOLOGIST_PATIENT_PAYMENTS_STATUS_PAID')
                  : t('PSYCHOLOGIST_PATIENT_PAYMENTS_STATUS_PENDING')}
            </Title>
            {row.unpaidBillingMonths.length > 0 ? (
              <Title hint gray block>
                {translateTemplate(
                  t('PSYCHOLOGIST_PATIENT_PAYMENTS_UNPAID_MONTHS'),
                  {
                    months: formatUnpaidMonths(row.unpaidBillingMonths),
                  }
                )}
              </Title>
            ) : null}
          </Flex>
        ),
      },
      {
        key: 'patientId' as const,
        label: t('PSYCHOLOGIST_PATIENT_PAYMENTS_COL_AMOUNT'),
        disableSort: true,
        customCellRender: (row: PatientPaymentTableRow) => (
          <Title s2 white>
            {row.payment
              ? formatCentsAsCurrencyForAppLanguage(
                  row.payment.amountCents,
                  language,
                  currency
                )
              : '—'}
          </Title>
        ),
      },
      {
        key: 'payment' as const,
        label: t('PSYCHOLOGIST_PATIENT_PAYMENTS_COL_PAID_AT'),
        disableSort: true,
        customCellRender: (row: PatientPaymentTableRow) => (
          <Title s2 white>
            {formatPaidAt(row.payment?.paidAt)}
          </Title>
        ),
      },
      {
        key: 'actions' as const,
        label: t('PSYCHOLOGIST_PATIENTS_COL_ACTIONS'),
        disableSort: true,
      },
    ],
    [currency, formatPaidAt, formatUnpaidMonths, language, t]
  );

  const goToPreviousMonth = () => {
    if (!summary?.billingMonth || !canGoToPreviousMonth) {
      return;
    }
    setSelectedBillingMonth(previousBillingMonth(summary.billingMonth));
  };

  const goToCurrentMonth = () => {
    setSelectedBillingMonth(null);
  };

  const handleSavePayment = async (amountCents: number, notes: string) => {
    if (!registerPatient || !summary?.billingMonth) {
      return;
    }
    await savePayment({
      patientId: registerPatient.patientId,
      billingMonth: summary.billingMonth,
      amountCents,
      notes: notes || null,
    });
    setRegisterPatient(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletePaymentId) {
      return;
    }
    await removePayment(deletePaymentId);
    setDeletePaymentId(null);
  };

  if (!isPsychologist && !guardLoading) {
    return null;
  }

  const showFullPageLoader = guardLoading || (loading && !summary);
  const showContentLoader = !showFullPageLoader && loading && summary !== null;

  const periodTitle = summary?.isCurrentMonth
    ? t('PSYCHOLOGIST_PATIENT_PAYMENTS_CURRENT_MONTH')
    : translateTemplate(t('PSYCHOLOGIST_PATIENT_PAYMENTS_SELECTED_MONTH'), {
        month: monthLabel,
      });

  return (
    <AppShell
      title={t('PSYCHOLOGIST_PATIENT_PAYMENTS_TITLE')}
      subtitle={t('PSYCHOLOGIST_PATIENT_PAYMENTS_SUBTITLE')}
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
            onClick={() => void router.push('/psychologist/billing')}
          >
            {t('PSYCHOLOGIST_PATIENT_PAYMENTS_GO_TO_BILLING')}
          </Button>
        </Flex>
        <Flex row alignCenter wrap gap4>
          <Button
            type='button'
            variant='secondary'
            disabled={!canGoToPreviousMonth || loading}
            onClick={goToPreviousMonth}
          >
            {t('PSYCHOLOGIST_BILLING_PREVIOUS_MONTH')}
          </Button>
          {!summary?.isCurrentMonth ? (
            <Button
              type='button'
              variant='primary'
              disabled={loading}
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
            <>
              <div className='mb-chart-card-row'>
                <Card padding='lg' shadow='md'>
                  <DashboardSectionTitle
                    title={periodTitle}
                    tooltip={t('TOOLTIP_PSYCHOLOGIST_PATIENT_PAYMENTS_SUMMARY')}
                  />
                  <Flex col wFull gap2>
                    <Title fs3 fw3>
                      {translateTemplate(
                        t('PSYCHOLOGIST_PATIENT_PAYMENTS_TOTAL_COLLECTED'),
                        {
                          amount: totalCollected,
                        }
                      )}
                    </Title>
                    <Title s1 gray>
                      {translateTemplate(
                        t('PSYCHOLOGIST_PATIENT_PAYMENTS_EXPECTED_PATIENTS'),
                        {
                          count: String(summary?.expectedPatientCount ?? 0),
                        }
                      )}
                    </Title>
                    <Title s1 gray>
                      {translateTemplate(
                        t('PSYCHOLOGIST_PATIENT_PAYMENTS_COMPLIANT_COUNT'),
                        {
                          count: String(summary?.compliantCount ?? 0),
                        }
                      )}
                    </Title>
                    <Title s1 gray>
                      {translateTemplate(
                        t('PSYCHOLOGIST_PATIENT_PAYMENTS_NON_COMPLIANT_COUNT'),
                        {
                          count: String(summary?.nonCompliantCount ?? 0),
                        }
                      )}
                    </Title>
                  </Flex>
                </Card>

                <ChartCard
                  title={t('PSYCHOLOGIST_PATIENT_PAYMENTS_COMPLIANCE_CHART')}
                  tooltip={t('TOOLTIP_PSYCHOLOGIST_PATIENT_PAYMENTS_CHART')}
                >
                  <ChartDonut
                    data={complianceChartData}
                    centerText={String(summary?.expectedPatientCount ?? 0)}
                    hideWhenEmpty={false}
                    height={280}
                  />
                </ChartCard>
              </div>

              <Card padding='lg' shadow='md'>
                <DashboardSectionTitle
                  title={translateTemplate(
                    t('PSYCHOLOGIST_PATIENT_PAYMENTS_TABLE_TITLE'),
                    {
                      month: monthLabel,
                    }
                  )}
                  tooltip={t('TOOLTIP_PSYCHOLOGIST_PATIENT_PAYMENTS_TABLE')}
                  trailing={
                    <Checkbox
                      checked={showOnlyNonCompliant}
                      label={t(
                        'PSYCHOLOGIST_PATIENT_PAYMENTS_SHOW_NON_COMPLIANT_ONLY'
                      )}
                      onChange={setShowOnlyNonCompliant}
                    />
                  }
                />
                {tableData.length === 0 ? (
                  <Title s1 gray>
                    {showOnlyNonCompliant
                      ? t('PSYCHOLOGIST_PATIENT_PAYMENTS_EMPTY_FILTERED')
                      : t('PSYCHOLOGIST_PATIENT_PAYMENTS_EMPTY')}
                  </Title>
                ) : (
                  <Table<PatientPaymentTableRow>
                    variant='dark'
                    columns={columns}
                    dataSource={tableData}
                    sortable
                  />
                )}
              </Card>
            </>
          )}
        </>
      )}

      <PatientPaymentRegisterModal
        visible={Boolean(registerPatient)}
        patient={registerPatient}
        billingMonth={summary?.billingMonth ?? ''}
        saving={saving}
        onClose={() => setRegisterPatient(null)}
        onConfirm={handleSavePayment}
      />

      <ConfirmModal
        visible={Boolean(deletePaymentId)}
        title={t('PSYCHOLOGIST_PATIENT_PAYMENTS_DELETE_CONFIRM_TITLE')}
        message={t('PSYCHOLOGIST_PATIENT_PAYMENTS_DELETE_CONFIRM_MESSAGE')}
        confirmLabel={t('PSYCHOLOGIST_PATIENT_PAYMENTS_ACTION_REMOVE')}
        cancelLabel={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
        confirmVariant='danger'
        onClose={() => {
          if (!saving) {
            setDeletePaymentId(null);
          }
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </AppShell>
  );
};
