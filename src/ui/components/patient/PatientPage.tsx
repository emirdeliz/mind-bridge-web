import { useMemo, useState } from "react";
import { useRouter } from "next/router";

import { useAiAgent } from "@services/ai/hooks/useAiAgent";
import { useAuth } from "@services/auth/hooks/useAuth";
import { Button, Flex, Title } from "@atoms";
import { Alert, Card } from "@molecules";
import { ChatPanel } from "@templates/chat/ChatPanel";
import { AppShell } from "@templates/layout/AppShell";
import { ProfileForm } from "@templates/profile/ProfileForm";

export const PatientPage = () => {
  const router = useRouter();
  const { session, saveProfile, logout } = useAuth();
  const [context] = useState("Support daily reflection and emotional awareness with empathetic language.");
  const { messages, sendMessage, summary } = useAiAgent(context);

  const missingProfileFields = useMemo(() => {
    if (!session) return [];
    return Object.entries(session.profile)
      .filter(([, value]) => !value)
      .map(([key]) => key);
  }, [session]);

  if (!session) {
    return (
      <AppShell title="Patient Area" subtitle="Please authenticate first.">
        <Button onClick={() => void router.push("/")}>Go to login</Button>
      </AppShell>
    );
  }

  return (
    <AppShell title="Patient Area" subtitle="Chat with the AI agent in text or audio and receive guided feedback.">
      {missingProfileFields.length ? (
        <Alert>
          Some profile data was not provided by the auth provider. Please complete:{" "}
          {missingProfileFields.join(", ")}.
        </Alert>
      ) : null}
      <ProfileForm initialData={session.profile} onSave={(profile) => void saveProfile(profile)} />
      <ChatPanel messages={messages} onSend={sendMessage} />
      <Card padding="lg" shadow="md">
        <Title fs3 fw3 mb2>
          Interaction Summary
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
              new Notification("Mind Bridge Reminder", {
                body: "How are you feeling today? Share a quick update with your AI care assistant.",
              });
            }
          }}
        >
          Enable engagement notifications
        </Button>
        <Button
          variant="secondary"
          onClick={async () => {
            await logout();
            void router.push("/");
          }}
        >
          Logout
        </Button>
      </Flex>
    </AppShell>
  );
};
