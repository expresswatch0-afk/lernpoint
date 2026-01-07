// components/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, target, label }) => {
  const progress = Math.min(100, (current / target) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm font-medium">
        <span className="text-dark-gray">{label}</span>
        <span className="text-medium-gray">{current}/{target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;