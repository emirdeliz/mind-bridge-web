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

const LoadingDots = () => (
  <div className='mb-loading-dots' aria-hidden>
    <span className='mb-loading-dot' />
    <span className='mb-loading-dot' />
    <span className='mb-loading-dot' />
  </div>
);

export const Loading = ({ global, center }: LoadingProps) => {
  const { hasLoadingActive } = useLoading();

  if (global) {
    return hasLoadingActive ? (
      <>
        <Overlay visible zIndex={50} />
        <div
          className='fixed inset-0 flex items-center justify-center'
          style={{ zIndex: 51 }}
        >
          <LoadingDots />
        </div>
      </>
    ) : null;
  }

  const containerClasses = center
    ? 'fixed inset-0 flex items-center justify-center'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <LoadingDots />
    </div>
  );
};

Loading.Global = (props: LoadingProps) => <Loading {...props} global />;

export { LoadingContext, LoadingProvider, useLoading };
