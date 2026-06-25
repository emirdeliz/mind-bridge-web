'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { APP_VERSION } from '@constants';
import { Icon, Logo, SidebarToggleIcon, Title } from '@atoms';
import { MOBILE_MAX_WIDTH_QUERY, useMatchMedia } from '@hooks';
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
  const isMobile = useMatchMedia(MOBILE_MAX_WIDTH_QUERY);
  const { isOpen: mobileOpen, close: closeMobileNav } = useMobileSidebarNav();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

  useEffect(() => {
    closeMobileNav();
  }, [closeMobileNav, pathname]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

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
    collapsed ? 'mb-sidebar-collapsed' : '',
    isMobile && mobileOpen ? 'mb-sidebar-mobile-open' : '',
    isMobile && !mobileOpen ? 'mb-sidebar-mobile-closed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={sidebarClassName} aria-label={t('ADMIN_SIDEBAR_ARIA_LABEL')}>
      <div className='mb-sidebar-header'>
        <Logo sm alt={t('APP_BRAND_NAME')} />
        {!collapsed ? (
          <Title s2 fw3 block>
            {t('ADMIN_SIDEBAR_TITLE')}
          </Title>
        ) : null}
        {!isMobile ? (
          <Tooltip
            title={
              collapsed
                ? t('ADMIN_SIDEBAR_EXPAND')
                : t('ADMIN_SIDEBAR_COLLAPSE')
            }
            right
          >
            <button
              type='button'
              className='mb-sidebar-toggle'
              aria-label={
                collapsed
                  ? t('ADMIN_SIDEBAR_EXPAND')
                  : t('ADMIN_SIDEBAR_COLLAPSE')
              }
              onClick={toggleCollapsed}
            >
              {collapsed ? (
                <SidebarToggleIcon direction='right' />
              ) : (
                <SidebarToggleIcon direction='left' />
              )}
            </button>
          </Tooltip>
        ) : null}
      </div>
      <nav className='mb-sidebar-nav'>
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isRouteActive(pathname, item.href)}
            collapsed={collapsed && !isMobile}
          />
        ))}
      </nav>
      <div className='mb-sidebar-footer'>
        <Title hint gray s1 center block>
          {translateTemplate(t('APP_VERSION_LABEL'), { version: APP_VERSION })}
        </Title>
      </div>
    </aside>
  );
};
