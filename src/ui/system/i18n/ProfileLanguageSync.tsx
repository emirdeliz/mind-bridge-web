import { useEffect } from 'react';

import { useAuth } from '@services';
import { useI18n } from './hooks/useI18n';

/** Applies `profile.language` from the active session to the UI locale. */
export const ProfileLanguageSync = () => {
  const { session, loading } = useAuth();
  const { setLanguage } = useI18n();

  useEffect(() => {
    if (loading || !session?.profile?.language) return;
    setLanguage(session.profile.language);
  }, [loading, session, setLanguage]);

  return null;
};
