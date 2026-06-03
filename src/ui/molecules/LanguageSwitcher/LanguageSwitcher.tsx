import { useI18n } from "@i18n";
import { LanguageSelect } from "../LanguageSelect/LanguageSelect";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();

  return <LanguageSelect value={language} onChange={setLanguage} />;
};
