import { Flex, Title } from '@atoms';

import { parseInteractionSummary } from '@utils';

import { EnumeratedTextList } from '../EnumeratedTextList/EnumeratedTextList';

type InteractionSummaryBodyProps = {
  text: string;
};

export const InteractionSummaryBody = ({
  text,
}: InteractionSummaryBodyProps) => {
  const { header, items } = parseInteractionSummary(text);

  if (!header && !items.length) {
    return (
      <Title s1 gray>
        —
      </Title>
    );
  }

  if (!items.length && header) {
    return (
      <Title s1 gray leadingRelaxed>
        {header}
      </Title>
    );
  }

  return (
    <Flex col wFull gap2>
      {header ? (
        <Title s1 gray leadingRelaxed>
          {header}
        </Title>
      ) : null}
      <EnumeratedTextList items={items} />
    </Flex>
  );
};
