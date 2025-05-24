import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Find your dream</span>
              <span className="block text-primary-600">startup team</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with the perfect match for your IT project or join an exciting startup. 
              Swipe, match, and build something amazing together.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link to="/swipe">
                  <Button 
                    size="lg"
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Start Swiping
                  </Button>
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link to="/projects">
                  <Button 
                    variant="outline"
                    size="lg"
                  >
                    Browse Projects
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;