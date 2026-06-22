'use client';

import { useEffect, useMemo, useState } from 'react';

import type { AiPromptTemplateListItemDto, AppLanguage } from '@api';
import { Button, Flex, Icon, Loading, Overlay, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card, ConfirmModal, FormGroup, PromptTemplateEditor } from '@molecules';
import {
  resolvePromptEditorContent,
  useAdminPromptTemplates,
} from '@services';

type AdminPromptTemplateEditModalProps = {
  visible: boolean;
  template: AiPromptTemplateListItemDto | null;
  tokens: ReturnType<typeof useAdminPromptTemplates>['tokens'];
  saving: boolean;
  onClose: () => void;
  onSave: (content: string, sourceLanguage: AppLanguage) => Promise<void>;
  onRestore: () => Promise<void>;
};

export const AdminPromptTemplateEditModal = ({
  visible,
  template,
  tokens,
  saving,
  onClose,
  onSave,
  onRestore,
}: AdminPromptTemplateEditModalProps) => {
  const { t, language } = useI18n();
  const [draft, setDraft] = useState('');
  const [formError, setFormError] = useState('');
  const [restoreOpen, setRestoreOpen] = useState(false);

  useEffect(() => {
    if (!visible || !template) {
      return;
    }
    setDraft(resolvePromptEditorContent(template, language));
    setFormError('');
    setRestoreOpen(false);
  }, [language, template, visible]);

  const allowedTokensForEditor = useMemo(() => {
    if (!template?.allowedTokens.length) {
      return tokens;
    }

    return tokens.filter((token) =>
      template.allowedTokens.includes(token.key)
    );
  }, [template, tokens]);

  if (!visible || !template) {
    return null;
  }

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setFormError(t('ADMIN_PROMPTS_FORM_REQUIRED'));
      return;
    }

    setFormError('');
    try {
      await onSave(trimmed, language);
      onClose();
    } catch {
      /* handled by parent hook */
    }
  };

  const handleRestore = async () => {
    try {
      await onRestore();
      setRestoreOpen(false);
      onClose();
    } catch {
      /* handled by parent hook */
    }
  };

  return (
    <>
      <Overlay visible={visible} zIndex={40} onClick={saving ? undefined : onClose}>
        <div
          className='flex w-full max-w-3xl max-h-[90dvh] min-h-0 flex-col overflow-hidden px-2'
          onClick={(event) => event.stopPropagation()}
          role='dialog'
          aria-modal='true'
        >
          <Card padding='lg' shadow='xl' overflowHidden>
            <div className='flex max-h-[calc(90dvh-5rem)] min-h-0 flex-col overflow-hidden'>
              <Flex row wFull alignStart justifySpaceBetween gap2>
                <Flex col gap1 flex1>
                  <Title fs4 fw3 block>
                    {template.label[language] ?? template.label.pt}
                  </Title>
                  <Title hint gray block leadingRelaxed>
                    {template.description[language] ?? template.description.pt}
                  </Title>
                </Flex>
                <Button
                  type='button'
                  xs
                  sm
                  circle
                  variant='secondary'
                  outlined
                  clickable={!saving}
                  title={t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                  onClick={onClose}
                >
                  <Icon.Close sm />
                </Button>
              </Flex>

              <div className='min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1'>
                <Title hint gray mb3 mt4 block leadingRelaxed>
                  {t('ADMIN_PROMPTS_EDIT_MODAL_HINT')}
                </Title>

                <Card padding='md' border>
                  <Title s2 fw3 mb2 block>
                    {t('ADMIN_PROMPTS_HELP_TITLE')}
                  </Title>
                  <Title hint gray mb2 block leadingRelaxed>
                    {t('ADMIN_PROMPTS_HELP_BODY')}
                  </Title>
                  <ul className='mb-prompt-template-token-help list-disc space-y-2 pl-5 text-sm text-mb-muted'>
                    {allowedTokensForEditor.map((token) => (
                      <li key={token.key}>
                        <span className='font-mono text-mb-accent'>#{token.key}</span>
                        {' — '}
                        {token.description[language] ?? token.description.pt}
                      </li>
                    ))}
                  </ul>
                </Card>

                <div className='mt-4'>
                  <FormGroup label={t('ADMIN_PROMPTS_EDITOR_LABEL')}>
                    <PromptTemplateEditor
                      value={draft}
                      onChange={setDraft}
                      tokens={tokens}
                      allowedTokens={template.allowedTokens}
                      disabled={saving}
                    />
                  </FormGroup>
                </div>

                {formError ? (
                  <Title s2 error mt2 block>
                    {formError}
                  </Title>
                ) : null}

                {saving ? (
                  <Flex row wFull alignCenter gap2 mt2>
                    <Loading />
                    <Title s2 gray block>
                      {t('ADMIN_PROMPTS_SAVING_TRANSLATING')}
                    </Title>
                  </Flex>
                ) : null}
              </div>

              <div className='mt-4 shrink-0 border-t border-mb-border/50 pt-4'>
                <Flex row wFull gap2 wrap>
                  <Button type='button' clickable={!saving} onClick={() => void handleSave()}>
                    {t('ADMIN_PROMPTS_SAVE')}
                  </Button>
                  <Button
                    type='button'
                    variant='secondary'
                    outlined
                    clickable={!saving}
                    onClick={() => setRestoreOpen(true)}
                  >
                    {t('ADMIN_PROMPTS_RESTORE')}
                  </Button>
                  <Button
                    type='button'
                    variant='secondary'
                    outlined
                    clickable={!saving}
                    onClick={onClose}
                  >
                    {t('PSYCHOLOGIST_PATIENTS_MODAL_CANCEL')}
                  </Button>
                </Flex>
              </div>
            </div>
          </Card>
        </div>
      </Overlay>

      <ConfirmModal
        visible={restoreOpen}
        title={t('ADMIN_PROMPTS_RESTORE_TITLE')}
        message={t('ADMIN_PROMPTS_RESTORE_MESSAGE')}
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
    </>
  );
};
