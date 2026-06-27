'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { APP_VERSION } from '@constants';
import { Icon, Logo, SidebarToggleIcon, Title } from '@atoms';
import { usePersistedSidebarCollapsed } from '@hooks';
import {
  getBillingRoute,
  getPatientPaymentsRoute,
  getPatientsRoute,
  getSchedulingRoute,
  getSettingsRoute,
} from '@services';
import { translateTemplate, useI18n } from '@i18n';
import { SidebarNavItem, Tooltip } from '@molecules';
import { useMobileSidebarNav } from '@organisms';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'mb-psychologist-sidebar-collapsed';

const isRouteActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

export const PsychologistSidebar = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { pathname } = router;
  const { isOpen: mobileOpen, close: closeMobileNav } = useMobileSidebarNav();
  const { isMobile, showCollapsedNav, toggleCollapsed } =
    usePersistedSidebarCollapsed(SIDEBAR_COLLAPSED_STORAGE_KEY);

  useEffect(() => {
    closeMobileNav();
  }, [closeMobileNav, pathname]);

  const navItems = useMemo(
    () => [
      {
        href: getPatientsRoute('psychologist') ?? '/psychologist/patients',
        label: t('PSYCHOLOGIST_PATIENTS_NAV'),
        icon: <Icon.Users sm />,
      },
      {
        href: getBillingRoute('psychologist') ?? '/psychologist/billing',
        label: t('USER_MENU_MY_BILLING'),
        icon: <Icon.Bank sm />,
      },
      {
        href:
          getPatientPaymentsRoute('psychologist') ??
          '/psychologist/patient-payments',
        label: t('USER_MENU_PATIENT_PAYMENTS'),
        icon: <Icon.CartArrowDown sm />,
      },
      {
        href: getSchedulingRoute('psychologist') ?? '/psychologist/scheduling',
        label: t('USER_MENU_SCHEDULING'),
        icon: <Icon.Calendar sm />,
      },
      {
        href: getSettingsRoute('psychologist') ?? '/psychologist/settings',
        label: t('USER_MENU_SETTINGS'),
        icon: <Icon.Cog sm />,
      },
    ],
    [t],
  );

  const toggleLabel = showCollapsedNav
    ? t('PSYCHOLOGIST_SIDEBAR_EXPAND')
    : t('PSYCHOLOGIST_SIDEBAR_COLLAPSE');

  const toggleButton = (
    <button
      type='button'
      className='mb-sidebar-toggle'
      aria-label={isMobile ? t('PSYCHOLOGIST_SIDEBAR_COLLAPSE') : toggleLabel}
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
          aria-label={t('PSYCHOLOGIST_SIDEBAR_COLLAPSE')}
          onClick={closeMobileNav}
        />
      ) : null}

      <aside className={sidebarClassName} aria-label={t('PSYCHOLOGIST_SIDEBAR_ARIA_LABEL')}>
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
