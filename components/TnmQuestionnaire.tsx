
import React, { useState, useEffect } from 'react';
import { TnmAnswers, TnmQuestion, TnmQuestionCategory, initialTnmAnswers } from '../types';
import { tnmQuestionnaireData } from '../data/tnmQuestions';
import { StyledButton } from './StyledButton';

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const HomeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5V21A.75.75 0 003.75 21H8.25v-5.25h7.5v5.25H19.5A.75.75 0 0020.25 21V10.5M15.75 19.5V10.5L12 7.5l-3.75 3V19.5" />
</svg>
);

interface TnmQuestionnaireProps {
  onComplete: (answers: TnmAnswers) => void;
  initialData?: TnmAnswers;
  onGoHome: () => void;
}

export const TnmQuestionnaire: React.FC<TnmQuestionnaireProps> = ({ onComplete, initialData = initialTnmAnswers, onGoHome }) => {
  const [answers, setAnswers] = useState<TnmAnswers>(initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAnswers(initialData);
    setError(null); 
  }, [initialData]);

  const handleChange = (questionId: keyof TnmAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (error) setError(null);
  };

  const validateAnswers = (): boolean => {
    for (const category of tnmQuestionnaireData) {
      for (const question of category.questions) {
        if (question.condition && !question.condition(answers)) {
          continue;
        }
        if (answers[question.id] === 'nsp') {
          setError(`Veuillez répondre à la question : "${question.label}" dans la section ${category.title}.`);
          return false;
        }
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAnswers()) {
      onComplete(answers);
    }
  };

  const renderQuestion = (question: TnmQuestion) => {
    if (question.condition && !question.condition(answers)) {
      return null;
    }

    const commonLabelClass = "block text-sm font-medium text-text-secondary mb-1";
    // Fluent UI inspired input styling
    const commonInputClass = "mt-1 block w-full p-2 border border-neutral-border rounded-md shadow-sm focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm bg-neutral-surface text-text-primary";

    if (question.type === 'select') {
      return (
        <div key={question.id} className="mb-5">
          <label htmlFor={question.id} className={commonLabelClass}>
            {question.label} <span className="text-status-error">*</span>
          </label>
          <select
            id={question.id}
            name={question.id}
            value={answers[question.id]}
            onChange={(e) => handleChange(question.id, e.target.value)}
            className={commonInputClass}
            aria-required="true"
          >
            {question.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    } else if (question.type === 'radio') {
      return (
        <div key={question.id} className="mb-5">
          <fieldset>
            <legend className={commonLabelClass}>{question.label} <span className="text-status-error">*</span></legend>
            <div className="mt-2 space-y-2">
              {question.options.map(opt => (
                <div key={opt.value} className="flex items-center">
                  <input
                    id={`${question.id}-${opt.value}`}
                    name={question.id}
                    type="radio"
                    value={opt.value}
                    checked={answers[question.id] === opt.value}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    className="focus:ring-primary h-4 w-4 text-primary border-neutral-border" // Adjusted border color
                    aria-required="true"
                  />
                  <label htmlFor={`${question.id}-${opt.value}`} className="ml-2 block text-sm text-text-primary">
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-background">
      <header className="bg-neutral-surface shadow-sm py-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">
            Bilan d'extension tumorale du CBNPC
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Veuillez renseigner les informations du scanner thoracique.
          </p>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto max-w-3xl w-full p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="bg-neutral-surface shadow-md rounded-lg p-6 sm:p-8 space-y-6">
          {tnmQuestionnaireData.map(category => (
            <div key={category.title} className="mb-6 last:mb-0">
              <h2 className="text-lg font-semibold text-primary border-b border-neutral-border pb-2 mb-4">
                {category.title}
              </h2>
              {category.questions.map(q => renderQuestion(q))}
            </div>
          ))}
          {error && 
            <div className="p-3 bg-status-errorBackground border border-status-error rounded-md text-sm text-status-error text-center">
              {error}
            </div>
          }
          <StyledButton type="submit" fullWidth size="lg" variant="primary" className="mt-6">
            Calculer le stade et continuer
          </StyledButton>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StyledButton 
              type="button" 
              onClick={onGoHome} 
              variant="secondary" 
              iconLeft={<ChevronLeftIcon />}
            >
              Précédent (Accueil)
            </StyledButton>
            <StyledButton 
              type="button" 
              onClick={onGoHome} 
              variant="secondary"
              iconLeft={<HomeIcon />}
            >
              Accueil
            </StyledButton>
          </div>
        </form>
      </main>
      <footer className="py-6 mt-auto text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs text-text-disabled italic">
                Tous les champs marqués d'un <span className="text-status-error font-semibold">*</span> sont obligatoires.
            </p>
        </div>
      </footer>
    </div>
  );
};
