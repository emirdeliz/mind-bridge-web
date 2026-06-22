'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { APP_VERSION } from '@constants';
import { Icon, Logo, SidebarToggleIcon, Title } from '@atoms';
import { MOBILE_MAX_WIDTH_QUERY, useMatchMedia } from '@hooks';
import { translateTemplate, useI18n } from '@i18n';
import { SidebarNavItem, Tooltip } from '@molecules';

import { useMobileSidebarNav } from '@organisms';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'mb-patient-sidebar-collapsed';

const isRouteActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

export const PatientSidebar = () => {
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
        href: '/patient',
        label: t('PATIENT_CHAT_NAV'),
        icon: <Icon.AiAgent sm />,
      },
    ],
    [t],
  );

  const toggleLabel = collapsed
    ? t('PATIENT_SIDEBAR_EXPAND')
    : t('PATIENT_SIDEBAR_COLLAPSE');

  const toggleButton = (
    <button
      type='button'
      className='mb-sidebar-toggle'
      aria-label={isMobile ? t('PATIENT_SIDEBAR_COLLAPSE') : toggleLabel}
      aria-expanded={isMobile ? mobileOpen : !collapsed}
      onClick={isMobile ? closeMobileNav : toggleCollapsed}
    >
      {isMobile ? (
        <SidebarToggleIcon direction='left' />
      ) : collapsed ? (
        <SidebarToggleIcon direction='right' />
      ) : (
        <SidebarToggleIcon direction='left' />
      )}
    </button>
  );

  const showCollapsedNav = isMobile ? false : collapsed;

  const footerContent = showCollapsedNav ? (
    <div className='mb-sidebar-footer-toggle-slot'>
      <Tooltip
        title={
          <Title s1 gray block>
            {translateTemplate(t('APP_VERSION_LABEL'), {
              version: APP_VERSION,
            })}
          </Title>
        }
        right
      >
        <Logo
          lg
          alt={t('APP_TITLE')}
          className='mb-sidebar-footer-icon'
        />
      </Tooltip>
    </div>
  ) : (
    <Title s1 gray block center>
      {translateTemplate(t('APP_VERSION_LABEL'), { version: APP_VERSION })}
    </Title>
  );

  const sidebarClassName = [
    'mb-sidebar',
    !isMobile && collapsed ? 'mb-sidebar-collapsed' : '',
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
          aria-label={t('PATIENT_SIDEBAR_COLLAPSE')}
          onClick={closeMobileNav}
        />
      ) : null}

      <aside className={sidebarClassName} aria-label={t('PATIENT_SIDEBAR_ARIA_LABEL')}>
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
              <Logo xl alt={t('APP_TITLE')} className='mb-sidebar-header-logo' />
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
          {footerContent}
        </div>
      </aside>
    </>
  );
};
