import { useState } from "react";
import { useRouter } from "next/router";

import type { UserRole } from "@api/dto/auth/AuthDto";
import { useAuth } from "@services/auth/hooks/useAuth";
import { Button, Input, Select } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form } from "@molecules";
import { AppShell } from "@templates/layout/AppShell";

export const RegisterPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { registerUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");

  return (
    <AppShell title={t("REGISTER")} subtitle={t("REGISTER_SUBTITLE")}>
      <Card padding="lg" shadow="md">
        <Form
          onSubmit={async (event) => {
            event.preventDefault();
            const user = await registerUser({ email, password, role, provider: "password" });
            void router.push(user.role === "psychologist" ? "/psychologist" : "/patient");
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
      </Card>
    </AppShell>
  );
};
