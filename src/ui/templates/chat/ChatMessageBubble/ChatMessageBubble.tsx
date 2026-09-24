import { Flex, Icon, Title } from '@atoms';
import { parseEnumeratedChatItems } from '@helpers';
import { EnumeratedTextList } from '@molecules';

interface ChatMessageBubbleProps {
  sender: 'agent' | 'user';
  label: string;
  text: string;
}

const ChatSenderIcon = ({ sender }: { sender: 'agent' | 'user' }) => (
  <span
    className={
      sender === 'agent'
        ? 'mb-chat-sender-icon mb-chat-sender-icon-agent'
        : 'mb-chat-sender-icon mb-chat-sender-icon-user'
    }
    aria-hidden
  >
    {sender === 'agent' ? <Icon.AiAgent sm /> : <Icon.User sm />}
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
