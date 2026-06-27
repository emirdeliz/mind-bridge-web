'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { APP_VERSION } from '@constants';
import { Icon, Logo, SidebarToggleIcon, Title } from '@atoms';
import { usePersistedSidebarCollapsed } from '@hooks';
import { translateTemplate, useI18n } from '@i18n';
import { SidebarNavItem, Tooltip } from '@molecules';
import { useMobileSidebarNav } from '@organisms';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'mb-admin-sidebar-collapsed';

const isRouteActive = (pathname: string, href: string): boolean => {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export const AdminSidebar = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { pathname } = router;
  const { isOpen: mobileOpen, close: closeMobileNav } = useMobileSidebarNav();
  const { isMobile, showCollapsedNav, toggleCollapsed } =
    usePersistedSidebarCollapsed(SIDEBAR_COLLAPSED_STORAGE_KEY);

  useEffect(() => {
    closeMobileNav();
  }, [closeMobileNav, pathname]);

  const toggleLabel = showCollapsedNav
    ? t('ADMIN_SIDEBAR_EXPAND')
    : t('ADMIN_SIDEBAR_COLLAPSE');

  const toggleButton = (
    <button
      type='button'
      className='mb-sidebar-toggle'
      aria-label={isMobile ? t('ADMIN_SIDEBAR_COLLAPSE') : toggleLabel}
      aria-expanded={isMobile ? mobileOpen : !showCollapsedNav}
      onClick={isMobile ? closeMobileNav : toggleCollapsed}
    >
      {isMobile ? (
        <SidebarToggleIcon direction='left' />
      ) : showCollapsedNav ? (
        <SidebarToggleIcon direction='right' />
      ) : (
        <SidebarToggleIcon direction='left' />
      )}
    </button>
  );

  const navItems = useMemo(
    () => [
      {
        href: '/admin',
        label: t('ADMIN_METRICS_NAV'),
        icon: <Icon.Bank sm />,
      },
      {
        href: '/admin/prompt-defaults',
        label: t('ADMIN_PROMPT_DEFAULTS_NAV'),
        icon: <Icon.Cog sm />,
      },
    ],
    [t]
  );

  const sidebarClassName = [
    'mb-sidebar',
    showCollapsedNav ? 'mb-sidebar-collapsed' : '',
    isMobile ? 'mb-sidebar-mobile-drawer' : '',
    isMobile && mobileOpen ? 'mb-sidebar-mobile-drawer-open' : '',
    isMobile && !mobileOpen ? 'mb-sidebar-mobile-drawer-closed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {isMobile && mobileOpen ? (
        <button
          type='button'
          className='mb-sidebar-mobile-backdrop'
          aria-label={t('ADMIN_SIDEBAR_COLLAPSE')}
          onClick={closeMobileNav}
        />
      ) : null}

      <aside className={sidebarClassName} aria-label={t('ADMIN_SIDEBAR_ARIA_LABEL')}>
        <div
          className={
            showCollapsedNav
              ? 'mb-sidebar-header mb-sidebar-header-collapsed'
              : 'mb-sidebar-header mb-sidebar-header-expanded'
          }
        >
          {showCollapsedNav ? (
            <div className='mb-sidebar-header-toggle-slot'>
              <Tooltip title={toggleLabel} right>
                {toggleButton}
              </Tooltip>
            </div>
          ) : (
            <>
              <Logo sm alt={t('APP_BRAND_NAME')} className='mb-sidebar-header-logo' />
              {!isMobile ? (
                <Title s2 fw3 block>
                  {t('ADMIN_SIDEBAR_TITLE')}
                </Title>
              ) : null}
              {toggleButton}
            </>
          )}
        </div>

        <nav className='mb-sidebar-nav'>
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isRouteActive(pathname, item.href)}
              collapsed={showCollapsedNav}
              onNavigate={isMobile ? closeMobileNav : undefined}
            />
          ))}
        </nav>

        <div
          className={
            showCollapsedNav
              ? 'mb-sidebar-footer mb-sidebar-footer-collapsed'
              : 'mb-sidebar-footer mb-sidebar-footer-expanded'
          }
        >
          <Title hint gray s1 center block>
            {translateTemplate(t('APP_VERSION_LABEL'), { version: APP_VERSION })}
          </Title>
        </div>
      </aside>
    </>
  );
};
