import { useState } from "react";
import { useRouter } from "next/router";

import { useAiAgent } from "@services/ai/hooks/useAiAgent";
import { useAuth } from "@services/auth/hooks/useAuth";
import { Button, Flex, Input, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card } from "@molecules";
import { ChatPanel } from "@templates/chat/ChatPanel";
import { AppShell } from "@templates/layout/AppShell";
import { ProfileForm } from "@templates/profile/ProfileForm";

export const PsychologistPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, saveProfile, logout } = useAuth();
  const [psychologistContext, setPsychologistContext] = useState(() => t("DEFAULT_PSYCHOLOGIST_AI_CONTEXT"));
  const [sessionNotes, setSessionNotes] = useState("");
  const [interactionNotes, setInteractionNotes] = useState("");
  const { messages, sendMessage, summary } = useAiAgent(psychologistContext);

  if (!session) {
    return (
      <AppShell title={t("PSYCHOLOGIST_AREA_TITLE")} subtitle={t("PSYCHOLOGIST_AUTH_REQUIRED_SUBTITLE")}>
        <Button onClick={() => void router.push("/")}>{t("GO_TO_LOGIN")}</Button>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("PSYCHOLOGIST_AREA_TITLE")} subtitle={t("PSYCHOLOGIST_AREA_SUBTITLE")}>
      <ProfileForm initialData={session.profile} onSave={(profile) => void saveProfile(profile)} />
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          {t("PSYCHOLOGIST_CONTEXT_FOR_AI")}
        </Title>
        <Input.TextArea
          rows={4}
          value={psychologistContext}
          onChange={(event) => setPsychologistContext(event.target.value)}
        />
      </Card>
      <Flex row wrap gap={16}>
        <Flex flex1>
          <Card padding="lg" shadow="md">
            <Title fs3 fw3 mb2>
              {t("INTERACTION_NOTES")}
            </Title>
            <Input.TextArea
              rows={6}
              placeholder={t("INTERACTION_NOTES_PLACEHOLDER")}
              value={interactionNotes}
              onChange={(event) => setInteractionNotes(event.target.value)}
            />
          </Card>
        </Flex>
        <Flex flex1>
          <Card padding="lg" shadow="md">
            <Title fs3 fw3 mb2>
              {t("SESSION_CONSIDERATIONS")}
            </Title>
            <Input.TextArea
              rows={6}
              placeholder={t("SESSION_CONSIDERATIONS_PLACEHOLDER")}
              value={sessionNotes}
              onChange={(event) => setSessionNotes(event.target.value)}
            />
          </Card>
        </Flex>
      </Flex>
      <ChatPanel messages={messages} onSend={sendMessage} />
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          {t("AGENTIC_INTERACTION_SUMMARY")}
        </Title>
        <Title s1 gray>
          {summary}
        </Title>
      </Card>
      <Button
        variant="secondary"
        onClick={async () => {
          await logout();
          void router.push("/");
        }}
      >
        {t("LOGOUT")}
      </Button>
    </AppShell>
  );
};
