import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import type { UserRole } from "@api";
import { getRoleRoute, useAuth } from "@services";
import { Button, Flex, Input, RouteLink, Select, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form, FormError } from "@molecules";
import { AppShell } from "@templates";

export const HomePage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading, loginWithPassword, loginWithProvider, enterBypass, isAuthBypassEnabled } = useAuth();
  const authBypass = isAuthBypassEnabled();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !session) return;
    void router.replace(getRoleRoute(session.role));
  }, [loading, session, router]);

  const navigateByRole = (userRole: UserRole) => {
    void router.replace(getRoleRoute(userRole));
  };

  if (loading || session) {
    return null;
  }

  return (
    <AppShell title={t("APP_TITLE")} subtitle={t("HOME_SUBTITLE")} variant="auth">
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          {t("LOGIN")}
        </Title>
        <Form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            const user = await loginWithPassword(email, password);
            if (!user) {
              setError(t("INVALID_CREDENTIALS"));
              return;
            }
            navigateByRole(user.role);
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
          <FormError error={error}>
            <Button type="submit" wFull>
              {t("LOGIN_WITH_PASSWORD")}
            </Button>
          </FormError>
        </Form>
        <Flex col wFull mt6 gap4>
          <Button
            variant="secondary"
            outlined
            wFull
            onClick={async () => navigateByRole((await loginWithProvider("google", role)).role)}
          >
            {t("CONTINUE_WITH_GOOGLE")}
          </Button>
          <Button
            variant="secondary"
            outlined
            wFull
            onClick={async () => navigateByRole((await loginWithProvider("facebook", role)).role)}
          >
            {t("CONTINUE_WITH_FACEBOOK")}
          </Button>
        </Flex>
        <Flex row justifyCenter alignCenter wrap gap2 mt4 wFull>
          <Title s1 gray center>
            {t("AUTH_OR")}
          </Title>
          <RouteLink href="/register" inline>
            {t("AUTH_REGISTER_LINK")}
          </RouteLink>
        </Flex>
        {authBypass ? (
          <Flex col wFull mt6 gap4>
            <Title s1 gray center>
              {t("AUTH_BYPASS_HINT")}
            </Title>
            <Button
              variant="secondary"
              outlined
              wFull
              onClick={async () => {
                await enterBypass("patient");
                void router.push("/patient");
              }}
            >
              {t("AUTH_BYPASS_PATIENT")}
            </Button>
            <Button
              variant="secondary"
              outlined
              wFull
              onClick={async () => {
                await enterBypass("psychologist");
                void router.push("/psychologist/patients");
              }}
            >
              {t("AUTH_BYPASS_PSYCHOLOGIST")}
            </Button>
          </Flex>
        ) : null}
      </Card>
    </AppShell>
  );
};
