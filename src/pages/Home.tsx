import React from 'react';
import Hero from '../components/home/Hero';
import FeatureSection from '../components/home/FeatureSection';
import HowItWorks from '../components/home/HowItWorks';
import TestimonialSection from '../components/home/TestimonialSection';
import CTASection from '../components/home/CTASection';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <FeatureSection />
      <HowItWorks />
      <TestimonialSection />
      <CTASection />
    </div>
  );
};

export default Home;