'use client';

import { useRouter } from 'next/router';
import { useMemo } from 'react';

import type { AiPromptTemplateListItemDto } from '@api';
import { Button, Flex, Icon, Loading, Title } from '@atoms';
import { useI18n } from '@i18n';
import { Card } from '@molecules';
import { usePsychologistPromptTemplates } from '@services';

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  patient_chat: 'ADMIN_PROMPTS_CATEGORY_PATIENT_CHAT',
  psychologist_copilot: 'ADMIN_PROMPTS_CATEGORY_PSYCHOLOGIST_COPILOT',
  shared: 'ADMIN_PROMPTS_CATEGORY_SHARED',
};

export const PsychologistPromptTemplatesPanel = () => {
  const router = useRouter();
  const { t, language } = useI18n();
  const { templates, loading, error } = usePsychologistPromptTemplates();

  const groupedTemplates = useMemo(() => {
    const groups = new Map<string, AiPromptTemplateListItemDto[]>();
    for (const template of templates) {
      const current = groups.get(template.category) ?? [];
      current.push(template);
      groups.set(template.category, current);
    }
    return [...groups.entries()];
  }, [templates]);

  return (
    <Card padding='lg' shadow='md'>
        <Title fs3 fw3 mb2 block>
          {t('PSYCHOLOGIST_PROMPTS_TITLE')}
        </Title>
        <Title hint gray mb4 block leadingRelaxed>
          {t('PSYCHOLOGIST_PROMPTS_SUBTITLE')}
        </Title>

        {error ? (
          <Title s2 error mb3 block>
            {error}
          </Title>
        ) : null}

        {loading ? (
          <Flex row wFull alignCenter gap2>
            <Loading />
          </Flex>
        ) : (
          <Flex col wFull gap4 alignStretch>
            {groupedTemplates.map(([category, items]) => (
              <Flex col wFull gap2 alignStretch key={category}>
                <Title s2 fw3 gray>
                  {t(
                    CATEGORY_LABEL_KEYS[category] ??
                      'ADMIN_PROMPTS_CATEGORY_OTHER'
                  )}
                </Title>
                {items.map((template) => (
                  <div
                    key={template.key}
                    className='mb-admin-prompt-card flex w-full max-w-full items-center justify-between gap-2 rounded-xl border border-mb-border/70 bg-mb-surface/60 px-3 py-3'
                  >
                    <Flex col gap1 flex1>
                      <Title s2 fw3 block>
                        {template.label[language] ?? template.label.pt}
                      </Title>
                      <Title hint gray block>
                        {template.description[language] ??
                          template.description.pt}
                      </Title>
                      {template.isCustomized ? (
                        <Title s2 textAccent block>
                          {t('ADMIN_PROMPTS_CUSTOMIZED_BADGE')}
                        </Title>
                      ) : null}
                    </Flex>
                    <Button
                      type='button'
                      variant='secondary'
                      outlined
                      onClick={() =>
                        void router.push(
                          `/psychologist/settings/prompts/${encodeURIComponent(template.key)}`
                        )
                      }
                    >
                        <Flex row alignCenter gap2>
                          <Icon.Pencil sm />
                          {t('ADMIN_PROMPTS_EDIT')}
                        </Flex>
                    </Button>
                  </div>
                ))}
              </Flex>
            ))}
          </Flex>
        )}
    </Card>
  );
};
