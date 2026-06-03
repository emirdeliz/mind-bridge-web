import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

import { I18nProvider } from "@i18n";
import "@styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const App = ({ Component, pageProps }: AppProps) => (
  <I18nProvider>
    <div className={`${inter.variable} min-h-screen font-sans`}>
      <Component {...pageProps} />
    </div>
  </I18nProvider>
);

export default App;
