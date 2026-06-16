'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { APP_VERSION } from '@constants';
import { Icon, Title } from '@atoms';
import {
  getBillingRoute,
  getPatientPaymentsRoute,
  getPatientsRoute,
  getSchedulingRoute,
  getSettingsRoute,
} from '@services';
import { translateTemplate, useI18n } from '@i18n';
import { SidebarNavItem, Tooltip } from '@molecules';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'mb-psychologist-sidebar-collapsed';

const isRouteActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

export const PsychologistSidebar = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { pathname } = router;
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

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
    [t]
  );

  const toggleLabel = collapsed
    ? t('PSYCHOLOGIST_SIDEBAR_EXPAND')
    : t('PSYCHOLOGIST_SIDEBAR_COLLAPSE');

  const toggleButton = (
    <button
      type='button'
      className='mb-sidebar-toggle'
      aria-label={toggleLabel}
      aria-expanded={!collapsed}
      onClick={toggleCollapsed}
    >
      {collapsed ? <Icon.RightOpen sm /> : <Icon.LeftOpen sm />}
    </button>
  );

  const footerContent = collapsed ? (
    <div className='mb-sidebar-footer-toggle-slot'>
      <Tooltip
        title={
          <>
            <Title s2 block>
              {t('APP_TITLE')}
            </Title>
            <Title s1 gray block mt2>
              {translateTemplate(t('APP_VERSION_LABEL'), {
                version: APP_VERSION,
              })}
            </Title>
          </>
        }
        right
      >
        <span
          className='mb-sidebar-nav-icon mb-sidebar-footer-icon'
          aria-label={t('APP_TITLE')}
        >
          <Icon.InfoCircle sm />
        </span>
      </Tooltip>
    </div>
  ) : (
    <>
      <Title fs4 fw3 block>
        {t('APP_TITLE')}
      </Title>
      <Title s1 gray block mt2>
        {translateTemplate(t('APP_VERSION_LABEL'), { version: APP_VERSION })}
      </Title>
    </>
  );

  return (
    <aside
      className={collapsed ? 'mb-sidebar mb-sidebar-collapsed' : 'mb-sidebar'}
      aria-label={t('PSYCHOLOGIST_SIDEBAR_ARIA_LABEL')}
    >
      <div
        className={
          collapsed
            ? 'mb-sidebar-header mb-sidebar-header-collapsed'
            : 'mb-sidebar-header mb-sidebar-header-expanded'
        }
      >
        {collapsed ? (
          <div className='mb-sidebar-header-toggle-slot'>
            <Tooltip title={toggleLabel} right>
              {toggleButton}
            </Tooltip>
          </div>
        ) : (
          toggleButton
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
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div
        className={
          collapsed
            ? 'mb-sidebar-footer mb-sidebar-footer-collapsed'
            : 'mb-sidebar-footer'
        }
      >
        {footerContent}
      </div>
    </aside>
  );
};
