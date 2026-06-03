import { useState } from "react";

import type { ChatMessage } from "@services";
import { Button, Flex, Input, Title } from "@atoms";
import { useI18n } from "@i18n";
import { Card, ChatMessageBubble, Form } from "@molecules";

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
      <Flex col mb4 maxH320 overflowY gap4 chatScroll>
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            sender={message.sender}
            label={message.sender === "agent" ? t("CHAT_AGENT_LABEL") : t("CHAT_USER_LABEL")}
            text={message.text}
          />
        ))}
        {!messages.length ? (
          <Title s1 gray center py8>
            {t("CHAT_NO_MESSAGES")}
          </Title>
        ) : null}
      </Flex>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          onSend(text);
          setText("");
        }}
      >
        <Flex row gap4 alignEnd>
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
