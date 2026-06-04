import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import type { UserRole } from "@api";
import { isValidPhone, phoneDigits } from "@helpers";
import { getRoleRoute, useAuth } from "@services";
import { Button, Flex, Input, RouteLink, Select, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form, FormError } from "@molecules";
import { AppShell } from "@templates";

export const RegisterPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading, registerPublicAccount } = useAuth();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [error, setError] = useState("");

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
            setError("");

            if (!email.trim()) {
              setError(t("REGISTER_ERROR_EMAIL_REQUIRED"));
              return;
            }

            if (!isValidPhone(phone)) {
              setError(t("REGISTER_ERROR_PHONE_REQUIRED"));
              return;
            }

            if (!password.trim()) {
              setError(t("REGISTER_ERROR_PASSWORD_REQUIRED"));
              return;
            }

            try {
              await registerPublicAccount({
                email: email.trim(),
                phone: phoneDigits(phone),
                password,
                role,
                provider: "password",
              });
              void router.replace("/?registered=1");
            } catch (registerError) {
              setError(
                registerError instanceof Error
                  ? registerError.message
                  : t("REGISTER_ERROR_GENERIC")
              );
            }
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
          <Input
            placeholder={t("EMAIL")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            phone
            placeholder={t("REGISTER_PHONE_PLACEHOLDER")}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Title s2 gray block>
            {t("REGISTER_PHONE_HELP")}
          </Title>
          <Input
            placeholder={t("PASSWORD")}
            password
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <FormError error={error}>
            <Button type="submit" wFull>
              {t("CREATE_ACCOUNT")}
            </Button>
          </FormError>
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
