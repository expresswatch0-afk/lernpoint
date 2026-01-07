// components/Sidebar.tsx
import React from 'react';
import { UserPanelPage } from '../types';
import { logoutUser } from '../services/authService';

interface SidebarProps {
  currentPage: UserPanelPage;
  onNavigate: (page: UserPanelPage) => void;
  userCoins: number;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, userCoins, isSidebarOpen, toggleSidebar }) => {
  const navItems: { label: string; page: UserPanelPage }[] = [
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Social Tasks', page: 'social-tasks' },
    { label: 'Invite & Earn', page: 'invite-earn' },
    { label: 'Extra Rewards', page: 'extra-rewards' },
    { label: 'Withdraw', page: 'withdraw' },
    { label: 'Advertiser', page: 'advertiser' },
    { label: 'Privacy Policy', page: 'privacy-policy' },
    { label: 'About', page: 'about' },
  ];

  const handleLogout = async () => {
    await logoutUser();
    onNavigate('dashboard'); // Redirect to dashboard, which will prompt login
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-20 w-64 bg-white text-dark-gray flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 md:flex-shrink-0 md:shadow-none md:border-r md:border-gray-200`}
    >
      {/* Header for desktop */}
      <div className="p-6 border-b border-gray-200 hidden md:block">
        <h1 className="text-3xl font-extrabold text-primary">LearnPoint</h1>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center mb-3">
          <img
            src="https://picsum.photos/40/40"
            alt="User Avatar"
            className="w-10 h-10 rounded-full mr-3 border-2 border-primary"
          />
          <span className="font-semibold text-lg text-dark-gray">Hello, User!</span> {/* Placeholder name */}
        </div>
        <div className="bg-gray-100 p-3 rounded-md flex justify-between items-center border border-gray-200">
          <span className="text-sm font-medium text-medium-gray">Your Coins:</span>
          <span className="text-xl font-bold text-yellow-600">{userCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-2 overflow-y-auto hide-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => { onNavigate(item.page); toggleSidebar(); }} // Close sidebar on mobile after navigation
            className={`flex items-center w-full px-4 py-2 rounded-lg text-left text-lg font-medium transition-colors duration-200
              ${currentPage === item.page
                ? 'bg-primary text-white shadow-md'
                : 'text-dark-gray hover:bg-gray-100 hover:text-primary'
              }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => { handleLogout(); toggleSidebar(); }} // Close sidebar on mobile after logout
          className="flex items-center w-full px-4 py-2 rounded-lg text-left text-lg font-medium text-red-600 hover:bg-red-100 transition-colors duration-200 mt-4"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;