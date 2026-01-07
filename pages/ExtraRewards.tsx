// pages/ExtraRewards.tsx
import React, { useState } from 'react';
import { User, Challenge } from '../types';
import { CHALLENGES } from '../constants';
import ProgressBar from '../components/ProgressBar';
import { collectChallengeReward } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';

interface ExtraRewardsProps {
  currentUser: User;
  onUserDataUpdate: () => void;
}

const ExtraRewards: React.FC<ExtraRewardsProps> = ({ currentUser, onUserDataUpdate }) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState<string | null>(null);

  const handleCollectReward = async (
    challengeType: 'ptcAds' | 'surfAds' | 'verifiedInvites',
    challenge: Challenge,
  ) => {
    setMessage(null);
    setLoadingChallenge(challenge.key);

    try {
      const success = await collectChallengeReward(
        currentUser.uid,
        challengeType,
        challenge.key,
        challenge.reward,
      );
      if (success) {
        setMessage({ type: 'success', text: `You collected ${challenge.reward} coins for ${challenge.label}!` });
        onUserDataUpdate();
      } else {
        setMessage({ type: 'error', text: 'Reward already collected or challenge not met.' });
      }
    } catch (err: any) {
      console.error('Error collecting reward:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to collect reward.' });
    } finally {
      setLoadingChallenge(null);
    }
  };

  const renderChallengeSection = (
    title: string,
    challengeType: 'ptcAds' | 'surfAds' | 'verifiedInvites',
    currentCount: number,
  ) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-primary mb-4">{title} Challenges</h3>
      <div className="space-y-6">
        {CHALLENGES[challengeType].map((challengeData, index) => {
          // Create a Challenge object with a 'key' property
          const challenge: Challenge = {
            ...challengeData,
            key: `${challengeType}-${index}-${challengeData.target}`, // Unique key for each challenge
          };
          const isCompleted = currentCount >= challenge.target;
          const isCollected = currentUser.challenges?.[challengeType]?.rewardsCollected?.[challenge.key];
          const canCollect = isCompleted && !isCollected;

          return (
            <div key={challenge.key} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex-grow mb-3 md:mb-0 md:mr-4 w-full">
                <ProgressBar
                  current={currentCount}
                  target={challenge.target}
                  label={challenge.label}
                />
              </div>
              <div className="flex-shrink-0 text-center">
                <span className="block text-yellow-600 text-xl font-bold mb-2">+{challenge.reward.toLocaleString()} Coins</span>
                <button
                  onClick={() => handleCollectReward(challengeType, challenge)}
                  className={`px-6 py-2 rounded-md font-semibold transition-colors duration-200 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
                    ${canCollect
                      ? 'bg-primary hover:bg-primary-dark text-white focus:ring-primary'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  disabled={!canCollect || loadingChallenge === challenge.key}
                >
                  {loadingChallenge === challenge.key ? (
                     <span className="flex items-center justify-center">
                     <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Collecting...
                   </span>
                  ) : (
                    isCollected ? 'Collected' : 'Collect Reward'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Extra Reward Challenges</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {renderChallengeSection('PTC Ads', 'ptcAds', currentUser.challenges?.ptcAds?.count || 0)}
        {renderChallengeSection('Surf Ads', 'surfAds', currentUser.challenges?.surfAds?.count || 0)}
        {renderChallengeSection('Verified Invites', 'verifiedInvites', currentUser.verifiedInvitesCount || 0)}
      </div>
    </div>
  );
};

export default ExtraRewards;