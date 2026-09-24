import { type ReactNode } from 'react';

import { useChatAutoScroll } from './useChatAutoScroll';

type ChatScrollAreaProps = {
  children: ReactNode;
  tallScroll?: boolean;
  fillHeight?: boolean;
  messageCount: number;
  isTyping?: boolean;
  lastMessageId?: string;
};

export const ChatScrollArea = ({
  children,
  tallScroll = false,
  fillHeight = false,
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
    fillHeight
      ? 'mb-0 min-h-0 flex-1'
      : tallScroll
        ? 'mb-4 min-h-[280px] max-h-[520px]'
        : 'mb-4 min-h-[200px] max-h-[320px]',
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
