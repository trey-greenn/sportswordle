import Head from 'next/head';

type SEOProps = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'article';
  structuredData?: object | null;
};

const SEO = ({
  title = 'Sports Wordle - Guess the Mystery Sports Player',
  description = 'Dive into the exciting world of Sports Wordle, where you can test your knowledge of famous athletes across various sports. Challenge yourself to guess the mystery sports player in a limited number of tries. Perfect for sports enthusiasts looking to engage with their favorite athletes in a fun and interactive way.',
  url = 'www.sportswordle.com',
  image = '/sportswordle.png',
  type = 'website',
  structuredData = null,
}: SEOProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

export default SEO;
