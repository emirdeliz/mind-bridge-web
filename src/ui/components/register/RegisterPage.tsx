import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import type { UserRole } from "@api";
import { getRoleRoute, useAuth } from "@services";
import { Button, Flex, Input, RouteLink, Select, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form } from "@molecules";
import { AppShell } from "@templates";

export const RegisterPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading, registerUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");

  useEffect(() => {
    if (loading || !session) return;
    void router.replace(getRoleRoute(session.role));
  }, [loading, session, router]);

  if (loading || session) {
    return null;
  }

  return (
    <AppShell title={t("APP_TITLE")} subtitle={t("REGISTER_SUBTITLE")} variant="auth">
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          {t("REGISTER")}
        </Title>
        <Form
          onSubmit={async (event) => {
            event.preventDefault();
            const user = await registerUser({ email, password, role, provider: "password" });
            void router.replace(getRoleRoute(user.role));
          }}
        >
          <Select
            value={role}
            onChange={(value) => setRole(value as UserRole)}
            options={[
              { label: t("ROLE_PATIENT"), value: "patient" },
              { label: t("ROLE_PSYCHOLOGIST"), value: "psychologist" },
            ]}
          />
          <Input placeholder={t("EMAIL")} value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            placeholder={t("PASSWORD")}
            password
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" wFull>
            {t("CREATE_ACCOUNT")}
          </Button>
        </Form>
        <Flex row justifyCenter alignCenter wrap gap2 mt6 wFull>
          <Title s1 gray center>
            {t("AUTH_OR")}
          </Title>
          <RouteLink href="/" inline>
            {t("AUTH_LOGIN_LINK")}
          </RouteLink>
        </Flex>
      </Card>
    </AppShell>
  );
};
