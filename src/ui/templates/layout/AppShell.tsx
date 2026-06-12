import type { ReactNode } from "react";
import { useRouter } from "next/router";

import { Flex, Title } from "@atoms";
import { LanguageSwitcher } from "@molecules";
import { PsychologistSidebar } from "@organisms";
import { UserAccountMenu } from "../user/UserAccountMenu";

type AppShellVariant = "auth" | "dashboard";

interface AppShellProps {
  title: string;
  subtitle?: string;
  variant?: AppShellVariant;
  children: ReactNode;
}

export const AppShell = ({ title, subtitle, variant = "dashboard", children }: AppShellProps) => {
  const { pathname } = useRouter();
  const showLanguageSwitcher = pathname === "/";
  const showPsychologistSidebar =
    variant === "dashboard" && pathname.startsWith("/psychologist");

  const mainContent = (
    <Flex col wFull maxWContainer mxAuto gap6 flex1>
      <Flex col wFull>
        <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
          <Title gradient fsHero fw3>
            {title}
          </Title>
          <Flex row alignCenter gap4>
            {showLanguageSwitcher ? <LanguageSwitcher /> : null}
            {variant === "dashboard" ? <UserAccountMenu /> : null}
          </Flex>
        </Flex>
        {subtitle ? (
          <Title s1 gray mt2 maxW2xl leadingRelaxed>
            {subtitle}
          </Title>
        ) : null}
      </Flex>
      {variant === "auth" ? (
        <Flex col alignCenter wFull mt10 pt2>
          <Flex col wFull maxWMd gap5>
            {children}
          </Flex>
        </Flex>
      ) : (
        <Flex col wFull alignStretch gap5>
          {children}
        </Flex>
      )}
    </Flex>
  );

  if (showPsychologistSidebar) {
    return (
      <div className="mb-dashboard-layout">
        <PsychologistSidebar />
        <Flex col wFull flex1 minHScreen px4 py8 smPx6 lgPx8>
          {mainContent}
        </Flex>
      </div>
    );
  }

  return (
    <Flex col wFull minHScreen px4 py8 smPx6 lgPx8>
      {mainContent}
    </Flex>
  );
};
