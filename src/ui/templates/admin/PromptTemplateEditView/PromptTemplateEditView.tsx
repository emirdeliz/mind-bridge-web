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
import { Card, ConfirmModal, FormGroup } from '@molecules';
import { PromptTemplateTestPanel } from '../PromptTemplateTestPanel/PromptTemplateTestPanel';
import {
  PromptTemplateEditor,
  PromptTemplateTokenReference,
} from '@templates';

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
  editHintKey = 'ADMIN_PROMPTS_EDIT_MODAL_HINT',
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
    return resolveEditorContent(template, language).trim();
  }, [language, resolveEditorContent, template]);

  useEffect(() => {
    if (!template) {
      return;
    }
    setDraft(resolveEditorContent(template, language));
    setFormError('');
    setRestoreOpen(false);
    setSaveConfirmOpen(false);
  }, [language, resolveEditorContent, template]);

  const isDirty = draft.trim() !== initialContent;

  const allowedTokensForEditor = useMemo(() => {
    if (!template?.allowedTokens.length) {
      return tokens;
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

  const handleInsertToken = useCallback((tokenKey: string) => {
    const insertion = `#${tokenKey}`;
    setDraft((current) => {
      const trimmed = current.trimEnd();
      if (!trimmed) {
        return insertion;
      }
      if (trimmed.endsWith(insertion)) {
        return current;
      }
      return `${trimmed}\n${insertion}`;
    });
  }, []);

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

        <div className='grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]'>
          <Card padding='lg' shadow='md' className='h-full'>
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
                {t(editHintKey)}
              </Title>
            </Flex>

            <FormGroup label={t('ADMIN_PROMPTS_EDITOR_LABEL')}>
              <PromptTemplateEditor
                value={draft}
                onChange={setDraft}
                tokens={tokens}
                allowedTokens={template.allowedTokens}
                disabled={saving}
                rows={24}
              />
            </FormGroup>

            {formError ? (
              <div className='mt-3'>
                <Title s2 error block>
                  {formError}
                </Title>
              </div>
            ) : null}

            {saving ? (
              <div className='mt-3 flex w-full items-center gap-2'>
                <Loading />
                <Title s2 gray block>
                  {t('ADMIN_PROMPTS_SAVING_TRANSLATING')}
                </Title>
              </div>
            ) : null}

            {enablePromptTest && onTestPrompt && template ? (
              <PromptTemplateTestPanel
                templateKey={template.key}
                category={template.category}
                draft={draft}
                language={language}
                testing={testingPrompt}
                onTest={onTestPrompt}
              />
            ) : null}

            <div className='mt-5 border-t border-mb-border/50 pt-5'>
              <Flex row wFull gap2 wrap>
                <Button type='button' clickable={!saving} onClick={requestSave}>
                  {t('ADMIN_PROMPTS_SAVE')}
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
                <Button
                  type='button'
                  variant='secondary'
                  outlined
                  clickable={!saving}
                  onClick={requestNavigateBack}
                >
                  {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                </Button>
              </Flex>
            </div>
          </Card>

          <aside className='h-full min-h-0'>
            <Card padding='lg' shadow='md' className='h-full'>
              <Title s2 fw3 mb2 block>
                {t('ADMIN_PROMPTS_TOKENS_SIDEBAR_TITLE')}
              </Title>
              <Title hint gray mb4 block leadingRelaxed>
                {t('ADMIN_PROMPTS_HELP_BODY')}
              </Title>
              <div className='min-h-0 flex-1 overflow-y-auto'>
                <PromptTemplateTokenReference
                  tokens={allowedTokensForEditor}
                  variant='sidebar'
                  onInsertToken={handleInsertToken}
                />
              </div>
            </Card>
          </aside>
        </div>
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
