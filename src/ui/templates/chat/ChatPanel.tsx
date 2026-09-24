import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import {
  transcribePatientSpeechApi,
  transcribePsychologistSpeechApi,
} from '@api';
import type { AppLanguage } from '@api';
import type { ChatMessage } from '@services';
import { Button, Flex, Icon, Input, Title } from '@atoms';
import { localeForAppLanguage } from '@helpers';
import { useI18n } from '@i18n';
import {
  Card,
  Form,
  Tooltip,
  useToast,
} from '@molecules';

import { ChatInteractionDivider } from './ChatInteractionDivider/ChatInteractionDivider';
import { ChatMessageBubble } from './ChatMessageBubble/ChatMessageBubble';
import { ChatScrollArea } from './ChatScrollArea/ChatScrollArea';
import { ChatTypingIndicator } from './ChatTypingIndicator/ChatTypingIndicator';

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

const formatInteractionDate = (
  isoDate: string,
  language: AppLanguage
): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(localeForAppLanguage(language), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const buildInteractionStartDividerLabels = (
  messages: ChatMessage[],
  language: AppLanguage,
  newInteractionLabel: string
): Map<number, string> => {
  const labels = new Map<number, string>();
  const dividerIndices = messages.reduce<number[]>((indices, _, index) => {
    if (shouldShowInteractionDividerBefore(messages, index)) {
      indices.push(index);
    }
    return indices;
  }, []);
  const lastDividerIndex = dividerIndices.at(-1);

  for (const index of dividerIndices) {
    if (index === lastDividerIndex) {
      labels.set(index, newInteractionLabel);
      continue;
    }

    const formattedDate = formatInteractionDate(
      messages[index]?.createdAt ?? '',
      language
    );
    labels.set(index, formattedDate || newInteractionLabel);
  }

  return labels;
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
  speechAudience?: 'patient' | 'psychologist';
  showInteractionDividers?: boolean;
  sectionTooltip?: string;
  disclaimer?: string;
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
  speechAudience = 'patient',
  showInteractionDividers = false,
  sectionTooltip,
  disclaimer,
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
  const interactionStartDividerLabels = useMemo(
    () =>
      showInteractionDividers
        ? buildInteractionStartDividerLabels(
            messages,
            language,
            t('CHAT_NEW_INTERACTION')
          )
        : new Map<number, string>(),
    [language, messages, showInteractionDividers, t]
  );

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

  const transcribeAudio = useMemo(
    () =>
      speechAudience === 'psychologist'
        ? transcribePsychologistSpeechApi
        : transcribePatientSpeechApi,
    [speechAudience]
  );

  const transcribeRecording = useCallback(
    async (audio: Blob) => {
      setIsTranscribing(true);
      try {
        const transcript = await transcribeAudio(audio, language);
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
    [applyTranscript, language, showToastError, t, transcribeAudio]
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

  const isPsychologistAudio = speechAudience === 'psychologist';

  const audioTooltip = isTranscribing
    ? t(
        isPsychologistAudio
          ? 'TOOLTIP_PSYCHOLOGIST_CHAT_AUDIO_TRANSCRIBING'
          : 'TOOLTIP_PATIENT_CHAT_AUDIO_TRANSCRIBING'
      )
    : isRecording
      ? t(
          isPsychologistAudio
            ? 'TOOLTIP_PSYCHOLOGIST_CHAT_AUDIO_STOP'
            : 'TOOLTIP_PATIENT_CHAT_AUDIO_STOP'
        )
      : t(
          isPsychologistAudio
            ? 'TOOLTIP_PSYCHOLOGIST_CHAT_AUDIO_START'
            : 'TOOLTIP_PATIENT_CHAT_AUDIO_START'
        );

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

  const resizeComposer = useCallback((element: HTMLTextAreaElement | null) => {
    if (!element) {
      return;
    }
    element.style.height = 'auto';
    const nextHeight = Math.min(Math.max(element.scrollHeight, 64), 120);
    element.style.height = `${nextHeight}px`;
  }, []);

  useEffect(() => {
    const element = document.getElementById(
      'mb-chat-composer-input'
    ) as HTMLTextAreaElement | null;
    resizeComposer(element);
  }, [text, resizeComposer]);

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

  const sendShortcut = useCallback(
    (message: string) => {
      if (sending || audioBusy) {
        return;
      }
      onSend(message);
    },
    [audioBusy, onSend, sending]
  );

  const chatSubtitle =
    speechAudience === 'psychologist'
      ? t('CHAT_SUBTITLE_PSYCHOLOGIST')
      : t('CHAT_SUBTITLE_PATIENT');

  const shortcutButtons = shortcuts?.length ? (
    <Flex col wFull gap2>
      <Flex row alignCenter gap2 wrap>
        <Title s1 gray>
          {t('CHAT_SHORTCUTS_LABEL')}
        </Title>
        <Tooltip title={t('CHAT_SHORTCUTS_HINT')} top width={280}>
          <span className='mb-tooltip-trigger'>
            <Icon.InfoCircle xs />
          </span>
        </Tooltip>
      </Flex>
      <Flex row wFull wrap gap2>
        {shortcuts.map((shortcut) => (
          <Button
            key={shortcut.id}
            type='button'
            chip
            clickable={!sending && !audioBusy}
            onClick={() => sendShortcut(shortcut.message)}
          >
            {shortcut.label}
          </Button>
        ))}
      </Flex>
    </Flex>
  ) : null;

  return (
    <Card padding='lg' shadow='lg'>
      {sectionTooltip ? (
        <DashboardSectionTitle
          title={t('AI_AGENT_CHAT')}
          tooltip={sectionTooltip}
          subtitle={chatSubtitle}
        />
      ) : (
        <Flex col wFull gap1 mb2>
          <Title fs3 fw3>
            {t('AI_AGENT_CHAT')}
          </Title>
          <Title hint gray block leadingRelaxed>
            {chatSubtitle}
          </Title>
        </Flex>
      )}
      {disclaimer ? (
        <Title hint gray block leadingRelaxed mb3>
          {disclaimer}
        </Title>
      ) : null}
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
                <ChatInteractionDivider
                  label={
                    interactionStartDividerLabels.get(index) ??
                    t('CHAT_NEW_INTERACTION')
                  }
                />
              ) : null}
              <ChatMessageBubble
                sender={message.sender}
                label={
                  message.sender === 'agent'
                    ? t('CHAT_AGENT_LABEL')
                    : t('CHAT_USER_LABEL')
                }
                text={message.text}
                createdAt={message.createdAt}
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
          <Flex col wFull alignCenter justifyCenter gap4 py8>
            <Title s1 gray center>
              {t('CHAT_NO_MESSAGES')}
            </Title>
            <Title hint gray center block leadingRelaxed>
              {t('CHAT_EMPTY_HINT')}
            </Title>
            {shortcutButtons}
          </Flex>
        ) : null}
      </ChatScrollArea>
      {messages.length > 0 || sending ? (
        <div className='mb-3'>{shortcutButtons}</div>
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
              id='mb-chat-composer-input'
              placeholder={t('CHAT_MESSAGE_PLACEHOLDER')}
              value={text}
              rows={2}
              disabled={sending || audioBusy}
              onChange={(event) => {
                setText(event.target.value);
                resizeComposer(event.target as HTMLTextAreaElement);
              }}
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
                    framed
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
