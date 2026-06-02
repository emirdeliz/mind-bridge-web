import { createContext, ReactNode, use, useCallback, useState } from 'react';
import en from '../dictionaries/en.json';
import es from '../dictionaries/es.json';
import pt from '../dictionaries/pt_br.json';

type Language = 'en' | 'es' | 'pt';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  i18n: {
    [key in Language]: {
      [key: string]: string;
    };
  };
  t: (key: string) => string;
}

const i18n: I18nContextType['i18n'] = {
  en,
  es,
  pt,
};

export const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  i18n: i18n,
  t: (key: string) => key,
});

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  const translate = useCallback(
    (key: string) => {
      return i18n[language][key];
    },
    [language]
  );

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        i18n,
        t: translate,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};
