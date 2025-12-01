import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, DragEndEvent, useDraggable, useDroppable, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import Confetti from 'react-confetti';
import { CountingObjects } from '@/components/CountingObjects';
import { DraggableNumberTile } from '@/components/DraggableNumberTile';
import { DragHandGuide } from '@/components/DragHandGuide';
import { useBoardCounting } from '@/hooks/useBoardCounting';
import { Card } from '@/components/ui/card';

interface ChalkboardGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  onComplete: (score: number) => void;
  onScoreChange: (score: number) => void;
}

const Butterfly = () => (
  <div className="absolute top-4 right-12 animate-[flutter_3s_ease-in-out_infinite]">
    <svg width="40" height="40" viewBox="0 0 40 40">
      <ellipse cx="12" cy="20" rx="10" ry="12" fill="#a855f7" opacity="0.8" />
      <ellipse cx="28" cy="20" rx="10" ry="12" fill="#c084fc" opacity="0.8" />
      <rect x="18" y="15" width="4" height="10" fill="#581c87" rx="2" />
      <circle cx="20" cy="12" r="3" fill="#581c87" />
      <path d="M18,12 L15,6" stroke="#581c87" strokeWidth="2" />
      <path d="M22,12 L25,6" stroke="#581c87" strokeWidth="2" />
    </svg>
  </div>
);

const DropZone = ({ isOver, droppedNumber }: { isOver: boolean; droppedNumber: number | null }) => {
  const { setNodeRef } = useDroppable({ id: 'answer-box' });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-24 h-24 rounded-xl flex items-center justify-center
        bg-green-900/80 border-4 border-white/30
        transition-all duration-300
        ${isOver ? 'ring-4 ring-yellow-400 scale-110' : ''}
      `}
    >
      {droppedNumber !== null ? (
        <span className="text-6xl font-bold text-white">{droppedNumber}</span>
      ) : (
        <span className="text-6xl font-bold text-white/70">?</span>
      )}
    </div>
  );
};

export const ChalkboardGame = ({ difficulty, totalQuestions, onComplete, onScoreChange }: ChalkboardGameProps) => {
  const { t } = useTranslation();
  const {
    currentProblem,
    currentQuestion,
    score,
    streak,
    generateNextProblem,
  } = useBoardCounting(difficulty, totalQuestions);

  const [droppedNumber, setDroppedNumber] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
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
    onScoreChange(score);
  }, [score, onScoreChange]);

  useEffect(() => {
    if (currentQuestion > totalQuestions) {
      onComplete(score);
    }
  }, [currentQuestion, totalQuestions, score, onComplete]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setShowHandGuide(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over || over.id !== 'answer-box') {
      return;
    }

    const draggedNumber = parseInt(active.id.toString().replace('number-', ''));
    setDroppedNumber(draggedNumber);

    if (draggedNumber === currentProblem.correctAnswer) {
      // Correct answer
      setShowConfetti(true);
      setBounce(true);
      setTimeout(() => {
        setShowConfetti(false);
        setBounce(false);
        setDroppedNumber(null);
        generateNextProblem(true);
        setShowHandGuide(currentQuestion === 0);
      }, 2000);
    } else {
      // Wrong answer
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setDroppedNumber(null);
        generateNextProblem(false);
      }, 500);
    }
  };

  if (currentQuestion > totalQuestions) {
    return null;
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="max-w-5xl mx-auto">
        {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

        {/* Score Header */}
        <div className="flex justify-between items-center mb-6">
          <Card className="px-6 py-3 bg-white/90 backdrop-blur-sm">
            <p className="text-xl font-bold text-slate-800">
              {t('boardcounting.score', 'คะแนน')}: {score}/{totalQuestions}
            </p>
          </Card>
          <Card className="px-6 py-3 bg-white/90 backdrop-blur-sm">
            <p className="text-xl font-bold text-slate-800">
              🔥 {streak}
            </p>
          </Card>
        </div>

        {/* Wooden Frame + Chalkboard */}
        <div
          className={`
            relative p-6 rounded-3xl
            bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800
            shadow-2xl
            ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}
          `}
        >
          <Butterfly />

          {/* Green Chalkboard */}
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-green-700 via-green-800 to-green-900">
            {/* Counting Objects + Equation Area */}
            <div className="flex items-center justify-center gap-12 mb-8 px-4">
              {/* Objects to count */}
              <div className={`grid grid-cols-3 gap-6 ${bounce ? 'animate-bounce' : ''}`}>
                <CountingObjects
                  type={currentProblem.objectType}
                  count={currentProblem.correctAnswer}
                />
              </div>

              {/* Equals sign */}
              <span className="text-9xl font-bold text-white/90">=</span>

              {/* Drop Zone */}
              <DropZone isOver={activeId !== null} droppedNumber={droppedNumber} />
            </div>

            {/* Draggable Number Blocks */}
            <div className="flex justify-center gap-6 mt-8">
              {currentProblem.choices.map((num, index) => {
                const colors = [
                  'from-pink-400 to-pink-600 border-pink-700',
                  'from-lime-400 to-lime-600 border-lime-700',
                  'from-sky-400 to-sky-600 border-sky-700',
                ];
                
                return (
                  <DraggableNumberTile
                    key={`number-${num}`}
                    id={`number-${num}`}
                    number={num}
                    buttonColor={colors[index]}
                  />
                );
              })}
            </div>

            {/* Hand Guide */}
            {showHandGuide && currentQuestion === 1 && (
              <DragHandGuide correctNumber={currentProblem.correctAnswer} />
            )}
          </div>

          {/* Question Counter */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <Card className="px-4 py-2 bg-white shadow-lg">
              <p className="text-lg font-bold text-slate-700">
                {currentQuestion} / {totalQuestions}
              </p>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes flutter {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </DndContext>
  );
};
