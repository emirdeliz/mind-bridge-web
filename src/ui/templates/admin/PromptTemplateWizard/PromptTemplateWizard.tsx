'use client';

import { useEffect, useMemo, useState } from 'react';

import type {
  AiPromptTokenDefinitionDto,
  AppLanguage,
  TestPromptTemplateBodyDto,
  TestPromptTemplateResultDto,
} from '@api';
import { Button, Flex, Icon, Input, Loading, Title } from '@atoms';
import { translateTemplate, useI18n } from '@i18n';
import { FormGroup, Switch } from '@molecules';
import { PromptTemplateTestPanel } from '../PromptTemplateTestPanel/PromptTemplateTestPanel';

import {
  composePromptGuidanceDraft,
  moveTokenInList,
  orderTokensForWizard,
  parsePromptGuidanceDraft,
  type PromptGuidanceDraft,
} from './promptGuidanceDraft';

const WIZARD_STEPS = [1, 2, 3] as const;
type WizardStep = (typeof WIZARD_STEPS)[number];

/** Generic auto-fill copy — not useful as an "origin" explanation in the wizard. */
const GENERIC_AUTO_SOURCE = new Set([
  'Preenchido automaticamente pelo aplicativo a cada mensagem.',
  'Filled automatically by the app on each message.',
  'Completado automáticamente por la aplicación en cada mensaje.',
]);

const shouldShowTokenSource = (source: string): boolean => {
  const trimmed = source.trim();
  return Boolean(trimmed) && !GENERIC_AUTO_SOURCE.has(trimmed);
};

type PromptTemplateWizardProps = {
  templateKey: string;
  category: string;
  initialContent: string;
  allowedTokens: string[];
  tokens: AiPromptTokenDefinitionDto[];
  disabled?: boolean;
  saving?: boolean;
  testingPrompt?: boolean;
  enablePromptTest?: boolean;
  onDraftChange: (composed: string) => void;
  onTestPrompt?: (
    body: TestPromptTemplateBodyDto
  ) => Promise<TestPromptTemplateResultDto>;
};

export const PromptTemplateWizard = ({
  templateKey,
  category,
  initialContent,
  allowedTokens,
  tokens,
  disabled = false,
  saving = false,
  testingPrompt = false,
  enablePromptTest = false,
  onDraftChange,
  onTestPrompt,
}: PromptTemplateWizardProps) => {
  const { t, language } = useI18n();
  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<PromptGuidanceDraft>(() =>
    parsePromptGuidanceDraft(initialContent, allowedTokens)
  );

  useEffect(() => {
    setDraft(parsePromptGuidanceDraft(initialContent, allowedTokens));
    setStep(1);
  }, [allowedTokens, initialContent]);

  const composed = useMemo(
    () => composePromptGuidanceDraft(draft),
    [draft]
  );

  useEffect(() => {
    onDraftChange(composed);
  }, [composed, onDraftChange]);

  const wizardTokens = useMemo(
    () => orderTokensForWizard(tokens, allowedTokens, draft.enabledTokens),
    [allowedTokens, draft.enabledTokens, tokens]
  );

  const enabledSet = useMemo(
    () => new Set(draft.enabledTokens),
    [draft.enabledTokens]
  );

  const hasBlocks = allowedTokens.length > 0;
  const visibleSteps = useMemo(
    () => (hasBlocks ? ([1, 2, 3] as WizardStep[]) : ([1, 3] as WizardStep[])),
    [hasBlocks]
  );

  useEffect(() => {
    if (!hasBlocks && step === 2) {
      setStep(1);
    }
  }, [hasBlocks, step]);

  const updateIntro = (intro: string) => {
    setDraft((current) => ({ ...current, intro }));
  };

  const goToAdjacentStep = (direction: -1 | 1) => {
    const index = visibleSteps.indexOf(step);
    const next = visibleSteps[index + direction];
    if (next) {
      goToStep(next);
    }
  };

  const toggleToken = (tokenKey: string, enabled: boolean) => {
    setDraft((current) => {
      if (enabled) {
        if (current.enabledTokens.includes(tokenKey)) {
          return current;
        }
        return {
          ...current,
          enabledTokens: [...current.enabledTokens, tokenKey],
        };
      }
      return {
        ...current,
        enabledTokens: current.enabledTokens.filter((key) => key !== tokenKey),
      };
    });
  };

  const reorderEnabled = (tokenKey: string, direction: -1 | 1) => {
    setDraft((current) => ({
      ...current,
      enabledTokens: moveTokenInList(
        current.enabledTokens,
        tokenKey,
        direction
      ),
    }));
  };

  const tokenLabel = (token: AiPromptTokenDefinitionDto) =>
    token.label[language as AppLanguage] ?? token.label.pt;

  const tokenDescription = (token: AiPromptTokenDefinitionDto) =>
    token.description[language as AppLanguage] ?? token.description.pt;

  const tokenSource = (token: AiPromptTokenDefinitionDto) =>
    token.source[language as AppLanguage] ?? token.source.pt;

  const goToStep = (next: WizardStep) => {
    if (!disabled && !saving && visibleSteps.includes(next)) {
      setStep(next);
    }
  };

  const stepIndex = visibleSteps.indexOf(step);
  const isFirstStep = stepIndex <= 0;
  const isLastStep = stepIndex >= visibleSteps.length - 1;

  return (
    <Flex col wFull gap5>
      <nav aria-label={t('PROMPT_WIZARD_STEPS_LABEL')}>
        <ol className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3'>
          {visibleSteps.map((item, index) => {
            const active = step === item;
            const done = stepIndex > index;
            return (
              <li key={item} className='flex items-center gap-2'>
                <button
                  type='button'
                  disabled={disabled || saving}
                  onClick={() => goToStep(item)}
                  className={[
                    'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition',
                    active
                      ? 'border-mb-accent/50 bg-mb-accent/10 text-mb-text'
                      : done
                        ? 'border-mb-border/70 bg-mb-surface-elevated text-mb-text'
                        : 'border-mb-border/50 text-mb-muted',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      active || done
                        ? 'bg-mb-accent text-white'
                        : 'bg-mb-surface text-mb-muted',
                    ].join(' ')}
                  >
                    {index + 1}
                  </span>
                  <span className='font-medium'>
                    {t(`PROMPT_WIZARD_STEP_${item}_TITLE`)}
                  </span>
                </button>
                {index < visibleSteps.length - 1 ? (
                  <span className='hidden text-mb-muted sm:inline' aria-hidden>
                    →
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      <Title hint gray block leadingRelaxed>
        {t(
          step === 1 && !hasBlocks
            ? 'PROMPT_WIZARD_STEP_1_HINT_TEXT_ONLY'
            : `PROMPT_WIZARD_STEP_${step}_HINT`
        )}
      </Title>

      {step === 1 ? (
        <FormGroup
          label={t(
            hasBlocks
              ? 'PROMPT_WIZARD_ROLE_LABEL'
              : 'PROMPT_WIZARD_TEXT_ONLY_LABEL'
          )}
          helpText={t(
            hasBlocks
              ? 'PROMPT_WIZARD_ROLE_HELP'
              : 'PROMPT_WIZARD_TEXT_ONLY_HELP'
          )}
        >
          <Input.TextArea
            rows={hasBlocks ? 8 : 12}
            value={draft.intro}
            disabled={disabled || saving}
            placeholder={t(
              hasBlocks
                ? 'PROMPT_WIZARD_ROLE_PLACEHOLDER'
                : 'PROMPT_WIZARD_TEXT_ONLY_PLACEHOLDER'
            )}
            onChange={(event) => updateIntro(event.target.value)}
          />
        </FormGroup>
      ) : null}

      {step === 2 && hasBlocks ? (
        <Flex col wFull alignStretch gap4>
          <Title hint gray block leadingRelaxed>
            {t('PROMPT_WIZARD_BLOCKS_HELP')}
          </Title>
          {wizardTokens.map((token) => {
            const enabled = enabledSet.has(token.key);
            const enabledIndex = draft.enabledTokens.indexOf(token.key);
            const source = tokenSource(token);
            const showSource = shouldShowTokenSource(source);
            return (
              <div
                key={token.key}
                className='w-full rounded-xl border border-mb-border/70 bg-mb-surface-elevated/60 px-4 py-3'
              >
                <Flex row wFull alignStart justifySpaceBetween gap4>
                  <Flex col flex1 gap2>
                    <Title s2 fw3 block>
                      {tokenLabel(token)}
                    </Title>
                    <Title hint gray block leadingRelaxed>
                      {tokenDescription(token)}
                    </Title>
                    {showSource ? (
                      <p className='border-l border-mb-accent/35 pl-3 text-xs leading-relaxed text-mb-muted'>
                        <span className='mr-1.5 font-semibold tracking-wide text-mb-muted/90'>
                          {t('ADMIN_PROMPTS_TOKEN_SOURCE_LABEL')}
                        </span>
                        <span className='text-mb-muted/75'>{source}</span>
                      </p>
                    ) : null}
                  </Flex>
                  <Switch
                    sm
                    id={`wizard-token-${token.key}`}
                    selected={enabled}
                    disabled={disabled || saving}
                    onChange={(value) => toggleToken(token.key, value)}
                  />
                </Flex>
                {enabled ? (
                  <Flex row alignCenter gap2 mt2>
                    <span className='text-xs text-mb-muted'>
                      {translateTemplate(t('PROMPT_WIZARD_BLOCK_POSITION'), {
                        position: enabledIndex + 1,
                      })}
                    </span>
                    <Button
                      type='button'
                      icon
                      variant='secondary'
                      clickable={!disabled && !saving && enabledIndex > 0}
                      title={t('PROMPT_WIZARD_MOVE_UP')}
                      onClick={() => reorderEnabled(token.key, -1)}
                    >
                      <Icon.UpOpen sm />
                    </Button>
                    <Button
                      type='button'
                      icon
                      variant='secondary'
                      clickable={
                        !disabled &&
                        !saving &&
                        enabledIndex >= 0 &&
                        enabledIndex < draft.enabledTokens.length - 1
                      }
                      title={t('PROMPT_WIZARD_MOVE_DOWN')}
                      onClick={() => reorderEnabled(token.key, 1)}
                    >
                      <Icon.DownOpen sm />
                    </Button>
                  </Flex>
                ) : null}
              </div>
            );
          })}
        </Flex>
      ) : null}

      {step === 3 ? (
        <Flex col wFull gap4>
          {enablePromptTest && onTestPrompt ? (
            <PromptTemplateTestPanel
              templateKey={templateKey}
              category={category}
              draft={composed}
              language={language}
              testing={testingPrompt}
              onTest={onTestPrompt}
            />
          ) : (
            <Title hint gray block leadingRelaxed>
              {t('PROMPT_WIZARD_TEST_UNAVAILABLE')}
            </Title>
          )}

          {saving ? (
            <div className='flex w-full items-center gap-2'>
              <Loading />
              <Title s2 gray block>
                {t('ADMIN_PROMPTS_SAVING_TRANSLATING')}
              </Title>
            </div>
          ) : null}
        </Flex>
      ) : null}

      <Flex row wFull justifySpaceBetween gap2 wrap>
        <Button
          type='button'
          variant='secondary'
          outlined
          clickable={!disabled && !saving && !isFirstStep}
          onClick={() => goToAdjacentStep(-1)}
        >
          <Flex row alignCenter gap2>
            <Icon.LeftOpen sm />
            {t('PROMPT_WIZARD_BACK')}
          </Flex>
        </Button>
        {!isLastStep ? (
          <Button
            type='button'
            clickable={!disabled && !saving}
            onClick={() => goToAdjacentStep(1)}
          >
            <Flex row alignCenter gap2>
              {t('PROMPT_WIZARD_NEXT')}
              <Icon.RightOpen sm />
            </Flex>
          </Button>
        ) : (
          <Title hint gray block>
            {t('PROMPT_WIZARD_STEP_3_FOOTER')}
          </Title>
        )}
      </Flex>
    </Flex>
  );
};
