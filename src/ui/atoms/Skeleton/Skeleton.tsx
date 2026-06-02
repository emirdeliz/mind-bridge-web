import React from 'react';

export interface SkeletonProps {
  rounded?: boolean;
  width: string;
  height: string;
}

export const Skeleton = ({ rounded, width, height, ...props }: SkeletonProps) => {
  const skeletonClasses = [
    'bg-gray-200 animate-pulse',
    rounded ? 'rounded-full' : 'rounded',
  ].join(' ');

  return (
    <div
      className={skeletonClasses}
      style={{ width, height }}
      data-testid="skeleton"
      {...props}
    />
  );
};

Skeleton.Rounded = (props: SkeletonProps) => <Skeleton {...props} rounded />;
