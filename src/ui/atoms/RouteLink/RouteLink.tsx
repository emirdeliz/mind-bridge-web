import type { ReactNode } from "react";
import NextLink from "next/link";

export interface RouteLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export const RouteLink = ({ href, children, className }: RouteLinkProps) => (
  <NextLink href={href} className={className ?? "text-sm text-blue-700 hover:underline"}>
    {children}
  </NextLink>
);
