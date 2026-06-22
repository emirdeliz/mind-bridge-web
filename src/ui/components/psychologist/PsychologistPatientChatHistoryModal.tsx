'use client';

import { useMemo, type MouseEvent } from 'react';

import type { ClinicalChatMessageDto, AppLanguage } from '@api';
import { Button, Flex, Icon, Loading, Overlay, Title } from '@atoms';
import { localeForAppLanguage } from '@helpers';
import { formatDateAsYYYYMMDD } from '@helpers';
import { useI18n } from '@i18n';
import { Card } from '@molecules';
import { ChatMessageBubble } from '@templates';

type PsychologistPatientChatHistoryModalProps = {
  visible: boolean;
  patientName?: string | null;
  messages: ClinicalChatMessageDto[];
  loading?: boolean;
  error?: string;
  onClose: () => void;
};

type ChatHistoryDateGroup = {
  dateKey: string;
  label: string;
  messages: ClinicalChatMessageDto[];
};

const formatChatDateHeading = (value: string, language: AppLanguage): string =>
  new Intl.DateTimeFormat(localeForAppLanguage(language), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));

const formatChatTime = (value: string, language: AppLanguage): string =>
  new Intl.DateTimeFormat(localeForAppLanguage(language), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const groupMessagesByDate = (
  messages: ClinicalChatMessageDto[],
  language: AppLanguage
): ChatHistoryDateGroup[] => {
  const visibleMessages = messages
    .filter(
      (message) =>
        message.sender !== 'agent' || message.text.trim().length > 0
    )
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  const groups: ChatHistoryDateGroup[] = [];

  for (const message of visibleMessages) {
    const dateKey = formatDateAsYYYYMMDD(message.createdAt);
    const lastGroup = groups.at(-1);

    if (!lastGroup || lastGroup.dateKey !== dateKey) {
      groups.push({
        dateKey,
        label: formatChatDateHeading(message.createdAt, language),
        messages: [message],
      });
      continue;
    }

    lastGroup.messages.push(message);
  }

  return groups;
};

export const PsychologistPatientChatHistoryModal = ({
  visible,
  patientName,
  messages,
  loading = false,
  error,
  onClose,
}: PsychologistPatientChatHistoryModalProps) => {
  const { t, language } = useI18n();

  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages, language),
    [language, messages]
  );

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const displayName = patientName?.trim() || t('PSYCHOLOGIST_PATIENTS_CHAT_HISTORY_UNNAMED');

  return (
    <Overlay visible={visible} zIndex={40} onClick={onClose}>
      <div
        className='w-full max-w-3xl'
        onClick={stopPropagation}
        role='dialog'
        aria-modal='true'
        aria-labelledby='patient-chat-history-modal-title'
      >
        <Card padding='lg' shadow='xl'>
          <Flex col wFull gap5 alignStretch>
            <Flex row wFull alignCenter justifySpaceBetween gap4>
              <Flex row alignCenter gap4 flex1>
                <div
                  className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-mb-primary/30 bg-mb-primary/15 shadow-glow'
                  aria-hidden
                >
                  <Icon.History nm white />
                </div>
                <div className='min-w-0 flex-1'>
                  <Flex col wFull gap1>
                    <Title
                      id='patient-chat-history-modal-title'
                      fs3
                      fw3
                      block
                      noWrap
                      ellipsis
                    >
                      {displayName}
                    </Title>
                    <Title hint gray block leadingRelaxed>
                      {t('PSYCHOLOGIST_PATIENTS_CHAT_HISTORY_MODAL_SUBTITLE')}
                    </Title>
                  </Flex>
                </div>
              </Flex>
              <Button
                type='button'
                variant='secondary'
                outlined
                circle
                title={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                onClick={onClose}
              >
                <Icon.Close sm />
              </Button>
            </Flex>

            <div className='h-px w-full bg-mb-border/70' aria-hidden />

            {loading ? (
              <div
                className='mb-chat-history-modal-loading'
                role='status'
                aria-label={t('PSYCHOLOGIST_PATIENTS_CHAT_HISTORY_LOADING')}
              >
                <Loading />
              </div>
            ) : (
              <>
                <div className='mb-chat-history-modal-scroll'>
                  {error ? (
                    <div
                      className='rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm font-medium text-mb-danger'
                      role='alert'
                    >
                      {error}
                    </div>
                  ) : groupedMessages.length === 0 ? (
                    <Title s1 gray block>
                      {t('PSYCHOLOGIST_PATIENTS_CHAT_HISTORY_EMPTY')}
                    </Title>
                  ) : (
                    <Flex col wFull gap5>
                      {groupedMessages.map((group) => (
                        <section
                          key={group.dateKey}
                          aria-label={group.label}
                          className='flex w-full flex-col gap-4'
                        >
                          <div className='mb-chat-interaction-divider'>
                            <span
                              className='mb-chat-interaction-divider-line'
                              aria-hidden
                            />
                            <Title s1 gray uppercase trackingWide block>
                              {group.label}
                            </Title>
                            <span
                              className='mb-chat-interaction-divider-line'
                              aria-hidden
                            />
                          </div>
                          <Flex col wFull gap4>
                            {group.messages.map((message) => (
                              <div
                                key={message.id}
                                className='flex w-full flex-col gap-1'
                              >
                                <Title s1 gray block>
                                  {formatChatTime(message.createdAt, language)}
                                </Title>
                                <ChatMessageBubble
                                  sender={message.sender}
                                  label={
                                    message.sender === 'agent'
                                      ? t('CHAT_AGENT_LABEL')
                                      : t('CHAT_PATIENT_LABEL')
                                  }
                                  text={message.text}
                                />
                              </div>
                            ))}
                          </Flex>
                        </section>
                      ))}
                    </Flex>
                  )}
                </div>

                <Flex row wFull justifyEnd>
                  <Button
                    type='button'
                    variant='secondary'
                    outlined
                    onClick={onClose}
                  >
                    {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                  </Button>
                </Flex>
              </>
            )}
          </Flex>
        </Card>
      </div>
    </Overlay>
  );
};
