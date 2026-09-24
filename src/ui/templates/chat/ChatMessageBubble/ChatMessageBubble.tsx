import { Button, Flex, Icon, Title } from '@atoms';
import type { AppLanguage } from '@api';
import { localeForAppLanguage, parseEnumeratedChatItems } from '@helpers';
import { useI18n } from '@i18n';
import { EnumeratedTextList, useToast } from '@molecules';

interface ChatMessageBubbleProps {
  sender: 'agent' | 'user';
  label: string;
  text: string;
  createdAt?: string;
  showCopy?: boolean;
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

export const ChatMessageBubble = ({
  sender,
  label,
  text,
  createdAt,
  showCopy = sender === 'agent',
}: ChatMessageBubbleProps) => {
  const { t, language } = useI18n();
  const { showToastSuccess, showToastError } = useToast();
  const enumeratedItems =
    sender === 'agent' ? parseEnumeratedChatItems(text) : null;
  const timeLabel = createdAt ? formatMessageTime(createdAt, language) : '';
  const canCopy = showCopy && text.trim().length > 0;

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
    </Flex>
  );
};
