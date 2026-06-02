import React from 'react';
import { Overlay } from '..';
import {
  Context as LoadingContext,
  Provider as LoadingProvider,
} from './context/LoadingContext';
import { useLoading } from './hooks/useLoading';

export interface LoadingProps {
  center?: boolean;
  global?: boolean;
}

export const Loading = ({ global, center }: LoadingProps) => {
  const { hasLoadingActive } = useLoading();
  
  // Para loading global, retornar apenas quando há loading ativo
  if (global) {
    return hasLoadingActive ? (
      <>
        <Overlay visible zIndex={50} />
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 51 }}>
          <div className="loading-wave">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
        <style jsx>{`
          .loading-wave {
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: center;
          }
          
          .loading-dot {
            width: 12px;
            height: 12px;
            background: linear-gradient(135deg, #0090ff, #0066cc);
            border-radius: 50%;
            animation: wave 1.5s ease-in-out infinite;
            box-shadow: 0 2px 8px rgba(0, 144, 255, 0.3);
          }
          
          .loading-dot:nth-child(1) { animation-delay: 0s; }
          .loading-dot:nth-child(2) { animation-delay: 0.1s; }
          .loading-dot:nth-child(3) { animation-delay: 0.2s; }
          .loading-dot:nth-child(4) { animation-delay: 0.3s; }
          .loading-dot:nth-child(5) { animation-delay: 0.4s; }
          
          @keyframes wave {
            0%, 60%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0.7;
            }
            30% {
              transform: translateY(-20px) scale(1.2);
              opacity: 1;
            }
          }
        `}</style>
      </>
    ) : null;
  }

  // Para loading local
  const containerClasses = center 
    ? 'fixed inset-0 flex items-center justify-center' 
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="loading-wave">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
      <style jsx>{`
        .loading-wave {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
        }
        
        .loading-dot {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #0090ff, #0066cc);
          border-radius: 50%;
          animation: wave 1.5s ease-in-out infinite;
          box-shadow: 0 2px 8px rgba(0, 144, 255, 0.3);
        }
        
        .loading-dot:nth-child(1) { animation-delay: 0s; }
        .loading-dot:nth-child(2) { animation-delay: 0.1s; }
        .loading-dot:nth-child(3) { animation-delay: 0.2s; }
        .loading-dot:nth-child(4) { animation-delay: 0.3s; }
        .loading-dot:nth-child(5) { animation-delay: 0.4s; }
        
        @keyframes wave {
          0%, 60%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

Loading.Global = (props: LoadingProps) => <Loading {...props} global />;

export { LoadingContext, LoadingProvider, useLoading };