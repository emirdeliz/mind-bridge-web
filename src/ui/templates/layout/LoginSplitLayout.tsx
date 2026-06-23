'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';

const LOGIN_SPLIT_IMAGE_SRC = '/images/login-hero.jpg';

type LoginSplitLayoutProps = {
  children: ReactNode;
  formHeader?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

export const LoginSplitLayout = ({
  children,
  formHeader,
  imageSrc = LOGIN_SPLIT_IMAGE_SRC,
  imageAlt = '',
}: LoginSplitLayoutProps) => {
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(imageSrc) && !imageError;

  return (
    <div className='mb-login-split'>
      <div className='mb-login-split-form'>
        {formHeader ? (
          <div className='mb-login-split-form-header'>{formHeader}</div>
        ) : null}
        <div className='mb-login-split-form-inner'>{children}</div>
      </div>
      <div className='mb-login-split-media'>
        <div className='mb-login-split-media-inner'>
          {showImage ? (
            <div className='mb-login-split-media-frame relative'>
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className='mb-login-split-media-image object-cover'
                onError={() => setImageError(true)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export { LOGIN_SPLIT_IMAGE_SRC };
