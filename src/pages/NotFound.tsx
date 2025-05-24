import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-9xl font-bold text-primary-200">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
      <p className="mt-2 text-xl text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
      
      <Link to="/" className="mt-8">
        <Button leftIcon={<Home size={18} />}>
          Return Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;