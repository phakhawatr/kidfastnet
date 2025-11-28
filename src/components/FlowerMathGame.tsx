import React from 'react';
import { type FlowerProblem } from '@/utils/flowerMathUtils';
import { getOperationSymbol } from '@/utils/flowerMathUtils';

interface FlowerMathGameProps {
  problem: FlowerProblem;
  choices: number[];
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  onAnswerSelect: (answer: number) => void;
  score: number;
  streak: number;
  problemNumber: number;
  totalProblems: number;
  timeRemaining: number | null;
}

const FlowerMathGame: React.FC<FlowerMathGameProps> = ({
  problem,
  choices,
  selectedAnswer,
  isCorrect,
  onAnswerSelect,
  score,
  streak,
  problemNumber,
  totalProblems,
  timeRemaining,
}) => {
  const centerX = 200;
  const centerY = 200;
  const petalRadius = 120;
  const innerCircleRadius = 60;
  const centerCircleRadius = 40;

  // Calculate petal positions (10 petals around circle)
  const getPetalPosition = (index: number) => {
    const angle = (index * 36 - 90) * (Math.PI / 180); // 360/10 = 36 degrees per petal
    return {
      x: centerX + petalRadius * Math.cos(angle),
      y: centerY + petalRadius * Math.sin(angle),
      angle: index * 36,
    };
  };

  const getInnerPosition = (index: number) => {
    const angle = (index * 36 - 90) * (Math.PI / 180);
    return {
      x: centerX + innerCircleRadius * Math.cos(angle),
      y: centerY + innerCircleRadius * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl mx-auto p-4">
      {/* Stats Bar - Mobile Top */}
      <div className="w-full lg:hidden flex justify-between items-center mb-4 bg-secondary/50 backdrop-blur-sm rounded-lg p-4">
        <div className="text-foreground">
          <span className="text-sm opacity-80">คะแนน:</span>
          <span className="ml-2 font-bold text-xl">{score}/{totalProblems}</span>
        </div>
        <div className="text-foreground">
          <span className="text-sm opacity-80">ข้อที่:</span>
          <span className="ml-2 font-bold text-xl">{problemNumber}/{totalProblems}</span>
        </div>
        {streak > 1 && (
          <div className="flex items-center gap-2 text-orange-500">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-xl">{streak}</span>
          </div>
        )}
        {timeRemaining !== null && (
          <div className={`font-bold text-xl ${timeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
            ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Flower Visualization */}
      <div className="flex-1 flex justify-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-md h-auto"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}
        >
          {/* Petals */}
          {problem.innerNumbers.map((_, index) => {
            const pos = getPetalPosition(index);
            const isQuestion = index === problem.questionIndex;
            const showCorrect = selectedAnswer !== null && isQuestion && isCorrect;
            const showWrong = selectedAnswer !== null && isQuestion && !isCorrect;
            
            const petalColor = isQuestion && selectedAnswer === null
              ? '#FF6B6B'
              : showCorrect
              ? '#4CAF50'
              : showWrong
              ? '#F44336'
              : '#FFB6C1';

            return (
              <g key={index} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle + 90})`}>
                {/* Petal shape */}
                <ellipse
                  rx="28"
                  ry="50"
                  fill={petalColor}
                  stroke="#FF69B4"
                  strokeWidth="2"
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                />
                {/* Result text or question mark */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="white"
                  fontSize="20"
                  fontWeight="bold"
                  transform={`rotate(${-pos.angle - 90})`}
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {isQuestion ? '?' : problem.results[index]}
                </text>
              </g>
            );
          })}

          {/* Inner circle numbers (1-10) */}
          {problem.innerNumbers.map((num, index) => {
            const pos = getInnerPosition(index);
            return (
              <g key={`inner-${index}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="18"
                  fill="#4A90E2"
                  stroke="#2E5C8A"
                  strokeWidth="2"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy="0.35em"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {num}
                </text>
              </g>
            );
          })}

          {/* Center circle with operation */}
          <circle
            cx={centerX}
            cy={centerY}
            r={centerCircleRadius}
            fill="#FFD700"
            stroke="#FFA500"
            strokeWidth="3"
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dy="0.35em"
            fill="#333"
            fontSize="24"
            fontWeight="bold"
          >
            {problem.multiplier}{getOperationSymbol(problem.operation)}
          </text>
        </svg>
      </div>

      {/* Choices and Stats Panel */}
      <div className="flex-shrink-0 w-full lg:w-80 space-y-4">
        {/* Stats - Desktop */}
        <div className="hidden lg:flex flex-col gap-3 bg-secondary/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-foreground/80">คะแนน:</span>
            <span className="font-bold text-xl text-foreground">{score}/{totalProblems}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foreground/80">ข้อที่:</span>
            <span className="font-bold text-xl text-foreground">{problemNumber}/{totalProblems}</span>
          </div>
          {streak > 1 && (
            <div className="flex justify-between items-center">
              <span className="text-foreground/80">Streak:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-xl text-orange-500">{streak}</span>
              </div>
            </div>
          )}
          {timeRemaining !== null && (
            <div className="flex justify-between items-center">
              <span className="text-foreground/80">เวลา:</span>
              <span className={`font-bold text-xl ${timeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Answer Choices */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground text-center lg:text-left mb-4">
            🌸 เลือกคำตอบ
          </h3>
          {choices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            const isCorrectAnswer = choice === problem.correctAnswer && selectedAnswer !== null;
            const isWrongAnswer = isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => onAnswerSelect(choice)}
                disabled={selectedAnswer !== null}
                className={`
                  w-full p-4 rounded-lg text-xl font-bold
                  transition-all duration-300 transform
                  ${selectedAnswer === null
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105'
                    : isCorrectAnswer
                    ? 'bg-green-500 text-white scale-105 shadow-lg'
                    : isWrongAnswer
                    ? 'bg-red-500 text-white'
                    : 'bg-muted text-muted-foreground'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {choice}
                {isCorrectAnswer && ' ✓'}
                {isWrongAnswer && ' ✗'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlowerMathGame;
