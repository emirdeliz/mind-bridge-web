import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import type { UserProfile } from "@api";
import { getRoleRoute, useAiAgent, useAuth } from "@services";
import { Button, Flex, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Alert, Card } from "@molecules";
import { AppShell, ChatPanel, ProfileForm } from "@templates";

const PROFILE_FIELD_I18N_KEYS: Record<keyof UserProfile, string> = {
  fullName: "PROFILE_FIELD_FULL_NAME",
  age: "PROFILE_FIELD_AGE",
  address: "PROFILE_FIELD_ADDRESS",
  phone: "PROFILE_FIELD_PHONE",
};

export const PatientPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading, saveProfile, logout } = useAuth();
  const [context] = useState(() => t("DEFAULT_PATIENT_AI_CONTEXT"));
  const { messages, sendMessage, summary } = useAiAgent(context);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void router.replace("/");
      return;
    }
    if (session.role !== "patient") {
      void router.replace(getRoleRoute(session.role));
    }
  }, [loading, session, router]);

  const missingProfileFields = useMemo(() => {
    if (!session) return [];
    return Object.entries(session.profile)
      .filter(([, value]) => !value)
      .map(([key]) => t(PROFILE_FIELD_I18N_KEYS[key as keyof UserProfile]));
  }, [session, t]);

  if (loading || !session || session.role !== "patient") {
    return null;
  }

  return (
    <AppShell title={t("PATIENT_AREA_TITLE")} subtitle={t("PATIENT_AREA_SUBTITLE")} variant="dashboard">
      {missingProfileFields.length ? (
        <Alert>
          {t("PROFILE_INCOMPLETE_ALERT")} {missingProfileFields.join(", ")}.
        </Alert>
      ) : null}
      <ProfileForm initialData={session.profile} onSave={(profile) => void saveProfile(profile)} />
      <ChatPanel messages={messages} onSend={sendMessage} />
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          {t("INTERACTION_SUMMARY")}
        </Title>
        <Title s1 gray>
          {summary}
        </Title>
      </Card>
      <Flex row wrap gap={8}>
        <Button
          variant="secondary"
          outlined
          onClick={async () => {
            if (!("Notification" in window)) return;
            if (Notification.permission !== "granted") await Notification.requestPermission();
            if (Notification.permission === "granted") {
              new Notification(t("NOTIFICATION_TITLE"), {
                body: t("NOTIFICATION_BODY"),
              });
            }
          }}
        >
          {t("ENABLE_NOTIFICATIONS")}
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            await logout();
            void router.push("/");
          }}
        >
          {t("LOGOUT")}
        </Button>
      </Flex>
    </AppShell>
  );
};
