import React from 'react';

const steps = [
  {
    id: '01',
    name: 'Create your profile',
    description: 'Sign up and create your profile as a specialist or startup founder. Showcase your skills or project details.'
  },
  {
    id: '02',
    name: 'Discover opportunities',
    description: 'Browse projects or specialists. Use our swipe interface to quickly find what interests you.'
  },
  {
    id: '03',
    name: 'Match and connect',
    description: "When there's mutual interest, you'll match! Start a conversation to explore the collaboration."
  },
  {
    id: '04',
    name: 'Build together',
    description: 'Form your team and start working on amazing projects together. Turn ideas into reality.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">How Kodari works</h2>
          <p className="mt-4 text-lg text-gray-500">
            Our platform makes it easy to find the perfect match for your startup journey.
          </p>
        </div>

        <div className="mt-10 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
          {steps.map((step) => (
            <div key={step.id} className="relative group">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full transition-all duration-200 hover:shadow-md group-hover:border-primary-200 animate-scale-in">
                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                  {step.id}
                </span>
                <h3 className="mt-3 text-lg font-medium text-gray-900">{step.name}</h3>
                <p className="mt-2 text-base text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;