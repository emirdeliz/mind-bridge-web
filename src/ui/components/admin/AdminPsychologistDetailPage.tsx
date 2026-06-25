'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  AdminPatientInteractionPeriod,
  AppLanguage,
  PsychologistBillablePatientDto,
} from '@api';
import { Button, Checkbox, Flex, Title } from '@atoms';
import {
  formatCentsAsCurrencyForAppLanguage,
  formatDateAsDDMMYYYYAndTime,
  localeForAppLanguage,
} from '@helpers';
import { translateTemplate, useI18n } from '@i18n';
import { Card, InputSearch, PageLoader, Table } from '@molecules';
import { AppShell, DashboardSectionTitle } from '@templates';
import {
  canNavigateToPreviousBillingMonth,
  previousBillingMonth,
  useAdminPsychologistBilling,
  useAdminPsychologistPatients,
  useAdminPsychologists,
} from '@services';

import { useAdminGuard } from './useAdminGuard';

type BillablePatientTableRow = PsychologistBillablePatientDto & {
  actions: null;
};

const INTERACTION_PERIOD_OPTIONS: AdminPatientInteractionPeriod[] = [
  'week',
  'month',
  '3m',
  '6m',
  '1y',
];

const interactionPeriodLabelKey = (
  period: AdminPatientInteractionPeriod
): string => {
  switch (period) {
    case 'week':
      return 'ADMIN_PERIOD_WEEK';
    case 'month':
      return 'ADMIN_PERIOD_LAST_MONTH';
    case '3m':
      return 'ADMIN_PERIOD_3M';
    case '6m':
      return 'ADMIN_PERIOD_6M';
    case '1y':
      return 'ADMIN_PERIOD_1Y';
  }
};

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

export const AdminPsychologistDetailPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isAdmin } = useAdminGuard();
  const psychologistId =
    typeof router.query.psychologistId === 'string'
      ? router.query.psychologistId
      : undefined;
  const { psychologists, loading: psychologistsLoading } =
    useAdminPsychologists();
  const {
    patients,
    interactionPeriod,
    setInteractionPeriod,
    search,
    setSearch,
    includeDeleted,
    setIncludeDeleted,
    loading: patientsLoading,
    error: patientsError,
  } = useAdminPsychologistPatients(psychologistId);
  const [selectedBillingMonth, setSelectedBillingMonth] = useState<
    string | null
  >(null);
  const {
    billing,
    loading: billingLoading,
    error: billingError,
  } = useAdminPsychologistBilling(psychologistId, selectedBillingMonth);

  const psychologist = useMemo(
    () => psychologists.find((item) => item.id === psychologistId),
    [psychologistId, psychologists]
  );

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

  const patientTableData = useMemo(
    () =>
      patients.map((patient) => ({
        ...patient,
        actions: null,
      })),
    [patients]
  );

  const patientColumns = useMemo(
    () => [
      {
        key: 'fullName' as const,
        label: t('ADMIN_PSYCHOLOGIST_PATIENTS_COL_NAME'),
        customCellRender: (row: (typeof patientTableData)[number]) => (
          <Title s2 fw3 white block>
            {row.fullName ?? '—'}
          </Title>
        ),
      },
      {
        key: 'email' as const,
        label: t('ADMIN_PSYCHOLOGIST_PATIENTS_COL_EMAIL'),
      },
      {
        key: 'phone' as const,
        label: t('ADMIN_PSYCHOLOGIST_PATIENTS_COL_PHONE'),
      },
      {
        key: 'lastConsultationAt' as const,
        label: t('ADMIN_PSYCHOLOGIST_PATIENTS_COL_LAST_CONSULTATION'),
        customCellRender: (row: (typeof patientTableData)[number]) =>
          row.lastConsultationAt
            ? formatDateAsDDMMYYYYAndTime(row.lastConsultationAt)
            : '—',
      },
      {
        key: 'aiInteractionCount' as const,
        label: t('ADMIN_PSYCHOLOGIST_PATIENTS_COL_AI_INTERACTIONS'),
        customCellRender: (row: (typeof patientTableData)[number]) => (
          <Title s2 white={row.aiInteractionCount > 0} gray={row.aiInteractionCount === 0}>
            {row.aiInteractionCount > 0
              ? String(row.aiInteractionCount)
              : t('ADMIN_PSYCHOLOGIST_PATIENTS_NO_AI_INTERACTIONS')}
          </Title>
        ),
      },
    ],
    [t]
  );

  const billablePatientColumns = useMemo(
    () => [
      {
        key: 'fullName' as const,
        label: t('PSYCHOLOGIST_BILLING_PATIENTS_COL_NAME'),
        customCellRender: (row: BillablePatientTableRow) => (
          <Title s2 fw3 white block>
            {row.fullName ?? row.email ?? row.patientId}
          </Title>
        ),
      },
      {
        key: 'enabledAt' as const,
        label: t('PSYCHOLOGIST_BILLING_PATIENTS_COL_ENABLED_AT'),
        customCellRender: (row: BillablePatientTableRow) =>
          formatDateAsDDMMYYYYAndTime(row.enabledAt),
      },
      {
        key: 'isCurrentlyEnabled' as const,
        label: t('PSYCHOLOGIST_BILLING_PATIENTS_COL_STATUS'),
        customCellRender: (row: BillablePatientTableRow) => (
          <Title s2 white>
            {row.isCurrentlyEnabled
              ? t('PSYCHOLOGIST_BILLING_PATIENT_STATUS_ACTIVE')
              : t('PSYCHOLOGIST_BILLING_PATIENT_STATUS_INACTIVE')}
          </Title>
        ),
      },
    ],
    [t]
  );

  const billablePatients = useMemo(
    (): BillablePatientTableRow[] =>
      (billing?.billablePatients ?? []).map((patient) => ({
        ...patient,
        actions: null,
      })),
    [billing?.billablePatients]
  );

  if (!isAdmin && !guardLoading) {
    return null;
  }

  const showLoader =
    guardLoading ||
    psychologistsLoading ||
    patientsLoading ||
    billingLoading;
  const currency = billing?.currency ?? 'BRL';

  return (
    <AppShell
      title={psychologist?.fullName ?? t('ADMIN_PSYCHOLOGIST_DETAIL_TITLE')}
      subtitle={psychologist?.email ?? t('ADMIN_PSYCHOLOGIST_DETAIL_SUBTITLE')}
      variant='dashboard'
    >
      <Flex col wFull gap5>
        <Button
          type='button'
          variant='secondary'
          onClick={() => void router.push('/admin/psychologists')}
        >
          {t('BACK')}
        </Button>

        {showLoader ? (
          <PageLoader />
        ) : (
          <>
            <Card padding='lg' shadow='md'>
              <DashboardSectionTitle
                title={t('ADMIN_PSYCHOLOGIST_BILLING_TITLE')}
                tooltip={t('TOOLTIP_ADMIN_PSYCHOLOGIST_BILLING')}
              />
              {billingError ? (
                <Title s2 error block>
                  {billingError}
                </Title>
              ) : billing ? (
                <Flex col gap4>
                  <Flex row wFull wrap gap4 alignCenter>
                    <div className='min-w-0 flex-1'>
                      <Title fs4 fw3 block>
                        {formatBillingMonth(billing.billingMonth, language)}
                      </Title>
                    </div>
                    <div className='ml-auto'>
                      <Flex row gap2 justifyEnd wrap>
                      <Button
                        type='button'
                        variant='secondary'
                        outlined
                        clickable={canGoToPreviousMonth}
                        onClick={() => {
                          if (!billing.billingMonth || !canGoToPreviousMonth) {
                            return;
                          }
                          setSelectedBillingMonth(
                            previousBillingMonth(billing.billingMonth)
                          );
                        }}
                      >
                        {t('PSYCHOLOGIST_BILLING_PREVIOUS_MONTH')}
                      </Button>
                      <Button
                        type='button'
                        variant='secondary'
                        outlined
                        clickable={!billing.isCurrentMonth}
                        onClick={() => setSelectedBillingMonth(null)}
                      >
                        {t('PSYCHOLOGIST_BILLING_BACK_TO_CURRENT_MONTH')}
                      </Button>
                      </Flex>
                    </div>
                  </Flex>
                  <Flex row wrap gap6>
                    <div>
                      <Title hint gray block>
                        {translateTemplate(
                          t('PSYCHOLOGIST_BILLING_ENABLED_PATIENTS'),
                          { count: String(billing.enabledPatientCount) }
                        )}
                      </Title>
                    </div>
                    <div>
                      <Title hint gray block>
                        {translateTemplate(t('PSYCHOLOGIST_BILLING_NET_AMOUNT'), {
                          amount: formatCentsAsCurrencyForAppLanguage(
                            billing.netAmountCents,
                            language,
                            currency
                          ),
                        })}
                      </Title>
                    </div>
                  </Flex>
                  <Table
                    variant='dark'
                    dataSource={billablePatients}
                    columns={billablePatientColumns}
                  />
                </Flex>
              ) : null}
            </Card>

            <Card padding='lg' shadow='md'>
              <DashboardSectionTitle
                title={t('ADMIN_PSYCHOLOGIST_PATIENTS_TITLE')}
                tooltip={t('TOOLTIP_ADMIN_PSYCHOLOGIST_PATIENTS')}
              />
              <Flex col gap4 mb4>
                <Flex row wFull wrap gap2 justifyEnd>
                  {INTERACTION_PERIOD_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      type='button'
                      sm
                      variant={
                        interactionPeriod === option ? 'primary' : 'secondary'
                      }
                      outlined={interactionPeriod !== option}
                      onClick={() => setInteractionPeriod(option)}
                    >
                      {t(interactionPeriodLabelKey(option))}
                    </Button>
                  ))}
                </Flex>
                <Flex row wFull wrap gap4 alignCenter>
                  <div className='min-w-0 flex-1'>
                    <InputSearch value={search} onChange={setSearch} />
                  </div>
                  <Checkbox
                    checked={includeDeleted}
                    label={t('PSYCHOLOGIST_PATIENTS_SHOW_DELETED')}
                    onChange={setIncludeDeleted}
                  />
                </Flex>
              </Flex>
              {patientsError ? (
                <Title s2 error block>
                  {patientsError}
                </Title>
              ) : (
                <Table
                  variant='dark'
                  dataSource={patientTableData}
                  columns={patientColumns}
                />
              )}
            </Card>
          </>
        )}
      </Flex>
    </AppShell>
  );
};
