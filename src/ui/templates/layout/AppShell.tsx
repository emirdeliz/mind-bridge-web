import type { ReactNode } from "react";
import { useRouter } from "next/router";

import { Flex, RouteLink, Title } from "@atoms";
import { useI18n } from "@i18n";
import { LanguageSwitcher } from "@molecules";

type AppShellVariant = "auth" | "dashboard";

interface AppShellProps {
  title: string;
  subtitle?: string;
  variant?: AppShellVariant;
  children: ReactNode;
}

const DASHBOARD_NAV_ITEMS = [
  { href: "/patient", key: "PATIENT_AREA" },
  { href: "/psychologist", key: "PSYCHOLOGIST_AREA" },
] as const;

export const AppShell = ({ title, subtitle, variant = "dashboard", children }: AppShellProps) => {
  const { t } = useI18n();
  const { pathname } = useRouter();

  return (
    <Flex col wFull minHScreen px4 py8 smPx6 lgPx8>
      <Flex col wFull maxWContainer mxAuto gap6>
        <Flex col wFull>
          <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
            <Title gradient fsHero fw3>
              {title}
            </Title>
            <LanguageSwitcher />
          </Flex>
          {subtitle ? (
            <Title s1 gray mt2 maxW2xl leadingRelaxed>
              {subtitle}
            </Title>
          ) : null}
          {variant === "dashboard" ? (
            <Flex row wrap gap2 mt4>
              {DASHBOARD_NAV_ITEMS.map((item) => (
                <RouteLink key={item.href} href={item.href} active={pathname === item.href}>
                  {t(item.key)}
                </RouteLink>
              ))}
            </Flex>
          ) : null}
        </Flex>
        {variant === "auth" ? (
          <Flex col alignCenter wFull mt10 pt2>
            <Flex col wFull maxWMd gap5>
              {children}
            </Flex>
          </Flex>
        ) : (
          <Flex col gap5>
            {children}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
