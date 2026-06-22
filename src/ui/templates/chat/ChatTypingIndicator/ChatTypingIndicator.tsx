import { Flex, Icon, Title } from '@atoms';

type ChatTypingIndicatorProps = {
  label: string;
  ariaLabel: string;
};

export const ChatTypingIndicator = ({
  label,
  ariaLabel,
}: ChatTypingIndicatorProps) => (
  <Flex col agentMessage>
    <Flex row alignCenter gap2 mb1>
      <span
        className='mb-chat-sender-icon mb-chat-sender-icon-agent'
        aria-hidden
      >
        <Icon.AiAgent sm />
      </span>
      <Title s1 uppercase trackingWide textAccent block>
        {label}
      </Title>
    </Flex>
    <div
      className='mb-chat-typing'
      role='status'
      aria-live='polite'
      aria-label={ariaLabel}
    >
      <span className='mb-chat-typing-dot' aria-hidden />
      <span className='mb-chat-typing-dot' aria-hidden />
      <span className='mb-chat-typing-dot' aria-hidden />
    </div>
  </Flex>
);
