import React, { ReactNode } from 'react';
import { Flex, Dot, DotProps, Icon, Title } from '@atoms';
import { filterDOMProps } from '@helpers';

interface StepProgressBarItemProps extends DotProps {
  title?: ReactNode;
  checked?: boolean;
}
export interface StepProgressBarProps {
  steps: Array<StepProgressBarItemProps>;
  currentIndex?: number;
  outlined?: boolean;
}

const renderDot = (
  key: number,
  { title, checked: checkedFromParm }: StepProgressBarItemProps,
  currentIndex?: number,
  outlined?: boolean
) => {
  const isCurrent = key === currentIndex;
  const checked = checkedFromParm ?? (currentIndex || 0) > key;
  return (
    <div key={key} className="flex flex-col items-center">
      <div className="flex items-center justify-center">
        <Dot
          xss
          data-testid={`${key}-step-dot`}
          outlined={outlined}
          sm={isCurrent && !outlined}
          p3={!isCurrent}
          white={isCurrent}
        />
      </div>
      {title && (
        <Flex.Row
          alignCenter
          justifyCenter
          ml="1"
          data-testid={`${key}-step-progress`}
        >
          <Title noWrap white={isCurrent}>
            {title}
          </Title>
          {checked && (
            <div className="flex items-center justify-center ml-1">
              <Icon.Check xs white={isCurrent} />
            </div>
          )}
        </Flex.Row>
      )}
    </div>
  );
};

const DotDelimiter = () => (
  <div className="flex flex-col items-center">
    <div className="flex items-center justify-center">
      <Dot xss />
    </div>
  </div>
);

export const StepProgressBar = ({
  steps,
  currentIndex,
  outlined,
}: StepProgressBarProps) => {
  return (
    <div className={`flex flex-col items-center h-[${steps.length * 70}px]`}>
      <div className="flex flex-col items-center">
        <DotDelimiter />
        {steps.map((step, index) =>
          renderDot(index, step, currentIndex, outlined)
        )}
        <DotDelimiter />
      </div>
    </div>
  );
};