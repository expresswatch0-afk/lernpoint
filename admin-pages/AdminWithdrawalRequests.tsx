// admin-pages/AdminWithdrawalRequests.tsx
import React, { useState, useEffect } from 'react';
import { listenToWithdrawRequests, updateWithdrawRequestStatus } from '../services/adminService';
import { WithdrawRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminWithdrawalRequests: React.FC = () => {
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToWithdrawRequests((requests) => {
      setWithdrawRequests(requests);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (
    requestId: string,
    status: 'approved' | 'rejected',
    userId: string,
    amountCoins: number,
  ) => {
    setProcessingId(requestId);
    try {
      await updateWithdrawRequestStatus(requestId, status, userId, amountCoins);
    } catch (err) {
      console.error(`Error updating withdrawal request ${status}:`, err);
      alert(`Failed to ${status} request. See console for details.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Withdrawal Requests</h1>

      {withdrawRequests.length === 0 ? (
        <p className="text-medium-gray text-center text-lg">No withdrawal requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  User Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Coins
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  USD
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Account Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Requested On
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {withdrawRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                    {request.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {request.amountCoins.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ${request.amountUSD.toFixed(5)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                    {request.method}
                  </td>
                  <td className="px-6 py-4 text-sm text-medium-gray max-w-xs overflow-hidden text-ellipsis">
                    {request.accountDetails}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-gray">
                    {new Date(request.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'approved', request.userId, request.amountCoins)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-white"
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'rejected', request.userId, 0)} // No coin deduction on reject
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-white"
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-medium-gray">No actions</span>
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

export default AdminWithdrawalRequests;