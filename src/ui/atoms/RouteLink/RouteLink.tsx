import type { ReactNode } from 'react';
import NextLink from 'next/link';

export interface RouteLinkProps {
  href: string;
  children: ReactNode;
  active?: boolean;
  inline?: boolean;
}

export const RouteLink = ({
  href,
  children,
  active,
  inline,
}: RouteLinkProps) => (
  <NextLink
    href={href}
    className={
      active
        ? 'mb-nav-link-active'
        : inline
          ? 'mb-auth-text-link'
          : 'mb-nav-link'
    }
  >
    {children}
  </NextLink>
);
