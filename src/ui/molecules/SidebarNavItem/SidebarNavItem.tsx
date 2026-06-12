import type { ReactNode } from "react";
import NextLink from "next/link";

import { Flex, Title } from "@atoms";
import { Tooltip } from "../Tooltip/Tooltip";

export type SidebarNavItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  collapsed?: boolean;
};

export const SidebarNavItem = ({
  href,
  label,
  icon,
  active = false,
  collapsed = false,
}: SidebarNavItemProps) => {
  const itemClassName = [
    "mb-sidebar-nav-item",
    active ? "mb-sidebar-nav-item-active" : "",
    collapsed ? "mb-sidebar-nav-item-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const link = (
    <NextLink href={href} aria-label={collapsed ? label : undefined} className={itemClassName}>
      {collapsed ? (
        <span className="mb-sidebar-nav-icon" aria-hidden>
          {icon}
        </span>
      ) : (
        <Flex row wFull alignCenter gap4>
          <span className="mb-sidebar-nav-icon" aria-hidden>
            {icon}
          </span>
          <Title s2 block>
            {label}
          </Title>
        </Flex>
      )}
    </NextLink>
  );

  if (collapsed) {
    return (
      <div className="mb-sidebar-nav-item-slot">
        <Tooltip title={label} right>
          {link}
        </Tooltip>
      </div>
    );
  }

  return link;
};
