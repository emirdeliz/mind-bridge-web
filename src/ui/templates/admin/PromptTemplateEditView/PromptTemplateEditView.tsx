'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  AiPromptTemplateDefaultListItemDto,
  AiPromptTemplateListItemDto,
  AiPromptTokenDefinitionDto,
  AppLanguage,
  TestPromptTemplateBodyDto,
  TestPromptTemplateResultDto,
} from '@api';
import { Button, Flex, Icon, Loading, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, ConfirmModal, FormActions } from '@molecules';
import { PromptTemplateWizard } from '../PromptTemplateWizard/PromptTemplateWizard';
import {
  composePromptGuidanceDraft,
  parsePromptGuidanceDraft,
} from '../PromptTemplateWizard/promptGuidanceDraft';

export type PromptTemplateEditItem =
  | AiPromptTemplateListItemDto
  | AiPromptTemplateDefaultListItemDto;

export type PromptTemplateEditViewProps = {
  template: PromptTemplateEditItem | null;
  tokens: AiPromptTokenDefinitionDto[];
  loading: boolean;
  saving: boolean;
  error: string;
  backHref: string;
  resolveEditorContent: (
    template: PromptTemplateEditItem,
    language: AppLanguage
  ) => string;
  onSave: (content: string, sourceLanguage: AppLanguage) => Promise<void>;
  onRestore?: () => Promise<void>;
  editHintKey?: string;
  restoreTitleKey?: string;
  restoreMessageKey?: string;
  requireSaveConfirmation?: boolean;
  saveConfirmTitle?: string;
  saveConfirmMessage?: string;
  showCustomizedBadge?: boolean;
  isCustomized?: boolean;
  enablePromptTest?: boolean;
  testingPrompt?: boolean;
  onTestPrompt?: (
    body: TestPromptTemplateBodyDto
  ) => Promise<TestPromptTemplateResultDto>;
};

export const PromptTemplateEditView = ({
  template,
  tokens,
  loading,
  saving,
  error,
  backHref,
  resolveEditorContent,
  onSave,
  onRestore,
  restoreTitleKey = 'ADMIN_PROMPTS_RESTORE_TITLE',
  restoreMessageKey = 'ADMIN_PROMPTS_RESTORE_MESSAGE',
  requireSaveConfirmation = false,
  saveConfirmTitle,
  saveConfirmMessage,
  showCustomizedBadge = false,
  isCustomized = false,
  enablePromptTest = false,
  testingPrompt = false,
  onTestPrompt,
}: PromptTemplateEditViewProps) => {
  const router = useRouter();
  const { t, language } = useI18n();
  const [draft, setDraft] = useState('');
  const [formError, setFormError] = useState('');
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const initialContent = useMemo(() => {
    if (!template) {
      return '';
    }
    const raw = resolveEditorContent(template, language).trim();
    return composePromptGuidanceDraft(
      parsePromptGuidanceDraft(raw, template.allowedTokens)
    );
  }, [language, resolveEditorContent, template]);

  useEffect(() => {
    if (!template) {
      return;
    }
    setDraft(initialContent);
    setFormError('');
    setRestoreOpen(false);
    setSaveConfirmOpen(false);
  }, [initialContent, template]);

  const isDirty = draft.trim() !== initialContent;

  const allowedTokensForEditor = useMemo(() => {
    if (!template?.allowedTokens.length) {
      return [];
    }

    return tokens.filter((token) =>
      template.allowedTokens.includes(token.key)
    );
  }, [template, tokens]);

  const navigateBack = useCallback(() => {
    void router.push(backHref);
  }, [backHref, router]);

  const requestNavigateBack = useCallback(() => {
    if (saving) {
      return;
    }

    if (
      isDirty &&
      !window.confirm(t('ADMIN_PROMPTS_UNSAVED_CONFIRM'))
    ) {
      return;
    }

    navigateBack();
  }, [isDirty, navigateBack, saving, t]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setFormError(t('ADMIN_PROMPTS_FORM_REQUIRED'));
      return;
    }

    setFormError('');
    try {
      await onSave(trimmed, language);
      setSaveConfirmOpen(false);
      navigateBack();
    } catch {
      /* handled by parent hook */
    }
  };

  const requestSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setFormError(t('ADMIN_PROMPTS_FORM_REQUIRED'));
      return;
    }

    setFormError('');
    if (requireSaveConfirmation) {
      setSaveConfirmOpen(true);
      return;
    }

    void handleSave();
  };

  const handleRestore = async () => {
    if (!onRestore) {
      return;
    }

    try {
      await onRestore();
      setRestoreOpen(false);
      navigateBack();
    } catch {
      /* handled by parent hook */
    }
  };

  const handleWizardDraftChange = useCallback((composed: string) => {
    setDraft(composed);
  }, []);

  if (loading || !template) {
    return (
      <div className='flex w-full items-center justify-center gap-2 py-12'>
        <Loading />
      </div>
    );
  }

  const templateLabel = template.label[language] ?? template.label.pt;
  const templateDescription =
    template.description[language] ?? template.description.pt;

  return (
    <>
      <div className='flex flex-col gap-6'>
        <Flex row wFull alignCenter justifySpaceBetween gap2 wrap>
          <Button
            type='button'
            variant='secondary'
            outlined
            clickable={!saving}
            onClick={requestNavigateBack}
          >
            <Flex row alignCenter gap2>
              <Icon.LeftOpen sm />
              {t('BACK')}
            </Flex>
          </Button>
          {isDirty ? (
            <Title s2 textAccent block>
              {t('ADMIN_PROMPTS_UNSAVED_BADGE')}
            </Title>
          ) : null}
        </Flex>

        {error ? (
          <Title s2 error block>
            {error}
          </Title>
        ) : null}

        <Card padding='lg' shadow='md'>
          <Flex col gap2 mb4>
            <Title fs3 fw3 block>
              {templateLabel}
            </Title>
            <Title hint gray block leadingRelaxed>
              {templateDescription}
            </Title>
            {showCustomizedBadge && isCustomized ? (
              <Title s2 textAccent block>
                {t('ADMIN_PROMPTS_CUSTOMIZED_BADGE')}
              </Title>
            ) : null}
            <Title hint gray block leadingRelaxed>
              {t('PROMPT_WIZARD_INTRO')}
            </Title>
          </Flex>

          <PromptTemplateWizard
            templateKey={template.key}
            category={template.category}
            initialContent={initialContent}
            allowedTokens={template.allowedTokens}
            tokens={allowedTokensForEditor}
            disabled={saving}
            saving={saving}
            testingPrompt={testingPrompt}
            enablePromptTest={enablePromptTest}
            onDraftChange={handleWizardDraftChange}
            onTestPrompt={onTestPrompt}
          />

          {formError ? (
            <div className='mt-3'>
              <Title s2 error block>
                {formError}
              </Title>
            </div>
          ) : null}

          <div className='mt-5 border-t border-mb-border/50 pt-5'>
            <FormActions>
              <Button
                type='button'
                variant='secondary'
                outlined
                clickable={!saving}
                onClick={requestNavigateBack}
              >
                {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
              </Button>
              {onRestore ? (
                <Button
                  type='button'
                  variant='secondary'
                  outlined
                  clickable={!saving}
                  onClick={() => setRestoreOpen(true)}
                >
                  {t('ADMIN_PROMPTS_RESTORE')}
                </Button>
              ) : null}
              <Button type='button' clickable={!saving} onClick={requestSave}>
                {t('ADMIN_PROMPTS_SAVE')}
              </Button>
            </FormActions>
          </div>
        </Card>
      </div>

      {requireSaveConfirmation ? (
        <ConfirmModal
          visible={saveConfirmOpen}
          title={saveConfirmTitle ?? t('ADMIN_PROMPT_DEFAULTS_SAVE_CONFIRM_TITLE')}
          message={
            saveConfirmMessage ?? t('ADMIN_PROMPT_DEFAULTS_SAVE_CONFIRM_MESSAGE')
          }
          confirmLabel={t('ADMIN_PROMPT_DEFAULTS_SAVE_CONFIRM')}
          cancelLabel={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
          confirmVariant='danger'
          onClose={() => {
            if (!saving) {
              setSaveConfirmOpen(false);
            }
          }}
          onConfirm={() => void handleSave()}
        />
      ) : null}

      {onRestore ? (
        <ConfirmModal
          visible={restoreOpen}
          title={t(restoreTitleKey)}
          message={t(restoreMessageKey)}
          confirmLabel={t('ADMIN_PROMPTS_RESTORE_CONFIRM')}
          cancelLabel={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
          confirmVariant='danger'
          onClose={() => {
            if (!saving) {
              setRestoreOpen(false);
            }
          }}
          onConfirm={() => void handleRestore()}
        />
      ) : null}
    </>
  );
};
