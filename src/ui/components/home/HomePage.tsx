import { useState } from "react";
import { useRouter } from "next/router";

import type { UserRole } from "@api/dto/auth/AuthDto";
import { useAuth } from "@services/auth/hooks/useAuth";
import { Button, Flex, Input, Select, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form, FormError } from "@molecules";
import { AppShell } from "@templates/layout/AppShell";

export const HomePage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { loginWithPassword, loginWithProvider } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [error, setError] = useState("");

  const navigateByRole = (userRole: UserRole) => {
    void router.push(userRole === "psychologist" ? "/psychologist" : "/patient");
  };

  return (
    <AppShell title={t("APP_TITLE")} subtitle={t("HOME_SUBTITLE")}>
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
        <Flex row gap={8} mt="4">
          <Button
            variant="secondary"
            outlined
            onClick={async () => navigateByRole((await loginWithProvider("google", role)).role)}
          >
            {t("CONTINUE_WITH_GOOGLE")}
          </Button>
          <Button
            variant="secondary"
            outlined
            onClick={async () => navigateByRole((await loginWithProvider("facebook", role)).role)}
          >
            {t("CONTINUE_WITH_FACEBOOK")}
          </Button>
        </Flex>
      </Card>
    </AppShell>
  );
};
