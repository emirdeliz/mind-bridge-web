import React, { MouseEvent, ReactNode } from 'react';
import { Button, Flex, Title } from '@atoms';

export interface ModalTemplateProps {
  title: string;
  subTitle: string;
  allowButton: boolean;
  labelButton: string;
  children: ReactNode;
  onClickButton: (value: unknown) => void;
}

export const ModalTemplate = ({
  title,
  subTitle,
  children,
  allowButton,
  labelButton,
  onClickButton,
}: ModalTemplateProps) => {
  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    if (allowButton) {
      onClickButton(e);
    }
  };

  const bodyClasses = [
    'w-full max-w-md mx-auto',
    'bg-white rounded-lg shadow-xl',
    'p-6',
    'border border-gray-200',
  ].join(' ');

  return (
    <form className={bodyClasses} onSubmit={(e) => e.preventDefault()}>
      <Title center>
        {title}
      </Title>
      {subTitle && (
        <Title center>
          {subTitle}
        </Title>
      )}
      {children}
      <Flex>
        <Button wFull clickable={allowButton} onClick={handleSubmit}>
          {labelButton}
        </Button>
      </Flex>
    </form>
  );
};
