// Importing global styles that will be applied across all pages.
import "@/styles/styles.css";
import '@/styles/globals.css';
import "@/components/headerNavigationBar/navbarStyling.css";
import HeaderNavBar from "@/components/headerNavigationBar/HeaderNavBar";
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import useThemeStore from "@/store/themeStore";
import "@/styles/styles.css";

// This custom App component initializes all pages in the Next.js application.
// It allows for setting global components like the HeaderNavBar or for keeping shared state across pages.
function App({ Component, pageProps }: AppProps) {
  const {theme} = useThemeStore();
  return (
    <div className={`main ${theme}`}>
      {/* The HeaderNavBar is included here to be available on all pages. */}
      <HeaderNavBar />
      {/* Render the current page component. */}
      <div className="page-body">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
export default appWithTranslation(App);