'use client';

import { useState } from 'react';

import type {
  AppLanguage,
  TestPromptTemplateBodyDto,
  TestPromptTemplateResultDto,
} from '@api';
import { Button, Flex, Input, Loading, Title } from '@atoms';
import { useI18n } from '@i18n';
import { FormGroup } from '@molecules';

type PromptTemplateTestPanelProps = {
  templateKey: string;
  category: string;
  draft: string;
  language: AppLanguage;
  testing: boolean;
  onTest: (
    body: TestPromptTemplateBodyDto
  ) => Promise<TestPromptTemplateResultDto>;
};

const isPatientChatCategory = (category: string, key: string): boolean =>
  category === 'patient_chat' || key === 'response_language.instruction';

const isCopilotCategory = (category: string, key: string): boolean =>
  category === 'psychologist_copilot' ||
  key === 'response_language.psychologist_brevity';

export const PromptTemplateTestPanel = ({
  templateKey,
  category,
  draft,
  language,
  testing,
  onTest,
}: PromptTemplateTestPanelProps) => {
  const { t } = useI18n();
  const [testMessage, setTestMessage] = useState('');
  const [psychologistContext, setPsychologistContext] = useState('');
  const [sessionConsiderations, setSessionConsiderations] = useState('');
  const [clinicalContext, setClinicalContext] = useState('');
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState<TestPromptTemplateResultDto | null>(null);
  const [showResolvedPrompt, setShowResolvedPrompt] = useState(false);

  const showPatientFields = isPatientChatCategory(category, templateKey);
  const showCopilotFields = isCopilotCategory(category, templateKey);

  const handleTest = async () => {
    const trimmedMessage = testMessage.trim();
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      setFormError(t('ADMIN_PROMPTS_FORM_REQUIRED'));
      return;
    }

    if (!trimmedMessage) {
      setFormError(t('PSYCHOLOGIST_PROMPTS_TEST_MESSAGE_REQUIRED'));
      return;
    }

    setFormError('');
    setResult(null);

    try {
      const response = await onTest({
        content: trimmedDraft,
        sourceLanguage: language,
        testMessage: trimmedMessage,
        psychologistContext: psychologistContext.trim() || undefined,
        sessionConsiderations: sessionConsiderations.trim() || undefined,
        clinicalContext: clinicalContext.trim() || undefined,
      });
      setResult(response);
    } catch {
      /* handled by parent hook */
    }
  };

  return (
    <div className='mt-5 border-t border-mb-border/50 pt-5'>
      <Title s2 fw3 mb2 block>
        {t('PSYCHOLOGIST_PROMPTS_TEST_TITLE')}
      </Title>
      <Title hint gray mb4 block leadingRelaxed>
        {t('PSYCHOLOGIST_PROMPTS_TEST_SUBTITLE')}
      </Title>

      <Flex col wFull gap2 alignStretch>
        <FormGroup label={t('PSYCHOLOGIST_PROMPTS_TEST_MESSAGE_LABEL')}>
          <Input.TextArea
            rows={3}
            value={testMessage}
            disabled={testing}
            onChange={(event) => setTestMessage(event.target.value)}
            placeholder={t('PSYCHOLOGIST_PROMPTS_TEST_MESSAGE_PLACEHOLDER')}
          />
        </FormGroup>

        {showPatientFields ? (
          <FormGroup
            label={t('PSYCHOLOGIST_PROMPTS_TEST_CONTEXT_LABEL')}
            helpText={t('PSYCHOLOGIST_PROMPTS_TEST_CONTEXT_HINT')}
          >
            <Input.TextArea
              rows={3}
              value={psychologistContext}
              disabled={testing}
              onChange={(event) => setPsychologistContext(event.target.value)}
              placeholder={t('PSYCHOLOGIST_PROMPTS_TEST_CONTEXT_PLACEHOLDER')}
            />
          </FormGroup>
        ) : null}

        {showCopilotFields ? (
          <>
            <FormGroup
              label={t('PSYCHOLOGIST_PROMPTS_TEST_SESSION_LABEL')}
              helpText={t('PSYCHOLOGIST_PROMPTS_TEST_SESSION_HINT')}
            >
              <Input.TextArea
                rows={2}
                value={sessionConsiderations}
                disabled={testing}
                onChange={(event) =>
                  setSessionConsiderations(event.target.value)
                }
                placeholder={t('PSYCHOLOGIST_PROMPTS_TEST_SESSION_PLACEHOLDER')}
              />
            </FormGroup>
            <FormGroup
              label={t('PSYCHOLOGIST_PROMPTS_TEST_CLINICAL_LABEL')}
              helpText={t('PSYCHOLOGIST_PROMPTS_TEST_CLINICAL_HINT')}
            >
              <Input.TextArea
                rows={2}
                value={clinicalContext}
                disabled={testing}
                onChange={(event) => setClinicalContext(event.target.value)}
                placeholder={t('PSYCHOLOGIST_PROMPTS_TEST_CLINICAL_PLACEHOLDER')}
              />
            </FormGroup>
          </>
        ) : null}

        {formError ? (
          <Title s2 error block>
            {formError}
          </Title>
        ) : null}

        <Flex row wFull gap2 wrap>
          <Button
            type='button'
            variant='secondary'
            outlined
            clickable={!testing}
            onClick={() => void handleTest()}
          >
            {testing
              ? t('PSYCHOLOGIST_PROMPTS_TEST_RUNNING')
              : t('PSYCHOLOGIST_PROMPTS_TEST_RUN')}
          </Button>
        </Flex>

        {testing ? (
          <Flex row wFull alignCenter gap2>
            <Loading />
            <Title s2 gray block>
              {t('PSYCHOLOGIST_PROMPTS_TEST_RUNNING')}
            </Title>
          </Flex>
        ) : null}

        {result ? (
          <div className='rounded-xl border border-mb-border/70 bg-mb-surface/50 p-4'>
            <Title s2 fw3 mb2 block>
              {t('PSYCHOLOGIST_PROMPTS_TEST_REPLY_TITLE')}
            </Title>
            <p className='mb-4 whitespace-pre-wrap text-sm leading-relaxed text-mb-text'>
              {result.reply || t('PSYCHOLOGIST_PROMPTS_TEST_REPLY_EMPTY')}
            </p>

            <Button
              type='button'
              xs
              sm
              variant='secondary'
              outlined
              onClick={() => setShowResolvedPrompt((current) => !current)}
            >
              {showResolvedPrompt
                ? t('PSYCHOLOGIST_PROMPTS_TEST_HIDE_RESOLVED')
                : t('PSYCHOLOGIST_PROMPTS_TEST_SHOW_RESOLVED')}
            </Button>

            {showResolvedPrompt ? (
              <pre className='mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-mb-border/60 bg-mb-surface/80 p-3 font-mono text-xs leading-relaxed text-mb-text'>
                {result.resolvedPrompt}
              </pre>
            ) : null}
          </div>
        ) : null}
      </Flex>
    </div>
  );
};
