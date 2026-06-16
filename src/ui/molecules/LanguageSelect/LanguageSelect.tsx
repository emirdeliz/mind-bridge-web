import type { AppLanguage } from '@api';
import { Button, Flex } from '@atoms';
import { APP_LANGUAGES, LANGUAGE_LABELS } from '@i18n';

interface LanguageSelectProps {
  value: AppLanguage;
  onChange: (language: AppLanguage) => void;
}

export const LanguageSelect = ({ value, onChange }: LanguageSelectProps) => (
  <Flex row alignCenter gap2 wrap>
    {APP_LANGUAGES.map((lang) => (
      <Button
        key={lang}
        type='button'
        chip
        selected={value === lang}
        onClick={() => onChange(lang)}
      >
        {LANGUAGE_LABELS[lang]}
      </Button>
    ))}
  </Flex>
);
