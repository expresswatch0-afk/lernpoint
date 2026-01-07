// pages/Advertiser.tsx
import React, { useState, FormEvent } from 'react';
import { User } from '../types';
import { submitDepositRequest } from '../services/userService';
import { EASYPEASA_NUMBER, ACCOUNT_NAME, COIN_TO_USD_RATE } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

interface AdvertiserProps {
  currentUser: User;
}

const Advertiser: React.FC<AdvertiserProps> = ({ currentUser }) => {
  const [transactionId, setTransactionId] = useState('');
  const [amountDeposited, setAmountDeposited] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const coinsToReceive = typeof amountDeposited === 'number' && amountDeposited > 0
    ? Math.floor(amountDeposited / COIN_TO_USD_RATE)
    : 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!transactionId || amountDeposited === '' || amountDeposited <= 0) {
      setMessage({ type: 'error', text: 'Please fill in all fields with valid data.' });
      setLoading(false);
      return;
    }

    try {
      await submitDepositRequest(
        currentUser.uid,
        currentUser.email,
        transactionId,
        amountDeposited,
        coinsToReceive,
      );
      setMessage({ type: 'success', text: 'Deposit request submitted successfully! Awaiting admin verification.' });
      setTransactionId('');
      setAmountDeposited('');
    } catch (err: any) {
      console.error('Error submitting deposit request:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to submit deposit request.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Advertiser / Buy Coins</h1>

      {message && (
        <div className={`p-4 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-primary mb-4">How to Buy Coins:</h2>
        <ol className="list-decimal list-inside text-dark-gray space-y-2 mb-6">
          <li>Transfer the desired amount to our Easypaisa Account.</li>
          <li>Fill out the form below with your Transaction ID and the amount you deposited.</li>
          <li>Submit the request. Our admin will verify your payment and add coins to your account.</li>
        </ol>

        <h3 className="text-xl font-semibold text-dark-gray mb-3">Payment Details:</h3>
        <p className="text-medium-gray mb-2"><strong>Easypaisa Number:</strong> <span className="text-primary">{EASYPEASA_NUMBER}</span></p>
        <p className="text-medium-gray mb-4"><strong>Account Name:</strong> <span className="text-primary">{ACCOUNT_NAME}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="transactionId" className="block text-dark-gray text-sm font-medium mb-2">
            Transaction ID (TRX ID)
          </label>
          <input
            type="text"
            id="transactionId"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., ABC123DEF456"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="amountDeposited" className="block text-dark-gray text-sm font-medium mb-2">
            Amount Deposited (in your currency)
          </label>
          <input
            type="number"
            id="amountDeposited"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., 500"
            value={amountDeposited}
            onChange={(e) => setAmountDeposited(parseFloat(e.target.value) || '')}
            min="0"
            step="any"
            required
          />
        </div>
        <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
          <p className="text-dark-gray text-lg font-medium">You will receive approximately:</p>
          <p className="text-yellow-600 text-3xl font-bold mt-1">{coinsToReceive.toLocaleString()} Coins</p>
          <p className="text-medium-gray text-sm mt-2">Conversion rate: 1 USD = {(1 / COIN_TO_USD_RATE).toLocaleString()} Coins</p>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white transition duration-300"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : 'Submit Deposit Request'}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold text-primary mb-4">What You Can Buy with Coins:</h2>
        <ul className="list-disc list-inside text-dark-gray space-y-2 ml-4">
          <li>YouTube Views</li>
          <li>YouTube Subscribers</li>
          <li>Social Media Followers (Instagram, Facebook, etc.)</li>
          <li>Website Traffic</li>
          <li>And many more digital promotion services!</li>
        </ul>
        <p className="mt-4 text-medium-gray text-sm">
          (Note: Actual service purchasing functionality is not implemented in this demo. Contact admin to arrange services.)
        </p>
      </div>
    </div>
  );
};

export default Advertiser;