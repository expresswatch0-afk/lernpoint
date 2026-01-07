// components/AdminSidebar.tsx
import React from 'react';
import { AdminPanelPage } from '../types';
import { logoutUser } from '../services/authService';

interface AdminSidebarProps {
  currentPage: AdminPanelPage;
  onNavigate: (page: AdminPanelPage) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPage, onNavigate, isSidebarOpen, toggleSidebar }) => {
  const navItems: { label: string; page: AdminPanelPage }[] = [
    { label: 'Admin Dashboard', page: 'admin-dashboard' },
    { label: 'User Management', page: 'admin-users' },
    { label: 'Withdrawal Requests', page: 'admin-withdrawals' },
    { label: 'Video Promotions', page: 'admin-video-promotions' },
    { label: 'Referral Verification', page: 'admin-referrals' },
    { label: 'Deposit Verification', page: 'admin-deposits' },
    { label: 'Ad Settings', page: 'admin-ads-settings' },
  ];

  const handleLogout = async () => {
    await logoutUser();
    onNavigate('admin-dashboard'); // Redirect to dashboard, which will prompt login
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-20 w-64 bg-white text-dark-gray flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 md:flex-shrink-0 md:shadow-none md:border-r md:border-gray-200`}
    >
      {/* Header for desktop */}
      <div className="p-6 border-b border-gray-200 hidden md:block">
        <h1 className="text-3xl font-extrabold text-primary">Admin Panel</h1>
        <p className="text-medium-gray text-sm">LearnPoint</p>
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

export default AdminSidebar;