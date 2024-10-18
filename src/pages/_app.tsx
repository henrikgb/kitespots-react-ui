import "@/styles/styles.css";
import '@/styles/globals.css';
import "@/components/headerNavigationBar/navbarStyling.css";
import HeaderNavBar from "@/components/headerNavigationBar/HeaderNavBar";
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import useThemeStore from "@/store/themeStore";
import "@/styles/styles.css";
import { SessionProvider } from "next-auth/react";

// This custom App component initializes all pages in the Next.js application.
// It allows for setting global components like the HeaderNavBar or for keeping shared state across pages.
function App({ Component, pageProps: { session, ...pageProps} }: AppProps) {
  const {theme} = useThemeStore();
  return (
    <SessionProvider session={session}>
      <div className={`main ${theme}`}>
        <HeaderNavBar />
        <div className="page-body">
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
}
export default appWithTranslation(App);