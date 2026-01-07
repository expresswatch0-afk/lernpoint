// admin-pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { listenToAllUsers, listenToWithdrawRequests, listenToVideoPromotions, listenToDepositRequests } from '../services/adminService';
import { User, WithdrawRequest, VideoPromotion, DepositRequest, AdminPanelPage } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface AdminDashboardProps {
  onNavigate: (page: AdminPanelPage) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [videoPromotions, setVideoPromotions] = useState<VideoPromotion[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    unsubscribes.push(listenToAllUsers(setUsers));
    unsubscribes.push(listenToWithdrawRequests(setWithdrawals));
    unsubscribes.push(listenToVideoPromotions(setVideoPromotions));
    unsubscribes.push(listenToDepositRequests(setDeposits));

    setLoading(false);

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const pendingWithdrawals = withdrawals.filter(req => req.status === 'pending').length;
  const pendingVideoPromotions = videoPromotions.filter(req => req.status === 'pending').length;
  const pendingDeposits = deposits.filter(req => req.status === 'pending').length;
  const totalUsers = users.length;
  const totalCoins = users.reduce((sum, user) => sum + (user.coins || 0), 0);

  const StatCard: React.FC<{ title: string; value: string | number; linkPage: AdminPanelPage; isAttention?: boolean }> =
    ({ title, value, linkPage, isAttention = false }) => (
      <button
        onClick={() => onNavigate(linkPage)}
        className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center transition-transform transform hover:scale-105 duration-200 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white
          ${isAttention ? 'ring-2 ring-red-500' : ''}`}
      >
        <p className="text-medium-gray text-lg font-medium">{title}</p>
        <p className={`mt-2 text-4xl font-extrabold ${isAttention ? 'text-red-600' : 'text-primary'}`}>
          {value}
        </p>
      </button>
    );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-8">Admin Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={totalUsers.toLocaleString()} linkPage="admin-users" />
        <StatCard title="Total Coins in System" value={totalCoins.toLocaleString()} linkPage="admin-users" />
        <StatCard title="Pending Withdrawals" value={pendingWithdrawals.toLocaleString()} linkPage="admin-withdrawals" isAttention={pendingWithdrawals > 0} />
        <StatCard title="Pending Video Promotions" value={pendingVideoPromotions.toLocaleString()} linkPage="admin-video-promotions" isAttention={pendingVideoPromotions > 0} />
        <StatCard title="Pending Deposits" value={pendingDeposits.toLocaleString()} linkPage="admin-deposits" isAttention={pendingDeposits > 0} />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-primary mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('admin-users')}
            className="flex items-center justify-center p-4 bg-primary hover:bg-primary-dark rounded-lg text-white font-semibold shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
          >
            Manage Users
          </button>
          <button
            onClick={() => onNavigate('admin-withdrawals')}
            className="flex items-center justify-center p-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            Review Withdrawals
          </button>
          <button
            onClick={() => onNavigate('admin-video-promotions')}
            className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            Approve Video Promos
          </button>
          <button
            onClick={() => onNavigate('admin-referrals')}
            className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            Verify Referrals
          </button>
          <button
            onClick={() => onNavigate('admin-deposits')}
            className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            Verify Deposits
          </button>
          <button
            onClick={() => onNavigate('admin-ads-settings')}
            className="flex items-center justify-center p-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            Configure Ads
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;