import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const CTASection: React.FC = () => {
  return (
    <div className="bg-primary-600">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to find your match?</span>
          <span className="block text-primary-200">Start your journey today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link to="/swipe">
              <Button 
                variant="secondary"
                size="lg"
                className="text-primary-600"
              >
                Get Started
              </Button>
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link to="/projects">
              <Button 
                variant="outline"
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;