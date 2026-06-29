'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import type { AiPromptTokenDefinitionDto, AppLanguage } from '@api';
import { Title } from '@atoms';
import { useI18n } from '@i18n';

type PromptTemplateEditorProps = {
  value: string;
  onChange: (value: string) => void;
  tokens: AiPromptTokenDefinitionDto[];
  allowedTokens?: string[];
  disabled?: boolean;
  rows?: number;
};

type MentionState = {
  start: number;
  query: string;
};

const TOKEN_INSERT_PATTERN = /#([a-z_]*)/i;

export const PromptTemplateEditor = ({
  value,
  onChange,
  tokens,
  allowedTokens,
  disabled = false,
  rows = 16,
}: PromptTemplateEditorProps) => {
  const { language, t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mention, setMention] = useState<MentionState | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const availableTokens = useMemo(() => {
    const allowed = allowedTokens?.length ? new Set(allowedTokens) : null;

    return tokens.filter((token) => !allowed || allowed.has(token.key));
  }, [allowedTokens, tokens]);

  const suggestions = useMemo(() => {
    if (!mention) {
      return [];
    }

    const query = mention.query.toLowerCase();
    return availableTokens.filter((token) =>
      token.key.toLowerCase().includes(query)
    );
  }, [availableTokens, mention]);

  const closeMention = useCallback(() => {
    setMention(null);
    setActiveIndex(0);
  }, []);

  const detectMention = useCallback(
    (content: string, cursor: number) => {
      const beforeCursor = content.slice(0, cursor);
      const match = beforeCursor.match(/#([a-z_]*)$/i);

      if (!match) {
        closeMention();
        return;
      }

      setMention({
        start: cursor - match[0].length,
        query: match[1] ?? '',
      });
      setActiveIndex(0);
    },
    [closeMention]
  );

  const insertToken = useCallback(
    (tokenKey: string) => {
      if (!mention || !textareaRef.current) {
        return;
      }

      const cursor = textareaRef.current.selectionStart ?? value.length;
      const before = value.slice(0, mention.start);
      const after = value.slice(cursor);
      const insertion = `#${tokenKey}`;
      const nextValue = `${before}${insertion}${after}`;
      const nextCursor = before.length + insertion.length;

      onChange(nextValue);
      closeMention();

      requestAnimationFrame(() => {
        const element = textareaRef.current;
        if (!element) {
          return;
        }
        element.focus();
        element.setSelectionRange(nextCursor, nextCursor);
      });
    },
    [closeMention, mention, onChange, value]
  );

  const handleChange = (nextValue: string) => {
    onChange(nextValue);
    const cursor = textareaRef.current?.selectionStart ?? nextValue.length;
    detectMention(nextValue, cursor);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mention || !suggestions.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + suggestions.length) % suggestions.length
      );
      return;
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      insertToken(suggestions[activeIndex]?.key ?? suggestions[0].key);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMention();
    }
  };

  useEffect(() => {
    if (activeIndex >= suggestions.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, suggestions.length]);

  const resolveLocalized = (record: Record<AppLanguage, string>): string =>
    record[language] ?? record.pt;

  return (
    <div className='relative w-full'>
      <textarea
        ref={textareaRef}
        value={value}
        disabled={disabled}
        rows={rows}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onClick={(event) =>
          detectMention(
            event.currentTarget.value,
            event.currentTarget.selectionStart ?? 0
          )
        }
        onBlur={() => {
          window.setTimeout(closeMention, 120);
        }}
        className='mb-field mb-prompt-template-editor block w-full min-h-[280px] resize-y font-mono text-sm leading-relaxed input-focus-primary'
        spellCheck={false}
      />

      {mention && suggestions.length ? (
        <div
          className='mb-prompt-template-mention-list absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-mb-border/80 bg-mb-surface-elevated shadow-card'
          role='listbox'
        >
          {suggestions.map((token, index) => (
            <button
              key={token.key}
              type='button'
              role='option'
              aria-selected={index === activeIndex}
              className={[
                'flex w-full flex-col gap-1 border-b border-mb-border/40 px-3 py-2 text-left last:border-b-0',
                index === activeIndex
                  ? 'bg-mb-primary/15 text-mb-text'
                  : 'text-mb-text hover:bg-mb-surface/80',
              ].join(' ')}
              onMouseDown={(event) => {
                event.preventDefault();
                insertToken(token.key);
              }}
            >
              <span className='font-mono text-sm font-semibold text-mb-accent'>
                #{token.key}
              </span>
              <span className='text-xs text-mb-muted'>
                {resolveLocalized(token.label)}
              </span>
              <span className='text-xs leading-relaxed text-mb-muted'>
                {resolveLocalized(token.description)}
              </span>
              <span className='text-xs leading-relaxed text-mb-muted/90'>
                {resolveLocalized(token.source)}
              </span>
              {resolveLocalized(token.preview).trim() ? (
                <span className='line-clamp-3 font-mono text-[11px] leading-relaxed text-mb-muted/80'>
                  {resolveLocalized(token.preview)}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <Title hint gray mt2 block leadingRelaxed>
        {t('ADMIN_PROMPTS_EDITOR_HINT')}
      </Title>

      {value.match(TOKEN_INSERT_PATTERN) ? (
        <Title textXs gray mt2 block leadingRelaxed>
          {t('ADMIN_PROMPTS_EDITOR_DETECTED_TOKENS')}:{' '}
          {[...new Set([...value.matchAll(/#([a-z_]+)/gi)].map((m) => m[1]))]
            .map((token) => `#${token}`)
            .join(', ')}
        </Title>
      ) : null}
    </div>
  );
};
