import "@/styles/styles.css"
import '@/styles/globals.css'
import "@/components/HeaderNavigationBar/navbarStyling.css"
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
