import React from 'react';

export interface SkeletonProps {
  rounded?: boolean;
  width: string;
  height: string;
}

export const Skeleton = ({
  rounded,
  width,
  height,
  ...props
}: SkeletonProps) => {
  const skeletonClasses = [
    'mb-skeleton',
    rounded ? 'rounded-full' : 'rounded-xl',
  ].join(' ');

  return (
    <div
      className={skeletonClasses}
      style={{ width, height }}
      data-testid='skeleton'
      aria-hidden
      {...props}
    />
  );
};

Skeleton.Rounded = (props: SkeletonProps) => <Skeleton {...props} rounded />;
