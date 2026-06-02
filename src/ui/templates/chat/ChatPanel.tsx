import { useState } from "react";

import type { ChatMessage } from "@services/ai/hooks/useAiAgent";
import { Button, Flex, Input, Title } from "@atoms";
import { Card, Form } from "@molecules";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onSpeechToText?: (text: string) => void;
}

export const ChatPanel = ({ messages, onSend, onSpeechToText }: ChatPanelProps) => {
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
    <Card padding="lg" shadow="md">
      <Title fs3 fw3 mb2>
        AI Agent Chat
      </Title>
      <Flex col mb="4" maxHeight="288px" overflowY gap={8} p="3">
        {messages.map((message) => (
          <Title key={message.id} s1>
            <Title s1 fw3>
              {message.sender === "agent" ? "Agent" : "You"}:
            </Title>{" "}
            {message.text}
          </Title>
        ))}
        {!messages.length ? (
          <Title s1 gray>
            No messages yet.
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
        <Flex row gap={2}>
          <Flex flex1>
            <Input
              placeholder="Write your message..."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </Flex>
          <Button type="button" variant="secondary" outlined onClick={startAudioInput}>
            Audio
          </Button>
          <Button type="submit">Send</Button>
        </Flex>
      </Form>
    </Card>
  );
};
