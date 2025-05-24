import React, { ReactNode } from 'react';
import Header from './Header'; // Changed Navbar to Header, assuming Header is the main navigation component
// import Footer from './Footer'; // Optional: if you have a Footer component

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;