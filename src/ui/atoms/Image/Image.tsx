import React from 'react';
import Image from 'next/image';

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
}

export const ImageComponent = ({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  ...props
}: ImageProps) => {
  const containerClasses = [
    'relative w-full h-full',
    'flex items-center justify-center',
  ].join(' ');

  if (fill) {
    return (
      <div className={containerClasses}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className='object-contain'
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <Image
        src={src}
        alt={alt}
        width={width || 400}
        height={height || 300}
        priority={priority}
        className='max-w-full max-h-full object-contain'
        {...props}
      />
    </div>
  );
};
