import { useMemo, useState } from "react";

import { safeAgentResponse } from "@services/ai/agentGuardrails";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  createdAt: string;
}

export const useAiAgent = (psychologistContext: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const summary = useMemo(() => {
    if (!messages.length) return "No interactions yet.";
    const userMessages = messages.filter((item) => item.sender === "user").length;
    const agentMessages = messages.filter((item) => item.sender === "agent").length;
    return `Interactions: ${messages.length}. Patient messages: ${userMessages}. Agent responses: ${agentMessages}.`;
  }, [messages]);

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
      text: safeAgentResponse(cleanText, psychologistContext),
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
