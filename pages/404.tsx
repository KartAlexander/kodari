import React from 'react';
import Link from 'next/link'; // Replaced react-router-dom Link
import Button from '../components/ui/Button'; // Adjusted path
import { Home, AlertTriangle } from 'lucide-react'; // Icons

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <AlertTriangle className="h-24 w-24 text-primary-400 mb-6" />
      <h1 className="text-6xl sm:text-8xl font-bold text-primary-600">404</h1>
      <h2 className="mt-4 text-2xl sm:text-3xl font-semibold text-gray-800">Страница не найдена</h2>
      <p className="mt-3 text-md sm:text-lg text-gray-600 max-w-md">
        Извините, мы не можем найти страницу, которую вы ищете. Возможно, она была перемещена, удалена или никогда не существовала.
      </p>
      
      <Link href="/" legacyBehavior>
        <a className="mt-10">
          <Button size="lg">
            <Home size={20} className="mr-2" />
            Вернуться на главную
          </Button>
        </a>
      </Link>
    </div>
  );
};

export default NotFoundPage;
