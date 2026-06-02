import { Skeleton, SkeletonProps } from '@atoms';
import React, { ReactNode } from 'react';

export interface ShowSkeletonProps extends SkeletonProps {
  when: boolean;
  children: ReactNode;
}

export const ShowSkeleton = ({
  when,
  children,
  width,
  height,
  rounded,
}: ShowSkeletonProps) => {
  return when ? (
    <Skeleton width={width} height={height} rounded={rounded} />
  ) : (
    <>{children}</>
  );
};
