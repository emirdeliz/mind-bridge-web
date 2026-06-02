import { useState } from "react";
import { useRouter } from "next/router";

import type { UserRole } from "@api/dto/auth/AuthDto";
import { useAuth } from "@services/auth/hooks/useAuth";
import { Button, Input, Select } from "@atoms";
import { Card, Form } from "@molecules";
import { AppShell } from "@templates/layout/AppShell";

export const RegisterPage = () => {
  const router = useRouter();
  const { registerUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");

  return (
    <AppShell title="Register" subtitle="Create an account if you do not use Google or Facebook login.">
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
              { label: "Patient", value: "patient" },
              { label: "Psychologist", value: "psychologist" },
            ]}
          />
          <Input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            placeholder="Password"
            password
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" wFull>
            Create account
          </Button>
        </Form>
      </Card>
    </AppShell>
  );
};
