import { useCallback, useEffect, useRef, useState } from 'react';

import type { ChatMessage } from '@services';
import { Button, Flex, Input, Title } from '@atoms';
import { SPEECH_RECOGNITION_LOCALE, useI18n } from '@i18n';
import {
  Card,
  ChatInteractionDivider,
  ChatMessageBubble,
  ChatScrollArea,
  ChatTypingIndicator,
  Form,
  Tooltip,
  useToast,
} from '@molecules';

import { DashboardSectionTitle } from '../dashboard/DashboardSectionTitle';

const shouldShowInteractionDividerBefore = (
  messages: ChatMessage[],
  index: number
): boolean => {
  if (index === 0) {
    return false;
  }

  const message = messages[index];
  const previous = messages[index - 1];

  if (previous?.isInteractionEnd) {
    return false;
  }

  if (message.isInteractionStart) {
    return true;
  }

  return Boolean(
    message.interactionId &&
    previous.interactionId &&
    message.interactionId !== previous.interactionId
  );
};

export type ChatShortcut = {
  id: string;
  label: string;
  message: string;
};

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onSpeechToText?: (text: string) => void;
  sending?: boolean;
  tallScroll?: boolean;
  showAudio?: boolean;
  showInteractionDividers?: boolean;
  sectionTooltip?: string;
  shortcuts?: ChatShortcut[];
}

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.webkitSpeechRecognition ?? window.SpeechRecognition ?? null;
};

export const ChatPanel = ({
  messages,
  onSend,
  onSpeechToText,
  sending = false,
  tallScroll,
  showAudio = true,
  showInteractionDividers = false,
  sectionTooltip,
  shortcuts,
}: ChatPanelProps) => {
  const { t, language } = useI18n();
  const { showToastError } = useToast();
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastMessage = messages.at(-1);
  const lastMessageId = lastMessage?.id;
  const showTypingIndicator =
    sending &&
    !(lastMessage?.sender === 'agent' && lastMessage.text.trim().length > 0);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    },
    []
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startAudioInput = useCallback(() => {
    if (sending) {
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      showToastError({ message: t('CHAT_AUDIO_NOT_SUPPORTED') });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_RECOGNITION_LOCALE[language];
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? '';
      if (!transcript) {
        return;
      }

      setText((current) => {
        const next = current.trim() ? `${current.trim()} ${transcript}` : transcript;
        onSpeechToText?.(next);
        return next;
      });
    };

    recognition.onerror = () => {
      showToastError({ message: t('CHAT_AUDIO_ERROR') });
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      showToastError({ message: t('CHAT_AUDIO_ERROR') });
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [
    isListening,
    language,
    onSpeechToText,
    sending,
    showToastError,
    stopListening,
    t,
  ]);

  return (
    <Card padding='lg' shadow='lg'>
      {sectionTooltip ? (
        <DashboardSectionTitle
          title={t('AI_AGENT_CHAT')}
          tooltip={sectionTooltip}
        />
      ) : (
        <Title fs3 fw3 mb2>
          {t('AI_AGENT_CHAT')}
        </Title>
      )}
      <ChatScrollArea
        tallScroll={tallScroll}
        messageCount={messages.length}
        isTyping={showTypingIndicator}
        lastMessageId={lastMessageId}
      >
        {messages.map((message, index) => {
          if (message.sender === 'agent' && !message.text.trim()) {
            return null;
          }

          return (
            <div key={message.id}>
              {showInteractionDividers &&
              shouldShowInteractionDividerBefore(messages, index) ? (
                <ChatInteractionDivider label={t('CHAT_NEW_INTERACTION')} />
              ) : null}
              <ChatMessageBubble
                sender={message.sender}
                label={
                  message.sender === 'agent'
                    ? t('CHAT_AGENT_LABEL')
                    : t('CHAT_USER_LABEL')
                }
                text={message.text}
              />
              {showInteractionDividers && message.isInteractionEnd ? (
                <ChatInteractionDivider label={t('CHAT_INTERACTION_END')} />
              ) : null}
            </div>
          );
        })}
        {showTypingIndicator ? (
          <ChatTypingIndicator
            label={t('CHAT_AGENT_LABEL')}
            ariaLabel={t('CHAT_AGENT_TYPING')}
          />
        ) : null}
        {!messages.length && !sending ? (
          <Title s1 gray center py8>
            {t('CHAT_NO_MESSAGES')}
          </Title>
        ) : null}
      </ChatScrollArea>
      {shortcuts?.length ? (
        <Flex row wFull wrap gap2 mb4>
          {shortcuts.map((shortcut) => (
            <Button
              key={shortcut.id}
              type='button'
              variant='secondary'
              outlined
              clickable={!sending}
              onClick={() => {
                if (sending) {
                  return;
                }
                onSend(shortcut.message);
              }}
            >
              {shortcut.label}
            </Button>
          ))}
        </Flex>
      ) : null}
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          if (sending || !text.trim()) {
            return;
          }
          onSend(text);
          setText('');
        }}
      >
        <Flex row wFull gap4 alignCenter>
          <Flex flex1 wFull alignStretch>
            <Input
              placeholder={t('CHAT_MESSAGE_PLACEHOLDER')}
              value={text}
              disabled={sending}
              onChange={(event) => setText(event.target.value)}
            />
          </Flex>
          {showAudio ? (
            <span className='mb-chat-form-action'>
              <Tooltip title={t('TOOLTIP_PATIENT_CHAT_AUDIO')} top width={260}>
                <Button
                  type='button'
                  variant={isListening ? 'primary' : 'secondary'}
                  outlined={!isListening}
                  clickable={!sending}
                  aria-pressed={isListening}
                  onClick={startAudioInput}
                >
                  {isListening ? t('CHAT_AUDIO_LISTENING') : t('AUDIO')}
                </Button>
              </Tooltip>
            </span>
          ) : null}
          <span className='mb-chat-form-action'>
            <Button type='submit' clickable={!sending}>
              {t('SEND')}
            </Button>
          </span>
        </Flex>
      </Form>
    </Card>
  );
};
