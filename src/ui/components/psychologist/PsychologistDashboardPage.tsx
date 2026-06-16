'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { MB_COLORS } from '@constants';
import { Button, Flex, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, ChartCard, DashboardKpiCard, PageLoader } from '@molecules';
import { AppShell } from '@templates';

import { usePsychologistDashboardData } from './usePsychologistDashboardData';
import { usePsychologistGuard } from './usePsychologistGuard';

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
const ChartDonut = dynamic(
  () =>
    import('../../atoms/Chart/Donut/ChartDonut').then((mod) => mod.ChartDonut),
  { ssr: false }
);
const ChartGauge = dynamic(
  () =>
    import('../../atoms/Chart/Gauge/ChartGauge').then((mod) => mod.ChartGauge),
  { ssr: false }
);
const ChartBarHorizontal = dynamic(
  () =>
    import('../../atoms/Chart/BarHorizontal/ChartBarHorizontal').then(
      (mod) => mod.ChartBarHorizontal
    ),
  { ssr: false }
);

const sumSeries = (data: number[] | undefined): number =>
  (data ?? []).reduce((total, value) => total + value, 0);

export const PsychologistDashboardPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { loading, isPsychologist } = usePsychologistGuard();
  const patientId =
    typeof router.query.patientId === 'string'
      ? router.query.patientId
      : undefined;
  const refreshKey =
    typeof router.query.refreshed === 'string'
      ? router.query.refreshed
      : undefined;
  const {
    snapshot,
    channelCenterText,
    loading: dashboardLoading,
  } = usePsychologistDashboardData(patientId, refreshKey);
  const patientName =
    typeof router.query.patientName === 'string' &&
    router.query.patientName.trim()
      ? router.query.patientName
      : undefined;

  const currentMood = useMemo(() => {
    const moodData = snapshot.moodTrendSeries[0]?.data ?? [];
    if (!moodData.length) return '—';
    return moodData[moodData.length - 1].toFixed(1);
  }, [snapshot.moodTrendSeries]);

  const weeklyInteractions = useMemo(
    () => sumSeries(snapshot.weeklyInteractionSeries[0]?.data),
    [snapshot.weeklyInteractionSeries]
  );

  useEffect(() => {
    if (!router.isReady || loading) {
      return;
    }
    if (!patientId) {
      void router.replace('/psychologist/patients');
    }
  }, [router, patientId, loading]);

  if (!isPsychologist && !loading) {
    return null;
  }

  if (!patientId && !loading) {
    return null;
  }

  const showFullPageLoader = loading || !patientId || dashboardLoading;

  const displayName = patientName ?? patientId ?? '';

  const startSession = () => {
    void router.push({
      pathname: '/psychologist/session',
      query: {
        patientId,
        patientName: displayName,
      },
    });
  };

  return (
    <AppShell
      title={t('PSYCHOLOGIST_DASHBOARD_TITLE')}
      subtitle={t('PSYCHOLOGIST_DASHBOARD_SUBTITLE')}
      variant='dashboard'
      breadcrumbs={[
        {
          label: t('PSYCHOLOGIST_PATIENTS_NAV'),
          href: '/psychologist/patients',
        },
        { label: displayName },
      ]}
    >
      {showFullPageLoader ? (
        <PageLoader variant='dashboard' />
      ) : (
        <>
          <Card padding='lg' shadow='md'>
            <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
              <Flex col gap2>
                <Title as='h2' fs3 fw3>
                  {t('PSYCHOLOGIST_DASHBOARD_PATIENT')}
                </Title>
                <Title as='p' s1 gray>
                  {displayName} · {t('PSYCHOLOGIST_DASHBOARD_PATIENT_HINT')}
                </Title>
              </Flex>
              <Button type='button' onClick={startSession}>
                {t('START_SESSION')}
              </Button>
            </Flex>
          </Card>

          <div className='mb-kpi-row'>
            <DashboardKpiCard
              label={t('DASHBOARD_KPI_CURRENT_MOOD')}
              value={
                <>
                  {currentMood}
                  {currentMood !== '—' ? (
                    <span className='ml-1 text-base font-medium text-mb-muted'>
                      {t('DASHBOARD_KPI_SCALE_OF_TEN')}
                    </span>
                  ) : null}
                </>
              }
              accentColor={MB_COLORS.accent}
            />
            <DashboardKpiCard
              label={t('DASHBOARD_KPI_ADHERENCE')}
              value={`${snapshot.moodDiaryAdherencePercent}%`}
              accentColor={MB_COLORS.primary}
            />
            <DashboardKpiCard
              label={t('DASHBOARD_KPI_WEEKLY_INTERACTIONS')}
              value={weeklyInteractions}
              accentColor={MB_COLORS.violet}
            />
          </div>

          <Flex col wFull gap4>
            <div className='mb-chart-card-row'>
              <ChartCard
                title={t('CHART_INTERACTION_CHANNELS')}
                tooltip={t('TOOLTIP_CHART_INTERACTION_CHANNELS')}
              >
                <ChartDonut
                  data={snapshot.interactionChannels}
                  centerText={channelCenterText}
                  hideWhenEmpty={false}
                  height={260}
                />
              </ChartCard>
              <ChartCard
                title={t('CHART_MOOD_DIARY_ADHERENCE')}
                tooltip={t('TOOLTIP_CHART_MOOD_DIARY_ADHERENCE')}
              >
                <ChartGauge
                  value={snapshot.moodDiaryAdherencePercent}
                  valueSuffix='%'
                  color={MB_COLORS.accent}
                  hideWhenEmpty={false}
                  height={260}
                />
              </ChartCard>
            </div>
            <ChartCard
              title={t('CHART_MOOD_TREND')}
              tooltip={t('TOOLTIP_CHART_MOOD_TREND')}
            >
              <ChartLine
                categories={snapshot.moodTrendCategories}
                series={snapshot.moodTrendSeries}
                unit='/10'
                hideWhenEmpty={false}
                height={300}
              />
            </ChartCard>
            <ChartCard
              title={t('CHART_WEEKLY_INTERACTIONS')}
              tooltip={t('TOOLTIP_CHART_WEEKLY_INTERACTIONS')}
            >
              <ChartBarVertical
                categories={snapshot.weeklyInteractionCategories}
                series={snapshot.weeklyInteractionSeries}
                hideWhenEmpty={false}
                height={280}
              />
            </ChartCard>
            <ChartCard
              title={t('CHART_CLINICAL_THEMES')}
              tooltip={t('TOOLTIP_CHART_CLINICAL_THEMES')}
            >
              <ChartBarHorizontal
                categories={snapshot.clinicalThemeCategories}
                series={snapshot.clinicalThemeSeries}
                hideWhenEmpty={false}
                height={300}
              />
            </ChartCard>
          </Flex>
        </>
      )}
    </AppShell>
  );
};
