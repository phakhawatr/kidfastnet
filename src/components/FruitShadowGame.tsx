import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Confetti from 'react-confetti';
import { PaperCard } from './PaperCard';
import { DraggableFruit } from './DraggableFruit';
import { FruitShadow } from './FruitShadow';
import { FruitCountingProblem } from '@/utils/fruitCountingUtils';

interface FruitShadowGameProps {
  problem: FruitCountingProblem;
  matches: Record<string, string>;
  onMatch: (fruitId: string, shadowId: string) => boolean;
  onComplete: () => void;
}

export const FruitShadowGame = ({ problem, matches, onMatch, onComplete }: FruitShadowGameProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongMatch, setWrongMatch] = useState(false);
  const [showHandGuide, setShowHandGuide] = useState(true);

  useEffect(() => {
    if (problem.fruits.length === Object.keys(matches).length) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 2000);
    }
  }, [matches, problem.fruits.length, onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHandGuide(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      const isCorrect = onMatch(active.id as string, over.id as string);
      
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
            {/* Left side - Draggable Fruits */}
            <div className="flex flex-col gap-6 items-center justify-center">
              <h3 
                className="text-2xl font-bold text-slate-700 mb-4"
                style={{ fontFamily: "'Varela Round', sans-serif" }}
              >
                ลากผลไม้ไปจับคู่
              </h3>
              <div className="flex flex-col gap-6">
                {problem.fruits.map((fruit) => (
                  <DraggableFruit
                    key={fruit.id}
                    id={fruit.id}
                    fruitType={fruit.fruitType}
                    isMatched={!!matches[fruit.id]}
                  />
                ))}
              </div>
            </div>

            {/* Right side - Shadow Targets */}
            <div className="flex flex-col gap-6 items-center justify-center">
              <h3 
                className="text-2xl font-bold text-slate-700 mb-4"
                style={{ fontFamily: "'Varela Round', sans-serif" }}
              >
                ตามจำนวน
              </h3>
              <div className="flex flex-col gap-6">
                {problem.shadows.map((shadow) => {
                  const matchedFruitId = Object.entries(matches).find(
                    ([_, shadowId]) => shadowId === shadow.shadowId
                  )?.[0];
                  
                  return (
                    <FruitShadow
                      key={shadow.shadowId}
                      shadowId={shadow.shadowId}
                      fruitType={shadow.fruitType}
                      number={shadow.number}
                      isMatched={!!matchedFruitId}
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
