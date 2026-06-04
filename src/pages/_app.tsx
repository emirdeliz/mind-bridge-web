import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useEffect } from "react";

import { I18nProvider, ProfileLanguageSync } from "@i18n";
import { AuthProvider, type AuthPageProps } from "../services/auth/AuthProvider";
import "@styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

type PagePropsWithAuth = {
  auth?: AuthPageProps;
};

const App = ({ Component, pageProps }: AppProps<PagePropsWithAuth>) => {
  useEffect(() => {
    document.documentElement.classList.add(inter.variable);
    document.body.classList.add(inter.className);
    return () => {
      document.documentElement.classList.remove(inter.variable);
      document.body.classList.remove(inter.className);
    };
  }, []);

  return (
    <I18nProvider>
      <AuthProvider initialAuth={pageProps.auth}>
        <ProfileLanguageSync />
        <div className={`${inter.variable} ${inter.className} min-h-screen font-sans`}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </I18nProvider>
  );
};

export default App;
