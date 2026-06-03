import type { ReactNode } from "react";
import { useRouter } from "next/router";

import { Flex, RouteLink, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card } from "@molecules";

type AppShellVariant = "auth" | "dashboard";

interface AppShellProps {
  title: string;
  subtitle?: string;
  variant?: AppShellVariant;
  children: ReactNode;
}

const AUTH_NAV_ITEMS = [
  { href: "/", key: "LOGIN" },
  { href: "/register", key: "REGISTER" },
] as const;

const DASHBOARD_NAV_ITEMS = [
  { href: "/patient", key: "PATIENT_AREA" },
  { href: "/psychologist", key: "PSYCHOLOGIST_AREA" },
] as const;

const LANGUAGE_LABELS: Record<"en" | "pt" | "es", string> = {
  en: "EN",
  pt: "PT-BR",
  es: "ES",
};

export const AppShell = ({ title, subtitle, variant = "dashboard", children }: AppShellProps) => {
  const { t, language, setLanguage } = useI18n();
  const { pathname } = useRouter();
  const navItems = variant === "auth" ? AUTH_NAV_ITEMS : DASHBOARD_NAV_ITEMS;

  return (
    <Flex col className="min-h-screen px-4 py-8 sm:px-6 lg:px-8" wFull>
      <Flex col wFull maxWidth="960px" gap={24} className="mx-auto">
        <Card padding="lg" shadow="lg" className="overflow-hidden">
          <Flex row alignCenter justifySpaceBetween wrap gap={16} mb="4">
            <Flex row alignCenter gap={12}>
              <Flex.Center className="h-11 w-11 rounded-xl bg-gradient-to-br from-mb-primary to-mb-accent text-sm font-bold text-mb-bg shadow-glow">
                MB
              </Flex.Center>
              <Flex col>
                <span className="mb-gradient-title text-2xl font-bold tracking-tight sm:text-3xl">{title}</span>
                {subtitle ? (
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-mb-muted">{subtitle}</p>
                ) : null}
              </Flex>
            </Flex>
            <Flex row alignCenter gap={8}>
              {(["en", "pt", "es"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                    language === lang
                      ? "bg-mb-accent/20 text-mb-accent ring-1 ring-mb-accent/30"
                      : "text-mb-muted hover:bg-mb-surface-elevated hover:text-mb-text"
                  }`}
                  onClick={() => setLanguage(lang)}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </Flex>
          </Flex>
          <nav className="flex flex-wrap gap-2 border-t border-mb-border/60 pt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <RouteLink key={item.href} href={item.href} className={isActive ? "mb-nav-link-active" : "mb-nav-link"}>
                  {t(item.key)}
                </RouteLink>
              );
            })}
          </nav>
        </Card>
        <Flex col gap={20}>
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
};
