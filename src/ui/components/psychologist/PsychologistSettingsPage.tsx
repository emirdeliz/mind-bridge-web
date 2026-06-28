'use client';

import { AppShell } from '@templates';
import { Flex } from '@atoms';
import { useI18n } from '@i18n';

import { PsychologistPromptTemplatesPanel } from './PsychologistPromptTemplatesPanel';
import { PsychologistChatShortcutsSettingsPanel } from './PsychologistChatShortcutsSettingsPanel';
import { PsychologistKnowledgeDocumentsSettingsPanel } from './PsychologistKnowledgeDocumentsSettingsPanel';
import { usePsychologistGuard } from './usePsychologistGuard';

export const PsychologistSettingsPage = () => {
  const { t } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();

  if (!isPsychologist && !guardLoading) {
    return null;
  }

  return (
    <AppShell
      title={t('PSYCHOLOGIST_SETTINGS_TITLE')}
      subtitle={t('PSYCHOLOGIST_SETTINGS_SUBTITLE')}
      variant='dashboard'
    >
      <Flex col wFull gap4>
        <PsychologistPromptTemplatesPanel />
        <PsychologistKnowledgeDocumentsSettingsPanel />
        <PsychologistChatShortcutsSettingsPanel />
      </Flex>
    </AppShell>
  );
};
