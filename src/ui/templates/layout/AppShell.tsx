import type { ReactNode } from "react";

import { Flex, RouteLink, Title } from "@atoms";
import { Card } from "@molecules";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const AppShell = ({ title, subtitle, children }: AppShellProps) => (
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
          <RouteLink href="/">Login</RouteLink>
          <RouteLink href="/register">Register</RouteLink>
          <RouteLink href="/patient">Patient area</RouteLink>
          <RouteLink href="/psychologist">Psychologist area</RouteLink>
        </Flex>
      </Card>
      {children}
    </Flex>
  </Flex>
);
