import { Button, Flex } from "@atoms";
import { useI18n } from "@i18n";

const LANGUAGES = ["en", "pt", "es"] as const;

const LANGUAGE_LABELS: Record<(typeof LANGUAGES)[number], string> = {
  en: "EN",
  pt: "PT-BR",
  es: "ES",
};

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();

  return (
    <Flex row alignCenter gap2>
      {LANGUAGES.map((lang) => (
        <Button
          key={lang}
          type="button"
          chip
          selected={language === lang}
          onClick={() => setLanguage(lang)}
        >
          {LANGUAGE_LABELS[lang]}
        </Button>
      ))}
    </Flex>
  );
};
