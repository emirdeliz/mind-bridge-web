'use client';

import { Flex } from '@atoms';
import { AppShell } from '@templates';
import { useI18n } from '@i18n';

import { AdminPromptTemplatesPanel } from './AdminPromptTemplatesPanel';
import { useAdminGuard } from './useAdminGuard';

export const AdminPromptsPage = () => {
  const { t } = useI18n();
  const { loading: guardLoading, isAdmin } = useAdminGuard();

  if (!isAdmin && !guardLoading) {
    return null;
  }

  return (
    <AppShell
      title={t('ADMIN_PROMPTS_PAGE_TITLE')}
      subtitle={t('ADMIN_PROMPTS_PAGE_SUBTITLE')}
      variant='dashboard'
    >
      <Flex col wFull gap4>
        <AdminPromptTemplatesPanel />
      </Flex>
    </AppShell>
  );
};
