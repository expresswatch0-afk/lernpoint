// types.ts

/**
 * Interface for a User object stored in Firebase.
 */
export interface User {
  uid: string;
  email: string;
  coins: number;
  // Removed: adsWatched?: { [adId: string]: boolean };
  dailyAdStats?: {
    [date: string]: { // e.g., "2024-07-29"
      totalWatches: number; // Total ads watched on this day
    };
  };
  socialTasks?: {
    whatsappJoined?: boolean;
    youtubeSubscribed?: boolean;
  };
  videoPromotions?: {
    [promoId: string]: VideoPromotion;
  };
  referralLink?: string;
  referredBy?: string; // UID of the user who referred this user
  challenges?: {
    ptcAds?: {
      count: number;
      rewardsCollected: { [challengeKey: string]: boolean };
    };
    surfAds?: {
      count: number;
      rewardsCollected: { [challengeKey: string]: boolean };
    };
    verifiedInvites?: {
      count: number;
      rewardsCollected: { [challengeKey: string]: boolean };
    };
  };
  totalInvites?: number;
  verifiedInvitesCount?: number;
  firstWithdrawalCompleted?: boolean;
  // Fix: Added the 'referrals' property to the User interface.
  // This property stores an object where keys are UIDs of referred users
  // and values are Referral objects.
  referrals?: { [uid: string]: Referral };
}

/**
 * Interface for an Ad object.
 */
export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  coins: number; // Coins earned for watching this specific ad
}

/**
 * Interface for a Social Task.
 */
export interface SocialTask {
  id: string;
  name: string;
  coins: number;
  link?: string;
  status?: 'pending' | 'completed'; // For tasks like YouTube Promotion
}

/**
 * Interface for a YouTube Video Promotion request.
 */
export interface VideoPromotion {
  id: string;
  userId: string;
  userEmail: string;
  videoLink: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
  coins: number;
}

/**
 * Interface for a Withdrawal Request.
 */
export interface WithdrawRequest {
  id: string;
  userId: string;
  userEmail: string;
  amountCoins: number;
  amountUSD: number;
  method: string;
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

/**
 * Interface for a Deposit Request (Buy Coins).
 */
export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  transactionId: string;
  amountDeposited: number; // Amount user paid in currency
  coinsToReceive: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

/**
 * Interface for a Challenge.
 */
export interface Challenge {
  target: number;
  reward: number;
  label: string;
  key: string; // Unique key for the challenge
}

/**
 * Interface for Referral data.
 */
export interface Referral {
  id: string; // UID of the referred user
  email: string;
  referredAt: number;
  firstWithdrawalApproved: boolean;
  status: 'pending' | 'verified'; // Admin status for referral verification
}

/**
 * Type for navigation paths.
 */
export type UserPanelPage =
  | 'dashboard'
  | 'social-tasks'
  | 'invite-earn'
  | 'extra-rewards'
  | 'withdraw'
  | 'advertiser'
  | 'privacy-policy'
  | 'about'
  | 'logout';

export type AdminPanelPage =
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-withdrawals'
  | 'admin-video-promotions'
  | 'admin-referrals'
  | 'admin-deposits'
  | 'admin-ads-settings';

/**
 * AuthFormType for login/signup.
 */
export type AuthFormType = 'login' | 'signup';

/**
 * Interface for Firebase context state.
 */
// Fix: Updated Firebase User type to FirebaseAuthUser
import { User as FirebaseAuthUser } from 'firebase/auth';
export interface AuthContextType {
  currentUser: FirebaseAuthUser | null;
  loading: boolean;
}

export interface AdminContextType {
  currentUser: FirebaseAuthUser | null;
  isAdmin: boolean;
  loading: boolean;
}