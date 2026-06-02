import React from 'react';

export interface ProgressBarProps {
  duration?: number 
}

export const ProgressBar = ({ duration = 3, ...props }: ProgressBarProps) => {
  const containerClasses = [
    'w-full min-w-50',
    'h-1 relative',
  ].join(' ');

  const progressBarClasses = [
    'opacity-70 absolute bottom-0 left-0',
    'w-full h-1 bg-primary-theme',
    'transform-origin-left',
    'animate-progress-bar',
  ].join(' ');

  return (
    <div className={containerClasses}>
      <div
        className={`${progressBarClasses} animate-[progressBar_${duration}s_linear_1s_forwards]`}
        {...props}
      />

      <style jsx>{`
        @keyframes progressBar {
          0% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(0);
          }
        }

        .animate-progress-bar {
          animation: progressBar linear forwards;
          animation-play-state: running;
        }
      `}</style>
    </div>
  );
};
