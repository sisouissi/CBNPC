
import React from 'react';

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, currentStep, totalSteps }) => {
  const percentage = Math.round(progress * 100);
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-semibold text-primary">{`Étape ${currentStep} sur ${totalSteps}`}</span>
        <span className="text-xs font-semibold text-primary">{percentage}%</span>
      </div>
      <div className="w-full bg-neutral-border rounded-full h-1.5"> {/* Thinner bar, neutral background */}
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
