
import React from 'react';
import { G8Answers, G8Question, G8AnswerKey } from '../types';
import { G8_QUESTIONS, ICONS } from '../constants';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

interface G8CalculatorProps {
  g8Answers: G8Answers;
  onAnswerChange: (key: G8AnswerKey, value: string) => void;
  onSubmit: (score: number) => void;
  onCancel: () => void;
}

export const G8Calculator: React.FC<G8CalculatorProps> = ({ g8Answers, onAnswerChange, onSubmit, onCancel }) => {
  const calculateG8ScoreInternal = (): number => {
    let total = 0;
    Object.values(g8Answers).forEach(value => {
      if (value !== '' && !isNaN(parseFloat(value))) {
        total += parseFloat(value);
      }
    });
    return total;
  };

  const currentScore = calculateG8ScoreInternal();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sky-700">
          <ICONS.G8Calculator className="h-6 w-6" />
          Calculateur Score G8 - Évaluation Gériatrique Détaillée
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {G8_QUESTIONS.map((questionItem, index) => (
          <div key={questionItem.key} className="p-4 border border-slate-200 rounded-lg bg-slate-50 shadow-sm">
            <h4 className="font-medium text-slate-700 mb-3 text-sm">
              {index + 1}. {questionItem.question}
            </h4>
            <div className="space-y-2">
              {questionItem.options.map((option) => (
                <label key={option.value + questionItem.key} className="flex items-center p-2 rounded-md hover:bg-sky-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={questionItem.key}
                    value={option.value}
                    checked={g8Answers[questionItem.key] === option.value}
                    onChange={(e) => onAnswerChange(questionItem.key, e.target.value)}
                    className="mr-3 h-4 w-4 text-sky-600 border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-600">({option.value} pt) {option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Score G8 calculé:</span>
            <span className="text-2xl font-bold text-sky-600">
              {currentScore.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}/17
            </span>
          </div>
          <div className={`mt-2 text-sm font-medium ${currentScore <= 14 ? 'text-amber-600' : 'text-green-600'}`}>
            {currentScore <= 14 
              ? '⚠️ Score ≤14 : Patient potentiellement fragile - Une évaluation oncogériatrique approfondie est recommandée.' 
              : '✅ Score >14 : Patient a priori en bon état général selon ce score.'
            }
          </div>
        </div>
        
        <div className="flex gap-4 justify-end mt-8">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-md text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Annuler
          </button>
          <button
            onClick={() => onSubmit(currentScore)}
            className="px-6 py-2 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Appliquer le score et Continuer
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
    