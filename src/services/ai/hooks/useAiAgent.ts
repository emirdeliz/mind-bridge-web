import { useMemo, useState } from "react";

import { translateTemplate, useI18n } from "@i18n";
import { safeAgentResponse } from "@services/ai/agentGuardrails";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  createdAt: string;
}

export const useAiAgent = (psychologistContext: string) => {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const summary = useMemo(() => {
    if (!messages.length) return t("AI_SUMMARY_NO_INTERACTIONS");

    const userMessages = messages.filter((item) => item.sender === "user").length;
    const agentMessages = messages.filter((item) => item.sender === "agent").length;

    return translateTemplate(t("AI_SUMMARY_WITH_COUNTS"), {
      total: messages.length,
      user: userMessages,
      agent: agentMessages,
    });
  }, [messages, t]);

  const sendMessage = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: cleanText,
      createdAt: new Date().toISOString(),
    };

    const agentMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "agent",
      text: safeAgentResponse(cleanText, psychologistContext, t),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, agentMessage]);
  };

  return {
    messages,
    summary,
    sendMessage,
  };
};
