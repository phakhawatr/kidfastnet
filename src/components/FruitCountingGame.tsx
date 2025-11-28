import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Confetti from 'react-confetti';
import { PaperCard } from './PaperCard';
import { FruitGroup } from './FruitGroup';
import { NumberTarget } from './NumberTarget';
import { FruitCountingProblem } from '@/utils/fruitCountingUtils';

interface FruitCountingGameProps {
  problem: FruitCountingProblem;
  matches: Record<string, number>; // groupId -> number
  onMatch: (groupId: string, number: number) => boolean;
  onComplete: () => void;
}

export const FruitCountingGame = ({ problem, matches, onMatch, onComplete }: FruitCountingGameProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongMatch, setWrongMatch] = useState(false);
  const [showHandGuide, setShowHandGuide] = useState(true);

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
      
      <DndContext onDragEnd={handleDragEnd}>
        <PaperCard rotation={Math.random() * 2 - 1}>
          <div className={`grid grid-cols-2 gap-12 ${wrongMatch ? 'animate-shake' : ''}`}>
            {/* Left side - Fruit Groups */}
            <div className="flex flex-col gap-6 items-center justify-center">
              <h3 
                className="text-2xl font-bold text-slate-700 mb-4"
                style={{ fontFamily: "'Varela Round', sans-serif" }}
              >
                นับผลไม้แล้วลาก
              </h3>
              <div className="flex flex-col gap-4">
                {problem.fruitGroups.map((group) => (
                  <FruitGroup
                    key={group.id}
                    id={group.id}
                    fruitType={group.fruitType}
                    count={group.count}
                    isMatched={!!matches[group.id]}
                  />
                ))}
              </div>
            </div>

            {/* Right side - Number Targets */}
            <div className="flex flex-col gap-6 items-center justify-center">
              <h3 
                className="text-2xl font-bold text-slate-700 mb-4"
                style={{ fontFamily: "'Varela Round', sans-serif" }}
              >
                วางที่ตัวเลข
              </h3>
              <div className="flex flex-col gap-4">
                {problem.numberChoices.map((number) => {
                  const isMatched = Object.values(matches).includes(number);
                  
                  return (
                    <NumberTarget
                      key={number}
                      number={number}
                      isMatched={isMatched}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hand Guide Animation */}
          {showHandGuide && (
            <div className="absolute top-1/2 left-1/4 animate-[bounce_1s_ease-in-out_infinite]">
              <div className="text-6xl">👉</div>
            </div>
          )}
        </PaperCard>
      </DndContext>
    </>
  );
};
