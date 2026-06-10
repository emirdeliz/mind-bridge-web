import { Title } from "@atoms";

import { EnumeratedTextList } from "@molecules";
import {
  isEnumeratedInsightTitle,
  parseInsightListItems,
} from "@utils/enumeratedTextList";

type SessionInsightBodyProps = {
  title: string;
  body: string;
};

export const SessionInsightBody = ({ title, body }: SessionInsightBodyProps) => {
  if (!body.trim()) {
    return (
      <Title s1 gray>
        —
      </Title>
    );
  }

  if (!isEnumeratedInsightTitle(title)) {
    return (
      <Title s1 gray preLine leadingRelaxed>
        {body}
      </Title>
    );
  }

  return <EnumeratedTextList items={parseInsightListItems(body)} />;
};
