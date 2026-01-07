// AdminApp.tsx (Admin Panel)
import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from './firebase';
import { checkAdminStatus } from './services/authService';
import { AdminPanelPage, AuthFormType } from './types';
import AuthForm from './components/AuthForm';
import AdminSidebar from './components/AdminSidebar';
import Header from './components/Header'; // New Header component
import Footer from './components/Footer'; // New Footer component
import AdminDashboard from './admin-pages/AdminDashboard';
import AdminUserManagement from './admin-pages/AdminUserManagement';
import AdminWithdrawalRequests from './admin-pages/AdminWithdrawalRequests';
import AdminVideoPromotions from './admin-pages/AdminVideoPromotions';
import AdminReferralVerification from './admin-pages/AdminReferralVerification';
import AdminDepositVerification from './admin-pages/AdminDepositVerification';
import AdminAdSettings from './admin-pages/AdminAdSettings';
import LoadingSpinner from './components/LoadingSpinner';
import { setupInitialAdminSettings } from './services/adminService';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from './constants';

const AdminApp: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<AdminPanelPage>('admin-dashboard');
  const [authFormType, setAuthFormType] = useState<AuthFormType>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar visibility


  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const adminStatus = checkAdminStatus(user.uid);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          await setupInitialAdminSettings(); // Ensure initial admin settings exist
        } else {
          // If a non-admin user somehow logs into the admin panel, log them out.
          await auth.signOut();
        }
      } else {
        setIsAdmin(false);
        setCurrentPage('admin-dashboard'); // Reset page when logged out
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setLoading(true); // Indicate loading while admin status is re-checked
    // onAuthStateChanged listener will handle the rest
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const renderAdminPage = () => {
    switch (currentPage) {
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentPage} />;
      case 'admin-users':
        return <AdminUserManagement />;
      case 'admin-withdrawals':
        return <AdminWithdrawalRequests />;
      case 'admin-video-promotions':
        return <AdminVideoPromotions />;
      case 'admin-referrals':
        return <AdminReferralVerification />;
      case 'admin-deposits':
        return <AdminDepositVerification />;
      case 'admin-ads-settings':
        return <AdminAdSettings />;
      default:
        return <AdminDashboard onNavigate={setCurrentPage} />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!firebaseUser || !isAdmin) {
    // Display login for admin. For initial setup, you can use a hardcoded admin UID.
    // NOTE: In a production environment, never hardcode admin credentials or rely solely on client-side UID checks.
    // Admin UIDs should be managed server-side or via Firebase Security Rules.
    // For this demo, please manually add an admin UID to constants.ts ADMIN_UIDS array
    // after creating an account for it, and then log in with that account.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <AuthForm
          type={authFormType}
          onAuthSuccess={handleAuthSuccess}
        />
        <p className="mt-4 text-medium-gray text-sm max-w-md text-center">
          Admin access required. Please log in with an authorized admin account.
          For demo: <span className="text-primary">{DEMO_ADMIN_EMAIL}</span> / <span className="text-primary">{DEMO_ADMIN_PASSWORD}</span>
          <br />
          (Remember to add this user's UID to `constants.ts` after first login for proper admin privileges)
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Header for mobile */}
      <Header appName="LearnPoint" isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isAdminPanel={true} />

      {/* Admin Sidebar */}
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
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
          {renderAdminPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminApp;