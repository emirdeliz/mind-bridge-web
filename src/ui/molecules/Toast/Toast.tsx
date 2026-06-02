import React, { memo, ReactNode } from 'react';
import { Link, ProgressBar, Title } from '@atoms';
import {
  Context as ToastContext,
  Provider as ToastProvider,
} from './context/ToastContext';
import { useToast } from './hooks/useToast';

export const TOAST_DEFAULT_DISMISS_SECONDS = 7;

export interface ToastProps {
  dismissTime?: number;
  topRight?: boolean;
  topLeft?: boolean;
  bottomLeft?: boolean;
  topOffset?: number;
}

export interface ToastItemProps {
  title?: string;
  message?: ReactNode;
  id?: string;
  icon?: ReactNode;
  // Cores
  bg?: string;
  text?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export const Toast = memo(
  ({ topRight, topLeft, bottomLeft, topOffset }: ToastProps) => {
    const { toastList, removeToast } = useToast();
    
    // Construir posicionamento - forçar bottom right por padrão
    const getPositionClasses = () => {
      const baseOffset = 6; // 24px
      
      if (topRight) {
        return `top-${baseOffset} right-${baseOffset}`;
      }
      if (topLeft) {
        return `top-${baseOffset} left-${baseOffset}`;
      }
      if (bottomLeft) {
        return `bottom-${baseOffset} left-${baseOffset}`;
      }
      // Forçar bottom right como padrão
      return `bottom-${baseOffset} right-${baseOffset}`;
    };

    // Função para obter cores baseadas no tipo
    const getToastColors = (toast: ToastItemProps) => {
      if (toast.type === 'error') {
        return 'bg-red-600 text-white border-red-700';
      }
      if (toast.type === 'success') {
        return 'bg-green-600 text-white border-green-700';
      }
      if (toast.type === 'warning') {
        return 'bg-yellow-600 text-white border-yellow-700';
      }
      if (toast.type === 'info') {
        return 'bg-blue-600 text-white border-blue-700';
      }
      // Fallback para cores customizadas ou padrão
      return toast.bg && toast.text ? `${toast.bg} ${toast.text}` : 'bg-blue-600 text-white border-blue-700';
    };

    const containerClasses = [
      'fixed z-50',
      getPositionClasses(),
    ].join(' ');

    return (
      <div 
        className={containerClasses} 
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}
      >
        {toastList.map(({ title, message, bg, text, type, ...toast }) => (
          <div key={toast.id} style={{ marginBottom: '12px' }}>
            <div 
              className={`
                relative w-80 max-w-sm p-4 pr-12 rounded-lg shadow-lg border
                ${getToastColors({ bg, text, type })}
                transition-all duration-300 ease-out
                transform hover:scale-105
                animate-toast-in-${topRight || topLeft ? 'left' : 'right'}
              `}
              data-testid="toast"
            >
              {/* Botão de fechar melhorado */}
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 group"
                aria-label="Fechar notificação"
              >
                <svg 
                  className="w-4 h-4 text-current group-hover:scale-110 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Ícone do tipo de toast */}
              {type && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {type === 'error' && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {type === 'success' && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {type === 'warning' && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    {type === 'info' && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Conteúdo do toast */}
                  <div className="flex-1 space-y-1">
                    {title && (
                      <div className="font-semibold text-sm leading-tight">
                        {title}
                      </div>
                    )}
                    {message && (
                      <div className="text-sm leading-relaxed opacity-90">
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Conteúdo do toast quando não há tipo específico */}
              {!type && (
                <div className="space-y-1">
                  {title && (
                    <div className="font-semibold text-sm leading-tight">
                      {title}
                    </div>
                  )}
                  {message && (
                    <div className="text-sm leading-relaxed opacity-90">
                      {message}
                    </div>
                  )}
                </div>
              )}

              {/* Barra de progresso melhorada */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
                <div 
                  className="h-full bg-white/40 rounded-b-lg transition-all duration-100 ease-linear"
                  style={{ 
                    animation: `toast-progress ${TOAST_DEFAULT_DISMISS_SECONDS}s linear forwards` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
        
        <style jsx>{`
          @keyframes toast-in-right {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes toast-in-left {
            from {
              transform: translateX(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes toast-progress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          
          .animate-toast-in-right {
            animation: toast-in-right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          
          .animate-toast-in-left {
            animation: toast-in-left 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
        `}</style>
      </div>
    );
  }
);

export { ToastContext, ToastProvider, useToast };

