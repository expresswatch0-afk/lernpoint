// pages/Withdraw.tsx
import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { User, WithdrawRequest } from '../types';
import { submitWithdrawRequest } from '../services/userService';
import { COIN_TO_USD_RATE } from '../constants';
import { listenToWithdrawRequests } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

interface WithdrawProps {
  currentUser: User;
  onUserDataUpdate: () => void;
}

const Withdraw: React.FC<WithdrawProps> = ({ currentUser, onUserDataUpdate }) => {
  const [amountCoins, setAmountCoins] = useState<number | ''>('');
  const [method, setMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const availableMethods = ['Easypaisa', 'JazzCash', 'UPI', 'Google Pay', 'Redeem Code', 'Bank Transfer'];

  const usdEquivalent = typeof amountCoins === 'number' && amountCoins > 0
    ? (amountCoins * COIN_TO_USD_RATE).toFixed(5)
    : '0.00000';

  useEffect(() => {
    // Listen to all withdrawal requests, then filter for the current user
    const unsubscribe = listenToWithdrawRequests((requests) => {
      const userRequests = requests.filter(req => req.userId === currentUser.uid);
      setWithdrawHistory(userRequests);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.uid]); // Dependency array includes currentUser.uid

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (
      amountCoins === '' ||
      amountCoins <= 0 ||
      amountCoins > currentUser.coins ||
      !method ||
      !accountDetails.trim()
    ) {
      setMessage({ type: 'error', text: 'Please fill in all fields with valid data and ensure you have enough coins.' });
      setLoading(false);
      return;
    }

    try {
      await submitWithdrawRequest(
        currentUser.uid,
        currentUser.email,
        amountCoins,
        method,
        accountDetails,
      );
      setMessage({ type: 'success', text: 'Withdrawal request submitted successfully! Awaiting admin approval.' });
      setAmountCoins('');
      setMethod('');
      setAccountDetails('');
      // No need to call onUserDataUpdate here, as coins are only deducted on admin approval.
      // History will update via listener.
    } catch (err: any) {
      console.error('Error submitting withdrawal request:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to submit withdrawal request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Withdraw Coins</h1>

      {message && (
        <div className={`p-4 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
        <p className="text-medium-gray text-lg">Your current coins:</p>
        <p className="text-yellow-600 text-5xl font-extrabold mt-2">{currentUser.coins.toLocaleString()}</p>
        <p className="text-medium-gray text-sm mt-3">
          1 Coin = {COIN_TO_USD_RATE} USD
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mb-12">
        <h2 className="text-2xl font-semibold text-primary mb-4">New Withdrawal Request</h2>
        <div>
          <label htmlFor="amountCoins" className="block text-dark-gray text-sm font-medium mb-2">
            Amount (Coins)
          </label>
          <input
            type="number"
            id="amountCoins"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., 10000"
            value={amountCoins}
            onChange={(e) => setAmountCoins(parseInt(e.target.value) || '')}
            min="1"
            max={currentUser.coins}
            required
          />
          <p className="text-medium-gray text-sm mt-2">
            You will receive approximately: <span className="text-green-600 font-semibold">${usdEquivalent} USD</span>
          </p>
        </div>
        <div>
          <label htmlFor="method" className="block text-dark-gray text-sm font-medium mb-2">
            Withdrawal Method
          </label>
          <select
            id="method"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray focus:outline-none focus:ring-2 focus:ring-primary"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            required
          >
            <option value="" disabled>Select a method</option>
            {availableMethods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="accountDetails" className="block text-dark-gray text-sm font-medium mb-2">
            Account Details (e.g., Easypaisa Number, Bank Account #, UPI ID)
          </label>
          <textarea
            id="accountDetails"
            rows={3}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Easypaisa: 03001234567, Account Name: John Doe"
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white transition duration-300"
          disabled={loading || amountCoins === '' || amountCoins <= 0 || amountCoins > currentUser.coins || !method || !accountDetails.trim()}
        >
          {loading ? <LoadingSpinner /> : 'Submit Withdrawal Request'}
        </button>
      </form>

      {/* Withdrawal History */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold text-primary mb-4">Withdrawal History</h2>
        {loadingHistory ? (
          <LoadingSpinner />
        ) : withdrawHistory.length === 0 ? (
          <p className="text-medium-gray text-center">No withdrawal requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Amount (Coins)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Amount (USD)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawHistory.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                      {request.amountCoins.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      ${request.amountUSD.toFixed(5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                      {request.method}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdraw;