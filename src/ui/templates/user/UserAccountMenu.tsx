import { useCallback, useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";

import { getProfileInitials } from "@helpers";
import { useOnClickOutside } from "@hooks";
import { getBillingRoute, getProfileRoute, useAuth } from "@services";
import { useI18n } from "@i18n";

export const UserAccountMenu = () => {
  const { t } = useI18n();
  const router = useRouter();
  const { session, logout } = useAuth();
  const { appendEventOutsideOnWindow } = useOnClickOutside();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    appendEventOutsideOnWindow(anchorRef.current, closeMenu);
  }, [open, appendEventOutsideOnWindow, closeMenu]);

  if (!session) return null;

  const initials = getProfileInitials(
    session.profile?.fullName ?? "",
    session.email.slice(0, 2).toUpperCase(),
  );
  const profileHref = getProfileRoute(session.role);
  const billingHref = getBillingRoute(session.role);

  return (
    <div ref={anchorRef} className="mb-user-menu-anchor">
      <button
        type="button"
        className="mb-user-avatar"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("USER_MENU_ARIA_LABEL")}
        onClick={() => setOpen((value) => !value)}
      >
        {initials}
      </button>
      {open ? (
        <div className="mb-user-menu" role="menu">
          <NextLink href={profileHref} className="mb-user-menu-item" role="menuitem" onClick={closeMenu}>
            {t("USER_MENU_EDIT_PROFILE")}
          </NextLink>
          {billingHref ? (
            <NextLink href={billingHref} className="mb-user-menu-item" role="menuitem" onClick={closeMenu}>
              {t("USER_MENU_MY_BILLING")}
            </NextLink>
          ) : null}
          <button
            type="button"
            className="mb-user-menu-item-danger"
            role="menuitem"
            onClick={async () => {
              closeMenu();
              await logout();
              void router.push("/");
            }}
          >
            {t("LOGOUT")}
          </button>
        </div>
      ) : null}
    </div>
  );
};
