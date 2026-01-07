// components/Header.tsx
import React from 'react';

interface HeaderProps {
  appName: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isAdminPanel?: boolean;
}

const Header: React.FC<HeaderProps> = ({ appName, isSidebarOpen, toggleSidebar, isAdminPanel = false }) => {
  return (
    <header className="bg-primary text-white p-4 flex justify-between items-center shadow-md md:hidden fixed w-full top-0 z-20">
      <h1 className="text-2xl font-extrabold">{isAdminPanel ? 'Admin Panel' : appName}</h1>
      <button
        onClick={toggleSidebar}
        className="text-white focus:outline-none"
        aria-label="Toggle Sidebar"
      >
        {isSidebarOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </header>
  );
};

export default Header;