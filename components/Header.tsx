
import React from 'react';
import { APP_TITLE, DEVELOPER_NAME } from '../constants';

const LungIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-primary inline-block mr-3 align-middle">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 5.25c1.326 0 2.5.75 3.124 1.876A5.253 5.253 0 0121 9.75c0 1.46-.614 2.79-1.585 3.755C18.443 14.475 17.25 16.5 17.25 18H6.75c0-1.5-.98-3.313-2.165-4.495A5.245 5.245 0 013 9.75c0-1.386.51-2.655 1.376-3.624C5.001 6 6.174 5.25 7.5 5.25c1.133 0 2.14.578 2.752 1.478C10.86 7.605 11.422 9 12 9s1.14-.395 1.748-1.272C14.36 6.828 15.367 5.25 16.5 5.25zM12 9v9" />
  </svg>
);

export const Header: React.FC = () => {
  return (
    <header className="bg-neutral-surface shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <LungIcon />
            <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">
              {APP_TITLE}
            </h1>
          </div>
          <p className="text-sm text-text-secondary mt-0.5">
            Prise en charge du CBNPC - Développé par {DEVELOPER_NAME}
          </p>
        </div>
      </div>
    </header>
  );
};
