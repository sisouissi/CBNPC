
import React from 'react';
import { QuestionNode as QuestionNodeType, DecisionOption } from '../types';
import { StyledButton } from './StyledButton';

interface QuestionDisplayProps {
  questionNode: QuestionNodeType;
  onAnswer: (questionId: string, option: DecisionOption) => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ questionNode, onAnswer }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-semibold text-text-primary whitespace-pre-line">{questionNode.text}</h2>
      <div className="space-y-3">
        {questionNode.options.map((option, index) => (
          <StyledButton
            key={index}
            variant="outline" // This will now be styled like a Fluent secondary/outline button
            onClick={() => onAnswer(questionNode.id, option)}
            fullWidth
            size="md" 
            // Chevron is now handled by StyledButton
          >
            {option.text}
          </StyledButton>
        ))}
      </div>
    </div>
  );
};
