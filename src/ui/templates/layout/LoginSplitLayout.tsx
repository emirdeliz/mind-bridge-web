'use client';

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
        {showImage ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className='mb-login-split-media-image'
            onError={() => setImageError(true)}
          />
        ) : null}
      </div>
    </div>
  );
};

export { LOGIN_SPLIT_IMAGE_SRC };
