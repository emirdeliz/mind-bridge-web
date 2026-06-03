import type { ReactNode } from "react";

import { Flex, RouteLink, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card } from "@molecules";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const AppShell = ({ title, subtitle, children }: AppShellProps) => {
  const { t } = useI18n();

  return (
    <Flex col p="6" wFull>
      <Flex col wFull maxWidth="896px" gap={24}>
        <Card padding="lg" shadow="md">
          <Title fs4 fw3 mb2>
            {title}
          </Title>
          {subtitle ? (
            <Title s1 gray>
              {subtitle}
            </Title>
          ) : null}
          <Flex row wrap gap={4} mt="4">
            <RouteLink href="/">{t("LOGIN")}</RouteLink>
            <RouteLink href="/register">{t("REGISTER")}</RouteLink>
            <RouteLink href="/patient">{t("PATIENT_AREA")}</RouteLink>
            <RouteLink href="/psychologist">{t("PSYCHOLOGIST_AREA")}</RouteLink>
          </Flex>
        </Card>
        {children}
      </Flex>
    </Flex>
  );
};
