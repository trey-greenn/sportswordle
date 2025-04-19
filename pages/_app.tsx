import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics'

export default function App({ Component, pageProps }: AppProps) {
  useGoogleAnalytics()

  return <Component {...pageProps} />;
}
