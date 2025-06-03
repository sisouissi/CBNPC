
import React from 'react';
import { Step, StepId } from '../types';
import { STEPS } from '../constants'; // Assuming STEPS is now in constants.ts
import { ChevronRight } from 'lucide-react';

interface StepNavigationProps {
  currentStepId: StepId;
  onStepClick: (stepId: StepId) => void;
  completedSteps: Set<StepId>;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ currentStepId, onStepClick, completedSteps }) => {
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStepId);

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center justify-center space-x-1 md:space-x-2">
        {STEPS.map((step, stepIdx) => (
          <li key={step.id} className="relative md:flex-1">
            {stepIdx < currentStepIndex || completedSteps.has(step.id) ? (
              // Completed or Past Step
              <button
                onClick={() => onStepClick(step.id)}
                className="group flex w-full flex-col items-center border-l-0 border-sky-600 py-2 pl-0 transition-colors md:border-l-4 md:pl-4 md:pt-4 md:pb-0"
                aria-current={step.id === currentStepId ? 'step' : undefined}
              >
                <span className="text-sm font-medium text-sky-600 transition-colors ">
                  <step.icon className="h-6 w-6 mb-1 mx-auto md:mr-2 md:inline-block" />
                  {step.title}
                </span>
              </button>
            ) : step.id === currentStepId ? (
              // Current Step
              <button
                onClick={() => onStepClick(step.id)}
                className="flex w-full flex-col items-center border-l-0 border-sky-600 py-2 pl-0 md:border-l-4 md:pl-4 md:pt-4 md:pb-0"
                aria-current="step"
              >
                <span className="text-sm font-medium text-sky-600">
                  <step.icon className="h-6 w-6 mb-1 mx-auto md:mr-2 md:inline-block" />
                  {step.title}
                </span>
              </button>
            ) : (
              // Future Step
              <button
                disabled={true} // Future steps are not clickable by default based on common stepper UX
                className="group flex w-full flex-col items-center border-l-0 border-gray-300 py-2 pl-0 transition-colors md:border-l-4 md:pl-4 md:pt-4 md:pb-0"
              >
                <span className="text-sm font-medium text-gray-500 transition-colors">
                  <step.icon className="h-6 w-6 mb-1 mx-auto md:mr-2 md:inline-block text-gray-400" />
                  {step.title}
                </span>
              </button>
            )}

            {/* Separator for larger screens */}
            {stepIdx !== STEPS.length - 1 ? (
              <div className="absolute top-0 right-0 hidden h-full w-5 md:block" aria-hidden="true">
                <ChevronRight className="h-full w-full text-gray-300" />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
};
    