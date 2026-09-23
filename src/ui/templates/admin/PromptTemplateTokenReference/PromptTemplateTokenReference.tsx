'use client';

import { useState } from 'react';

import type { AiPromptTokenDefinitionDto, AppLanguage } from '@api';
import { Button, Icon, Title } from '@atoms';
import { useI18n } from '@i18n';

type PromptTemplateTokenReferenceProps = {
  tokens: AiPromptTokenDefinitionDto[];
  variant?: 'full' | 'sidebar';
  onInsertToken?: (tokenKey: string) => void;
};

const resolveLocalized = (
  record: Record<AppLanguage, string>,
  language: AppLanguage
): string => record[language] ?? record.pt;

export const PromptTemplateTokenReference = ({
  tokens,
  variant = 'full',
  onInsertToken,
}: PromptTemplateTokenReferenceProps) => {
  const { t, language } = useI18n();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(null);

  if (!tokens.length) {
    return null;
  }

  const isSidebar = variant === 'sidebar';

  return (
    <div className={isSidebar ? 'flex flex-col gap-1.5' : 'flex flex-col gap-3'}>
      {tokens.map((token) => {
        const preview = resolveLocalized(token.preview, language).trim();
        const source = resolveLocalized(token.source, language);
        const label = resolveLocalized(token.label, language);
        const description = resolveLocalized(token.description, language);
        const isExpanded = isSidebar ? expandedKey === token.key : true;
        const showExample = isSidebar && previewKey === token.key;

        return (
          <div
            key={token.key}
            className={[
              'rounded-lg border border-mb-border/60 bg-mb-surface/40',
              isSidebar ? 'overflow-hidden' : 'rounded-xl p-3',
            ].join(' ')}
          >
            <button
              type='button'
              className={[
                'flex w-full items-center gap-2 text-left',
                isSidebar
                  ? 'px-2.5 py-2 transition-colors hover:bg-mb-surface/60'
                  : 'cursor-default',
              ].join(' ')}
              onClick={() => {
                if (!isSidebar) {
                  return;
                }
                setExpandedKey((current) =>
                  current === token.key ? null : token.key
                );
                setPreviewKey(null);
              }}
              aria-expanded={isSidebar ? isExpanded : undefined}
            >
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                  <span className='font-mono text-xs font-semibold text-mb-accent'>
                    #{token.key}
                  </span>
                  <Title s2 fw3 block>
                    {label}
                  </Title>
                </div>
                {!isSidebar ? (
                  <Title hint gray mt2 block leadingRelaxed>
                    {description}
                  </Title>
                ) : null}
              </div>
              {isSidebar ? (
                <Icon.RightOpen xxs rotate90={isExpanded} />
              ) : null}
            </button>

            {isExpanded ? (
              <div
                className={
                  isSidebar
                    ? 'border-t border-mb-border/40 px-2.5 pb-2.5 pt-2'
                    : 'mt-2'
                }
              >
                {isSidebar ? (
                  <Title hint gray mb2 block leadingRelaxed>
                    {description}
                  </Title>
                ) : (
                  <>
                    <Title s2 gray mb1 block>
                      {t('ADMIN_PROMPTS_TOKEN_SOURCE_LABEL')}
                    </Title>
                    <Title hint gray mb2 block leadingRelaxed>
                      {source}
                    </Title>
                  </>
                )}

                {isSidebar ? (
                  <div className='flex flex-wrap gap-2'>
                    {onInsertToken ? (
                      <Button
                        type='button'
                        xs
                        sm
                        variant='secondary'
                        outlined
                        onClick={() => onInsertToken(token.key)}
                      >
                        {t('ADMIN_PROMPTS_TOKEN_INSERT')}
                      </Button>
                    ) : null}
                    {preview ? (
                      <Button
                        type='button'
                        xs
                        sm
                        variant='secondary'
                        outlined
                        onClick={() =>
                          setPreviewKey((current) =>
                            current === token.key ? null : token.key
                          )
                        }
                      >
                        {showExample
                          ? t('ADMIN_PROMPTS_TOKEN_HIDE_EXAMPLE')
                          : t('ADMIN_PROMPTS_TOKEN_SHOW_EXAMPLE')}
                      </Button>
                    ) : null}
                  </div>
                ) : null}

                {showExample && preview ? (
                  <pre className='mt-2 max-h-28 overflow-y-auto whitespace-pre-wrap rounded-lg border border-mb-border/60 bg-mb-surface/80 p-2.5 font-mono text-[11px] leading-relaxed text-mb-text'>
                    {preview}
                  </pre>
                ) : null}

                {!isSidebar ? (
                  <>
                    {preview ? (
                      <>
                        <Title s2 gray mb1 block>
                          {t('ADMIN_PROMPTS_TOKEN_PREVIEW_LABEL')}
                        </Title>
                        <pre className='max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-mb-border/60 bg-mb-surface/80 p-3 font-mono text-xs leading-relaxed text-mb-text'>
                          {preview}
                        </pre>
                      </>
                    ) : (
                      <span className='block text-sm italic leading-relaxed text-mb-muted'>
                        {t('ADMIN_PROMPTS_TOKEN_PREVIEW_EMPTY')}
                      </span>
                    )}
                    {onInsertToken ? (
                      <div className='mt-3'>
                        <Button
                          type='button'
                          xs
                          sm
                          variant='secondary'
                          outlined
                          onClick={() => onInsertToken(token.key)}
                        >
                          {t('ADMIN_PROMPTS_TOKEN_INSERT')}
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
