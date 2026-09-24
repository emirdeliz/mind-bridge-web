import { type ReactNode } from 'react';

import { useChatAutoScroll } from './useChatAutoScroll';

type ChatScrollAreaProps = {
  children: ReactNode;
  tallScroll?: boolean;
  messageCount: number;
  isTyping?: boolean;
  lastMessageId?: string;
};

export const ChatScrollArea = ({
  children,
  tallScroll = false,
  messageCount,
  isTyping = false,
  lastMessageId,
}: ChatScrollAreaProps) => {
  const scrollRef = useChatAutoScroll([messageCount, isTyping, lastMessageId]);

  const className = [
    'mb-chat-scroll',
    'flex',
    'w-full',
    'flex-col',
    'gap-4',
    'overflow-y-auto',
    'mb-4',
    tallScroll ? 'min-h-[280px] max-h-[520px]' : 'min-h-[200px] max-h-[320px]',
  ].join(' ');

  return (
    <div
      ref={scrollRef}
      className={className}
      role='log'
      aria-live='polite'
      aria-relevant='additions'
    >
      {children}
    </div>
  );
};
