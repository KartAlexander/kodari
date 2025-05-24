import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, MessageSquare, User, Briefcase, Home, Compass, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // Adjusted path
// import Button from '../ui/Button'; // Button might not be needed if using styled <a> tags

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout, loading } = useAuth(); // Get user and logout function from AuthContext

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMenuOpen(false);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  const commonNavigation = [
    { name: 'Главная', href: '/', icon: <Home size={18} /> },
    { name: 'Проекты', href: '/projects', icon: <Briefcase size={18} /> },
  ];

  const authNavigation = [
    { name: 'Сообщения', href: '/messages', icon: <MessageSquare size={18} /> },
    { name: 'Профиль', href: '/profile', icon: <User size={18} /> },
  ];

  const guestNavigation = [
    { name: 'Войти', href: '/login', icon: <LogIn size={18} /> },
    { name: 'Регистрация', href: '/register', icon: <User size={18} /> }, // Using User icon for register for now
  ];

  const navigation = user ? [...commonNavigation, ...authNavigation] : [...commonNavigation, ...guestNavigation];

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" legacyBehavior>
              <a className="text-primary-600 font-bold text-2xl">
                Kodari
              </a>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} legacyBehavior>
                <a
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ease-in-out
                    ${ isActive(item.href)
                        ? 'text-white bg-primary-600 shadow-md'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.name}
                </a>
              </Link>
            ))}
            {user && !loading && (
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-150 ease-in-out"
              >
                <LogOut size={18} className="mr-1.5" />
                Выйти
              </button>
            )}
             {/* User Avatar - Desktop */}
            {user && !loading && (
              <Link href="/profile" legacyBehavior>
                <a className="ml-3 flex-shrink-0">
                  <img
                    src={user.avatarUrl || `https://avatar.vercel.sh/${user.email || user.name}.png?size=40`}
                    alt={user.name || 'User'}
                    className="h-9 w-9 rounded-full object-cover border-2 border-transparent hover:border-primary-500 transition-all"
                  />
                </a>
              </Link>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Открыть меню</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200 shadow-lg fixed w-full z-40`} id="mobile-menu">
        <nav className="pt-2 pb-3 space-y-1 px-2">
          {navigation.map((item) => (
            <Link key={`mobile-${item.name}`} href={item.href} legacyBehavior>
              <a
                className={`flex items-center px-3 py-3 text-base font-medium rounded-md
                  ${ isActive(item.href)
                      ? 'text-white bg-primary-600'
                      : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50'
                  }`}
                onClick={toggleMenu} // Close menu on click
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
        
        {/* Mobile User Info & Logout */}
        {user && !loading && (
          <div className="pt-4 pb-3 border-t border-gray-200 px-2">
            <div className="flex items-center px-3 mb-3">
              <div className="flex-shrink-0">
                <img
                  src={user.avatarUrl || `https://avatar.vercel.sh/${user.email || user.name}.png?size=40`}
                  alt={user.name || 'User'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.name}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => { handleLogout(); toggleMenu(); }}
              className="w-full flex items-center px-3 py-3 text-base font-medium rounded-md text-gray-700 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut size={18} className="mr-3" />
              Выйти
            </button>
          </div>
        )}
         {!user && !loading && (
            <div className="pt-4 pb-3 border-t border-gray-200 px-2">
                 <Link href="/login" legacyBehavior>
                    <a className="flex items-center px-3 py-3 text-base font-medium rounded-md text-gray-700 hover:text-primary-700 hover:bg-primary-50" onClick={toggleMenu}>
                        <LogIn size={18} className="mr-3" /> Войти
                    </a>
                 </Link>
                 <Link href="/register" legacyBehavior>
                    <a className="flex items-center px-3 py-3 text-base font-medium rounded-md text-gray-700 hover:text-primary-700 hover:bg-primary-50" onClick={toggleMenu}>
                        <User size={18} className="mr-3" /> Регистрация
                    </a>
                 </Link>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;