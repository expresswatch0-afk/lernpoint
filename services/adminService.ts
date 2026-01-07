// services/adminService.ts
import { ref, get, set, update, remove, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import { User, WithdrawRequest, VideoPromotion, DepositRequest, Referral } from '../types';
import { REFERRAL_COMMISSION_PERCENT, ADMIN_UIDS, DAILY_AD_VIEW_LIMIT, YOUTUBE_PROMOTION_REWARD_COINS } from '../constants'; // Import DAILY_AD_VIEW_LIMIT

/**
 * Fetches all users.
 * @returns A promise that resolves with an array of User objects.
 */
export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    const usersData = snapshot.val();
    return Object.keys(usersData).map((key) => usersData[key] as User);
  }
  return [];
};

/**
 * Sets up a real-time listener for all users.
 * @param callback A function to call with the updated list of users.
 * @returns A function to unsubscribe the listener.
 */
export const listenToAllUsers = (callback: (users: User[]) => void) => {
  const usersRef = ref(database, 'users');
  const unsubscribe = onValue(usersRef, (snapshot) => {
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      const users: User[] = Object.keys(usersData).map((key) => ({ uid: key, ...usersData[key] }));
      callback(users);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};

/**
 * Updates a user's coins.
 * @param userId The UID of the user.
 * @param newCoins The new total coin amount for the user.
 */
export const adminUpdateUserCoins = async (userId: string, newCoins: number): Promise<void> => {
  await update(ref(database, `users/${userId}`), { coins: newCoins });
};

/**
 * Fetches all withdrawal requests.
 * @returns A promise that resolves with an array of WithdrawRequest objects.
 */
export const getAllWithdrawRequests = async (): Promise<WithdrawRequest[]> => {
  const withdrawRef = ref(database, 'withdrawRequests');
  const snapshot = await get(withdrawRef);
  if (snapshot.exists()) {
    const requestsData = snapshot.val();
    return Object.keys(requestsData).map((key) => ({ id: key, ...requestsData[key] }) as WithdrawRequest);
  }
  return [];
};

/**
 * Sets up a real-time listener for withdrawal requests.
 * @param callback A function to call with the updated list of withdrawal requests.
 * @returns A function to unsubscribe the listener.
 */
export const listenToWithdrawRequests = (callback: (requests: WithdrawRequest[]) => void) => {
  const withdrawRef = ref(database, 'withdrawRequests');
  const unsubscribe = onValue(withdrawRef, (snapshot) => {
    if (snapshot.exists()) {
      const requestsData = snapshot.val();
      const requests: WithdrawRequest[] = Object.keys(requestsData).map((key) => ({ id: key, ...requestsData[key] }));
      callback(requests.sort((a,b) => b.timestamp - a.timestamp)); // Sort by newest first
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};


/**
 * Updates the status of a withdrawal request and adjusts user coins.
 * @param requestId The ID of the withdrawal request.
 * @param status The new status ('approved' or 'rejected').
 * @param userId The UID of the user.
 * @param amountCoins The amount of coins involved in the withdrawal.
 */
export const updateWithdrawRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected',
  userId: string,
  amountCoins: number,
): Promise<void> => {
  await update(ref(database, `withdrawRequests/${requestId}`), { status: status });

  if (status === 'approved') {
    // Deduct coins from user
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
      const userData: User = userSnapshot.val();
      const newCoins = (userData.coins || 0) - amountCoins;
      await update(userRef, { coins: newCoins >= 0 ? newCoins : 0, firstWithdrawalCompleted: true });

      // If user was referred, award inviter 5% commission on first withdrawal
      if (userData.referredBy && !userData.firstWithdrawalCompleted) {
        const inviterRef = ref(database, `users/${userData.referredBy}`);
        const inviterSnapshot = await get(inviterRef);
        if (inviterSnapshot.exists()) {
          const commissionAmount = amountCoins * (REFERRAL_COMMISSION_PERCENT / 100);
          const inviterData: User = inviterSnapshot.val();
          const newInviterCoins = (inviterData.coins || 0) + commissionAmount;
          await update(inviterRef, { coins: newInviterCoins });
          // Also mark this referral as having completed first withdrawal
          await update(ref(database, `users/${userData.referredBy}/referrals/${userId}`), { firstWithdrawalApproved: true });
        }
      }
    }
  } else if (status === 'rejected') {
    // If rejected, coins are not deducted/returned (assuming they were not deducted initially)
    // For this app, coins are deducted ONLY upon approval.
  }
};

/**
 * Fetches all YouTube video promotion requests.
 * @returns A promise that resolves with an array of VideoPromotion objects.
 */
export const getAllVideoPromotions = async (): Promise<VideoPromotion[]> => {
  const promotionsRef = ref(database, 'videoPromotions');
  const snapshot = await get(promotionsRef);
  if (snapshot.exists()) {
    const promotionsData = snapshot.val();
    return Object.keys(promotionsData).map((key) => ({ id: key, ...promotionsData[key] }) as VideoPromotion);
  }
  return [];
};

/**
 * Sets up a real-time listener for video promotion requests.
 * @param callback A function to call with the updated list of video promotion requests.
 * @returns A function to unsubscribe the listener.
 */
export const listenToVideoPromotions = (callback: (promotions: VideoPromotion[]) => void) => {
  const promotionsRef = ref(database, 'videoPromotions');
  const unsubscribe = onValue(promotionsRef, (snapshot) => {
    if (snapshot.exists()) {
      const promotionsData = snapshot.val();
      const promotions: VideoPromotion[] = Object.keys(promotionsData).map((key) => ({ id: key, ...promotionsData[key] }));
      callback(promotions.sort((a,b) => b.timestamp - a.timestamp));
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};

/**
 * Updates the status of a video promotion request and adjusts user coins.
 * @param promoId The ID of the video promotion.
 * @param status The new status ('accepted' or 'rejected').
 * @param userId The UID of the user.
 * @param coins The coins to award if accepted.
 */
export const updateVideoPromotionStatus = async (
  promoId: string,
  status: 'accepted' | 'rejected',
  userId: string,
  coins: number,
): Promise<void> => {
  await update(ref(database, `videoPromotions/${promoId}`), { status: status });
  await update(ref(database, `users/${userId}/videoPromotions/${promoId}`), { status: status });

  if (status === 'accepted') {
    // Award coins to user
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
      const userData: User = userSnapshot.val();
      const newCoins = (userData.coins || 0) + coins;
      await update(userRef, { coins: newCoins });
    }
  }
};

/**
 * Fetches all deposit requests.
 * @returns A promise that resolves with an array of DepositRequest objects.
 */
export const getAllDepositRequests = async (): Promise<DepositRequest[]> => {
  const depositsRef = ref(database, 'depositRequests');
  const snapshot = await get(depositsRef);
  if (snapshot.exists()) {
    const depositsData = snapshot.val();
    return Object.keys(depositsData).map((key) => ({ id: key, ...depositsData[key] }) as DepositRequest);
  }
  return [];
};

/**
 * Sets up a real-time listener for deposit requests.
 * @param callback A function to call with the updated list of deposit requests.
 * @returns A function to unsubscribe the listener.
 */
export const listenToDepositRequests = (callback: (requests: DepositRequest[]) => void) => {
  const depositsRef = ref(database, 'depositRequests');
  const unsubscribe = onValue(depositsRef, (snapshot) => {
    if (snapshot.exists()) {
      const depositsData = snapshot.val();
      // Fix: Changed `requestsData[key]` to `depositsData[key]` to correctly access data from the snapshot.
      const requests: DepositRequest[] = Object.keys(depositsData).map((key) => ({ id: key, ...depositsData[key] }));
      callback(requests.sort((a,b) => b.timestamp - a.timestamp));
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};

/**
 * Updates the status of a deposit request and awards coins to the user.
 * @param depositId The ID of the deposit request.
 * @param status The new status ('approved' or 'rejected').
 * @param userId The UID of the user.
 * @param coinsToReceive The amount of coins to award if approved.
 */
export const updateDepositRequestStatus = async (
  depositId: string,
  status: 'approved' | 'rejected',
  userId: string,
  coinsToReceive: number,
): Promise<void> => {
  await update(ref(database, `depositRequests/${depositId}`), { status: status });

  if (status === 'approved') {
    // Award coins to user
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    if (userSnapshot.exists()) {
      const userData: User = userSnapshot.val();
      const newCoins = (userData.coins || 0) + coinsToReceive;
      await update(userRef, { coins: newCoins });
    }
  }
};

/**
 * Fetches all referrals for a given inviter.
 * @param inviterId The UID of the inviter.
 * @returns A promise that resolves with an object of Referral objects, or null.
 */
export const getReferralsForInviter = async (inviterId: string): Promise<{ [uid: string]: Referral } | null> => {
  const referralsRef = ref(database, `users/${inviterId}/referrals`);
  const snapshot = await get(referralsRef);
  if (snapshot.exists()) {
    return snapshot.val() as { [uid: string]: Referral };
  }
  return null;
};

/**
 * Sets up a real-time listener for referrals of a specific inviter.
 * @param inviterId The UID of the inviter.
 * @param callback A function to call with the updated list of referrals.
 * @returns A function to unsubscribe the listener.
 */
export const listenToReferralsForInviter = (inviterId: string, callback: (referrals: Referral[]) => void) => {
  const referralsRef = ref(database, `users/${inviterId}/referrals`);
  const unsubscribe = onValue(referralsRef, (snapshot) => {
    if (snapshot.exists()) {
      const referralsData = snapshot.val();
      const referrals: Referral[] = Object.keys(referralsData).map((key) => ({ id: key, ...referralsData[key] }));
      callback(referrals);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
};

/**
 * Verifies a referral (sets its status to 'verified') and increments inviter's verified invites count.
 * @param inviterId The UID of the inviter.
 * @param referredUserId The UID of the referred user.
 */
export const verifyReferral = async (inviterId: string, referredUserId: string): Promise<void> => {
  await update(ref(database, `users/${inviterId}/referrals/${referredUserId}`), { status: 'verified' });

  // Increment inviter's verified invites count
  const inviterVerifiedInvitesRef = ref(database, `users/${inviterId}/verifiedInvitesCount`);
  const inviterSnapshot = await get(ref(database, `users/${inviterId}`));
  if (inviterSnapshot.exists()) {
    const inviterData: User = inviterSnapshot.val();
    const currentVerifiedInvites = inviterData.verifiedInvitesCount || 0;
    await update(ref(database, `users/${inviterId}`), { verifiedInvitesCount: currentVerifiedInvites + 1 });
    await update(ref(database, `users/${inviterId}/challenges/verifiedInvites`), { count: currentVerifiedInvites + 1 });
  }
};

/**
 * Unverifies a referral (sets its status back to 'pending') and decrements inviter's verified invites count.
 * This is useful if a referral is found to be fraudulent.
 * @param inviterId The UID of the inviter.
 * @param referredUserId The UID of the referred user.
 */
export const unverifyReferral = async (inviterId: string, referredUserId: string): Promise<void> => {
  await update(ref(database, `users/${inviterId}/referrals/${referredUserId}`), { status: 'pending' });

  // Decrement inviter's verified invites count
  const inviterVerifiedInvitesRef = ref(database, `users/${inviterId}/verifiedInvitesCount`);
  const inviterSnapshot = await get(ref(database, `users/${inviterId}`));
  if (inviterSnapshot.exists()) {
    const inviterData: User = inviterSnapshot.val();
    const currentVerifiedInvites = inviterData.verifiedInvitesCount || 0;
    await update(ref(database, `users/${inviterId}`), { verifiedInvitesCount: Math.max(0, currentVerifiedInvites - 1) });
    await update(ref(database, `users/${inviterId}/challenges/verifiedInvites`), { count: Math.max(0, currentVerifiedInvites - 1) });
  }
};

/**
 * Updates global ad links.
 * @param adId The ID of the ad (e.g., 'ad1').
 * @param newLink The new URL for the ad.
 */
export const updateGlobalAdLink = async (adId: string, newLink: string): Promise<void> => {
  await update(ref(database, `admin/ads/${adId}`), { link: newLink });
};

/**
 * Fetches all global ad settings.
 * @returns A promise that resolves with an object of ad settings.
 */
export const getGlobalAds = async (): Promise<{ [adId: string]: { url: string; coins: number } } | null> => {
  const adsRef = ref(database, 'admin/ads');
  const snapshot = await get(adsRef);
  if (snapshot.exists()) {
    // Fix: Explicitly cast snapshot.val() to the expected type
    return snapshot.val() as { [adId: string]: { url: string; coins: number } };
  }
  return null;
};

/**
 * Sets up a real-time listener for global ad settings.
 * @param callback A function to call with the updated ad settings.
 * @returns A function to unsubscribe the listener.
 */
export const listenToGlobalAds = (callback: (ads: { [adId: string]: { url: string; coins: number } }) => void) => {
  const adsRef = ref(database, 'admin/ads');
  const unsubscribe = onValue(adsRef, (snapshot) => {
    if (snapshot.exists()) {
      // Fix: Explicitly cast snapshot.val() to the expected type
      callback(snapshot.val() as { [adId: string]: { url: string; coins: number } });
    } else {
      callback({});
    }
  });
  return unsubscribe;
};

/**
 * Updates social task links.
 * @param taskType The type of social task ('whatsapp' or 'youtube').
 * @param newLink The new URL for the social task.
 */
export const updateSocialTaskLink = async (taskType: 'whatsapp' | 'youtube', newLink: string): Promise<void> => {
  await update(ref(database, `admin/socialTaskLinks`), { [taskType]: newLink });
};

/**
 * Fetches all social task links.
 * @returns A promise that resolves with an object of social task links.
 */
export const getSocialTaskLinks = async (): Promise<{ whatsapp: string; youtube: string } | null> => {
  const linksRef = ref(database, 'admin/socialTaskLinks');
  const snapshot = await get(linksRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

/**
 * Sets up a real-time listener for social task links.
 * @param callback A function to call with the updated social task links.
 * @returns A function to unsubscribe the listener.
 */
export const listenToSocialTaskLinks = (callback: (links: { whatsapp: string; youtube: string }) => void) => {
  const linksRef = ref(database, 'admin/socialTaskLinks');
  const unsubscribe = onValue(linksRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({ whatsapp: '', youtube: '' });
    }
  });
  return unsubscribe;
};

/**
 * Updates the global daily ad view limit.
 * @param limit The new daily ad view limit.
 */
export const updateDailyAdViewLimit = async (limit: number): Promise<void> => {
  await update(ref(database, 'admin'), { dailyAdViewLimit: limit });
};

/**
 * Sets up a real-time listener for the daily ad view limit.
 * @param callback A function to call with the updated limit.
 * @returns A function to unsubscribe the listener.
 */
export const listenToDailyAdViewLimit = (callback: (limit: number) => void) => {
  const limitRef = ref(database, 'admin/dailyAdViewLimit');
  const unsubscribe = onValue(limitRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(DAILY_AD_VIEW_LIMIT); // Default from constants if not set
    }
  });
  return unsubscribe;
};

// Initial admin setup function (call this once from admin side if `admin` node doesn't exist)
export const setupInitialAdminSettings = async () => {
  const adminRef = ref(database, 'admin');
  const snapshot = await get(adminRef);
  if (!snapshot.exists()) {
    const adminUidsObject: { [key: string]: boolean } = {};
    ADMIN_UIDS.forEach(uid => {
      if (uid !== 'YOUR_ADMIN_UID_1' && uid !== 'YOUR_ADMIN_UID_2') { // Avoid adding placeholder UIDs
        adminUidsObject[uid] = true;
      }
    });

    await set(adminRef, {
      adminUids: adminUidsObject, // Populate with actual admin UIDs
      ads: {
        ad1: { url: 'https://www.google.com', coins: 10 },
        ad2: { url: 'https://www.youtube.com', coins: 10 },
        ad3: { url: 'https://www.bing.com', coins: 10 },
      },
      socialTaskLinks: {
        whatsapp: 'https://chat.whatsapp.com/YOUR_DEFAULT_INVITE',
        youtube: 'https://www.youtube.com/@YOUR_DEFAULT_CHANNEL',
      },
      youtubePromotionCoins: YOUTUBE_PROMOTION_REWARD_COINS, // Use constant
      referralCommission: REFERRAL_COMMISSION_PERCENT / 100, // Use constant, store as decimal
      coinToUsdRate: 0.00001,
      dailyAdViewLimit: DAILY_AD_VIEW_LIMIT, // Set initial daily ad view limit
    });
    console.log('Initial admin settings created.');
  }
};