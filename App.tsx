// App.tsx (User Panel)
import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from './firebase';
import { getUserData } from './services/userService';
import { User, UserPanelPage, AuthFormType } from './types';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header'; // New Header component
import Footer from './components/Footer'; // New Footer component
import Dashboard from './pages/Dashboard';
import SocialTasks from './pages/SocialTasks';
import InviteEarn from './pages/InviteEarn';
import ExtraRewards from './pages/ExtraRewards';
import Withdraw from './pages/Withdraw';
import Advertiser from './pages/Advertiser';
import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<UserPanelPage>('dashboard');
  const [authFormType, setAuthFormType] = useState<AuthFormType>('login');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar visibility

  // Parse referral code from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split('?')[1]);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      setAuthFormType('signup'); // Default to signup if referral code is present
    } else if (hash.includes('signup')) {
      setAuthFormType('signup');
    } else {
      setAuthFormType('login');
    }

    const handleHashChange = () => {
      const currentHash = window.location.hash;
      const currentParams = new URLSearchParams(currentHash.split('?')[1]);
      const currentRef = currentParams.get('ref');

      if (currentRef && currentRef !== referralCode) {
        setReferralCode(currentRef);
        setAuthFormType('signup');
      } else if (currentHash.includes('signup')) {
        setAuthFormType('signup');
      } else if (currentHash.includes('login')) {
        setAuthFormType('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [referralCode]);

  // Fetch user data from Firebase
  const fetchUserData = useCallback(async (uid: string) => {
    try {
      const data = await getUserData(uid);
      if (data) {
        setCurrentUserData(data);
      } else {
        // This should ideally not happen if user signed up correctly
        console.warn('User data not found for UID:', uid);
        setCurrentUserData(null);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setCurrentUserData(null);
    }
  }, []);

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setCurrentUserData(null);
        setCurrentPage('dashboard'); // Reset page to default when logged out
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  const handleAuthSuccess = () => {
    // Auth state observer will handle fetching user data
    setLoading(true); // Indicate loading while user data is fetched
  };

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const renderPage = () => {
    if (!currentUserData) {
      return null; // Should not happen if user is logged in and data is fetched
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={currentUserData} onUserDataUpdate={() => fetchUserData(currentUserData.uid)} />;
      case 'social-tasks':
        return <SocialTasks currentUser={currentUserData} onUserDataUpdate={() => fetchUserData(currentUserData.uid)} />;
      case 'invite-earn':
        return <InviteEarn currentUser={currentUserData} />;
      case 'extra-rewards':
        return <ExtraRewards currentUser={currentUserData} onUserDataUpdate={() => fetchUserData(currentUserData.uid)} />;
      case 'withdraw':
        return <Withdraw currentUser={currentUserData} onUserDataUpdate={() => fetchUserData(currentUserData.uid)} />;
      case 'advertiser':
        return <Advertiser currentUser={currentUserData} />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'about':
        return <About />;
      default:
        return <Dashboard currentUser={currentUserData} onUserDataUpdate={() => fetchUserData(currentUserData.uid)} />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!firebaseUser) {
    return (
      <AuthForm
        type={authFormType}
        onAuthSuccess={handleAuthSuccess}
        initialReferralCode={referralCode}
      />
    );
  }

  if (!currentUserData) {
    return <LoadingSpinner />; // User is logged in but data not loaded yet
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Header for mobile */}
      <Header appName="LearnPoint" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userCoins={currentUserData.coins}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content Area */}
      <div className={`flex-grow flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'} mt-16 md:mt-0`}>
        <main className="flex-grow p-4 md:p-8">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;