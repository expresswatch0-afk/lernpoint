// services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { ref, set, get, DataSnapshot } from 'firebase/database';
import { auth, database } from '../firebase';
import { User } from '../types';
import { ADMIN_UIDS } from '../constants';

/**
 * Signs up a new user with email and password.
 * @param email User's email.
 * @param password User's password.
 * @param referralCode Optional referral code.
 * @returns A promise that resolves with the Firebase user.
 */
export const signUpUser = async (email: string, password: string, referralCode?: string): Promise<FirebaseAuthUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newUser: User = {
      uid: user.uid,
      email: user.email!,
      coins: 0,
      // adsWatched: {}, // Removed as per new daily ad watch tracking
      socialTasks: {
        whatsappJoined: false,
        youtubeSubscribed: false,
      },
      challenges: {
        ptcAds: { count: 0, rewardsCollected: {} },
        surfAds: { count: 0, rewardsCollected: {} },
        verifiedInvites: { count: 0, rewardsCollected: {} },
      },
      totalInvites: 0,
      verifiedInvitesCount: 0,
      firstWithdrawalCompleted: false,
    };

    if (referralCode) {
      newUser.referredBy = referralCode;
      // Also update the inviter's totalInvites count
      const inviterRef = ref(database, `users/${referralCode}`);
      const inviterSnapshot: DataSnapshot = await get(inviterRef);
      if (inviterSnapshot.exists()) {
        const inviterData: User = inviterSnapshot.val();
        await set(ref(database, `users/${referralCode}/totalInvites`), (inviterData.totalInvites || 0) + 1);
        // Add referred user to inviter's referrals list
        await set(ref(database, `users/${referralCode}/referrals/${user.uid}`), {
          email: user.email,
          referredAt: Date.now(),
          firstWithdrawalApproved: false,
          status: 'pending' // Admin will verify this
        });
      }
    }

    await set(ref(database, `users/${user.uid}`), newUser);
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

/**
 * Logs in an existing user with email and password.
 * @param email User's email.
 * @param password User's password.
 * @returns A promise that resolves with the Firebase user.
 */
export const loginUser = async (email: string, password: string): Promise<FirebaseAuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

/**
 * Logs out the current user.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

/**
 * Checks if the given user UID belongs to an admin.
 * @param uid User's UID.
 * @returns True if the user is an admin, false otherwise.
 */
export const checkAdminStatus = (uid: string): boolean => {
  return ADMIN_UIDS.includes(uid);
};