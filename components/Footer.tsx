
import React from 'react';
import { SOURCE_REFERENCE, SOURCE_REFERENCE_URL } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-10 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-text-secondary mb-2">
          Source: <a href={SOURCE_REFERENCE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{SOURCE_REFERENCE}</a>
        </p>
        <p className="text-xs text-text-disabled italic">
          Cet outil est conçu comme une aide à la décision et ne remplace pas le jugement clinique du professionnel de santé.
        </p>
         <p className="text-xs text-text-disabled mt-4">
          © {new Date().getFullYear()} Dr. Zouhair Souissi. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};
