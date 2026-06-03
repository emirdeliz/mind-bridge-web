import { useState } from "react";

import type { ChatMessage } from "@services";
import { Button, Flex, Input, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, Form } from "@molecules";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onSpeechToText?: (text: string) => void;
}

export const ChatPanel = ({ messages, onSend, onSpeechToText }: ChatPanelProps) => {
  const { t } = useI18n();
  const [text, setText] = useState("");

  const startAudioInput = () => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? ((window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition ??
            (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition)
        : undefined;

    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript ?? "";
      setText(transcript);
      onSpeechToText?.(transcript);
    };
    recognition.start();
  };

  return (
    <Card padding="lg" shadow="lg">
      <Title fs3 fw3 mb2>
        {t("AI_AGENT_CHAT")}
      </Title>
      <Flex col mb="4" maxHeight="320px" overflowY gap={12} className="mb-chat-scroll">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.sender === "agent" ? "mb-message-agent" : "mb-message-user"}
          >
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-mb-accent">
              {message.sender === "agent" ? t("CHAT_AGENT_LABEL") : t("CHAT_USER_LABEL")}
            </span>
            {message.text}
          </div>
        ))}
        {!messages.length ? (
          <p className="py-8 text-center text-sm text-mb-muted">{t("CHAT_NO_MESSAGES")}</p>
        ) : null}
      </Flex>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          onSend(text);
          setText("");
        }}
      >
        <Flex row gap={8} alignEnd>
          <Flex flex1>
            <Input
              placeholder={t("CHAT_MESSAGE_PLACEHOLDER")}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </Flex>
          <Button type="button" variant="secondary" outlined onClick={startAudioInput}>
            {t("AUDIO")}
          </Button>
          <Button type="submit">{t("SEND")}</Button>
        </Flex>
      </Form>
    </Card>
  );
};
