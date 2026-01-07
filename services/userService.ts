// services/userService.ts
import { ref, get, set, update, push, runTransaction, increment, DataSnapshot } from 'firebase/database';
import { database } from '../firebase';
import { User, Ad, VideoPromotion, WithdrawRequest, DepositRequest, Challenge } from '../types';
import {
  AD_WATCH_REWARD_COINS,
  WHATSAPP_REWARD_COINS,
  YOUTUBE_SUBSCRIBE_REWARD_COINS,
  YOUTUBE_PROMOTION_REWARD_COINS,
  COIN_TO_USD_RATE,
  DAILY_AD_VIEW_LIMIT, // Import the new constant
} from '../constants';

/**
 * Fetches user data from Firebase.
 * @param userId The UID of the user.
 * @returns A promise that resolves with the User object or null if not found.
 */
export const getUserData = async (userId: string): Promise<User | null> => {
  const userRef = ref(database, `users/${userId}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    return snapshot.val() as User;
  }
  return null;
};

/**
 * Updates a user's coins.
 * @param userId The UID of the user.
 * @param amount The amount of coins to add (positive) or subtract (negative).
 */
export const updateCoins = async (userId: string, amount: number): Promise<void> => {
  const userCoinsRef = ref(database, `users/${userId}/coins`);
  await runTransaction(userCoinsRef, (currentCoins) => {
    return (currentCoins || 0) + amount;
  });
};

/**
 * Records an ad watch, awards coins, and checks against daily limits.
 * @param userId The UID of the user.
 * @param adId The ID of the ad (not used for unique watch tracking anymore, but for general ad context).
 * @param coins The coins to award for watching.
 * @returns True if ad was watched and coins awarded. Throws an error if daily limit reached or other issues.
 */
export const watchAd = async (userId: string, adId: string, coins: number = AD_WATCH_REWARD_COINS): Promise<boolean> => {
  const userRef = ref(database, `users/${userId}`);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

  let success = false;
  let errorMessage: string | null = null;

  try {
    const transactionResult = await runTransaction(userRef, (currentData: DataSnapshot | null) => {
      let user: User;
      let dataExists: boolean;
      let dataValue: any;

      // CRITICAL: Robustly determine if data exists and get its value,
      // handling cases where currentData might not be a proper DataSnapshot.
      if (currentData === null) {
        // Firebase passed null, indicating data does not exist at the location.
        dataExists = false;
        dataValue = null;
      } else if (typeof currentData.exists === 'function' && typeof currentData.val === 'function') {
        // currentData is a proper DataSnapshot.
        dataExists = currentData.exists();
        dataValue = currentData.val();
      } else {
        // Unexpected scenario: currentData is not null but also not a DataSnapshot (missing .exists() or .val()).
        // Treat currentData itself as the raw value, and infer existence from its truthiness.
        console.warn('Firebase transaction received non-DataSnapshot object for UID', userId, ':', currentData);
        dataExists = !!currentData; // If it's an object/primitive, it "exists".
        dataValue = currentData;
      }

      // If user node doesn't exist (or is null), initialize a new default user object.
      // This makes the transaction self-healing for missing user nodes.
      if (!dataExists || dataValue === null) {
        console.warn(`User data for UID ${userId} not found or null during ad watch transaction. Initializing default user data.`);
        user = {
          uid: userId,
          email: 'auto-initialized@learnpoint.blog', // Placeholder, should be overwritten by real signup flow
          coins: 0,
          challenges: {
            ptcAds: { count: 0, rewardsCollected: {} },
            surfAds: { count: 0, rewardsCollected: {} },
            verifiedInvites: { count: 0, rewardsCollected: {} },
          },
          totalInvites: 0,
          verifiedInvitesCount: 0,
          firstWithdrawalCompleted: false,
          dailyAdStats: {},
          socialTasks: {
            whatsappJoined: false,
            youtubeSubscribed: false,
          },
        };
      } else {
        // If data exists, use it.
        user = dataValue as User;
      }
      
      // Ensure all necessary fields are initialized defensively if they are missing
      user.coins = user.coins || 0;
      user.challenges = user.challenges || {};
      user.challenges.ptcAds = user.challenges.ptcAds || { count: 0, rewardsCollected: {} };
      user.dailyAdStats = user.dailyAdStats || {};
      user.dailyAdStats[today] = user.dailyAdStats[today] || { totalWatches: 0 };

      // Check daily ad watch limit
      if (user.dailyAdStats[today].totalWatches >= DAILY_AD_VIEW_LIMIT) {
        errorMessage = `Daily ad watch limit (${DAILY_AD_VIEW_LIMIT}) reached. Try again tomorrow.`;
        return; // Abort transaction if limit reached by returning undefined
      }

      // Update data
      user.dailyAdStats[today].totalWatches += 1;
      user.coins += coins;
      user.challenges.ptcAds.count += 1;

      success = true; // Mark success if we reach here and modify data
      return user; // Commit transaction with updated data
    });

    if (!transactionResult.committed && errorMessage) {
      // Transaction was explicitly aborted by our logic (e.g., daily limit reached)
      throw new Error(errorMessage);
    } else if (!transactionResult.committed) {
      // Transaction was aborted for other reasons (e.g., concurrent modification, network issues)
      throw new Error('Failed to watch ad due to a transaction conflict or unexpected database state. Please try again.');
    }

    return success; // Return true on successful commit
  } catch (error: any) {
    console.error('Error during watchAd transaction:', error);
    // If an error message was set in the transaction, use that, otherwise default
    throw new Error(errorMessage || error.message || 'An unexpected error occurred during ad watch.');
  }
};


/**
 * Marks WhatsApp channel as joined and awards coins.
 * @param userId The UID of the user.
 * @returns True if successful, false if already joined.
 */
export const joinWhatsapp = async (userId: string): Promise<boolean> => {
  const whatsappRef = ref(database, `users/${userId}/socialTasks/whatsappJoined`);
  const snapshot = await get(whatsappRef);
  if (!snapshot.exists() || !snapshot.val()) {
    await update(ref(database, `users/${userId}`), {
      'socialTasks/whatsappJoined': true,
      coins: increment(WHATSAPP_REWARD_COINS),
    });
    return true;
  }
  return false;
};

/**
 * Marks YouTube channel as subscribed and awards coins.
 * @param userId The UID of the user.
 * @returns True if successful, false if already subscribed.
 */
export const subscribeYoutube = async (userId: string): Promise<boolean> => {
  const youtubeRef = ref(database, `users/${userId}/socialTasks/youtubeSubscribed`);
  const snapshot = await get(youtubeRef);
  if (!snapshot.exists() || !snapshot.val()) {
    await update(ref(database, `users/${userId}`), {
      'socialTasks/youtubeSubscribed': true,
      coins: increment(YOUTUBE_SUBSCRIBE_REWARD_COINS),
    });
    return true;
  }
  return false;
};

/**
 * Submits a YouTube video promotion request.
 * @param userId The UID of the user.
 * @param userEmail The email of the user.
 * @param videoLink The link to the YouTube video.
 */
export const submitVideoPromotion = async (userId: string, userEmail: string, videoLink: string): Promise<string> => {
  const newPromoRef = push(ref(database, `users/${userId}/videoPromotions`));
  const promoId = newPromoRef.key!;
  const newPromotion: VideoPromotion = {
    id: promoId,
    userId: userId,
    userEmail: userEmail,
    videoLink: videoLink,
    status: 'pending',
    timestamp: Date.now(),
    coins: YOUTUBE_PROMOTION_REWARD_COINS,
  };
  await set(newPromoRef, newPromotion);

  // Also store in a top-level collection for admin
  await set(ref(database, `videoPromotions/${promoId}`), newPromotion);
  return promoId;
};

/**
 * Submits a withdrawal request.
 * @param userId The UID of the user.
 * @param userEmail The email of the user.
 * @param amountCoins The amount of coins to withdraw.
 * @param method The withdrawal method.
 * @param accountDetails Account details for the withdrawal.
 */
export const submitWithdrawRequest = async (
  userId: string,
  userEmail: string,
  amountCoins: number,
  method: string,
  accountDetails: string,
): Promise<string> => {
  const newWithdrawRef = push(ref(database, `withdrawRequests`));
  const withdrawId = newWithdrawRef.key!;
  const amountUSD = amountCoins * COIN_TO_USD_RATE;

  const newRequest: WithdrawRequest = {
    id: withdrawId,
    userId: userId,
    userEmail: userEmail,
    amountCoins: amountCoins,
    amountUSD: parseFloat(amountUSD.toFixed(5)), // Keep USD to 5 decimal places
    method: method,
    accountDetails: accountDetails,
    status: 'pending',
    timestamp: Date.now(),
  };
  await set(newWithdrawRef, newRequest);
  return withdrawId;
};

/**
 * Submits a deposit request for buying coins.
 * @param userId The UID of the user.
 * @param userEmail The email of the user.
 * @param transactionId The transaction ID from the payment.
 * @param amountDeposited The amount of currency deposited.
 * @param coinsToReceive The amount of coins the user expects to receive.
 */
export const submitDepositRequest = async (
  userId: string,
  userEmail: string,
  transactionId: string,
  amountDeposited: number,
  coinsToReceive: number,
): Promise<string> => {
  const newDepositRef = push(ref(database, `depositRequests`));
  const depositId = newDepositRef.key!;

  const newRequest: DepositRequest = {
    id: depositId,
    userId: userId,
    userEmail: userEmail,
    transactionId: transactionId,
    amountDeposited: amountDeposited,
    coinsToReceive: coinsToReceive,
    status: 'pending',
    timestamp: Date.now(),
  };
  await set(newDepositRef, newRequest);
  return depositId;
};

/**
 * Collects an extra reward challenge.
 * @param userId The UID of the user.
 * @param challengeType Type of challenge ('ptcAds', 'surfAds', 'verifiedInvites').
 * @param challengeKey Unique key for the specific challenge level.
 * @param rewardCoins Coins to be awarded.
 */
export const collectChallengeReward = async (
  userId: string,
  challengeType: 'ptcAds' | 'surfAds' | 'verifiedInvites',
  challengeKey: string,
  rewardCoins: number,
): Promise<boolean> => {
  const rewardCollectedRef = ref(database, `users/${userId}/challenges/${challengeType}/rewardsCollected/${challengeKey}`);
  const snapshot = await get(rewardCollectedRef);

  if (!snapshot.exists() || !snapshot.val()) {
    await update(ref(database, `users/${userId}`), {
      [`challenges/${challengeType}/rewardsCollected/${challengeKey}`]: true,
      coins: increment(rewardCoins),
    });
    return true;
  }
  return false; // Reward already collected
};