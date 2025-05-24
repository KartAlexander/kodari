import React from 'react';
import { Search, Users, Briefcase, MessageSquare } from 'lucide-react';

const features = [
  {
    name: 'Swipe & Match',
    description: 'Quickly find projects or specialists that match your needs with our intuitive swipe interface.',
    icon: <Search className="h-6 w-6 text-white" />
  },
  {
    name: 'Build Your Team',
    description: 'Assemble the perfect team with complementary skills for your startup project.',
    icon: <Users className="h-6 w-6 text-white" />
  },
  {
    name: 'Join Exciting Projects',
    description: 'Browse and apply to join innovative startups that match your skills and interests.',
    icon: <Briefcase className="h-6 w-6 text-white" />
  },
  {
    name: 'Connect & Collaborate',
    description: 'Seamlessly communicate with potential team members or project founders.',
    icon: <MessageSquare className="h-6 w-6 text-white" />
  }
];

const FeatureSection: React.FC = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            The easiest way to build your startup team
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Kodari connects IT specialists with innovative startup projects through a simple, intuitive interface.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <div key={index} className="relative">
                <div className="animate-fade-in">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;