import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { useEffect } from "react";

import { I18nProvider } from "@i18n";
import "@styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const App = ({ Component, pageProps }: AppProps) => {
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
      <div className={`${inter.variable} ${inter.className} min-h-screen font-sans`}>
        <Component {...pageProps} />
      </div>
    </I18nProvider>
  );
};

export default App;
