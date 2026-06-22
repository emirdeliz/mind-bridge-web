import type { AppProps } from 'next/app';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { useEffect } from 'react';

import { I18nProvider, ProfileLanguageSync } from '@i18n';
import { Toast, ToastProvider } from '@molecules';
import {
  AuthProvider,
  type AuthPageProps,
} from '../services/auth/AuthProvider';
import '@styles/globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

type PagePropsWithAuth = {
  auth?: AuthPageProps;
};

const App = ({ Component, pageProps }: AppProps<PagePropsWithAuth>) => {
  useEffect(() => {
    document.documentElement.classList.add(jakarta.variable);
    document.body.classList.add(jakarta.className);
    return () => {
      document.documentElement.classList.remove(jakarta.variable);
      document.body.classList.remove(jakarta.className);
    };
  }, []);

  return (
    <I18nProvider>
      <AuthProvider initialAuth={pageProps.auth}>
        <ToastProvider>
          <ProfileLanguageSync />
          <div
            className={`${jakarta.variable} ${jakarta.className} min-h-screen font-sans`}
          >
            <Component {...pageProps} />
          </div>
          <Toast />
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
};

export default App;
