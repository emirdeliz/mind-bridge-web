import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { transcribePatientSpeechApi } from '@api';
import type { ChatMessage } from '@services';
import { Button, Flex, Icon, Input, Title } from '@atoms';
import { useI18n } from '@i18n';
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

const pickRecorderMimeType = (): string => {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];

  return (
    candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? 'audio/webm'
  );
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
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recorderMimeTypeRef = useRef('audio/webm');
  const lastMessage = messages.at(-1);
  const lastMessageId = lastMessage?.id;
  const showTypingIndicator =
    sending &&
    !(lastMessage?.sender === 'agent' && lastMessage.text.trim().length > 0);
  const audioBusy = isRecording || isTranscribing;

  const releaseMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  useEffect(
    () => () => {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
      releaseMediaStream();
    },
    [releaseMediaStream]
  );

  const applyTranscript = useCallback(
    (transcript: string) => {
      const trimmed = transcript.trim();
      if (!trimmed) {
        return;
      }

      setText((current) => {
        const next = current.trim() ? `${current.trim()} ${trimmed}` : trimmed;
        onSpeechToText?.(next);
        return next;
      });
    },
    [onSpeechToText]
  );

  const transcribeRecording = useCallback(
    async (audio: Blob) => {
      setIsTranscribing(true);
      try {
        const transcript = await transcribePatientSpeechApi(audio, language);
        if (!transcript) {
          showToastError({ message: t('CHAT_AUDIO_EMPTY') });
          return;
        }
        applyTranscript(transcript);
      } catch {
        showToastError({ message: t('CHAT_AUDIO_ERROR') });
      } finally {
        setIsTranscribing(false);
      }
    },
    [applyTranscript, language, showToastError, t]
  );

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return;
    }
    recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    if (sending || isTranscribing) {
      return;
    }

    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      showToastError({ message: t('CHAT_AUDIO_NOT_SUPPORTED') });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecorderMimeType();
      const recorder = new MediaRecorder(stream, { mimeType });

      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recorderMimeTypeRef.current = mimeType;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        showToastError({ message: t('CHAT_AUDIO_ERROR') });
        setIsRecording(false);
        releaseMediaStream();
        mediaRecorderRef.current = null;
      };

      recorder.onstop = () => {
        setIsRecording(false);
        releaseMediaStream();
        mediaRecorderRef.current = null;

        const audio = new Blob(audioChunksRef.current, {
          type: recorderMimeTypeRef.current,
        });
        audioChunksRef.current = [];

        if (!audio.size) {
          return;
        }

        void transcribeRecording(audio);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      releaseMediaStream();
      showToastError({ message: t('CHAT_AUDIO_ERROR') });
      setIsRecording(false);
    }
  }, [
    isTranscribing,
    releaseMediaStream,
    sending,
    showToastError,
    t,
    transcribeRecording,
  ]);

  const handleAudioButtonClick = useCallback(() => {
    if (isTranscribing) {
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    void startRecording();
  }, [isRecording, isTranscribing, startRecording, stopRecording]);

  const audioTooltip = isTranscribing
    ? t('TOOLTIP_PATIENT_CHAT_AUDIO_TRANSCRIBING')
    : isRecording
      ? t('TOOLTIP_PATIENT_CHAT_AUDIO_STOP')
      : t('TOOLTIP_PATIENT_CHAT_AUDIO_START');

  const audioAriaLabel = isTranscribing
    ? t('CHAT_AUDIO_TRANSCRIBING_ARIA')
    : isRecording
      ? t('CHAT_AUDIO_STOP_ARIA')
      : t('CHAT_AUDIO_START_ARIA');

  const renderAudioIcon = () => {
    if (isTranscribing) {
      return <Icon.Spin sm spinning />;
    }

    if (isRecording) {
      return <Icon.Stop sm />;
    }

    return <Icon.Microphone sm />;
  };

  const submitMessage = useCallback(() => {
    if (sending || audioBusy || !text.trim()) {
      return;
    }

    onSend(text);
    setText('');
  }, [audioBusy, onSend, sending, text]);

  const handleComposerKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.shiftKey) {
        return;
      }

      event.preventDefault();
      submitMessage();
    },
    [submitMessage]
  );

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
              clickable={!sending && !audioBusy}
              onClick={() => {
                if (sending || audioBusy) {
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
          submitMessage();
        }}
      >
        <div className='mb-chat-composer'>
          <div className='mb-chat-composer-field'>
            <Input.TextArea
              placeholder={t('CHAT_MESSAGE_PLACEHOLDER')}
              value={text}
              rows={4}
              disabled={sending || audioBusy}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleComposerKeyDown}
            />
          </div>
          <div className='mb-chat-composer-actions'>
            {showAudio ? (
              <span
                className={[
                  'mb-chat-form-action mb-chat-audio-button',
                  isRecording ? 'mb-chat-audio-button-recording' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Tooltip title={audioTooltip} top width={260}>
                  <Button
                    type='button'
                    circle
                    nm
                    variant={isRecording ? 'danger' : 'secondary'}
                    outlined
                    clickable={!sending && !isTranscribing}
                    aria-label={audioAriaLabel}
                    aria-pressed={isRecording}
                    onClick={handleAudioButtonClick}
                  >
                    {renderAudioIcon()}
                  </Button>
                </Tooltip>
              </span>
            ) : null}
            <span className='mb-chat-form-action'>
              <Button type='submit' clickable={!sending && !audioBusy}>
                {t('SEND')}
              </Button>
            </span>
          </div>
        </div>
      </Form>
    </Card>
  );
};
