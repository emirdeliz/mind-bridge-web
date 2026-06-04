"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { Button, Flex, RouteLink, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, ChartCard } from "@molecules";
import { AppShell } from "@templates";

import { usePsychologistDashboardData } from "./usePsychologistDashboardData";
import { usePsychologistGuard } from "./usePsychologistGuard";

const ChartLine = dynamic(
  () => import("../../atoms/Chart/Line/ChartLine").then((mod) => mod.ChartLine),
  { ssr: false },
);
const ChartBarVertical = dynamic(
  () => import("../../atoms/Chart/BarVertical/ChartBarVertical").then((mod) => mod.ChartBarVertical),
  { ssr: false },
);
const ChartDonut = dynamic(
  () => import("../../atoms/Chart/Donut/ChartDonut").then((mod) => mod.ChartDonut),
  { ssr: false },
);
const ChartGauge = dynamic(
  () => import("../../atoms/Chart/Gauge/ChartGauge").then((mod) => mod.ChartGauge),
  { ssr: false },
);
const ChartBarHorizontal = dynamic(
  () =>
    import("../../atoms/Chart/BarHorizontal/ChartBarHorizontal").then((mod) => mod.ChartBarHorizontal),
  { ssr: false },
);

export const PsychologistDashboardPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { loading, isPsychologist } = usePsychologistGuard();
  const patientId =
    typeof router.query.patientId === "string" ? router.query.patientId : undefined;
  const { snapshot, channelCenterText, loading: dashboardLoading } =
    usePsychologistDashboardData(patientId);
  const patientName =
    typeof router.query.patientName === "string" && router.query.patientName.trim()
      ? router.query.patientName
      : undefined;

  useEffect(() => {
    if (!router.isReady || loading) {
      return;
    }
    if (!patientId) {
      void router.replace("/psychologist/patients");
    }
  }, [router, patientId, loading]);

  if (loading || dashboardLoading || !isPsychologist || !patientId) {
    return null;
  }

  const displayName = patientName ?? patientId;

  const startSession = () => {
    void router.push({
      pathname: "/psychologist/session",
      query: {
        patientId,
        patientName: displayName,
      },
    });
  };

  return (
    <AppShell
      title={t("PSYCHOLOGIST_AREA_TITLE")}
      subtitle={t("PSYCHOLOGIST_DASHBOARD_SUBTITLE")}
      variant="dashboard"
    >
      <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
        <RouteLink href="/psychologist/patients" inline>
          {t("PSYCHOLOGIST_PATIENTS_NAV")}
        </RouteLink>
      </Flex>

      <Card padding="lg" shadow="md">
        <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
          <Flex col gap2>
            <Title fs3 fw3>
              {t("PSYCHOLOGIST_DASHBOARD_PATIENT")}
            </Title>
            <Title s1 gray>
              {displayName} · {t("PSYCHOLOGIST_DASHBOARD_PATIENT_HINT")}
            </Title>
          </Flex>
          <Button type="button" onClick={startSession}>
            {t("START_SESSION")}
          </Button>
        </Flex>
      </Card>
      <Flex col wFull gap4>
        <div className="mb-chart-card-row">
          <ChartCard title={t("CHART_INTERACTION_CHANNELS")}>
            <ChartDonut
              data={snapshot.interactionChannels}
              centerText={channelCenterText}
              hideWhenEmpty={false}
              height={260}
            />
          </ChartCard>
          <ChartCard
            title={t("CHART_MOOD_DIARY_ADHERENCE")}
            tooltip={t("TOOLTIP_CHART_MOOD_DIARY_ADHERENCE")}
          >
            <ChartGauge
              value={snapshot.moodDiaryAdherencePercent}
              valueSuffix="%"
              color="#5eead4"
              hideWhenEmpty={false}
              height={260}
            />
          </ChartCard>
        </div>
        <ChartCard title={t("CHART_MOOD_TREND")} tooltip={t("TOOLTIP_CHART_MOOD_TREND")}>
          <ChartLine
            categories={snapshot.moodTrendCategories}
            series={snapshot.moodTrendSeries}
            unit="/10"
            hideWhenEmpty={false}
            height={300}
          />
        </ChartCard>
        <ChartCard title={t("CHART_WEEKLY_INTERACTIONS")}>
          <ChartBarVertical
            categories={snapshot.weeklyInteractionCategories}
            series={snapshot.weeklyInteractionSeries}
            hideWhenEmpty={false}
            height={280}
          />
        </ChartCard>
        <ChartCard title={t("CHART_CLINICAL_THEMES")} tooltip={t("TOOLTIP_CHART_CLINICAL_THEMES")}>
          <ChartBarHorizontal
            categories={snapshot.clinicalThemeCategories}
            series={snapshot.clinicalThemeSeries}
            hideWhenEmpty={false}
            height={300}
          />
        </ChartCard>
      </Flex>
    </AppShell>
  );
};
