import { Flex, Title } from "@atoms";

interface ChatMessageBubbleProps {
  sender: "agent" | "user";
  label: string;
  text: string;
}

export const ChatMessageBubble = ({ sender, label, text }: ChatMessageBubbleProps) => (
  <Flex col agentMessage={sender === "agent"} userMessage={sender === "user"}>
    <Title s1 uppercase trackingWide textAccent block mb1>
      {label}
    </Title>
    {text}
  </Flex>
);
