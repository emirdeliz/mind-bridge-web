import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import type { UserProfile } from "@api";
import {
  type ChatMessage,
  getProfileRoute,
  getRoleRoute,
  isAuthBypassEnabled,
  useAiAgent,
  useAuth,
} from "@services";
import { Button, Flex, RouteLink, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Alert, Card, Tooltip } from "@molecules";
import { AppShell, ChatPanel, DashboardSectionTitle } from "@templates";

const MOCK_PATIENT_CHAT: ChatMessage[] = [
  {
    id: "mock-patient-1",
    sender: "user",
    text: "Hoje acordei muito ansioso pensando na reunião da tarde.",
    createdAt: "2026-06-02T09:15:00.000Z",
  },
  {
    id: "mock-patient-2",
    sender: "agent",
    text: "Obrigado por compartilhar. Antes da reunião, você percebeu algum sinal no corpo — taquicardia, tensão nos ombros ou pensamentos acelerados?",
    createdAt: "2026-06-02T09:16:00.000Z",
  },
  {
    id: "mock-patient-3",
    sender: "user",
    text: "Senti o peito apertado e não consegui dormir direito ontem.",
    createdAt: "2026-06-02T09:17:00.000Z",
  },
  {
    id: "mock-patient-4",
    sender: "agent",
    text: "Vamos registrar isso no seu plano de cuidado. Que tal uma pausa de 2 minutos de respiração antes da reunião e anotar como você se sente depois?",
    createdAt: "2026-06-02T09:18:00.000Z",
  },
];

const MOCK_PATIENT_SUMMARY =
  "Últimas 48h: 4 mensagens trocadas. Temas principais: ansiedade antecipatória no trabalho, sintomas corporais (aperto no peito) e sono prejudicado. Agente sugeriu respiração guiada e registro pós-reunião. Risco emocional: moderado. Encaminhar reflexão para a próxima sessão com o psicólogo.";

const PROFILE_FIELD_I18N_KEYS: Record<keyof UserProfile, string> = {
  fullName: "PROFILE_FIELD_FULL_NAME",
  age: "PROFILE_FIELD_AGE",
  address: "PROFILE_FIELD_ADDRESS",
  phone: "PROFILE_FIELD_PHONE",
};

export const PatientPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading } = useAuth();
  const [context] = useState(() => t("DEFAULT_PATIENT_AI_CONTEXT"));
  const { messages, sendMessage } = useAiAgent(context);
  const chatMessages = [...MOCK_PATIENT_CHAT, ...messages];

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void router.replace("/");
      return;
    }
    if (session.role !== "patient" && !isAuthBypassEnabled()) {
      void router.replace(getRoleRoute(session.role));
    }
  }, [loading, session, router]);

  const missingProfileFields = useMemo(() => {
    if (!session) return [];
    return Object.entries(session.profile)
      .filter(([, value]) => !value)
      .map(([key]) => t(PROFILE_FIELD_I18N_KEYS[key as keyof UserProfile]));
  }, [session, t]);

  if (loading || !session || (session.role !== "patient" && !isAuthBypassEnabled())) {
    return null;
  }

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
        messages={chatMessages}
        onSend={sendMessage}
        sectionTooltip={t("TOOLTIP_PATIENT_CHAT")}
      />
      <Card padding="lg" shadow="md">
        <DashboardSectionTitle title={t("INTERACTION_SUMMARY")} tooltip={t("TOOLTIP_PATIENT_SUMMARY")} />
        <Title s1 gray>
          {MOCK_PATIENT_SUMMARY}
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
