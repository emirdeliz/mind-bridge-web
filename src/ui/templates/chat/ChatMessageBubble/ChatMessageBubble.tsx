import { Button, Flex, Icon, Title } from '@atoms';
import type { AiContextUsageDto, AppLanguage } from '@api';
import { localeForAppLanguage, parseEnumeratedChatItems } from '@helpers';
import { useI18n } from '@i18n';
import { EnumeratedTextList, useToast } from '@molecules';

interface ChatMessageBubbleProps {
  sender: 'agent' | 'user';
  label: string;
  text: string;
  createdAt?: string;
  showCopy?: boolean;
  contextUsage?: AiContextUsageDto;
}

/** Inline SVG — fontello "user" glyph is optically left-heavy in its em-box. */
const UserSenderSvg = () => (
  <svg
    className='mb-chat-sender-icon-svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    aria-hidden
  >
    <path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .7.5 1.2 1.2 1.2h16.8c.7 0 1.2-.5 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z' />
  </svg>
);

const ChatSenderIcon = ({ sender }: { sender: 'agent' | 'user' }) => (
  <span
    className={
      sender === 'agent'
        ? 'mb-chat-sender-icon mb-chat-sender-icon-agent'
        : 'mb-chat-sender-icon mb-chat-sender-icon-user'
    }
    aria-hidden
  >
    {sender === 'agent' ? <Icon.AiAgent /> : <UserSenderSvg />}
  </span>
);

const formatMessageTime = (value: string, language: AppLanguage): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(localeForAppLanguage(language), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const buildContextUsageChips = (
  usage: AiContextUsageDto,
  t: (key: string) => string
): string[] => {
  const chips: string[] = [];
  if (usage.usedClinicalRecord) {
    chips.push(t('CHAT_CONTEXT_USED_CLINICAL'));
  }
  if (usage.usedDocuments) {
    chips.push(t('CHAT_CONTEXT_USED_DOCUMENTS'));
  }
  if (usage.usedSessionNotes) {
    chips.push(t('CHAT_CONTEXT_USED_SESSION_NOTES'));
  }
  if (usage.usedPsychologistContext) {
    chips.push(t('CHAT_CONTEXT_USED_PSYCHOLOGIST'));
  }
  return chips;
};

export const ChatMessageBubble = ({
  sender,
  label,
  text,
  createdAt,
  showCopy = sender === 'agent',
  contextUsage,
}: ChatMessageBubbleProps) => {
  const { t, language } = useI18n();
  const { showToastSuccess, showToastError } = useToast();
  const enumeratedItems =
    sender === 'agent' ? parseEnumeratedChatItems(text) : null;
  const timeLabel = createdAt ? formatMessageTime(createdAt, language) : '';
  const canCopy = showCopy && text.trim().length > 0;
  const contextChips =
    sender === 'agent' && contextUsage
      ? buildContextUsageChips(contextUsage, t)
      : [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToastSuccess({ message: t('CHAT_COPY_SUCCESS') });
    } catch {
      showToastError({ message: t('CHAT_COPY_ERROR') });
    }
  };

  return (
    <Flex col agentMessage={sender === 'agent'} userMessage={sender === 'user'}>
      <Flex row alignCenter gap2 mb1>
        <ChatSenderIcon sender={sender} />
        <Title s1 uppercase trackingWide textAccent block>
          {label}
        </Title>
        {timeLabel ? (
          <span className='ml-auto text-[11px] tabular-nums text-mb-muted/80'>
            {timeLabel}
          </span>
        ) : null}
        {canCopy ? (
          <Button
            type='button'
            icon
            variant='secondary'
            title={t('CHAT_COPY')}
            onClick={() => void handleCopy()}
          >
            <Icon.Docs sm />
          </Button>
        ) : null}
      </Flex>
      {enumeratedItems ? (
        <EnumeratedTextList items={enumeratedItems} muted={false} />
      ) : (
        <span className='break-words whitespace-pre-wrap text-sm leading-relaxed text-mb-text'>
          {text}
        </span>
      )}
      {contextChips.length > 0 ? (
        <div className='mt-2 flex flex-wrap items-center gap-1.5'>
          <span className='text-[11px] text-mb-muted'>
            {t('CHAT_CONTEXT_USED_LABEL')}
          </span>
          {contextChips.map((chip) => (
            <span
              key={chip}
              className='rounded-md border border-mb-border/60 bg-mb-surface-elevated px-2 py-0.5 text-[11px] text-mb-muted'
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </Flex>
  );
};
