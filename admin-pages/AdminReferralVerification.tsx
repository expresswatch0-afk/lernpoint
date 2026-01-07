// admin-pages/AdminReferralVerification.tsx
import React, { useState, useEffect } from 'react';
import { listenToAllUsers, verifyReferral, unverifyReferral } from '../services/adminService';
import { User, Referral } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminReferralVerification: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToAllUsers((users) => {
      setAllUsers(users);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Flatten all referrals from all users into a single list for admin view
  const allReferrals: { inviterId: string; referral: Referral }[] = [];
  allUsers.forEach(user => {
    // 'referrals' property added to User interface in types.ts.
    // Ensure user.referrals exists before attempting to iterate.
    if (user.referrals) {
      Object.entries(user.referrals).forEach(([, referralData]) => {
        // referralData is an object of type Referral, so explicitly type it.
        allReferrals.push({
          inviterId: user.uid,
          referral: referralData as Referral,
        });
      });
    }
  });

  const handleVerifyReferral = async (inviterId: string, referredUserId: string) => {
    setProcessingId(`${inviterId}-${referredUserId}`);
    try {
      await verifyReferral(inviterId, referredUserId);
    } catch (err) {
      console.error('Error verifying referral:', err);
      alert('Failed to verify referral. See console for details.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnverifyReferral = async (inviterId: string, referredUserId: string) => {
    setProcessingId(`${inviterId}-${referredUserId}`);
    try {
      await unverifyReferral(inviterId, referredUserId);
    } catch (err) {
      console.error('Error un-verifying referral:', err);
      alert('Failed to un-verify referral. See console for details.');
    } finally {
      setProcessingId(null);
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Referral Verification</h1>

      {allReferrals.length === 0 ? (
        <p className="text-medium-gray text-center text-lg">No referrals found in the system.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Inviter Email (UID)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Referred User Email (UID)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Referred At
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  First Withdrawal Completed
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allReferrals.map((item) => {
                const inviter = allUsers.find(u => u.uid === item.inviterId);
                const referredUser = allUsers.find(u => u.uid === item.referral.id);
                const currentProcessingId = `${item.inviterId}-${item.referral.id}`;

                return (
                  <tr key={currentProcessingId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                      {inviter?.email || 'N/A'} <br/> <span className="text-medium-gray text-xs">({item.inviterId})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                      {referredUser?.email || 'N/A'} <br/> <span className="text-medium-gray text-xs">({item.referral.id})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-gray">
                      {new Date(item.referral.referredAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.referral.firstWithdrawalApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.referral.firstWithdrawalApproved ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.referral.status === 'verified' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.referral.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {item.referral.status === 'pending' ? (
                        <button
                          onClick={() => handleVerifyReferral(item.inviterId, item.referral.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
                          disabled={processingId === currentProcessingId}
                        >
                          {processingId === currentProcessingId ? 'Verifying...' : 'Verify Referral'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnverifyReferral(item.inviterId, item.referral.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-white"
                          disabled={processingId === currentProcessingId}
                        >
                          {processingId === currentProcessingId ? 'Un-verifying...' : 'Un-verify'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReferralVerification;