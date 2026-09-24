import { useCallback, useMemo, useState } from 'react';

import type { AiContextUsageDto, AppLanguage } from '@api';
import { streamPatientChatApi, streamPsychologistChatApi } from '@api';
import { translateTemplate, useI18n } from '@i18n';
import { useAuth } from '@services';

export type ChatMessage = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  createdAt: string;
  interactionId?: string;
  isInteractionStart?: boolean;
  isInteractionEnd?: boolean;
  contextUsage?: AiContextUsageDto;
};


export type UseAiAgentOptions = {
  mode: 'patient' | 'psychologist';
  patientId?: string;
  clinicalContext?: string;
  /** Current psychotherapy session notes (psychologist mode). */
  sessionConsiderations?: string;
  onChatComplete?: () => void;
};

const resolveRequestLanguage = (
  uiLanguage: AppLanguage,
  profileLanguage?: AppLanguage
): AppLanguage => uiLanguage ?? profileLanguage ?? 'pt';

const resolveAgentReplyText = (
  responseMessage: string,
  streamedAgentText: string,
  currentAgentText: string
): string =>
  responseMessage.trim() ||
  streamedAgentText.trim() ||
  currentAgentText.trim();

export const useAiAgent = (options: UseAiAgentOptions) => {
  const { t, language } = useI18n();
  const { session } = useAuth();
  const requestLanguage = resolveRequestLanguage(
    language,
    session?.profile?.language
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const summary = useMemo(() => {
    if (!messages.length) return t('AI_SUMMARY_NO_INTERACTIONS');

    const userMessages = messages.filter(
      (item) => item.sender === 'user'
    ).length;
    const agentMessages = messages.filter(
      (item) => item.sender === 'agent'
    ).length;

    return translateTemplate(t('AI_SUMMARY_WITH_COUNTS'), {
      total: messages.length,
      user: userMessages,
      agent: agentMessages,
    });
  }, [messages, t]);

  const appendAgentDelta = useCallback(
    (agentMessageId: string, delta: string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === agentMessageId
            ? { ...message, text: message.text + delta }
            : message
        )
      );
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || sending) return;

      if (!session) {
        setError(t('AI_ERROR_NOT_AUTHENTICATED'));
        return;
      }

      if (options.mode === 'psychologist' && !options.patientId) {
        setError(t('AI_ERROR_PATIENT_REQUIRED'));
        return;
      }

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'user',
        text: cleanText,
        createdAt: new Date().toISOString(),
      };
      const agentMessageId = crypto.randomUUID();
      const streamingAgentMessage: ChatMessage = {
        id: agentMessageId,
        sender: 'agent',
        text: '',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, streamingAgentMessage]);
      setSending(true);
      setError('');

      try {
        if (options.mode === 'patient') {
          let streamedAgentText = '';
          const response = await streamPatientChatApi(
            cleanText,
            requestLanguage,
            (delta) => {
              streamedAgentText += delta;
              appendAgentDelta(agentMessageId, delta);
            }
          );

          setSending(false);

          if (response.messages?.length) {
            setMessages((prev) => {
              const currentAgentText =
                prev.find((message) => message.id === agentMessageId)?.text ??
                '';
              const agentReplyText = resolveAgentReplyText(
                response.message,
                streamedAgentText,
                currentAgentText
              );

              return [
                ...prev.slice(0, -2),
                ...response.messages!.map((item) => ({
                  id: item.id,
                  sender: item.sender,
                  text:
                    item.sender === 'agent' && !item.text?.trim()
                      ? agentReplyText
                      : item.text,
                  createdAt: item.createdAt,
                  interactionId: item.interactionId,
                  isInteractionStart: item.isInteractionStart,
                  isInteractionEnd: item.isInteractionEnd,
                })),
              ];
            });
          } else {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === agentMessageId
                  ? {
                      ...message,
                      text: resolveAgentReplyText(
                        response.message,
                        streamedAgentText,
                        message.text
                      ),
                    }
                  : message
              )
            );
          }

          options.onChatComplete?.();
        } else {
          let streamedAgentText = '';
          const reply = await streamPsychologistChatApi(
            options.patientId!,
            cleanText,
            options.clinicalContext,
            requestLanguage,
            options.sessionConsiderations,
            (delta) => {
              streamedAgentText += delta;
              appendAgentDelta(agentMessageId, delta);
            }
          );

          setSending(false);
          setMessages((prev) =>
            prev.map((message) =>
              message.id === agentMessageId
                ? {
                    ...message,
                    text: resolveAgentReplyText(
                      reply.message,
                      streamedAgentText,
                      message.text
                    ),
                    contextUsage: reply.contextUsage,
                  }
                : message
            )
          );

          options.onChatComplete?.();
        }
      } catch (sendError) {
        setMessages((prev) =>
          prev.filter((message) => message.id !== agentMessageId)
        );
        setError(
          sendError instanceof Error ? sendError.message : t('AI_ERROR_GENERIC')
        );
      } finally {
        setSending(false);
      }
    },
    [appendAgentDelta, options, sending, session, t, requestLanguage]
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
