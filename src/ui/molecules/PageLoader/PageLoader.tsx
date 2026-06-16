import { Flex } from '@atoms';

type PageLoaderVariant = 'default' | 'dashboard';

interface PageLoaderProps {
  variant?: PageLoaderVariant;
}

const SkeletonBlock = ({ className = '' }: { className?: string }) => (
  <div className={`mb-skeleton ${className}`.trim()} aria-hidden />
);

export const PageLoader = ({ variant = 'default' }: PageLoaderProps) => {
  if (variant === 'dashboard') {
    return (
      <div className='w-full space-y-4' role='status' aria-label='Loading'>
        <div className='mb-kpi-row'>
          <SkeletonBlock className='h-24 rounded-2xl' />
          <SkeletonBlock className='h-24 rounded-2xl' />
          <SkeletonBlock className='h-24 rounded-2xl' />
        </div>
        <div className='mb-chart-card-row'>
          <SkeletonBlock className='min-h-[320px] rounded-2xl' />
          <SkeletonBlock className='min-h-[320px] rounded-2xl' />
        </div>
        <SkeletonBlock className='min-h-[300px] rounded-2xl' />
        <span className='sr-only'>Loading</span>
      </div>
    );
  }

  return (
    <div className='min-h-[280px] py-16' role='status' aria-label='Loading'>
      <Flex col wFull alignCenter justifyCenter gap4>
        <div className='mb-loading-dots' aria-hidden>
          <span className='mb-loading-dot' />
          <span className='mb-loading-dot' />
          <span className='mb-loading-dot' />
        </div>
        <span className='sr-only'>Loading</span>
      </Flex>
    </div>
  );
};
