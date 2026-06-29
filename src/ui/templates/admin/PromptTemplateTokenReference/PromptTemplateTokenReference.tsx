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
  const [expandedKey, setExpandedKey] = useState<string | null>(
    variant === 'sidebar' ? (tokens[0]?.key ?? null) : null
  );

  if (!tokens.length) {
    return null;
  }

  const isSidebar = variant === 'sidebar';

  return (
    <div className={isSidebar ? 'flex flex-col gap-2' : 'flex flex-col gap-3'}>
      {tokens.map((token) => {
        const preview = resolveLocalized(token.preview, language).trim();
        const source = resolveLocalized(token.source, language);
        const label = resolveLocalized(token.label, language);
        const description = resolveLocalized(token.description, language);
        const isExpanded = isSidebar ? expandedKey === token.key : true;

        const toggleExpanded = () => {
          if (!isSidebar) {
            return;
          }
          setExpandedKey((current) =>
            current === token.key ? null : token.key
          );
        };

        return (
          <div
            key={token.key}
            className={[
              'rounded-xl border border-mb-border/70 bg-mb-surface/40',
              isSidebar ? 'overflow-hidden' : 'p-3',
            ].join(' ')}
          >
            <button
              type='button'
              className={[
                'flex w-full items-start gap-2 text-left',
                isSidebar ? 'p-3 transition-colors hover:bg-mb-surface/60' : 'cursor-default',
              ].join(' ')}
              onClick={toggleExpanded}
              aria-expanded={isSidebar ? isExpanded : undefined}
            >
              <div className='min-w-0 flex-1'>
                <div className='mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1'>
                  <span className='font-mono text-sm font-semibold text-mb-accent'>
                    #{token.key}
                  </span>
                  <Title s2 fw3 block>
                    {label}
                  </Title>
                </div>
                {!isSidebar || !isExpanded ? (
                  <Title hint gray block leadingRelaxed>
                    {description}
                  </Title>
                ) : null}
              </div>
              {isSidebar ? (
                <Icon.RightOpen xxs rotate90={isExpanded} />
              ) : null}
            </button>

            {isExpanded ? (
              <div className={isSidebar ? 'border-t border-mb-border/50 px-3 pb-3 pt-2' : ''}>
                {isSidebar ? (
                  <Title hint gray mb2 block leadingRelaxed>
                    {description}
                  </Title>
                ) : null}

                <Title s2 gray mb1 block>
                  {t('ADMIN_PROMPTS_TOKEN_SOURCE_LABEL')}
                </Title>
                <Title hint gray mb2 block leadingRelaxed>
                  {source}
                </Title>

                {preview ? (
                  <>
                    <Title s2 gray mb1 block>
                      {t('ADMIN_PROMPTS_TOKEN_PREVIEW_LABEL')}
                    </Title>
                    <pre
                      className={[
                        'overflow-y-auto whitespace-pre-wrap rounded-lg border border-mb-border/60 bg-mb-surface/80 p-3 font-mono text-xs leading-relaxed text-mb-text',
                        isSidebar ? 'max-h-40' : 'max-h-48',
                      ].join(' ')}
                    >
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
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
