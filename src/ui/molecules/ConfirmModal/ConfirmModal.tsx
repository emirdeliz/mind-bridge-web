'use client';

import type { MouseEvent } from 'react';

import { Button, Flex, Icon, Overlay, Title } from '@atoms';

import { Card } from '../Card/Card';

export type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info';
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmModal = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  onClose,
  onConfirm,
}: ConfirmModalProps) => {
  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <Overlay visible={visible} zIndex={40} onClick={onClose}>
      <div
        className='w-full max-w-md'
        onClick={stopPropagation}
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='confirm-modal-title'
        aria-describedby='confirm-modal-message'
      >
        <Card padding='lg' shadow='xl'>
          <Flex col wFull gap5>
            <Flex row wFull alignStart justifySpaceBetween gap4>
              <Flex col wFull gap2 flex1>
                <div id='confirm-modal-title'>
                  <Title fs3 fw3 block leadingRelaxed>
                    {title}
                  </Title>
                </div>
                <div id='confirm-modal-message'>
                  <Title hint gray block leadingRelaxed>
                    {message}
                  </Title>
                </div>
              </Flex>
              <Button
                type='button'
                variant='secondary'
                outlined
                circle
                title={cancelLabel}
                onClick={onClose}
              >
                <Icon.Close sm />
              </Button>
            </Flex>

            <div className='h-px w-full bg-mb-border/70' aria-hidden />

            <Flex row wFull gap5>
              <Flex flex1 wFull>
                <Button
                  type='button'
                  variant='secondary'
                  outlined
                  wFull
                  onClick={onClose}
                >
                  {cancelLabel}
                </Button>
              </Flex>
              <Flex flex1 wFull>
                <Button
                  type='button'
                  variant={confirmVariant}
                  wFull
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </div>
    </Overlay>
  );
};
