// pages/PrivacyPolicy.tsx
import React from 'react';
import { PRIVACY_POLICY_CONTENT } from '../constants';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-6 md:p-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Privacy Policy</h1>
      <div className="text-dark-gray leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_CONTENT }} />
    </div>
  );
};

export default PrivacyPolicy;