// pages/InviteEarn.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Referral } from '../types';
import { REFERRAL_COMMISSION_PERCENT } from '../constants';
import { listenToReferralsForInviter } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

interface InviteEarnProps {
  currentUser: User;
}

const InviteEarn: React.FC<InviteEarnProps> = ({ currentUser }) => {
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const baseDomain = window.location.origin; // e.g., http://localhost:3000 or https://learnpoint.blog

  useEffect(() => {
    if (currentUser.uid) {
      setReferralLink(`${baseDomain}/#/signup?ref=${currentUser.uid}`);

      const unsubscribe = listenToReferralsForInviter(currentUser.uid, (fetchedReferrals) => {
        setReferrals(Object.values(fetchedReferrals));
        setLoadingReferrals(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser.uid, baseDomain]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(referralLink);
    setCopyMessage('Link Copied!');
    setTimeout(() => setCopyMessage(null), 2000);
  }, [referralLink]);

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Invite & Earn</h1>

      {/* Referral Link Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-primary mb-4">Your Referral Link</h2>
        <p className="text-medium-gray mb-3">Share this link with your friends to invite them to LearnPoint:</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-grow px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-dark-gray cursor-text select-all focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleCopyLink}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white flex-shrink-0"
          >
            {copyMessage || 'Copy Link'}
          </button>
        </div>
        <p className="text-medium-gray text-sm">
          Earn a lifetime <strong className="text-primary">{REFERRAL_COMMISSION_PERCENT}%</strong> commission on your referral's first withdrawal.
          Your referral must complete their first withdrawal, and it must be approved by the admin.
        </p>
      </div>

      {/* Referral List Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-primary mb-4">Your Referred Users</h2>
        {loadingReferrals ? (
          <LoadingSpinner />
        ) : referrals.length === 0 ? (
          <p className="text-medium-gray text-center">You haven't referred anyone yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Referred At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    First Withdrawal
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                      {referral.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-gray">
                      {new Date(referral.referredAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        referral.firstWithdrawalApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.firstWithdrawalApproved ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        referral.status === 'verified' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.status === 'verified' ? 'Verified' : 'Pending'}
                      </span>
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

export default InviteEarn;