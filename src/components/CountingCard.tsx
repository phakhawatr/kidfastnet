import { useDroppable } from '@dnd-kit/core';
import { CountingChallenge } from '@/utils/countingChallengeUtils';
import { CountingVisuals } from './CountingVisuals';
import { DraggableNumberTile } from './DraggableNumberTile';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface CountingCardProps {
  challenge: CountingChallenge;
  cardNumber: 1 | 2;
  onAnswer: (answer: number) => { isCorrect: boolean };
  isCorrect: boolean;
  showHandHint?: boolean;
}

export const CountingCard = ({ 
  challenge, 
  cardNumber, 
  onAnswer, 
  isCorrect,
  showHandHint = false 
}: CountingCardProps) => {
  const { t } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${cardNumber}`,
    disabled: isCorrect,
  });

  const handleAnswerClick = (answer: number) => {
    if (isCorrect) return;
    
    setSelectedAnswer(answer);
    const result = onAnswer(answer);
    
    if (!result.isCorrect) {
      setShowIncorrect(true);
      setTimeout(() => {
        setShowIncorrect(false);
        setSelectedAnswer(null);
      }, 500);
    }
  };

  return (
    <div
      className={`
        relative bg-white rounded-3xl border-4 ${challenge.borderColor}
        shadow-2xl p-6 transition-all duration-300
        ${showIncorrect ? 'animate-shake border-red-600' : ''}
        ${isCorrect ? 'border-green-500 shadow-green-500/50' : ''}
        ${isOver ? 'scale-105 shadow-2xl' : ''}
      `}
    >
      {/* Visual Objects */}
      <div className="mb-6">
        <CountingVisuals theme={challenge.theme} count={challenge.count} />
      </div>

      {/* Equation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="text-4xl font-bold text-gray-700">=</span>
        <div
          ref={setNodeRef}
          className={`
            w-24 h-24 rounded-2xl border-4 border-dashed border-gray-400
            flex items-center justify-center text-5xl font-bold
            transition-all duration-300
            ${isOver ? 'border-blue-500 bg-blue-50 scale-110' : 'bg-gray-50'}
            ${isCorrect ? 'border-green-500 bg-green-50' : ''}
          `}
        >
          {selectedAnswer !== null ? selectedAnswer : '?'}
        </div>
      </div>

      {/* Hand Hint Animation */}
      {showHandHint && !isCorrect && (
        <div className="absolute top-1/2 right-4 animate-bounce">
          <span className="text-5xl">👆</span>
        </div>
      )}

      {/* Answer Choices */}
      <div className="flex justify-center gap-4">
        {challenge.choices.map((choice, index) => (
          <DraggableNumberTile
            key={index}
            number={choice}
            id={`tile-${cardNumber}-${choice}`}
            buttonColor={challenge.buttonColor}
            onClick={() => handleAnswerClick(choice)}
            disabled={isCorrect}
          />
        ))}
      </div>

      {/* Success Indicator */}
      {isCorrect && (
        <div className="absolute inset-0 bg-green-500/10 rounded-3xl flex items-center justify-center animate-scale-in">
          <div className="text-6xl animate-bounce">✅</div>
        </div>
      )}
    </div>
  );
};
