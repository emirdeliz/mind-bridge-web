'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { AppShell, PromptTemplateEditView } from '@templates';
import { useI18n } from '@i18n';
import {
  resolvePromptDefaultEditorContent,
  useAdminPromptTemplateDefaults,
} from '@services';

import { useAdminGuard } from './useAdminGuard';

export const AdminPromptTemplateDefaultEditPage = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { loading: guardLoading, isAdmin } = useAdminGuard();
  const templateKey =
    typeof router.query.key === 'string' ? router.query.key : '';

  const { templates, tokens, loading, saving, error, saveDefault } =
    useAdminPromptTemplateDefaults();

  const template = useMemo(
    () => templates.find((item) => item.key === templateKey) ?? null,
    [templateKey, templates]
  );

  useEffect(() => {
    if (!loading && templateKey && !template) {
      void router.replace('/admin/prompt-defaults');
    }
  }, [loading, router, template, templateKey]);

  if (!isAdmin && !guardLoading) {
    return null;
  }

  const templateLabel =
    template?.label[language] ??
    template?.label.pt ??
    t('ADMIN_PROMPT_DEFAULTS_TITLE');

  return (
    <AppShell
      title={templateLabel}
      subtitle={t('ADMIN_PROMPT_DEFAULTS_EDIT_PAGE_SUBTITLE')}
      variant='dashboard'
      breadcrumbs={[
        {
          label: t('ADMIN_PROMPT_DEFAULTS_PAGE_TITLE'),
          href: '/admin/prompt-defaults',
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
        backHref='/admin/prompt-defaults'
        resolveEditorContent={resolvePromptDefaultEditorContent}
        editHintKey='ADMIN_PROMPT_DEFAULTS_EDIT_MODAL_HINT'
        requireSaveConfirmation
        onSave={async (content, sourceLanguage) => {
          if (!template) {
            return;
          }
          await saveDefault(template.key, content, sourceLanguage);
        }}
      />
    </AppShell>
  );
};
