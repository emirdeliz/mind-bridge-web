import type { ReactNode } from 'react';
import { useRouter } from 'next/router';

import { Flex, Title } from '@atoms';
import { LanguageSwitcher } from '@molecules';
import { PatientSidebar, PsychologistSidebar } from '@organisms';
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
  const showPsychologistSidebar =
    variant === 'dashboard' && pathname.startsWith('/psychologist');
  const showPatientSidebar =
    variant === 'dashboard' && pathname.startsWith('/patient');

  const mainContent = (
    <Flex col wFull maxWContainer mxAuto gap6 flex1>
      <Flex col wFull>
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        <Flex row wFull alignCenter justifySpaceBetween wrap gap4>
          <Title as='h1' gradient fsHero fw3>
            {title}
          </Title>
          <Flex row alignCenter gap4>
            <LanguageSwitcher />
            {variant === 'dashboard' ? <UserAccountMenu /> : null}
          </Flex>
        </Flex>
        {subtitle ? (
          <Title as='p' s1 gray mt2 maxW2xl leadingRelaxed>
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
      <div className='mb-dashboard-layout'>
        <PsychologistSidebar />
        <div className='mb-dashboard-main'>{mainContent}</div>
      </div>
    );
  }

  if (showPatientSidebar) {
    return (
      <div className='mb-dashboard-layout'>
        <PatientSidebar />
        <div className='mb-dashboard-main'>{mainContent}</div>
      </div>
    );
  }

  return (
    <Flex col wFull minHScreen px4 py8 smPx6 lgPx8>
      {mainContent}
    </Flex>
  );
};
