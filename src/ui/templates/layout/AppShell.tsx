'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/router';

import { Flex, Logo, Title } from '@atoms';
import { MOBILE_MAX_WIDTH_QUERY, useMatchMedia } from '@hooks';
import { LanguageSwitcher } from '@molecules';
import {
  MobileSidebarNavProvider,
  MobileSidebarTrigger,
  PatientSidebar,
  PsychologistSidebar,
} from '@organisms';

import { UserAccountMenu } from '../user/UserAccountMenu';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

type AppShellVariant = 'auth' | 'dashboard';

interface AppShellProps {
  title: string;
  subtitle?: string;
  variant?: AppShellVariant;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
}

export const AppShell = ({
  title,
  subtitle,
  variant = 'dashboard',
  breadcrumbs,
  children,
}: AppShellProps) => {
  const { pathname } = useRouter();
  const isMobile = useMatchMedia(MOBILE_MAX_WIDTH_QUERY);
  const showPsychologistSidebar =
    variant === 'dashboard' && pathname.startsWith('/psychologist');
  const showPatientSidebar =
    variant === 'dashboard' && pathname.startsWith('/patient');
  const showLanguageSwitcher = variant === 'auth' && pathname === '/';
  const showMobileDashboardHeader =
    (showPatientSidebar || showPsychologistSidebar) && isMobile;
  const mobileSidebarExpandKey = showPsychologistSidebar
    ? 'PSYCHOLOGIST_SIDEBAR_EXPAND'
    : 'PATIENT_SIDEBAR_EXPAND';

  const mainContent = (
    <Flex col wFull maxWContainer mxAuto gap6 flex1>
      <Flex col wFull alignStretch>
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        {showMobileDashboardHeader ? (
          <div className='mb-page-header-mobile'>
            <div className='mb-page-header-mobile-row'>
              <MobileSidebarTrigger expandLabelKey={mobileSidebarExpandKey} />
              <div className='mb-page-header-mobile-title'>
                <Flex row alignCenter gap2 wFull>
                  <Logo sm alt={title} />
                  <Title as='h1' gradient fsHero fw3 ellipsis>
                    {title}
                  </Title>
                </Flex>
              </div>
              <UserAccountMenu />
            </div>
          </div>
        ) : variant === 'auth' ? (
          <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
            <Flex col gap2>
              <Title as='h1' gradient fsHero fw3>
                {title}
              </Title>
              {subtitle ? (
                <Title as='p' hint gray maxW2xl leadingRelaxed>
                  {subtitle}
                </Title>
              ) : null}
            </Flex>
            {showLanguageSwitcher ? <LanguageSwitcher /> : null}
          </Flex>
        ) : (
          <>
            <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
              <Title as='h1' gradient fsHero fw3>
                {title}
              </Title>
              <Flex row alignCenter gap4>
                <UserAccountMenu />
              </Flex>
            </Flex>
            {subtitle ? (
              <Title as='p' hint gray mt2 maxW2xl>
                {subtitle}
              </Title>
            ) : null}
          </>
        )}
        {showMobileDashboardHeader && subtitle ? (
          <Title as='p' hint gray mt2 maxW2xl>
            {subtitle}
          </Title>
        ) : null}
      </Flex>
      {variant === 'auth' ? (
        <Flex col alignCenter wFull mt10 pt2>
          <Flex col wFull maxWMd gap5>
            {children}
          </Flex>
        </Flex>
      ) : (
        <Flex col wFull alignStretch gap5>
          {children}
        </Flex>
      )}
    </Flex>
  );

  if (showPsychologistSidebar) {
    return (
      <MobileSidebarNavProvider>
        <div className='mb-dashboard-layout mb-mobile-dashboard-layout'>
          <PsychologistSidebar />
          <div className='mb-dashboard-main mb-mobile-dashboard-main'>{mainContent}</div>
        </div>
      </MobileSidebarNavProvider>
    );
  }

  if (showPatientSidebar) {
    return (
      <MobileSidebarNavProvider>
        <div className='mb-dashboard-layout mb-mobile-dashboard-layout'>
          <PatientSidebar />
          <div className='mb-dashboard-main mb-mobile-dashboard-main'>{mainContent}</div>
        </div>
      </MobileSidebarNavProvider>
    );
  }

  return (
    <Flex col wFull minHScreen px4 py8 smPx6 lgPx8>
      {mainContent}
    </Flex>
  );
};
