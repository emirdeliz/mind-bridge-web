"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import type { AppLanguage } from "@api";
import { Button, Flex, Title } from "@atoms";
import {
  formatCentsAsCurrencyForAppLanguage,
  formatCurrencyForAppLanguage,
  localeForAppLanguage,
} from "@helpers";
import { translateTemplate, useI18n } from "@i18n";
import { Card, ChartCard } from "@molecules";
import { AppShell, DashboardSectionTitle } from "@templates";
import { usePsychologistBilling } from "@services";

import { usePsychologistGuard } from "./usePsychologistGuard";

const ChartLine = dynamic(
  () => import("../../atoms/Chart/Line/ChartLine").then((mod) => mod.ChartLine),
  { ssr: false },
);
const ChartBarVertical = dynamic(
  () => import("../../atoms/Chart/BarVertical/ChartBarVertical").then((mod) => mod.ChartBarVertical),
  { ssr: false },
);

const formatBillingMonth = (billingMonth: string, language: AppLanguage): string => {
  const date = new Date(`${billingMonth}T12:00:00.000Z`);
  return new Intl.DateTimeFormat(localeForAppLanguage(language), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export const PsychologistBillingPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();
  const { billing, loading: billingLoading, error } = usePsychologistBilling();
  const history = billing?.history ?? [];
  const monthCategories = useMemo(
    () => history.map((entry) => formatBillingMonth(entry.billingMonth, language)),
    [history, language],
  );
  const netCostSeries = useMemo(
    () => [
      {
        name: t("PSYCHOLOGIST_BILLING_CHART_COST"),
        data: history.map((entry) => Number((entry.netAmountCents / 100).toFixed(2))),
        color: "#818cf8",
        smooth: true,
        areaStyle: true,
      },
    ],
    [history, t],
  );
  const patientCountSeries = useMemo(
    () => [
      {
        name: t("PSYCHOLOGIST_BILLING_CHART_PATIENTS"),
        data: history.map((entry) => entry.enabledPatientCount),
        color: "#5eead4",
      },
    ],
    [history, t],
  );
  const currency = billing?.currency ?? "BRL";
  const formatCostTooltipValue = useMemo(
    () => (value: number) => formatCurrencyForAppLanguage(value, language, currency),
    [language, currency],
  );

  if (guardLoading || billingLoading || !isPsychologist) {
    return null;
  }

  const unitPrice = billing
    ? formatCentsAsCurrencyForAppLanguage(billing.unitPriceCents, language, currency)
    : "—";
  const grossAmount = billing
    ? formatCentsAsCurrencyForAppLanguage(billing.grossAmountCents, language, currency)
    : "—";
  const discountAmount = billing
    ? formatCentsAsCurrencyForAppLanguage(billing.discountAmountCents, language, currency)
    : "—";
  const netAmount = billing
    ? formatCentsAsCurrencyForAppLanguage(billing.netAmountCents, language, currency)
    : "—";

  return (
    <AppShell
      title={t("PSYCHOLOGIST_BILLING_TITLE")}
      subtitle={t("PSYCHOLOGIST_BILLING_SUBTITLE")}
      variant="dashboard"
    >
      <Flex row wFull alignCenter wrap gap4>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void router.push("/psychologist/patients")}
        >
          {t("BACK_TO_PSYCHOLOGIST_PATIENTS")}
        </Button>
      </Flex>

      {error ? (
        <Title s1 gray>
          {error}
        </Title>
      ) : null}

      <Flex col wFull gap4>
        <div className="mb-chart-card-row">
          <Card padding="lg" shadow="md">
            <DashboardSectionTitle
              title={t("PSYCHOLOGIST_BILLING_CURRENT_MONTH")}
              tooltip={t("TOOLTIP_PSYCHOLOGIST_BILLING_CURRENT")}
            />
            <Flex col wFull gap2>
              <Title s1 gray>
                {translateTemplate(t("PSYCHOLOGIST_BILLING_ENABLED_PATIENTS"), {
                  count: String(billing?.enabledPatientCount ?? 0),
                })}
              </Title>
              <Title s1 gray>
                {translateTemplate(t("PSYCHOLOGIST_BILLING_UNIT_PRICE"), {
                  price: unitPrice,
                })}
              </Title>
              <Title s1 gray>
                {translateTemplate(t("PSYCHOLOGIST_BILLING_GROSS_AMOUNT"), {
                  amount: grossAmount,
                })}
              </Title>
              {billing?.discount ? (
                <Title s2 textAccent>
                  {translateTemplate(t("PSYCHOLOGIST_BILLING_DISCOUNT_APPLIED"), {
                    percent: String(billing.discount.discountPercent),
                    label: billing.discount.label ?? t("PSYCHOLOGIST_BILLING_DISCOUNT_DEFAULT_LABEL"),
                    amount: discountAmount,
                  })}
                </Title>
              ) : (
                <Title s1 gray>
                  {t("PSYCHOLOGIST_BILLING_NO_DISCOUNT")}
                </Title>
              )}
              <Title fs3 fw3>
                {translateTemplate(t("PSYCHOLOGIST_BILLING_NET_AMOUNT"), {
                  amount: netAmount,
                })}
              </Title>
            </Flex>
          </Card>
          <Card padding="lg" shadow="md">
            <DashboardSectionTitle
              title={t("PSYCHOLOGIST_BILLING_FORMULA_TITLE")}
              tooltip={t("TOOLTIP_PSYCHOLOGIST_BILLING_FORMULA")}
            />
            <Title s1 gray>
              {t("PSYCHOLOGIST_BILLING_FORMULA_BODY")}
            </Title>
          </Card>
        </div>

        <ChartCard
          title={t("PSYCHOLOGIST_BILLING_COST_EVOLUTION")}
          tooltip={t("TOOLTIP_PSYCHOLOGIST_BILLING_COST_CHART")}
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
          title={t("PSYCHOLOGIST_BILLING_PATIENTS_EVOLUTION")}
          tooltip={t("TOOLTIP_PSYCHOLOGIST_BILLING_PATIENTS_CHART")}
        >
          <ChartBarVertical
            categories={monthCategories}
            series={patientCountSeries}
            hideWhenEmpty={false}
            height={300}
          />
        </ChartCard>
      </Flex>
    </AppShell>
  );
};
