import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import type { ClinicalChatMessageDto, UserProfile } from "@api";
import { logPatientInteractionApi } from "@api";
import {
  type ChatMessage,
  getProfileRoute,
  getRoleRoute,
  useAiAgent,
  useAuth,
  usePatientClinicalContent,
} from "@services";
import { Button, Flex, RouteLink, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Alert, Card, Tooltip } from "@molecules";
import { AppShell, ChatPanel, DashboardSectionTitle } from "@templates";

const PROFILE_FIELD_I18N_KEYS: Record<Exclude<keyof UserProfile, "language">, string> = {
  fullName: "PROFILE_FIELD_FULL_NAME",
  age: "PROFILE_FIELD_AGE",
  address: "PROFILE_FIELD_ADDRESS",
  phone: "PROFILE_FIELD_PHONE",
};

const toChatMessages = (seed: ClinicalChatMessageDto[]): ChatMessage[] =>
  seed.map((item) => ({
    id: item.id,
    sender: item.sender,
    text: item.text,
    createdAt: item.createdAt,
  }));

export const PatientPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading } = useAuth();
  const { content, loading: contentLoading } = usePatientClinicalContent();
  const [usedAudioInput, setUsedAudioInput] = useState(false);
  const { messages, sendMessage, setMessages, sending } = useAiAgent({
    mode: "patient",
  });

  useEffect(() => {
    if (content?.patientChatSeed) {
      setMessages(toChatMessages(content.patientChatSeed));
    }
  }, [content, setMessages]);

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
      .filter(([key, value]) => key !== "language" && !value)
      .map(([key]) => t(PROFILE_FIELD_I18N_KEYS[key as Exclude<keyof UserProfile, "language">]));
  }, [session, t]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      await sendMessage(text);
      if (usedAudioInput) {
        try {
          await logPatientInteractionApi("audio", "web");
        } catch {
          // Chat already logged as text on backend; audio is best-effort.
        }
        setUsedAudioInput(false);
      }
    },
    [sendMessage, usedAudioInput],
  );

  if (loading || contentLoading || !session || session.role !== "patient") {
    return null;
  }

  const patientSummary =
    content?.patientSummary ?? t("AI_SUMMARY_NO_INTERACTIONS");

  return (
    <AppShell title={t("PATIENT_AREA_TITLE")} subtitle={t("PATIENT_AREA_SUBTITLE")} variant="dashboard">
      {missingProfileFields.length ? (
        <Alert>
          {t("PROFILE_INCOMPLETE_ALERT")} {missingProfileFields.join(", ")}.{" "}
          <RouteLink href={getProfileRoute(session.role)} inline>
            {t("COMPLETE_PROFILE")}
          </RouteLink>
        </Alert>
      ) : null}

      <ChatPanel
        messages={messages}
        onSend={(text) => void handleSendMessage(text)}
        onSpeechToText={() => setUsedAudioInput(true)}
        sending={sending}
        sectionTooltip={t("TOOLTIP_PATIENT_CHAT")}
      />
      <Card padding="lg" shadow="md">
        <DashboardSectionTitle title={t("INTERACTION_SUMMARY")} tooltip={t("TOOLTIP_PATIENT_SUMMARY")} />
        <Title s1 gray>
          {patientSummary}
        </Title>
      </Card>
      <Flex row wrap wFull gap4>
        <Tooltip title={t("TOOLTIP_PATIENT_NOTIFICATIONS")} top width={300}>
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
                try {
                  await logPatientInteractionApi("notification", "web");
                } catch {
                  // Notification shown; logging is best-effort.
                }
              }
            }}
          >
            {t("ENABLE_NOTIFICATIONS")}
          </Button>
        </Tooltip>
      </Flex>
    </AppShell>
  );
};
