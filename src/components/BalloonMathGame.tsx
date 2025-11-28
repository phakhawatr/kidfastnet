import { useDroppable } from '@dnd-kit/core';
import { BalloonVisual } from './BalloonVisual';
import { DraggableAnswer } from './DraggableAnswer';
import type { Problem } from '@/utils/balloonMathUtils';
import { useTranslation } from 'react-i18next';

interface BalloonMathGameProps {
  problem: Problem;
  choices: number[];
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  showVisuals: boolean;
  onAnswerSelect: (answer: number) => void;
}

export const BalloonMathGame = ({
  problem,
  choices,
  selectedAnswer,
  isCorrect,
  showVisuals,
  onAnswerSelect
}: BalloonMathGameProps) => {
  const { t } = useTranslation('balloonmath');
  const { setNodeRef, isOver } = useDroppable({
    id: 'answer-dropzone'
  });

  const answerColors = [
    'bg-gradient-to-br from-purple-500 to-purple-700',
    'bg-gradient-to-br from-blue-500 to-blue-700',
    'bg-gradient-to-br from-pink-500 to-pink-700'
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center w-full max-w-7xl mx-auto px-4">
      {/* Blackboard */}
      <div className="relative">
        {/* Wood Border */}
        <div className="absolute -inset-4 bg-gradient-to-br from-amber-700 to-amber-900 rounded-3xl shadow-2xl"></div>
        
        {/* Green Blackboard */}
        <div className="relative bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-12 shadow-xl min-w-[500px] min-h-[400px] flex flex-col items-center justify-center">
          {/* Equation */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex flex-col items-center">
              <span className="text-white text-7xl font-bold">{problem.num1}</span>
              {showVisuals && <BalloonVisual count={problem.num1} />}
            </div>

            <span className="text-white text-7xl font-bold">{problem.operatorSymbol}</span>

            <div className="flex flex-col items-center">
              <span className="text-white text-7xl font-bold">{problem.num2}</span>
              {showVisuals && <BalloonVisual count={problem.num2} />}
            </div>

            <span className="text-white text-7xl font-bold">=</span>

            {/* Drop Zone */}
            <div
              ref={setNodeRef}
              className={`
                w-32 h-32 rounded-2xl border-4 border-dashed border-white/50
                flex items-center justify-center
                transition-all duration-200
                ${isOver ? 'bg-white/20 scale-110' : 'bg-white/10'}
                ${selectedAnswer !== null ? 'border-solid' : ''}
              `}
            >
              {selectedAnswer !== null ? (
                <span className={`text-6xl font-bold ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                  {selectedAnswer}
                </span>
              ) : (
                <span className="text-white/50 text-6xl">?</span>
              )}
            </div>
          </div>

          {/* Hint */}
          {selectedAnswer === null && (
            <p className="text-white/70 text-sm text-center animate-pulse">
              {t('dragHint')}
            </p>
          )}

          {/* Feedback */}
          {isCorrect === true && (
            <p className="text-green-300 text-3xl font-bold animate-bounce mt-4">
              {t('correct')}
            </p>
          )}
          {isCorrect === false && (
            <p className="text-red-300 text-3xl font-bold animate-shake mt-4">
              {t('tryAgain')}
            </p>
          )}
        </div>
      </div>

      {/* Answer Choices */}
      <div className="flex lg:flex-col gap-6">
        {choices.map((choice, index) => (
          <DraggableAnswer
            key={choice}
            value={choice}
            color={answerColors[index]}
            isSelected={selectedAnswer === choice}
            isCorrect={selectedAnswer === choice ? isCorrect : null}
            onClick={() => onAnswerSelect(choice)}
          />
        ))}
      </div>
    </div>
  );
};
