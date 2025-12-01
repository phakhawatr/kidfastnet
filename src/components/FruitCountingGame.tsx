import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import Confetti from 'react-confetti';
import { FruitGroup } from './FruitGroup';
import { NumberTarget } from './NumberTarget';
import { FruitCountingProblem } from '@/utils/fruitCountingUtils';
import { useTranslation } from 'react-i18next';

interface FruitCountingGameProps {
  problem: FruitCountingProblem;
  matches: Record<string, number>; // groupId -> number
  onMatch: (groupId: string, number: number) => boolean;
  onComplete: () => void;
}

export const FruitCountingGame = ({ problem, matches, onMatch, onComplete }: FruitCountingGameProps) => {
  const { t } = useTranslation('fruitcounting');
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongMatch, setWrongMatch] = useState(false);
  const [showHandGuide, setShowHandGuide] = useState(true);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    if (problem.fruitGroups.length === Object.keys(matches).length) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 2000);
    }
  }, [matches, problem.fruitGroups.length, onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHandGuide(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      const groupId = active.id as string;
      const numberId = over.id as string;
      const number = parseInt(numberId.replace('number-', ''));
      
      const isCorrect = onMatch(groupId, number);
      
      if (isCorrect) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1000);
      } else {
        setWrongMatch(true);
        setTimeout(() => setWrongMatch(false), 500);
      }
    }
  };

  return (
    <>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}
      
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {problem.fruitGroups.map((group) => {
            const isMatched = !!matches[group.id];
            
            return (
              <div
                key={group.id}
                className={`
                  relative bg-white rounded-3xl border-4 ${group.borderColor}
                  shadow-2xl p-6 transition-all duration-300
                  ${wrongMatch ? 'animate-shake border-red-600' : ''}
                  ${isMatched ? 'border-green-500 shadow-green-500/50' : ''}
                `}
              >
                {/* Fruit Display */}
                <div className="mb-6">
                  <FruitGroup
                    id={group.id}
                    fruitType={group.fruitType}
                    count={group.count}
                    isMatched={isMatched}
                    borderColor={group.borderColor}
                    buttonColor={group.buttonColor}
                  />
                </div>

                {/* Equation with Drop Zone */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className="text-4xl font-bold text-gray-700">=</span>
                  <div
                    className="
                      w-24 h-24 rounded-2xl border-4 border-dashed border-gray-400
                      flex items-center justify-center text-5xl font-bold
                      transition-all duration-300 bg-gray-50
                    "
                  >
                    {matches[group.id] || '?'}
                  </div>
                </div>

                {/* Hand Hint Animation - Show only on first card */}
                {showHandGuide && !isMatched && group === problem.fruitGroups[0] && (
                  <div className="absolute top-1/2 right-4 animate-bounce">
                    <span className="text-5xl">👆</span>
                  </div>
                )}

                {/* Answer Choices */}
                <div className="flex justify-center gap-3">
                  {problem.numberChoices.map((number) => {
                    const isUsed = Object.values(matches).includes(number);
                    
                    return (
                      <NumberTarget
                        key={number}
                        number={number}
                        groupId={group.id}
                        buttonColor={group.buttonColor}
                        isMatched={isMatched}
                        isUsed={isUsed}
                        onDrop={(droppedNumber) => {
                          onMatch(group.id, droppedNumber);
                        }}
                      />
                    );
                  })}
                </div>

                {/* Success Indicator */}
                {isMatched && (
                  <div className="absolute inset-0 bg-green-500/10 rounded-3xl flex items-center justify-center animate-scale-in">
                    <div className="text-6xl animate-bounce">✅</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DndContext>
    </>
  );
};
