import { Flex, Icon, Title } from "@atoms";

interface ChatMessageBubbleProps {
  sender: "agent" | "user";
  label: string;
  text: string;
}

const ChatSenderIcon = ({ sender }: { sender: "agent" | "user" }) => (
  <span
    className={sender === "agent" ? "mb-chat-sender-icon mb-chat-sender-icon-agent" : "mb-chat-sender-icon mb-chat-sender-icon-user"}
    aria-hidden
  >
    {sender === "agent" ? <Icon.AiAgent sm /> : <Icon.User sm />}
  </span>
);

export const ChatMessageBubble = ({ sender, label, text }: ChatMessageBubbleProps) => (
  <Flex col agentMessage={sender === "agent"} userMessage={sender === "user"}>
    <Flex row alignCenter gap2 mb1>
      <ChatSenderIcon sender={sender} />
      <Title s1 uppercase trackingWide textAccent block>
        {label}
      </Title>
    </Flex>
    {text}
  </Flex>
);
