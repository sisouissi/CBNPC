
import React from 'react';
import { RecommendationNode as RecommendationNodeType, Answers } from '../types';

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface RecommendationDisplayProps {
  recommendationNode: RecommendationNodeType;
  answers: Answers;
}

export const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendationNode, answers }) => {
  const descriptionText = typeof recommendationNode.description === 'function'
    ? recommendationNode.description(answers)
    : recommendationNode.description;

  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold text-accent flex items-center"> {/* Updated to font-semibold from bold, color from accent */}
        <CheckCircleIcon className="text-accent mr-2 flex-shrink-0" />
        <span>{recommendationNode.title}</span>
      </h2>
      <div className="text-text-secondary whitespace-pre-line pl-8 text-sm">{descriptionText}</div> {/* Text size slightly smaller */}
      {recommendationNode.details && (
        <p className="text-xs text-text-disabled italic pl-8">{recommendationNode.details}</p>
      )}
    </div>
  );
};
