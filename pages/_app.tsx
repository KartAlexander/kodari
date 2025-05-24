import { AuthProvider } from '../contexts/AuthContext';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Layout from '../components/layout/Layout'; // Import your Layout component
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout> {/* Wrap Component with Layout */}
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#000000" /> {/* Example theme color */}
          <meta name="author" content="Kodari Team" />
          {/* General fallback title and description, can be overridden by pages */}
          <title>Kodari - Connect and Collaborate</title>
          <meta name="description" content="Kodari is a platform to find co-founders, specialists, and projects to collaborate on. Join our community of innovators." />
          <link rel="icon" href="/favicon.ico" /> {/* Assuming favicon.ico is in public folder */}
          
          {/* Open Graph general fallback tags */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Kodari" />
          <meta property="og:url" content="https://www.kodari.com/" /> {/* Replace with actual domain */}
          <meta property="og:title" content="Kodari - Connect and Collaborate" />
          <meta property="og:description" content="Kodari is a platform to find co-founders, specialists, and projects to collaborate on." />
          <meta property="og:image" content="https://www.kodari.com/og-image.png" /> {/* Replace with actual default OG image URL */}
          
          {/* Twitter Card general fallback tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Kodari - Connect and Collaborate" />
          <meta name="twitter:description" content="Kodari is a platform to find co-founders, specialists, and projects to collaborate on." />
          <meta name="twitter:image" content="https://www.kodari.com/twitter-image.png" /> {/* Replace with actual default Twitter image URL */}

        </Head>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
