// admin-pages/AdminAdSettings.tsx
import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import {
  listenToGlobalAds,
  updateGlobalAdLink,
  listenToSocialTaskLinks,
  updateSocialTaskLink,
  listenToDailyAdViewLimit,
  updateDailyAdViewLimit,
} from '../services/adminService';
import {
  DUMMY_ADS,
  WHATSAPP_CHANNEL_LINK,
  YOUTUBE_CHANNEL_LINK,
  AD_WATCH_REWARD_COINS,
  DAILY_AD_VIEW_LIMIT, // Import constant for initial value
} from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminAdSettings: React.FC = () => {
  const [globalAds, setGlobalAds] = useState<{ [adId: string]: { url: string; coins: number } }>({});
  const [socialTaskLinks, setSocialTaskLinks] = useState<{ whatsapp: string; youtube: string }>({ whatsapp: '', youtube: '' });
  const [dailyLimit, setDailyLimit] = useState(DAILY_AD_VIEW_LIMIT); // State for daily ad limit
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [currentEditAdId, setCurrentEditAdId] = useState<string | null>(null);
  const [currentEditAdLink, setCurrentEditAdLink] = useState('');
  const [currentEditSocialTaskType, setCurrentEditSocialTaskType] = useState<'whatsapp' | 'youtube' | null>(null);
  const [currentEditSocialTaskLink, setCurrentEditSocialTaskLink] = useState('');
  const [newDailyLimit, setNewDailyLimit] = useState<number | ''>(DAILY_AD_VIEW_LIMIT);


  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    // Initialize global ads if they don't exist
    const initialGlobalAds: { [key: string]: { url: string; coins: number } } = {};
    DUMMY_ADS.forEach(ad => {
      initialGlobalAds[ad.id] = { url: ad.link, coins: AD_WATCH_REWARD_COINS };
    });
    setGlobalAds(initialGlobalAds);

    unsubscribes.push(listenToGlobalAds((ads) => {
      // Merge with dummy ads to ensure all expected ads are present, using Firebase values if available
      const mergedAds = { ...initialGlobalAds };
      for (const adId in ads) {
        mergedAds[adId] = { ...mergedAds[adId], ...ads[adId] };
      }
      setGlobalAds(mergedAds);
    }));

    unsubscribes.push(listenToSocialTaskLinks((links) => {
      setSocialTaskLinks(links);
    }));

    unsubscribes.push(listenToDailyAdViewLimit((limit) => {
      setDailyLimit(limit);
      setNewDailyLimit(limit); // Keep edit field updated
    }));

    setLoading(false);

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const handleUpdateAdLink = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!currentEditAdId || !currentEditAdLink.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid URL.' });
      return;
    }
    try {
      await updateGlobalAdLink(currentEditAdId, currentEditAdLink);
      setMessage({ type: 'success', text: `Ad link for ${currentEditAdId} updated successfully.` });
      setCurrentEditAdId(null);
      setCurrentEditAdLink('');
    } catch (err: any) {
      console.error('Error updating ad link:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update ad link.' });
    }
  }, [currentEditAdId, currentEditAdLink]);

  const handleUpdateSocialTaskLink = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!currentEditSocialTaskType || !currentEditSocialTaskLink.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid URL.' });
      return;
    }
    try {
      await updateSocialTaskLink(currentEditSocialTaskType, currentEditSocialTaskLink);
      setMessage({ type: 'success', text: `${currentEditSocialTaskType} link updated successfully.` });
      setCurrentEditSocialTaskType(null);
      setCurrentEditSocialTaskLink('');
    } catch (err: any) {
      console.error('Error updating social task link:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update social task link.' });
    }
  }, [currentEditSocialTaskType, currentEditSocialTaskLink]);

  const handleUpdateDailyLimit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newDailyLimit === '' || newDailyLimit <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive number for the daily limit.' });
      return;
    }
    try {
      await updateDailyAdViewLimit(newDailyLimit);
      setMessage({ type: 'success', text: `Daily ad view limit updated to ${newDailyLimit}.` });
    } catch (err: any) {
      console.error('Error updating daily ad limit:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update daily ad limit.' });
    }
  }, [newDailyLimit]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Ad & Social Task Settings</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Daily Ad View Limit */}
      <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-primary mb-4">Daily Ad View Limit</h2>
        <p className="text-medium-gray mb-4">
          Current daily limit for each user to watch ads: <strong className="text-primary">{dailyLimit.toLocaleString()}</strong> ads.
        </p>
        <form onSubmit={handleUpdateDailyLimit} className="space-y-4">
          <div>
            <label htmlFor="dailyLimit" className="block text-dark-gray text-sm font-medium mb-2">New Daily Limit</label>
            <input
              type="number"
              id="dailyLimit"
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-dark-gray focus:outline-none focus:ring-2 focus:ring-primary"
              value={newDailyLimit}
              onChange={(e) => setNewDailyLimit(parseInt(e.target.value) || '')}
              min="1"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
          >
            Update Daily Limit
          </button>
        </form>
      </div>

      {/* Global Ad Links */}
      <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-primary mb-4">Global Ad Links</h2>
        <p className="text-medium-gray mb-4">
          These links are used for the "Watch Ad" feature. Users will be redirected here after watching an ad.
        </p>
        <div className="space-y-4">
          {/* Fix: Explicitly type 'ad' in the map function */}
          {Object.entries(globalAds).map(([adId, ad]: [string, { url: string; coins: number }]) => (
            <div key={adId} className="bg-white p-4 rounded-md border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-2 md:mb-0">
                <span className="text-lg font-medium text-dark-gray block">{adId} (Earns {ad.coins} Coins)</span>
                <span className="text-sm text-medium-gray break-all">{ad.url}</span>
              </div>
              <button
                onClick={() => { setCurrentEditAdId(adId); setCurrentEditAdLink(ad.url); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white mt-2 md:mt-0"
              >
                Edit Link
              </button>
            </div>
          ))}
        </div>

        {currentEditAdId && (
          <form onSubmit={handleUpdateAdLink} className="mt-6 p-4 bg-white rounded-md border border-gray-200">
            <h3 className="text-xl font-semibold text-primary mb-3">Edit Link for {currentEditAdId}</h3>
            <div className="mb-4">
              <label htmlFor="adLink" className="block text-dark-gray text-sm font-medium mb-2">New Ad URL</label>
              <input
                type="url"
                id="adLink"
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-dark-gray focus:outline-none focus:ring-2 focus:ring-primary"
                value={currentEditAdLink}
                onChange={(e) => setCurrentEditAdLink(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => { setCurrentEditAdId(null); setCurrentEditAdLink(''); }}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Social Task Links */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-primary mb-4">Social Task Links</h2>
        <p className="text-medium-gray mb-4">
          These links are used for the "Join WhatsApp Channel" and "Subscribe YouTube Channel" tasks.
        </p>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-md border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-2 md:mb-0">
              <span className="text-lg font-medium text-dark-gray block">WhatsApp Channel Link</span>
              <span className="text-sm text-medium-gray break-all">{socialTaskLinks.whatsapp || WHATSAPP_CHANNEL_LINK}</span>
            </div>
            <button
              onClick={() => { setCurrentEditSocialTaskType('whatsapp'); setCurrentEditSocialTaskLink(socialTaskLinks.whatsapp || WHATSAPP_CHANNEL_LINK); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white mt-2 md:mt-0"
            >
              Edit Link
            </button>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-2 md:mb-0">
              <span className="text-lg font-medium text-dark-gray block">YouTube Channel Link</span>
              <span className="text-sm text-medium-gray break-all">{socialTaskLinks.youtube || YOUTUBE_CHANNEL_LINK}</span>
            </div>
            <button
              onClick={() => { setCurrentEditSocialTaskType('youtube'); setCurrentEditSocialTaskLink(socialTaskLinks.youtube || YOUTUBE_CHANNEL_LINK); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white mt-2 md:mt-0"
            >
              Edit Link
            </button>
          </div>
        </div>

        {currentEditSocialTaskType && (
          <form onSubmit={handleUpdateSocialTaskLink} className="mt-6 p-4 bg-white rounded-md border border-gray-200">
            <h3 className="text-xl font-semibold text-primary mb-3">Edit Link for {currentEditSocialTaskType === 'whatsapp' ? 'WhatsApp Channel' : 'YouTube Channel'}</h3>
            <div className="mb-4">
              <label htmlFor="socialTaskLink" className="block text-dark-gray text-sm font-medium mb-2">New URL</label>
              <input
                type="url"
                id="socialTaskLink"
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-dark-gray focus:outline-none focus:ring-2 focus:ring-primary"
                value={currentEditSocialTaskLink}
                onChange={(e) => setCurrentEditSocialTaskLink(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => { setCurrentEditSocialTaskType(null); setCurrentEditSocialTaskLink(''); }}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAdSettings;