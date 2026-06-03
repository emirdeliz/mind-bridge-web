import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { getRoleRoute, useAiAgent, useAuth } from "@services";
import { Button, Flex, Input, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card } from "@molecules";
import { AppShell, ChatPanel, ProfileForm } from "@templates";

export const PsychologistPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session, loading, saveProfile, logout } = useAuth();
  const [psychologistContext, setPsychologistContext] = useState(() => t("DEFAULT_PSYCHOLOGIST_AI_CONTEXT"));
  const [sessionNotes, setSessionNotes] = useState("");
  const [interactionNotes, setInteractionNotes] = useState("");
  const { messages, sendMessage, summary } = useAiAgent(psychologistContext);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void router.replace("/");
      return;
    }
    if (session.role !== "psychologist") {
      void router.replace(getRoleRoute(session.role));
    }
  }, [loading, session, router]);

  if (loading || !session || session.role !== "psychologist") {
    return null;
  }

  return (
    <AppShell title={t("PSYCHOLOGIST_AREA_TITLE")} subtitle={t("PSYCHOLOGIST_AREA_SUBTITLE")} variant="dashboard">
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
      <Flex row wrap gap4>
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
