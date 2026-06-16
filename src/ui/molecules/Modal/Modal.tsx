import { Button, Fade, Flex, Link, Overlay } from '@atoms';
import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type VoidFunction = () => void;

export interface ModalProps {
  children?: ReactNode;
  visible?: boolean;
  confirm?: boolean;
  confirmButtonLabel?: ReactNode;
  closeButtonLabel?: ReactNode;
  overlay?: boolean;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  transparent?: boolean;
  ignorePadding?: boolean;
  ignoreRadius?: boolean;
  headerLeftIcon?: ReactNode;
  zIndex?: number;
  enableButton?: boolean;
  onClose?: VoidFunction;
  onConfirm?: VoidFunction;
}

export const Modal = ({
  children,
  visible,
  confirmButtonLabel = 'Confirmar',
  closeButtonLabel = 'Fechar',
  overlay,
  transparent,
  headerLeftIcon,
  enableButton = true,
  onClose,
  onConfirm,
  maxWidth,
  maxHeight,
  height,
  ignorePadding,
  ignoreRadius,
  zIndex = 20,
  ...props
}: ModalProps) => {
  if (!visible) {
    return null;
  }

  const content = globalThis.document?.body
    ? createPortal(
        <div
          className='modal-scroll'
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fafafa',
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: zIndex,
            maxWidth: maxWidth || '500px',
            width: '90%',
            maxHeight: '90vh', // Altura máxima de 90% da viewport
            overflowY: 'auto', // Scroll vertical automático
            overflowX: 'hidden', // Sem scroll horizontal
          }}
          {...props}
        >
          <div style={{ marginBottom: '20px' }}>{children}</div>
          <div
            style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {closeButtonLabel}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={!enableButton}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary, #007bff)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: enableButton ? 'pointer' : 'not-allowed',
                }}
              >
                {confirmButtonLabel}
              </button>
            )}
          </div>
        </div>,
        globalThis.document?.body
      )
    : null;

  return overlay ? (
    <div
      style={{
        position: 'fixed',
        inset: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex - 1,
      }}
    >
      {content}
    </div>
  ) : (
    content
  );
};

Modal.Overlay = (props: ModalProps) => <Modal {...props} overlay />;

Modal.Confirm = (props: ModalProps) => <Modal {...props} confirm />;
