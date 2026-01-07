// pages/SocialTasks.tsx
import React, { useState, FormEvent } from 'react';
import { User, VideoPromotion } from '../types';
import { joinWhatsapp, subscribeYoutube, submitVideoPromotion } from '../services/userService';
import {
  WHATSAPP_CHANNEL_LINK,
  WHATSAPP_REWARD_COINS,
  YOUTUBE_CHANNEL_LINK,
  YOUTUBE_SUBSCRIBE_REWARD_COINS,
  YOUTUBE_PROMOTION_REWARD_COINS,
} from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

interface SocialTasksProps {
  currentUser: User;
  onUserDataUpdate: () => void;
}

const SocialTasks: React.FC<SocialTasksProps> = ({ currentUser, onUserDataUpdate }) => {
  const [videoLink, setVideoLink] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loadingTask, setLoadingTask] = useState<string | null>(null);

  const handleJoinWhatsapp = async () => {
    setMessage(null);
    setLoadingTask('whatsapp');
    try {
      const success = await joinWhatsapp(currentUser.uid);
      if (success) {
        setMessage({ type: 'success', text: `You joined the WhatsApp channel and earned ${WHATSAPP_REWARD_COINS} coins!` });
        onUserDataUpdate();
      } else {
        setMessage({ type: 'error', text: 'You have already joined the WhatsApp channel.' });
      }
      setTimeout(() => window.open(WHATSAPP_CHANNEL_LINK, '_blank'), 500);
    } catch (err: any) {
      console.error('Error joining WhatsApp:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to join WhatsApp channel.' });
    } finally {
      setLoadingTask(null);
    }
  };

  const handleSubscribeYoutube = async () => {
    setMessage(null);
    setLoadingTask('youtube-subscribe');
    try {
      const success = await subscribeYoutube(currentUser.uid);
      if (success) {
        setMessage({ type: 'success', text: `You subscribed to the YouTube channel and earned ${YOUTUBE_SUBSCRIBE_REWARD_COINS} coins!` });
        onUserDataUpdate();
      } else {
        setMessage({ type: 'error', text: 'You have already subscribed to the YouTube channel.' });
      }
      setTimeout(() => window.open(YOUTUBE_CHANNEL_LINK, '_blank'), 500);
    } catch (err: any) {
      console.error('Error subscribing YouTube:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to subscribe YouTube channel.' });
    } finally {
      setLoadingTask(null);
    }
  };

  const handleSubmitVideoPromotion = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoadingTask('youtube-promotion');

    if (!videoLink.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid YouTube video link.' });
      setLoadingTask(null);
      return;
    }

    try {
      await submitVideoPromotion(currentUser.uid, currentUser.email, videoLink);
      setMessage({ type: 'success', text: 'YouTube video promotion request submitted! Awaiting admin approval.' });
      setVideoLink('');
      onUserDataUpdate(); // To update the list of user's submitted promotions
    } catch (err: any) {
      console.error('Error submitting video promotion:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to submit video promotion.' });
    } finally {
      setLoadingTask(null);
    }
  };

  const userVideoPromotions: VideoPromotion[] = currentUser.videoPromotions
    ? Object.values(currentUser.videoPromotions)
    : [];

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Social Tasks</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Join WhatsApp Channel */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-dark-gray mb-3">Join WhatsApp Channel</h2>
          <p className="text-medium-gray text-sm mb-4">
            Join our official WhatsApp channel to stay updated and earn <strong className="text-yellow-600">{WHATSAPP_REWARD_COINS} Coins</strong>.
          </p>
          <button
            onClick={handleJoinWhatsapp}
            className={`w-full py-2 px-4 rounded-md font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
              ${currentUser.socialTasks?.whatsappJoined
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark text-white focus:ring-primary'
              }`}
            disabled={currentUser.socialTasks?.whatsappJoined || loadingTask === 'whatsapp'}
          >
            {loadingTask === 'whatsapp' ? <LoadingSpinner /> : currentUser.socialTasks?.whatsappJoined ? 'Joined' : 'Join Now'}
          </button>
        </div>

        {/* Subscribe YouTube Channel */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-dark-gray mb-3">Subscribe YouTube Channel</h2>
          <p className="text-medium-gray text-sm mb-4">
            Subscribe to our YouTube channel for amazing content and earn <strong className="text-yellow-600">{YOUTUBE_SUBSCRIBE_REWARD_COINS} Coins</strong>.
          </p>
          <button
            onClick={handleSubscribeYoutube}
            className={`w-full py-2 px-4 rounded-md font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
              ${currentUser.socialTasks?.youtubeSubscribed
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark text-white focus:ring-primary'
              }`}
            disabled={currentUser.socialTasks?.youtubeSubscribed || loadingTask === 'youtube-subscribe'}
          >
            {loadingTask === 'youtube-subscribe' ? <LoadingSpinner /> : currentUser.socialTasks?.youtubeSubscribed ? 'Subscribed' : 'Subscribe Now'}
          </button>
        </div>
      </div>

      {/* YouTube Video Promotion */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-primary mb-3">YouTube Video Promotion</h2>
        <p className="text-medium-gray text-sm mb-4">
          Promote your YouTube video and earn a massive <strong className="text-yellow-600">{YOUTUBE_PROMOTION_REWARD_COINS.toLocaleString()} Coins</strong> upon admin approval.
        </p>
        <form onSubmit={handleSubmitVideoPromotion} className="space-y-4">
          <div>
            <label htmlFor="videoLink" className="block text-dark-gray text-sm font-medium mb-2">
              Your YouTube Video Link
            </label>
            <input
              type="url"
              id="videoLink"
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., https://www.youtube.com/watch?v=xxxxxxxx"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
            disabled={loadingTask === 'youtube-promotion'}
          >
            {loadingTask === 'youtube-promotion' ? <LoadingSpinner /> : 'Submit Video for Promotion'}
          </button>
        </form>

        <h3 className="text-lg font-bold text-dark-gray mt-8 mb-4">Your Promotion Submissions</h3>
        {userVideoPromotions.length === 0 ? (
          <p className="text-medium-gray text-center">No video promotion requests submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Video Link
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Coins
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                    Submitted On
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userVideoPromotions.map((promo: VideoPromotion) => (
                  <tr key={promo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                      <a href={promo.videoLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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

export default SocialTasks;