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
  const petalRadius = 140; // ขยายจาก 120
  const innerCircleRadius = 70; // ขยายจาก 60
  const centerCircleRadius = 48; // ขยายจาก 40

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
    <div className="flex flex-col items-center lg:flex-row lg:items-start gap-6 justify-center w-full max-w-6xl mx-auto px-4">
      {/* Stats Bar - Mobile Top */}
      <div className="w-full lg:hidden bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-pink-200 mb-4">
        <div className="flex justify-between items-center gap-3">
          <div>
            <span className="text-sm text-slate-500 font-medium">คะแนน:</span>
            <span className="ml-2 font-bold text-2xl text-pink-600">{score}/{totalProblems}</span>
          </div>
          <div>
            <span className="text-sm text-slate-500 font-medium">ข้อที่:</span>
            <span className="ml-2 font-bold text-2xl text-cyan-600">{problemNumber}/{totalProblems}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-2xl text-orange-600">{streak}</span>
            </div>
          )}
          {timeRemaining !== null && (
            <div className={`font-bold text-xl ${timeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
              ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>

      {/* Flower Visualization */}
      <div className="flex-1 flex justify-center items-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-[340px] sm:max-w-lg lg:max-w-xl h-auto mx-auto"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}
        >
          {/* Petals */}
          {problem.innerNumbers.map((_, index) => {
            const isQuestion = index === problem.questionIndex;
            const showCorrect = selectedAnswer !== null && isQuestion && isCorrect;
            const showWrong = selectedAnswer !== null && isQuestion && !isCorrect;
            
            // For division and subtraction, petals always show values (no "?")
            const isDivOrSub = problem.operation === 'division' || problem.operation === 'subtraction';
            const shouldHighlight = isDivOrSub ? false : (isQuestion && selectedAnswer === null);
            
            const petalColor = isDivOrSub
              ? '#FFB6C1' // Normal color for division/subtraction
              : isQuestion && selectedAnswer === null
              ? '#FF6B6B'
              : showCorrect
              ? '#4CAF50'
              : showWrong
              ? '#F44336'
              : '#FFB6C1';

            const pos = getPetalPosition(index);
            
            return (
              <g key={index} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.angle + 90})`}>
                {/* Petal shape */}
                <ellipse
                  rx={shouldHighlight ? "34" : "32"}
                  ry={shouldHighlight ? "58" : "55"}
                  fill={petalColor}
                  stroke="#FF69B4"
                  strokeWidth={shouldHighlight ? "3" : "2"}
                  className={shouldHighlight ? 'animate-question-pulse' : ''}
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                />
                {/* Result text - always show for division/subtraction */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="white"
                  fontSize={(isDivOrSub || isQuestion) ? "28" : "22"}
                  fontWeight="bold"
                  transform={`rotate(${-pos.angle - 90})`}
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
                >
                  {isDivOrSub ? problem.results[index] : (isQuestion ? '?' : problem.results[index])}
                </text>
              </g>
            );
          })}

          {/* Inner circle numbers (1-10) */}
          {problem.innerNumbers.map((num, index) => {
            const pos = getInnerPosition(index);
            const isQuestion = index === problem.questionIndex;
            const isDivOrSub = problem.operation === 'division' || problem.operation === 'subtraction';
            const showCorrect = selectedAnswer !== null && isQuestion && isCorrect && isDivOrSub;
            const showWrong = selectedAnswer !== null && isQuestion && !isCorrect && isDivOrSub;
            
            // For division/subtraction, inner number at questionIndex shows "?"
            const shouldHighlight = isDivOrSub && isQuestion && selectedAnswer === null;
            const circleColor = shouldHighlight
              ? '#FF6B6B'
              : showCorrect
              ? '#4CAF50'
              : showWrong
              ? '#F44336'
              : '#4A90E2';
            
            return (
              <g key={`inner-${index}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={shouldHighlight ? "25" : "22"}
                  fill={circleColor}
                  stroke={shouldHighlight ? "#FF0000" : "#2E5C8A"}
                  strokeWidth={shouldHighlight ? "3" : "2"}
                  className={shouldHighlight ? 'animate-question-pulse' : ''}
                  style={{
                    transition: 'all 0.3s ease',
                  }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy="0.35em"
                  fill="white"
                  fontSize={shouldHighlight ? "22" : "18"}
                  fontWeight="bold"
                >
                  {isDivOrSub && isQuestion ? '?' : num}
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
            fontSize="28"
            fontWeight="bold"
          >
            {problem.multiplier}{getOperationSymbol(problem.operation)}
          </text>
        </svg>
      </div>

      {/* Choices and Stats Panel */}
      <div className="flex-shrink-0 w-full lg:w-80 space-y-4">
        {/* Stats - Desktop */}
        <div className="hidden lg:flex flex-col gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-pink-200">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">คะแนน:</span>
            <span className="font-bold text-2xl text-pink-600">{score}/{totalProblems}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">ข้อที่:</span>
            <span className="font-bold text-2xl text-cyan-600">{problemNumber}/{totalProblems}</span>
          </div>
          {streak > 1 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Streak:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-2xl text-orange-600">{streak}</span>
              </div>
            </div>
          )}
          {timeRemaining !== null && (
            <div className="flex justify-between items-center pt-2 border-t border-pink-200">
              <span className="text-slate-600 font-medium">เวลา:</span>
              <span className={`font-bold text-xl ${timeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Answer Choices */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center lg:text-left mb-4">
            🌸 เลือกคำตอบ
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
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
                    w-full p-4 md:p-5 rounded-2xl text-2xl md:text-3xl font-bold
                    transition-all duration-200 transform
                    shadow-lg border-b-4
                    ${selectedAnswer === null
                      ? 'bg-gradient-to-b from-pink-400 via-pink-500 to-rose-500 text-white border-rose-600 hover:from-pink-300 hover:to-rose-400 hover:scale-105 active:scale-95'
                      : isCorrectAnswer
                      ? 'bg-gradient-to-b from-green-400 to-green-500 text-white scale-105 border-green-600'
                      : isWrongAnswer
                      ? 'bg-gradient-to-b from-red-400 to-red-500 text-white animate-shake border-red-600'
                      : 'bg-slate-300 text-slate-400 border-slate-400'
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
    </div>
  );
};

export default FlowerMathGame;
