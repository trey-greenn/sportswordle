import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>SportsWordle - Play the Sports-Themed Wordle Game</title>
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-4FVXM212R7"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4FVXM212R7');
            `,
          }}
        />
        {/* SEO Meta Description */}
        <meta name="description" content="SportsWordle is a platform where you can enjoy a sports-themed wordle game, guessing mystery sports players in a fun and interactive way." />
        <meta name="keywords" content="sports wordle, sports game, wordle game, guess sports players, sports puzzle" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="SportsWordle - Play the Sports-Themed Wordle Game" />
        <meta property="og:description" content="Enjoy a sports-themed wordle game, guessing mystery sports players in a fun and interactive way." />
        <meta property="og:image" content="https://www.sportswordle.com/og-image.jpg" />
        <meta property="og:url" content="https://www.sportswordle.com/" />
        <meta property="og:type" content="website" />
        <meta charSet="UTF-8" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}