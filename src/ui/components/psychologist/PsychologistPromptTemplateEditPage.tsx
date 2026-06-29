'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { AppShell, PromptTemplateEditView } from '@templates';
import { useI18n } from '@i18n';
import {
  resolvePromptEditorContent,
  usePsychologistPromptTemplates,
} from '@services';

import { usePsychologistGuard } from './usePsychologistGuard';

export const PsychologistPromptTemplateEditPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isPsychologist } = usePsychologistGuard();
  const templateKey =
    typeof router.query.key === 'string' ? router.query.key : '';

  const {
    templates,
    tokens,
    loading,
    saving,
    testing,
    error,
    saveTemplate,
    restoreTemplate,
    testTemplate,
  } = usePsychologistPromptTemplates();

  const template = useMemo(
    () => templates.find((item) => item.key === templateKey) ?? null,
    [templateKey, templates]
  );

  useEffect(() => {
    if (!loading && templateKey && !template) {
      void router.replace('/psychologist/settings');
    }
  }, [loading, router, template, templateKey]);

  if (!isPsychologist && !guardLoading) {
    return null;
  }

  const templateLabel =
    template?.label[language] ?? template?.label.pt ?? t('PSYCHOLOGIST_PROMPTS_TITLE');

  return (
    <AppShell
      title={templateLabel}
      subtitle={t('PSYCHOLOGIST_PROMPTS_EDIT_PAGE_SUBTITLE')}
      variant='dashboard'
      breadcrumbs={[
        {
          label: t('PSYCHOLOGIST_SETTINGS_TITLE'),
          href: '/psychologist/settings',
        },
        {
          label: t('PSYCHOLOGIST_PROMPTS_TITLE'),
          href: '/psychologist/settings',
        },
        { label: templateLabel },
      ]}
    >
      <PromptTemplateEditView
        template={template}
        tokens={tokens}
        loading={loading || !templateKey}
        saving={saving}
        error={error}
        backHref='/psychologist/settings'
        resolveEditorContent={resolvePromptEditorContent}
        editHintKey='PSYCHOLOGIST_PROMPTS_EDIT_MODAL_HINT'
        restoreTitleKey='PSYCHOLOGIST_PROMPTS_RESTORE_TITLE'
        restoreMessageKey='PSYCHOLOGIST_PROMPTS_RESTORE_MESSAGE'
        showCustomizedBadge
        isCustomized={Boolean(template?.isCustomized)}
        enablePromptTest
        testingPrompt={testing}
        onTestPrompt={
          template
            ? (body) => testTemplate(template.key, body)
            : undefined
        }
        onSave={async (content, sourceLanguage) => {
          if (!template) {
            return;
          }
          await saveTemplate(template.key, content, sourceLanguage);
        }}
        onRestore={
          template
            ? async () => {
                await restoreTemplate(template.key);
              }
            : undefined
        }
      />
    </AppShell>
  );
};
