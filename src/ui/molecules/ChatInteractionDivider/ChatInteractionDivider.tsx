import { Title } from "@atoms";

interface ChatInteractionDividerProps {
  label: string;
}

export const ChatInteractionDivider = ({ label }: ChatInteractionDividerProps) => (
  <div className="mb-chat-interaction-divider" role="separator" aria-label={label}>
    <span className="mb-chat-interaction-divider-line" aria-hidden />
    <Title s1 gray uppercase trackingWide block>
      {label}
    </Title>
    <span className="mb-chat-interaction-divider-line" aria-hidden />
  </div>
);
