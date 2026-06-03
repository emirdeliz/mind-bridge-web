import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import type { UserProfile } from "@api/dto/auth/AuthDto";
import { useAiAgent } from "@services/ai/hooks/useAiAgent";
import { useAuth } from "@services/auth/hooks/useAuth";
import { Button, Flex, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Alert, Card } from "@molecules";
import { ChatPanel } from "@templates/chat/ChatPanel";
import { AppShell } from "@templates/layout/AppShell";
import { ProfileForm } from "@templates/profile/ProfileForm";

const PROFILE_FIELD_I18N_KEYS: Record<keyof UserProfile, string> = {
  fullName: "PROFILE_FIELD_FULL_NAME",
  age: "PROFILE_FIELD_AGE",
  address: "PROFILE_FIELD_ADDRESS",
  phone: "PROFILE_FIELD_PHONE",
};

export const PatientPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, saveProfile, logout } = useAuth();
  const [context] = useState(() => t("DEFAULT_PATIENT_AI_CONTEXT"));
  const { messages, sendMessage, summary } = useAiAgent(context);

  const missingProfileFields = useMemo(() => {
    if (!session) return [];
    return Object.entries(session.profile)
      .filter(([, value]) => !value)
      .map(([key]) => t(PROFILE_FIELD_I18N_KEYS[key as keyof UserProfile]));
  }, [session, t]);

  if (!session) {
    return (
      <AppShell title={t("PATIENT_AREA_TITLE")} subtitle={t("PATIENT_AUTH_REQUIRED_SUBTITLE")}>
        <Button onClick={() => void router.push("/")}>{t("GO_TO_LOGIN")}</Button>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("PATIENT_AREA_TITLE")} subtitle={t("PATIENT_AREA_SUBTITLE")}>
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
      <Flex row gap={8}>
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
