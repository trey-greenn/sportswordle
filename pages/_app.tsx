import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import { DefaultSeo } from 'next-seo';

export default function App({ Component, pageProps }: AppProps) {
  useGoogleAnalytics();

  return (
    <>
      <DefaultSeo
        title="SportsWordle - Play the Sports-Themed Wordle Game"
        description="Guess the mystery sports player in 8 tries or less. A daily word game for sports fans with players from MLB, NBA, NFL, NHL and more."
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: 'https://sportswordle.com/',
          siteName: 'SportsWordle',
          images: [
            {
              url: 'https://sportswordle.com/og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'SportsWordle',
            },
          ],
        }}
        twitter={{
          handle: '@sportswordle',
          site: '@sportswordle',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'theme-color',
            content: '#ffffff',
          },
          {
            name: 'application-name',
            content: 'SportsWordle',
          }
        ]}
      />
      <Component {...pageProps} />
    </>
  );
}
