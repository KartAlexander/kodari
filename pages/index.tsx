import React from 'react';
import Head from 'next/head';
import Hero from '../components/home/Hero';
import FeatureSection from '../components/home/FeatureSection';
import HowItWorks from '../components/home/HowItWorks';
import TestimonialSection from '../components/home/TestimonialSection';
import CTASection from '../components/home/CTASection';

const HomePage: React.FC = () => {
  const pageTitle = "Kodari | Find Your Startup Team & Co-founder";
  const pageDescription = "Kodari helps specialists and startup founders connect, collaborate, and build innovative projects. Discover opportunities and talent.";
  const pageUrl = "https://www.kodari.com/"; // Replace with actual domain
  const ogImageUrl = "https://www.kodari.com/og-image-home.png"; // Replace with actual home OG image

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>
      <div>
        <Hero />
        <FeatureSection />
        <HowItWorks />
        <TestimonialSection />
        <CTASection />
      </div>
    </>
  );
};

export default HomePage;
