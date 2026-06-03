import type { AppProps } from "next/app";

import { I18nProvider } from "@i18n";
import "@styles/globals.css";

const App = ({ Component, pageProps }: AppProps) => (
  <I18nProvider>
    <Component {...pageProps} />
  </I18nProvider>
);

export default App;
