"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { Button, Flex, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, ChartCard } from "@molecules";
import { AppShell } from "@templates";

import {
  MOCK_CLINICAL_THEME_CATEGORIES,
  MOCK_CLINICAL_THEME_SERIES,
  MOCK_INTERACTION_CHANNELS,
  MOCK_MOOD_DIARY_ADHERENCE_PERCENT,
  MOCK_MOOD_TREND_CATEGORIES,
  MOCK_MOOD_TREND_SERIES,
  MOCK_PATIENT_DISPLAY_NAME,
  MOCK_WEEKLY_INTERACTION_CATEGORIES,
  MOCK_WEEKLY_INTERACTION_SERIES,
} from "./psychologistMockData";
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

  if (loading || !isPsychologist) {
    return null;
  }

  const startSession = () => {
    void router.push("/psychologist/session");
  };

  return (
    <AppShell
      title={t("PSYCHOLOGIST_AREA_TITLE")}
      subtitle={t("PSYCHOLOGIST_DASHBOARD_SUBTITLE")}
      variant="dashboard"
    >
      <Card padding="lg" shadow="md">
        <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
          <Flex col gap2>
            <Title fs3 fw3>
              {t("PSYCHOLOGIST_DASHBOARD_PATIENT")}
            </Title>
            <Title s1 gray>
              {MOCK_PATIENT_DISPLAY_NAME} · {t("PSYCHOLOGIST_DASHBOARD_PATIENT_HINT")}
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
              data={MOCK_INTERACTION_CHANNELS}
              centerText="6"
              hideWhenEmpty={false}
              height={260}
            />
          </ChartCard>
          <ChartCard
            title={t("CHART_MOOD_DIARY_ADHERENCE")}
            tooltip={t("TOOLTIP_CHART_MOOD_DIARY_ADHERENCE")}
          >
            <ChartGauge
              value={MOCK_MOOD_DIARY_ADHERENCE_PERCENT}
              valueSuffix="%"
              color="#5eead4"
              hideWhenEmpty={false}
              height={260}
            />
          </ChartCard>
        </div>
        <ChartCard title={t("CHART_MOOD_TREND")} tooltip={t("TOOLTIP_CHART_MOOD_TREND")}>
          <ChartLine
            categories={MOCK_MOOD_TREND_CATEGORIES}
            series={MOCK_MOOD_TREND_SERIES}
            unit="/10"
            hideWhenEmpty={false}
            height={300}
          />
        </ChartCard>
        <ChartCard title={t("CHART_WEEKLY_INTERACTIONS")}>
          <ChartBarVertical
            categories={MOCK_WEEKLY_INTERACTION_CATEGORIES}
            series={MOCK_WEEKLY_INTERACTION_SERIES}
            hideWhenEmpty={false}
            height={280}
          />
        </ChartCard>
        <ChartCard title={t("CHART_CLINICAL_THEMES")} tooltip={t("TOOLTIP_CHART_CLINICAL_THEMES")}>
          <ChartBarHorizontal
            categories={MOCK_CLINICAL_THEME_CATEGORIES}
            series={MOCK_CLINICAL_THEME_SERIES}
            hideWhenEmpty={false}
            height={300}
          />
        </ChartCard>
      </Flex>
    </AppShell>
  );
};
