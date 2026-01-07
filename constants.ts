// constants.ts

/**
 * Global constants for the LearnPoint application.
 */

// --- Admin Panel Settings ---
export const ADMIN_UIDS: string[] = [
  'YOUR_ADMIN_UID_1', // Replace with actual Firebase UIDs for admin users
  'YOUR_ADMIN_UID_2',
];

// This email and password are for demo purposes. In a real app, do not hardcode admin credentials.
// Instead, use one of the UIDs from ADMIN_UIDS and ensure that user logs in with their own email/password.
// For initial setup, you might manually create an admin user in Firebase Auth and add their UID to ADMIN_UIDS.
export const DEMO_ADMIN_EMAIL = 'admin@learnpoint.blog';
export const DEMO_ADMIN_PASSWORD = 'adminpassword123';

// --- Ad Configurations ---
export const AD_WATCH_DURATION_SECONDS = 10;
export const AD_WATCH_REWARD_COINS = 10;
export const AD_WATCH_REDIRECT_LINK = 'https://www.google.com'; // Default ad link
export const DAILY_AD_VIEW_LIMIT = 500; // Total ads a user can watch per day (also stored in Firebase admin node for rules)

// Updated DUMMY_ADS to have 30 entries and include 'coins' property
export const DUMMY_ADS = Array.from({ length: 30 }, (_, i) => ({
  id: `ad${i + 1}`,
  title: `Ad #${i + 1}`,
  description: `Watch this short ad and earn ${AD_WATCH_REWARD_COINS} coins!`,
  imageUrl: `https://picsum.photos/400/200?random=${i + 1}`, // Images are removed from UI, but kept here for potential future use or consistency
  link: AD_WATCH_REDIRECT_LINK,
  coins: AD_WATCH_REWARD_COINS, // Added 'coins' property
}));

// --- Social Task Configurations ---
export const WHATSAPP_CHANNEL_LINK = 'https://chat.whatsapp.com/YOUR_CHANNEL_INVITE_LINK';
export const WHATSAPP_REWARD_COINS = 20;

export const YOUTUBE_CHANNEL_LINK = 'https://www.youtube.com/@YOUR_CHANNEL_USERNAME';
export const YOUTUBE_SUBSCRIBE_REWARD_COINS = 20;

export const YOUTUBE_PROMOTION_REWARD_COINS = 25000;

// --- Invite & Earn Configurations ---
export const REFERRAL_COMMISSION_PERCENT = 5; // 5% of referral's first withdrawal (simplified)

// --- Extra Reward Challenges ---
export const CHALLENGES = {
  ptcAds: [
    { target: 100, reward: 100, label: 'Watch 100 PTC Ads' },
    { target: 1000, reward: 1000, label: 'Watch 1000 PTC Ads' },
    { target: 5000, reward: 5000, label: 'Watch 5000 PTC Ads' },
  ],
  surfAds: [
    { target: 100, reward: 100, label: 'Watch 100 Surf Ads' },
    { target: 1000, reward: 1000, label: 'Watch 1000 Surf Ads' },
    { target: 5000, reward: 5000, label: 'Watch 5000 Surf Ads' },
  ],
  verifiedInvites: [
    { target: 10, reward: 500, label: '10 Verified Invites' },
    { target: 30, reward: 3000, label: '30 Verified Invites' },
    { target: 100, reward: 25000, label: '100 Verified Invites' },
    { target: 500, reward: 200000, label: '500 Verified Invites' },
    { target: 1000, reward: 500000, label: '1000 Verified Invites' },
  ],
};

// --- Withdraw Page Configuration ---
export const COIN_TO_USD_RATE = 0.00001; // Example: 1 coin = $0.00001 (100,000 coins = $1)

// --- Advertiser / Buy Coins Page Configuration ---
export const EASYPEASA_NUMBER = '03265740158';
export const ACCOUNT_NAME = 'Shumshad Begum';

// --- Privacy Policy Content ---
export const PRIVACY_POLICY_CONTENT = `
  <h2 class="text-2xl font-bold mb-4 text-primary">Privacy Policy for LearnPoint</h2>
  <p class="mb-3 text-medium-gray">At LearnPoint, accessible from learnpoint.blog, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by LearnPoint and how we use it.</p>

  <h3 class="xl text-xl font-semibold mb-3 text-primary">Information We Collect</h3>
  <p class="mb-3 text-medium-gray">We collect several different types of information for various purposes to provide and improve our Service to you.</p>
  <ul class="list-disc list-inside mb-4 ml-4 text-medium-gray">
    <li class="mb-2"><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:
      <ul class="list-disc list-inside mb-2 ml-4 text-medium-gray">
        <li>Email address</li>
        <li>First name and last name</li>
        <li>Usage Data</li>
      </ul>
    </li>
    <li class="mb-2"><strong>Usage Data:</strong> We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device ("Usage Data").</li>
  </ul>

  <h3 class="xl text-xl font-semibold mb-3 text-primary">How We Use Your Data</h3>
  <p class="mb-3 text-medium-gray">LearnPoint uses the collected data for various purposes:</p>
  <ul class="list-disc list-inside mb-4 ml-4 text-medium-gray">
    <li class="mb-2">To provide and maintain our Service</li>
    <li class="mb-2">To notify you about changes to our Service</li>
    <li class="mb-2">To allow you to participate in interactive features of our Service when you choose to do so</li>
    <li class="mb-2">To provide customer support</li>
    <li class="mb-2">To gather analysis or valuable information so that we can improve our Service</li>
    <li class="mb-2">To monitor the usage of our Service</li>
    <li class="mb-2">To detect, prevent and address technical issues</li>
    <li class="mb-2">To manage your account and provide you with earned rewards</li>
  </ul>

  <h3 class="xl text-xl font-semibold mb-3 text-primary">Cookies</h3>
  <p class="mb-3 text-medium-gray">We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. Tracking technologies also used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.</p>
  <p class="mb-3 text-medium-gray">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>

  <h3 class="xl text-xl font-semibold mb-3 text-primary">Account Suspension and Fake Activity Rules</h3>
  <p class="mb-3 text-medium-gray">LearnPoint reserves the right to suspend or terminate accounts that engage in fraudulent, manipulative, or any form of fake activity designed to illicitly gain rewards. This includes, but is not limited to: using bots, multiple accounts, false referrals, or any other method that violates our terms of service.</p>
  <p class="mb-3 text-medium-gray">Suspended accounts will lose all accumulated earnings and may be permanently banned from the platform. Our decisions regarding account activity are final.</p>

  <h3 class="xl text-xl font-semibold mb-3 text-primary">Changes to This Privacy Policy</h3>
  <p class="mb-3 text-medium-gray">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

  <h3 class="xl text-xl font-semibold mb-3 text-primary">Contact Us</h3>
  <p class="mb-3 text-medium-gray">If you have any questions about this Privacy Policy, please contact us at support@learnpoint.blog.</p>
`;

// --- About Page Content ---
export const ABOUT_CONTENT = `
  <h2 class="text-2xl font-bold mb-4 text-primary">About LearnPoint</h2>
  <p class="mb-3 text-medium-gray">Welcome to LearnPoint, your ultimate platform for earning rewards by engaging with various online activities. We believe in providing a transparent and fair environment where users can easily earn coins and exchange them for real value.</p>

  <h3 class="xl text-xl font-semibold mb-3 text-primary">How Users Earn Coins</h3>
  <p class="mb-3 text-medium-gray">Earning with LearnPoint is simple and fun! Here are the main ways you can accumulate coins:</p>
  <ul class="list-disc list-inside mb-4 ml-4 text-medium-gray">
    <li class="mb-2"><strong>Watch Ads / Surf Ads:</strong> Engage with short advertisements and instantly earn coins for your time. Each ad watched contributes to your balance.</li>
    <li class="mb-2"><strong>Social Tasks:</strong> Boost your earnings by completing simple social media tasks, such as joining WhatsApp channels or subscribing to YouTube channels.</li>
    <li class="mb-2"><strong>Invite & Earn:</strong> Share your unique referral link with friends and family. Earn a lifetime commission when your referrals become active and complete their first withdrawal.</li>
    <li class="mb-2"><strong>Extra Reward Challenges:</strong> Take on exciting challenges like watching a certain number of ads or inviting more users to unlock significant bonus rewards.</li>
    <li class="mb-2"><strong>YouTube Video Promotion:</strong> For content creators, we offer a unique opportunity to promote your YouTube videos and earn a substantial amount of coins upon admin approval.</li>
  </ul>

  <h3 class="xl text-xl font-semibold mb-3 text-primary">Transparency and Fair Usage Rules</h3>
  <p class="mb-3 text-medium-gray">At LearnPoint, transparency and fairness are at the core of our operations. We are committed to:</p>
  <ul class="list-disc list-inside mb-4 ml-4 text-medium-gray">
    <li class="mb-2"><strong>Clear Earning Mechanics:</strong> All coin earning methods and their respective rewards are clearly outlined.</li>
    <li class="mb-2"><strong>Secure Transactions:</strong> Your withdrawals and deposits are handled with utmost care and verified by our administration team.</li>
    <li class="mb-2"><strong>Anti-Fraud Measures:</strong> We employ robust systems to detect and prevent fraudulent activities, ensuring a fair playing field for all legitimate users. Accounts found engaging in fake activity will be suspended.</li>
    <li class="mb-2"><strong>User Support:</strong> Our support team is always ready to assist you with any queries or concerns.</li>
  </ul>
  <p class="mb-3 text-medium-gray">Join LearnPoint today and start earning with confidence!</p>
`;