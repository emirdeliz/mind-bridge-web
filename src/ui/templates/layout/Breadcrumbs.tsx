import NextLink from 'next/link';
import type { ReactNode } from 'react';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  if (!items.length) return null;

  return (
    <nav aria-label='Breadcrumb' className='mb-breadcrumbs'>
      <ol className='mb-breadcrumbs-list'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content: ReactNode =
            item.href && !isLast ? (
              <NextLink href={item.href} className='mb-breadcrumb-link'>
                {item.label}
              </NextLink>
            ) : (
              <span
                className={
                  isLast ? 'mb-breadcrumb-current' : 'mb-breadcrumb-text'
                }
              >
                {item.label}
              </span>
            );

          return (
            <li key={`${item.label}-${index}`} className='mb-breadcrumb-item'>
              {index > 0 ? (
                <span className='mb-breadcrumb-separator' aria-hidden>
                  /
                </span>
              ) : null}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
