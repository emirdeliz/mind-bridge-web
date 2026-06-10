import { useEffect } from "react";
import { useRouter } from "next/router";

import type { ClinicalChatMessageDto } from "@api";
import {
  type ChatMessage,
  getRoleRoute,
  useAiAgent,
  useAuth,
  usePatientClinicalContent,
} from "@services";
import { Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, InteractionSummaryBody } from "@molecules";
import { AppShell, ChatPanel, DashboardSectionTitle } from "@templates";

const toChatMessages = (seed: ClinicalChatMessageDto[]): ChatMessage[] =>
  seed.map((item) => ({
    id: item.id,
    sender: item.sender,
    text: item.text,
    createdAt: item.createdAt,
    interactionId: item.interactionId,
    isInteractionStart: item.isInteractionStart,
    isInteractionEnd: item.isInteractionEnd,
  }));

export const PatientPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading } = useAuth();
  const { content, loading: contentLoading, reload: reloadContent } =
    usePatientClinicalContent();
  const { messages, sendMessage, setMessages, sending } = useAiAgent({
    mode: "patient",
    onAgentReply: () => reloadContent({ silent: true }),
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

  if (loading || contentLoading || !session || session.role !== "patient") {
    return null;
  }

  const patientSummaryText = content?.patientSummary?.trim() ?? "";
  const hasPatientSummary = Boolean(patientSummaryText);

  return (
    <AppShell title={t("PATIENT_AREA_TITLE")} subtitle={t("PATIENT_AREA_SUBTITLE")} variant="dashboard">
      <ChatPanel
        messages={messages}
        onSend={(text) => void sendMessage(text)}
        sending={sending}
        showAudio={false}
        showInteractionDividers
        sectionTooltip={t("TOOLTIP_PATIENT_CHAT")}
      />
      <Card padding="lg" shadow="md">
        <DashboardSectionTitle title={t("INTERACTION_SUMMARY")} tooltip={t("TOOLTIP_PATIENT_SUMMARY")} />
        {hasPatientSummary ? (
          <InteractionSummaryBody text={patientSummaryText} />
        ) : (
          <Title s1 gray>
            {t("AI_SUMMARY_NO_INTERACTIONS")}
          </Title>
        )}
      </Card>
    </AppShell>
  );
};
