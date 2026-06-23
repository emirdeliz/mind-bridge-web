'use client';

import { useRouter } from 'next/router';

import { Button, Flex } from '@atoms';
import { AppShell } from '@templates';
import { useI18n } from '@i18n';

import { AdminPromptDefaultsPanel } from './AdminPromptDefaultsPanel';
import { useAdminGuard } from './useAdminGuard';

export const AdminPromptDefaultsPage = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { loading: guardLoading, isAdmin } = useAdminGuard();

  if (!isAdmin && !guardLoading) {
    return null;
  }

  return (
    <AppShell
      title={t('ADMIN_PROMPT_DEFAULTS_PAGE_TITLE')}
      subtitle={t('ADMIN_PROMPT_DEFAULTS_PAGE_SUBTITLE')}
      variant='dashboard'
    >
      <Flex col wFull gap4>
        <Button
          type='button'
          variant='secondary'
          onClick={() => router.back()}
        >
          {t('BACK')}
        </Button>
        <AdminPromptDefaultsPanel />
      </Flex>
    </AppShell>
  );
};
