'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { MB_COLORS } from '@constants';
import type {
  AdminMetricsGranularity,
  AdminMetricsPeriod,
  AppLanguage,
} from '@api';
import { Button, Flex, Title } from '@atoms';
import {
  formatCentsAsCurrencyForAppLanguage,
  localeForAppLanguage,
} from '@helpers';
import { useI18n } from '@i18n';
import { Card, ChartCard, PageLoader } from '@molecules';
import { AppShell, DashboardSectionTitle } from '@templates';
import { useAdminPlatformMetrics } from '@services';

import { useAdminGuard } from './useAdminGuard';

const ChartLine = dynamic(
  () => import('../../atoms/Chart/Line/ChartLine').then((mod) => mod.ChartLine),
  { ssr: false }
);

const PERIOD_OPTIONS: AdminMetricsPeriod[] = ['month', '3m', '6m', '1y'];

const parseUtcDate = (isoDate: string): Date =>
  new Date(`${isoDate}T12:00:00.000Z`);

const formatBillingMonth = (
  periodStart: string,
  language: AppLanguage
): string => {
  const date = parseUtcDate(periodStart);
  return new Intl.DateTimeFormat(localeForAppLanguage(language), {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const formatWeekRange = (
  periodStart: string,
  periodEndInclusive: string,
  language: AppLanguage
): string => {
  const start = parseUtcDate(periodStart);
  const end = parseUtcDate(periodEndInclusive);
  const locale = localeForAppLanguage(language);
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: 'UTC',
  });
  const dayFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    timeZone: 'UTC',
  });

  if (
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth()
  ) {
    return `${dayFormatter.format(start)}–${dayFormatter.format(end)} ${monthFormatter.format(start)}`;
  }

  return `${dayFormatter.format(start)} ${monthFormatter.format(start)} – ${dayFormatter.format(end)} ${monthFormatter.format(end)}`;
};

const resolveWeekEndInclusive = (
  points: { periodStart: string }[],
  index: number
): string => {
  const start = parseUtcDate(points[index].periodStart);
  if (index < points.length - 1) {
    const nextStart = parseUtcDate(points[index + 1].periodStart);
    nextStart.setUTCDate(nextStart.getUTCDate() - 1);
    const year = nextStart.getUTCFullYear();
    const month = String(nextStart.getUTCMonth() + 1).padStart(2, '0');
    const day = String(nextStart.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const monthEnd = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 12, 0, 0, 0)
  );
  const year = monthEnd.getUTCFullYear();
  const month = String(monthEnd.getUTCMonth() + 1).padStart(2, '0');
  const day = String(monthEnd.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMetricCategory = (
  points: { periodStart: string }[],
  index: number,
  granularity: AdminMetricsGranularity | undefined,
  language: AppLanguage
): string => {
  const point = points[index];
  if (granularity === 'week') {
    return formatWeekRange(
      point.periodStart,
      resolveWeekEndInclusive(points, index),
      language
    );
  }

  return formatBillingMonth(point.periodStart, language);
};

const periodLabelKey = (period: AdminMetricsPeriod): string => {
  switch (period) {
    case 'month':
      return 'ADMIN_PERIOD_MONTH';
    case '3m':
      return 'ADMIN_PERIOD_3M';
    case '6m':
      return 'ADMIN_PERIOD_6M';
    case '1y':
      return 'ADMIN_PERIOD_1Y';
  }
};

export const AdminPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isAdmin } = useAdminGuard();
  const [period, setPeriod] = useState<AdminMetricsPeriod>('month');
  const {
    metrics,
    loading: metricsLoading,
    error,
  } = useAdminPlatformMetrics(period);

  const categories = useMemo(
    () =>
      (metrics?.points ?? []).map((point, index, points) =>
        formatMetricCategory(points, index, metrics?.granularity, language)
      ),
    [language, metrics?.granularity, metrics?.points]
  );

  const psychologistsSeries = useMemo(
    () => [
      {
        name: t('ADMIN_ACTIVE_PSYCHOLOGISTS_CHART'),
        data: (metrics?.points ?? []).map((point) => point.activePsychologists),
        color: MB_COLORS.primary,
        smooth: true,
        areaStyle: true,
      },
    ],
    [metrics?.points, t]
  );

  const patientsSeries = useMemo(
    () => [
      {
        name: t('ADMIN_ACTIVE_PATIENTS_CHART'),
        data: (metrics?.points ?? []).map((point) => point.activePatients),
        color: MB_COLORS.accent,
        smooth: true,
        areaStyle: true,
      },
    ],
    [metrics?.points, t]
  );

  if (!isAdmin && !guardLoading) {
    return null;
  }

  const showFullPageLoader = guardLoading || metricsLoading;
  const currency = metrics?.currency ?? 'BRL';
  const revenueLabel = formatCentsAsCurrencyForAppLanguage(
    metrics?.platformRevenueCents ?? 0,
    language,
    currency
  );

  return (
    <AppShell
      title={t('ADMIN_PAGE_TITLE')}
      subtitle={t('ADMIN_PAGE_SUBTITLE')}
      variant='dashboard'
    >
      <Flex col wFull gap5>
        <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
          <Button
            type='button'
            variant='secondary'
            onClick={() => router.back()}
          >
            {t('BACK')}
          </Button>
          <Flex row wrap gap4 justifyEnd>
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option}
                type='button'
                variant={period === option ? 'primary' : 'secondary'}
                outlined={period !== option}
                onClick={() => setPeriod(option)}
              >
                {t(periodLabelKey(option))}
              </Button>
            ))}
          </Flex>
        </Flex>

        {showFullPageLoader ? (
          <PageLoader />
        ) : error ? (
          <Title s2 error block>
            {error}
          </Title>
        ) : (
          <>
            <Card padding='lg' shadow='md'>
              <DashboardSectionTitle
                title={t('ADMIN_PLATFORM_REVENUE')}
                tooltip={t('TOOLTIP_ADMIN_PLATFORM_REVENUE')}
              />
              <Title fs4 fw3 block>
                {revenueLabel}
              </Title>
              <Title hint gray block mt2>
                {t(periodLabelKey(period))}
              </Title>
            </Card>

            <ChartCard
              title={t('ADMIN_ACTIVE_PSYCHOLOGISTS_CHART')}
              tooltip={t('TOOLTIP_ADMIN_ACTIVE_PSYCHOLOGISTS')}
            >
              <ChartLine categories={categories} series={psychologistsSeries} />
            </ChartCard>

            <ChartCard
              title={t('ADMIN_ACTIVE_PATIENTS_CHART')}
              tooltip={t('TOOLTIP_ADMIN_ACTIVE_PATIENTS')}
            >
              <ChartLine categories={categories} series={patientsSeries} />
            </ChartCard>
          </>
        )}
      </Flex>
    </AppShell>
  );
};
