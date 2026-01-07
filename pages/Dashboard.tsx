// pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Ad } from '../types';
import { watchAd } from '../services/userService';
import {
  AD_WATCH_DURATION_SECONDS,
  AD_WATCH_REWARD_COINS,
  DUMMY_ADS,
} from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardProps {
  currentUser: User;
  onUserDataUpdate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onUserDataUpdate }) => {
  // All dummy ads are displayed, not filtered based on `adsWatched` anymore
  const [ads] = useState<Ad[]>(DUMMY_ADS);
  const [activeAd, setActiveAd] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWatchAd = useCallback(async (adId: string, adLink: string) => {
    setMessage(null);
    if (activeAd) {
      setMessage({ type: 'error', text: 'Please wait, another ad is already active.' });
      return;
    }
    setActiveAd(adId);
    setTimer(AD_WATCH_DURATION_SECONDS);
    setLoading(true);

    let countdown = AD_WATCH_DURATION_SECONDS;
    const interval = setInterval(() => {
      countdown--;
      setTimer(countdown);
      if (countdown <= 0) {
        clearInterval(interval);
        setLoading(false);

        // After timer, attempt to award coins and redirect
        watchAd(currentUser.uid, adId, AD_WATCH_REWARD_COINS)
          .then((success) => {
            if (success) {
              setMessage({ type: 'success', text: `You earned ${AD_WATCH_REWARD_COINS} coins!` });
              onUserDataUpdate(); // Refresh user data to show new coin balance
              setTimeout(() => window.open(adLink, '_blank'), 500); // Redirect after a short delay
            } else {
              // This case should ideally be caught by the service throwing an error,
              // but as a fallback.
              setMessage({ type: 'error', text: 'Failed to watch ad. Please try again.' });
            }
          })
          .catch((err: Error) => {
            console.error('Error watching ad:', err);
            setMessage({ type: 'error', text: err.message || 'Failed to process ad. Please try again.' });
          })
          .finally(() => {
            setActiveAd(null);
          });
      }
    }, 1000);
  }, [activeAd, currentUser.uid, onUserDataUpdate]);

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Dashboard</h1>

      {message && (
        <div className={`p-4 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
        <p className="text-medium-gray text-lg">Your current coins:</p>
        <p className="text-yellow-600 text-5xl font-extrabold mt-2">{currentUser.coins.toLocaleString()}</p>
      </div>

      <h2 className="text-2xl font-semibold text-primary mb-5">Watch Ads / Surf Ads</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => ( // Render all ads, not just available ones
          <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
            <div>
              {/* Ad images removed as per requirements */}
              <h3 className="text-xl font-bold text-dark-gray mb-2">{ad.title}</h3>
              <p className="text-medium-gray text-sm mb-3">{ad.description}</p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-yellow-600 font-semibold text-lg">{AD_WATCH_REWARD_COINS} Coins</span>
              <span className="text-medium-gray text-sm">{AD_WATCH_DURATION_SECONDS} Seconds</span>
            </div>
            <button
              onClick={() => handleWatchAd(ad.id, ad.link)}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
              disabled={activeAd === ad.id || loading}
            >
              {activeAd === ad.id ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Watching... {timer}s
                </span>
              ) : (
                'Watch Ad'
              )}
            </button>
          </div>
        ))}
        {/* If no ads are loaded (shouldn't happen with DUMMY_ADS), this fallback would render. */}
        {ads.length === 0 && (
          <div className="col-span-full bg-white p-6 rounded-lg text-center text-dark-gray border border-gray-200">
            No ads configured. Please check back later!
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;