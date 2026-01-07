// admin-pages/AdminUserManagement.tsx
import React, { useState, useEffect } from 'react';
import { listenToAllUsers, adminUpdateUserCoins } from '../services/adminService';
import { User } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newCoins, setNewCoins] = useState<number | ''>('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterEmail, setFilterEmail] = useState('');

  useEffect(() => {
    const unsubscribe = listenToAllUsers((fetchedUsers) => {
      setUsers(fetchedUsers.sort((a,b) => (a.email || '').localeCompare(b.email || ''))); // Sort by email
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEditCoins = (user: User) => {
    setEditingUserId(user.uid);
    setNewCoins(user.coins);
  };

  const handleSaveCoins = async (userId: string) => {
    if (newCoins === '' || newCoins < 0) {
      alert('Please enter a valid coin amount.');
      return;
    }
    setProcessingId(userId);
    try {
      await adminUpdateUserCoins(userId, newCoins);
      setEditingUserId(null);
      setNewCoins('');
    } catch (err) {
      console.error('Error updating user coins:', err);
      alert('Failed to update coins. See console for details.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(filterEmail.toLowerCase()) ||
    user.uid.toLowerCase().includes(filterEmail.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">User Management</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by email or UID"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-medium-gray text-center text-lg">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  User Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  UID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Coins
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Total Invites
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Verified Invites
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.uid}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-gray font-mono break-all max-w-[150px]">
                    {user.uid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {editingUserId === user.uid ? (
                      <input
                        type="number"
                        value={newCoins}
                        onChange={(e) => setNewCoins(parseInt(e.target.value) || '')}
                        className="w-24 px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-dark-gray focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    ) : (
                      user.coins.toLocaleString()
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                    {(user.totalInvites || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                    {(user.verifiedInvitesCount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingUserId === user.uid ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveCoins(user.uid)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-white"
                          disabled={processingId === user.uid}
                        >
                          {processingId === user.uid ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditCoins(user)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
                      >
                        Edit Coins
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;