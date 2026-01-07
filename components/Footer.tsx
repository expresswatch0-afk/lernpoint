// components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white p-4 text-center text-sm shadow-md mt-auto">
      <div className="container mx-auto">
        &copy; {new Date().getFullYear()} LearnPoint. All rights reserved.
        <span className="mx-2">|</span>
        <a href="/#/privacy-policy" className="hover:underline">Privacy Policy</a>
        <span className="mx-2">|</span>
        <a href="/#/about" className="hover:underline">About Us</a>
      </div>
    </footer>
  );
};

export default Footer;