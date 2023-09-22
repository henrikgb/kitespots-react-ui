// Importing global styles that will be applied across all pages.
import "@/styles/styles.css";
import '@/styles/globals.css';
import "@/components/HeaderNavigationBar/navbarStyling.css";
import "@/i18n/i18n";
import HeaderNavBar from "@/components/HeaderNavigationBar/HeaderNavBar";

// The AppProps type includes `Component` and `pageProps` properties.
// `Component` is the active page, and `pageProps` are its incoming props.
import type { AppProps } from 'next/app';
import useThemeStore from "@/store/themeStore";

// This custom App component initializes all pages in the Next.js application.
// It allows for setting global components like the HeaderNavBar or for keeping shared state across pages.
export default function App({ Component, pageProps }: AppProps) {
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
