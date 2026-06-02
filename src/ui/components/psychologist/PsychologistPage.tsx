import { useState } from "react";
import { useRouter } from "next/router";

import { useAiAgent } from "@services/ai/hooks/useAiAgent";
import { useAuth } from "@services/auth/hooks/useAuth";
import { Button, Flex, Input, Title } from "@atoms";
import { Card } from "@molecules";
import { ChatPanel } from "@templates/chat/ChatPanel";
import { AppShell } from "@templates/layout/AppShell";
import { ProfileForm } from "@templates/profile/ProfileForm";

export const PsychologistPage = () => {
  const router = useRouter();
  const { session, saveProfile, logout } = useAuth();
  const [psychologistContext, setPsychologistContext] = useState(
    "Encourage healthy routines, active listening, and reflective questioning.",
  );
  const [sessionNotes, setSessionNotes] = useState("");
  const [interactionNotes, setInteractionNotes] = useState("");
  const { messages, sendMessage, summary } = useAiAgent(psychologistContext);

  if (!session) {
    return (
      <AppShell title="Psychologist Area" subtitle="Please authenticate first.">
        <Button onClick={() => void router.push("/")}>Go to login</Button>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Psychologist Area"
      subtitle="Track patient interactions, annotate sessions, and tune AI context for daily patient guidance."
    >
      <ProfileForm initialData={session.profile} onSave={(profile) => void saveProfile(profile)} />
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          Psychologist Context for AI
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
              Interaction Notes
            </Title>
            <Input.TextArea
              rows={6}
              placeholder="Write notes for each interaction..."
              value={interactionNotes}
              onChange={(event) => setInteractionNotes(event.target.value)}
            />
          </Card>
        </Flex>
        <Flex flex1>
          <Card padding="lg" shadow="md">
            <Title fs3 fw3 mb2>
              Psychotherapy Session Considerations
            </Title>
            <Input.TextArea
              rows={6}
              placeholder="Add in-session considerations..."
              value={sessionNotes}
              onChange={(event) => setSessionNotes(event.target.value)}
            />
          </Card>
        </Flex>
      </Flex>
      <ChatPanel messages={messages} onSend={sendMessage} />
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          Agentic Interaction Summary
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
        Logout
      </Button>
    </AppShell>
  );
};
