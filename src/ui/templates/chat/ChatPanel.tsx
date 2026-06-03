import { useState } from "react";

import type { ChatMessage } from "@services";
import { Button, Flex, Input, Title } from "@atoms";
import { DashboardSectionTitle } from "../dashboard/DashboardSectionTitle";
import { useI18n } from "@i18n";
import { Card, ChatMessageBubble, Form, Tooltip } from "@molecules";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onSpeechToText?: (text: string) => void;
  tallScroll?: boolean;
  showAudio?: boolean;
  sectionTooltip?: string;
}

export const ChatPanel = ({
  messages,
  onSend,
  onSpeechToText,
  tallScroll,
  showAudio = true,
  sectionTooltip,
}: ChatPanelProps) => {
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
      {sectionTooltip ? (
        <DashboardSectionTitle title={t("AI_AGENT_CHAT")} tooltip={sectionTooltip} />
      ) : (
        <Title fs3 fw3 mb2>
          {t("AI_AGENT_CHAT")}
        </Title>
      )}
      <Flex col mb4 overflowY gap4 chatScroll maxH320={!tallScroll} maxH480={tallScroll}>
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
        <Flex row wFull gap4 alignCenter>
          <Flex flex1 wFull alignStretch>
            <Input
              placeholder={t("CHAT_MESSAGE_PLACEHOLDER")}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </Flex>
          {showAudio ? (
            <span className="mb-chat-form-action">
              <Tooltip title={t("TOOLTIP_PATIENT_CHAT_AUDIO")} top width={260}>
                <Button type="button" variant="secondary" outlined onClick={startAudioInput}>
                  {t("AUDIO")}
                </Button>
              </Tooltip>
            </span>
          ) : null}
          <span className="mb-chat-form-action">
            <Button type="submit">{t("SEND")}</Button>
          </span>
        </Flex>
      </Form>
    </Card>
  );
};
