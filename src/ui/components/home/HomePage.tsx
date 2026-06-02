import { useState } from "react";
import { useRouter } from "next/router";

import type { UserRole } from "@api/dto/auth/AuthDto";
import { useAuth } from "@services/auth/hooks/useAuth";
import { Button, Flex, Input, Select, Title } from "@atoms";
import { Card, Form, FormError } from "@molecules";
import { AppShell } from "@templates/layout/AppShell";

export const HomePage = () => {
  const router = useRouter();
  const { loginWithPassword, loginWithProvider } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");
  const [error, setError] = useState("");

  const navigateByRole = (userRole: UserRole) => {
    void router.push(userRole === "psychologist" ? "/psychologist" : "/patient");
  };

  return (
    <AppShell
      title="Mind Bridge Web"
      subtitle="Login with password, Google, or Facebook using the same user model as the mobile app."
    >
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          Login
        </Title>
        <Form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            const user = await loginWithPassword(email, password);
            if (!user) {
              setError("Invalid credentials or user not registered.");
              return;
            }
            navigateByRole(user.role);
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
          <FormError error={error}>
            <Button type="submit" wFull>
              Login with password
            </Button>
          </FormError>
        </Form>
        <Flex row gap={8} mt="4">
          <Button
            variant="secondary"
            outlined
            onClick={async () => navigateByRole((await loginWithProvider("google", role)).role)}
          >
            Continue with Google
          </Button>
          <Button
            variant="secondary"
            outlined
            onClick={async () => navigateByRole((await loginWithProvider("facebook", role)).role)}
          >
            Continue with Facebook
          </Button>
        </Flex>
      </Card>
    </AppShell>
  );
};
