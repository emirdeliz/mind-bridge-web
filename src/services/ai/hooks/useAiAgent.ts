import { useCallback, useMemo, useState } from "react";

import { postPatientChatApi, postPsychologistChatApi } from "@api";
import { translateTemplate, useI18n } from "@i18n";
import { useAuth } from "@services";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  createdAt: string;
}

export type UseAiAgentOptions = {
  mode: "patient" | "psychologist";
  patientId?: string;
  clinicalContext?: string;
  careContext?: string;
};

export const useAiAgent = (options: UseAiAgentOptions) => {
  const { t } = useI18n();
  const { session } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || sending) return;

      if (!session) {
        setError(t("AI_ERROR_NOT_AUTHENTICATED"));
        return;
      }

      if (options.mode === "psychologist" && !options.patientId) {
        setError(t("AI_ERROR_PATIENT_REQUIRED"));
        return;
      }

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        text: cleanText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setSending(true);
      setError("");

      try {
        const reply =
          options.mode === "patient"
            ? await postPatientChatApi(cleanText, options.careContext)
            : await postPsychologistChatApi(
                options.patientId!,
                cleanText,
                options.clinicalContext,
              );

        const agentMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: "agent",
          text: reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentMessage]);
      } catch (sendError) {
        setError(
          sendError instanceof Error ? sendError.message : t("AI_ERROR_GENERIC"),
        );
      } finally {
        setSending(false);
      }
    },
    [options, sending, session, t],
  );

  return {
    messages,
    summary,
    sending,
    error,
    sendMessage,
    setMessages,
  };
};
