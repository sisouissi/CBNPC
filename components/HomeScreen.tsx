
import React from 'react';
import { APP_TITLE, DEVELOPER_NAME, SOURCE_REFERENCE } from '../constants';
import { StyledButton } from './StyledButton'; // Ensure StyledButton is imported

// Re-defining a large lung icon - this could be made more distinct or use the one from Header
const LungIconLarge: React.FC = () => (
  // Using a slightly different stroke-width or size to differentiate if needed, or keep consistent
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-16 h-16 text-primary mb-4 mx-auto">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 5.25c1.326 0 2.5.75 3.124 1.876A5.253 5.253 0 0121 9.75c0 1.46-.614 2.79-1.585 3.755C18.443 14.475 17.25 16.5 17.25 18H6.75c0-1.5-.98-3.313-2.165-4.495A5.245 5.245 0 013 9.75c0-1.386.51-2.655 1.376-3.624C5.001 6 6.174 5.25 7.5 5.25c1.133 0 2.14.578 2.752 1.478C10.86 7.605 11.422 9 12 9s1.14-.395 1.748-1.272C14.36 6.828 15.367 5.25 16.5 5.25zM12 9v9" />
  </svg>
);

const ArrowLongRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => ( // Increased size
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
  </svg>
);

interface HomeScreenProps {
  onStartEvaluation: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartEvaluation }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-background p-4">
      <div className="bg-neutral-surface p-6 sm:p-10 rounded-2xl shadow-lg max-w-xl w-full text-center">
        <LungIconLarge />
        <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary mb-2">
          {APP_TITLE}
        </h1>
        <p className="text-lg text-text-secondary mb-1">
          Prise en charge du cancer bronchique CBNPC
        </p>
        <p className="text-base text-text-disabled mb-4">
          Développée par {DEVELOPER_NAME}
        </p>
        <p className="text-sm text-text-disabled mb-8">
          {SOURCE_REFERENCE}.
        </p>
        
        <div className="flex justify-center mt-8 mb-4">
          <StyledButton
            onClick={onStartEvaluation}
            aria-label="Démarrer l'évaluation"
            // Applying gradient directly and ensuring text size and weight
            className="bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark text-text-onPrimary text-lg font-bold py-3 px-6" // Changed text-base to text-lg
            size="lg" // Using lg for padding, but text size controlled by className
            iconLeft={<ArrowLongRightIcon className="w-6 h-6 mr-2" />} // Ensure icon is visible and sized
          >
            Démarrer
          </StyledButton>
        </div>
        
        <p className="text-sm text-text-disabled mt-10 italic">
          Cet outil est une aide à la décision et ne remplace en aucun cas le jugement clinique d'un professionnel de santé.
        </p>
      </div>
       <p className="text-text-disabled text-xs mt-6">© {new Date().getFullYear()} {DEVELOPER_NAME}.</p>
    </div>
  );
};
