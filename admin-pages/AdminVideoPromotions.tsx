// admin-pages/AdminVideoPromotions.tsx
import React, { useState, useEffect } from 'react';
import { listenToVideoPromotions, updateVideoPromotionStatus } from '../services/adminService';
import { VideoPromotion } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminVideoPromotions: React.FC = () => {
  const [videoPromotions, setVideoPromotions] = useState<VideoPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = listenToVideoPromotions((promotions) => {
      setVideoPromotions(promotions);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (
    promoId: string,
    status: 'accepted' | 'rejected',
    userId: string,
    coins: number,
  ) => {
    setProcessingId(promoId);
    try {
      await updateVideoPromotionStatus(promoId, status, userId, coins);
    } catch (err) {
      console.error(`Error updating video promotion ${status}:`, err);
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
      <h1 className="text-3xl font-bold text-primary mb-6">Video Promotion Requests</h1>

      {videoPromotions.length === 0 ? (
        <p className="text-medium-gray text-center text-lg">No video promotion requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  User Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Video Link
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Coins Reward
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Submitted On
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videoPromotions.map((promo) => (
                <tr key={promo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                    {promo.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                    <a href={promo.videoLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {promo.videoLink.substring(0, 30)}...
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {promo.coins.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      promo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      promo.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {promo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-gray">
                    {new Date(promo.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {promo.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(promo.id, 'accepted', promo.userId, promo.coins)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-white"
                          disabled={processingId === promo.id}
                        >
                          {processingId === promo.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(promo.id, 'rejected', promo.userId, 0)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-white"
                          disabled={processingId === promo.id}
                        >
                          {processingId === promo.id ? 'Rejecting...' : 'Reject'}
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

export default AdminVideoPromotions;