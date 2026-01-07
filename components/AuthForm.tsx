// components/AuthForm.tsx
import React, { useState, FormEvent, useEffect } from 'react';
import { AuthFormType } from '../types';
import { loginUser, signUpUser } from '../services/authService';

interface AuthFormProps {
  type: AuthFormType;
  onAuthSuccess: () => void;
  initialReferralCode?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onAuthSuccess, initialReferralCode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState(initialReferralCode || '');

  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (type === 'login') {
        await loginUser(email, password);
      } else {
        await signUpUser(email, password, referralCode || undefined);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">
          {type === 'login' ? 'Login to LearnPoint' : 'Join LearnPoint'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-dark-gray text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-dark-gray text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {type === 'signup' && (
            <div>
              <label htmlFor="referralCode" className="block text-dark-gray text-sm font-medium mb-2">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                id="referralCode"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-dark-gray placeholder-medium-gray focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white transition duration-300"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {type === 'login' ? 'Logging in...' : 'Signing up...'}
              </span>
            ) : (
              type === 'login' ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          {type === 'login' ? (
            <p className="text-medium-gray">
              Don't have an account?{' '}
              <button
                onClick={() => window.location.hash = '#signup'}
                className="text-primary hover:text-primary-dark font-medium focus:outline-none"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-medium-gray">
              Already have an account?{' '}
              <button
                onClick={() => window.location.hash = '#login'}
                className="text-primary hover:text-primary-dark font-medium focus:outline-none"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;