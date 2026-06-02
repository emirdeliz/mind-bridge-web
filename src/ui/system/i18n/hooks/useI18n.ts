import { useContext } from 'react';
import { I18nContext } from '../context/I18nContext';

export const useI18n = () => {
  const { t, language, setLanguage } = useContext(I18nContext);
  return { t, language, setLanguage };
};
