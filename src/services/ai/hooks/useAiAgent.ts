import { useCallback, useMemo, useState } from "react";

import type { AppLanguage } from "@api";
import { postPatientChatApi, postPsychologistChatApi } from "@api";
import { translateTemplate, useI18n } from "@i18n";
import { useAuth } from "@services";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  createdAt: string;
  interactionId?: string;
  isInteractionStart?: boolean;
  isInteractionEnd?: boolean;
}

export type UseAiAgentOptions = {
  mode: "patient" | "psychologist";
  patientId?: string;
  clinicalContext?: string;
  /** Current psychotherapy session notes (psychologist mode). */
  sessionConsiderations?: string;
  /** Called after a successful agent reply. */
  onAgentReply?: () => void | Promise<void>;
};

const resolveRequestLanguage = (
  uiLanguage: AppLanguage,
  profileLanguage?: AppLanguage
): AppLanguage => uiLanguage ?? profileLanguage ?? "pt";

export const useAiAgent = (options: UseAiAgentOptions) => {
  const { t, language } = useI18n();
  const { session } = useAuth();
  const requestLanguage = resolveRequestLanguage(
    language,
    session?.profile?.language,
  );
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

      let succeeded = false;

      try {
        if (options.mode === "patient") {
          const response = await postPatientChatApi(cleanText, requestLanguage);
          if (response.messages?.length) {
            setMessages((prev) => [
              ...prev.slice(0, -1),
              ...response.messages!.map((item) => ({
                id: item.id,
                sender: item.sender,
                text: item.text,
                createdAt: item.createdAt,
                interactionId: item.interactionId,
                isInteractionStart: item.isInteractionStart,
                isInteractionEnd: item.isInteractionEnd,
              })),
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                sender: "agent",
                text: response.message,
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        } else {
          const reply = await postPsychologistChatApi(
            options.patientId!,
            cleanText,
            options.clinicalContext,
            requestLanguage,
            options.sessionConsiderations,
          );

          const agentMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: "agent",
            text: reply,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, agentMessage]);
        }
        succeeded = true;
      } catch (sendError) {
        setError(
          sendError instanceof Error ? sendError.message : t("AI_ERROR_GENERIC"),
        );
      } finally {
        setSending(false);
      }

      if (succeeded && options.onAgentReply) {
        await options.onAgentReply();
      }
    },
    [options, sending, session, t, requestLanguage],
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
