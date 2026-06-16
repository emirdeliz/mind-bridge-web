import { useState } from 'react';

import type { ChatMessage } from '@services';
import { Button, Flex, Input, Title } from '@atoms';
import { DashboardSectionTitle } from '../dashboard/DashboardSectionTitle';
import { useI18n } from '@i18n';
import {
  Card,
  ChatInteractionDivider,
  ChatMessageBubble,
  ChatScrollArea,
  ChatTypingIndicator,
  Form,
  Tooltip,
} from '@molecules';

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
  const { t } = useI18n();
  const [text, setText] = useState('');
  const lastMessage = messages.at(-1);
  const lastMessageId = lastMessage?.id;
  const showTypingIndicator =
    sending &&
    !(lastMessage?.sender === 'agent' && lastMessage.text.trim().length > 0);

  const startAudioInput = () => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? ((
            window as Window & {
              webkitSpeechRecognition?: new () => SpeechRecognition;
            }
          ).webkitSpeechRecognition ??
          (
            window as Window & {
              SpeechRecognition?: new () => SpeechRecognition;
            }
          ).SpeechRecognition)
        : undefined;

    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript ?? '';
      setText(transcript);
      onSpeechToText?.(transcript);
    };
    recognition.start();
  };

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
                  variant='secondary'
                  outlined
                  clickable={!sending}
                  onClick={startAudioInput}
                >
                  {t('AUDIO')}
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
