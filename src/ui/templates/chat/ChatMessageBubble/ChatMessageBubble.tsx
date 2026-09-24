import { Flex, Icon, Title } from '@atoms';
import { parseEnumeratedChatItems } from '@helpers';
import { EnumeratedTextList } from '@molecules';

interface ChatMessageBubbleProps {
  sender: 'agent' | 'user';
  label: string;
  text: string;
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

export const ChatMessageBubble = ({
  sender,
  label,
  text,
}: ChatMessageBubbleProps) => {
  const enumeratedItems =
    sender === 'agent' ? parseEnumeratedChatItems(text) : null;

  return (
    <Flex col agentMessage={sender === 'agent'} userMessage={sender === 'user'}>
      <Flex row alignCenter gap2 mb1>
        <ChatSenderIcon sender={sender} />
        <Title s1 uppercase trackingWide textAccent block>
          {label}
        </Title>
      </Flex>
      {enumeratedItems ? (
        <EnumeratedTextList items={enumeratedItems} />
      ) : (
        <span className='break-words whitespace-pre-wrap text-sm leading-relaxed text-mb-text'>
          {text}
        </span>
      )}
    </Flex>
  );
};
