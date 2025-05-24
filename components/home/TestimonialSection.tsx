import React from 'react';

const testimonials = [
  {
    content: "Kodari helped me find the perfect technical co-founder for my EdTech startup. The matching algorithm really works!",
    author: {
      name: "Elena Martinez",
      role: "Founder, LearnWave",
      image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300"
    }
  },
  {
    content: "As a developer, I wanted to join a meaningful project. Through Kodari, I found an innovative healthcare startup that matched my skills and values.",
    author: {
      name: "Michael Chen",
      role: "Full-stack Developer",
      image: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=300"
    }
  },
  {
    content: "We built our entire founding team using Kodari. The quality of matches and the ease of connecting made all the difference for our startup.",
    author: {
      name: "Sarah Johnson",
      role: "CEO, TechSolve",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300"
    }
  }
];

const TestimonialSection: React.FC = () => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Loved by founders and specialists</h2>
          <p className="mt-4 text-lg text-gray-500">
            Here's what our community has to say about their experience with Kodari.
          </p>
        </div>
        
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full animate-fade-in">
              <blockquote className="flex-1">
                <p className="text-gray-700 text-lg leading-relaxed">"{testimonial.content}"</p>
              </blockquote>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={testimonial.author.image}
                    alt={testimonial.author.name}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{testimonial.author.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.author.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;