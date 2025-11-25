import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle, Trophy, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface FractionPair {
  id: number;
  numerator: number;
  denominator: number;
  filledParts: number;
  totalParts: number;
  color: string;
}

interface Connection {
  leftId: number;
  rightId: number;
  isCorrect: boolean;
}

// Helper function to create SVG circle with filled parts
const FractionCircle: React.FC<{
  totalParts: number;
  filledParts: number;
  color: string;
  size?: number;
}> = ({ totalParts, filledParts, color, size = 80 }) => {
  const radius = 35;
  const centerX = size / 2;
  const centerY = size / 2;

  const createPath = (startAngle: number, endAngle: number) => {
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const anglePerPart = (2 * Math.PI) / totalParts;
  
  return (
    <svg width={size} height={size} className="border-2 border-gray-800 rounded-full bg-white">
      {/* Draw all parts */}
      {Array.from({ length: totalParts }).map((_, index) => {
        const startAngle = index * anglePerPart - Math.PI / 2;
        const endAngle = (index + 1) * anglePerPart - Math.PI / 2;
        const isFilled = index < filledParts;
        
        return (
          <path
            key={index}
            d={createPath(startAngle, endAngle)}
            fill={isFilled ? color : '#f8f9fa'}
            stroke="#1f2937"
            strokeWidth="1"
          />
        );
      })}
      
      {/* Draw dividing lines */}
      {Array.from({ length: totalParts }).map((_, index) => {
        const angle = index * anglePerPart - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        return (
          <line
            key={`line-${index}`}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="#1f2937"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

const FractionCard: React.FC<{
  fraction: FractionPair;
  isSelected: boolean;
  isConnected: boolean;
  isCorrect?: boolean;
  onClick: () => void;
  side: 'left' | 'right';
}> = ({ fraction, isSelected, isConnected, isCorrect, onClick, side }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[120px] sm:min-h-[140px] flex items-center justify-center
        ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}
        ${isConnected ? (isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : ''}
      `}
    >
      <div className="flex flex-col items-center gap-2 w-full">
        {side === 'left' && (
          <FractionCircle
            totalParts={fraction.totalParts}
            filledParts={fraction.filledParts}
            color={fraction.color}
            size={90}
          />
        )}
        
        {side === 'right' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl sm:text-4xl font-bold text-gray-800">
              <div className="flex flex-col items-center">
                <div className="border-b-2 border-gray-800 pb-1 mb-1 min-w-[50px] text-center">
                  {fraction.numerator}
                </div>
                <div className="text-center">
                  {fraction.denominator}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isConnected && (
          <div className="absolute top-2 right-2">
            {isCorrect ? 
            <CheckCircle className="w-5 h-5 text-green-500" /> :
            <XCircle className="w-5 h-5 text-red-500" />
            }
          </div>
        )}
      </div>
    </div>
  );
};

const questionSets: FractionPair[][] = [
  [
    { id: 1, numerator: 1, denominator: 4, filledParts: 1, totalParts: 4, color: '#fbbf24' },
    { id: 2, numerator: 2, denominator: 6, filledParts: 2, totalParts: 6, color: '#fb923c' },
    { id: 3, numerator: 3, denominator: 8, filledParts: 3, totalParts: 8, color: '#a78bfa' },
    { id: 4, numerator: 1, denominator: 2, filledParts: 4, totalParts: 8, color: '#f472b6' },
    { id: 5, numerator: 3, denominator: 6, filledParts: 3, totalParts: 6, color: '#4ade80' }
  ],
  [
    { id: 1, numerator: 2, denominator: 8, filledParts: 2, totalParts: 8, color: '#60a5fa' },
    { id: 2, numerator: 3, denominator: 9, filledParts: 3, totalParts: 9, color: '#34d399' },
    { id: 3, numerator: 5, denominator: 10, filledParts: 5, totalParts: 10, color: '#fca5a5' },
    { id: 4, numerator: 4, denominator: 12, filledParts: 4, totalParts: 12, color: '#c084fc' },
    { id: 5, numerator: 6, denominator: 8, filledParts: 6, totalParts: 8, color: '#fde047' }
  ],
  [
    { id: 1, numerator: 1, denominator: 3, filledParts: 2, totalParts: 6, color: '#ff6b6b' },
    { id: 2, numerator: 2, denominator: 5, filledParts: 4, totalParts: 10, color: '#4ecdc4' },
    { id: 3, numerator: 3, denominator: 4, filledParts: 6, totalParts: 8, color: '#45b7d1' },
    { id: 4, numerator: 5, denominator: 6, filledParts: 10, totalParts: 12, color: '#f9ca24' },
    { id: 5, numerator: 7, denominator: 8, filledParts: 7, totalParts: 8, color: '#6c5ce7' }
  ]
];

const FractionMatchingApp: React.FC = () => {
  const { t } = useTranslation('exercises');
  const [currentSet, setCurrentSet] = useState(0);
  const [questions, setQuestions] = useState<FractionPair[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<FractionPair[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [currentSet]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const simplifyFraction = (num: number, den: number) => {
    const divisor = gcd(num, den);
    return { numerator: num / divisor, denominator: den / divisor };
  };

  const fractionsEqual = (f1: FractionPair, f2: FractionPair) => {
    const simplified1 = simplifyFraction(f1.numerator, f1.denominator);
    const simplified2 = simplifyFraction(f2.numerator, f2.denominator);
    return simplified1.numerator === simplified2.numerator && simplified1.denominator === simplified2.denominator;
  };

  const initializeGame = () => {
    const currentQuestions = questionSets[currentSet];
    setQuestions(currentQuestions);
    
    // Shuffle answers
    const answers = [...currentQuestions];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    setShuffledAnswers(answers);
    
    setConnections([]);
    setSelectedLeft(null);
    setIsCompleted(false);
    setScore(0);
    setTimeElapsed(0);
    setIsTimerRunning(true);
  };

  const handleLeftClick = (id: number) => {
    if (selectedLeft === id) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(id);
    }
  };

  const handleRightClick = (rightId: number) => {
    if (selectedLeft === null) return;

    // Remove existing connection for this left item
    const newConnections = connections.filter(conn => conn.leftId !== selectedLeft);
    
    // Find the matching pair
    const leftItem = questions.find(q => q.id === selectedLeft);
    const rightItem = shuffledAnswers.find(q => q.id === rightId);
    
    if (leftItem && rightItem) {
      const isCorrect = fractionsEqual(leftItem, rightItem);
      newConnections.push({
        leftId: selectedLeft,
        rightId: rightId,
        isCorrect
      });
    }

    setConnections(newConnections);
    setSelectedLeft(null);

    // Check if all connections are made
    if (newConnections.length === questions.length) {
      const correctCount = newConnections.filter(conn => conn.isCorrect).length;
      setScore(correctCount);
      setIsCompleted(true);
      setIsTimerRunning(false);
    }
  };

  const resetGame = () => {
    initializeGame();
  };

  const generateRandomSet = () => {
    const colors = ['#fbbf24', '#fb923c', '#a78bfa', '#f472b6', '#4ade80', '#60a5fa', '#34d399'];
    const randomQuestions: FractionPair[] = [];

    for (let i = 1; i <= 6; i++) {
      const denominator = Math.floor(Math.random() * 8) + 4; // 4-12
      const numerator = Math.floor(Math.random() * (denominator - 1)) + 1; // 1 to denominator-1
      
      randomQuestions.push({
        id: i,
        numerator,
        denominator,
        filledParts: numerator,
        totalParts: denominator,
        color: colors[i - 1]
      });
    }

    setQuestions(randomQuestions);
    
    // Shuffle answers
    const answers = [...randomQuestions];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    setShuffledAnswers(answers);
    
    setConnections([]);
    setSelectedLeft(null);
    setIsCompleted(false);
    setScore(0);
    setTimeElapsed(0);
    setIsTimerRunning(true);
  };

  const nextSet = () => {
    if (currentSet < questionSets.length - 1) {
      setCurrentSet(currentSet + 1);
    } else {
      setCurrentSet(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionForLeft = (leftId: number) => {
    return connections.find(conn => conn.leftId === leftId);
  };

  const isRightConnected = (rightId: number) => {
    return connections.find(conn => conn.rightId === rightId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">{t('fractions.title')}</h1>
          </div>

          <Badge variant="secondary" className="text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(timeElapsed)}
          </Badge>
        </div>

        {/* Game Instructions */}
        <div className="mb-6 bg-slate-800/90 backdrop-blur rounded-lg p-4 border border-slate-600">
          <p className="text-center text-slate-200">
            🎯 {t('fractions.instructions')}
          </p>
        </div>

        {/* Game Area */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Left Side - Visual Fractions */}
            <div className="space-y-2">
              <h2 className="text-sm sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-4">{t('fractions.visualFractions')}</h2>
              {questions.map((question) => {
                const connection = getConnectionForLeft(question.id);
                const isSelected = selectedLeft === question.id;
                const isConnected = connection !== undefined;
                
                return (
                  <FractionCard
                    key={question.id}
                    fraction={question}
                    isSelected={isSelected}
                    isConnected={isConnected}
                    isCorrect={connection?.isCorrect}
                    onClick={() => handleLeftClick(question.id)}
                    side="left"
                  />
                );
              })}
            </div>

            {/* Right Side - Fraction Numbers */}
            <div className="space-y-2">
              <h2 className="text-sm sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-4">{t('fractions.numberFractions')}</h2>
              {shuffledAnswers.map((answer) => {
                const connection = isRightConnected(answer.id);
                const isConnected = connection !== undefined;
                
                return (
                  <FractionCard
                    key={answer.id}
                    fraction={answer}
                    isSelected={false}
                    isConnected={isConnected}
                    isCorrect={connection?.isCorrect}
                    onClick={() => handleRightClick(answer.id)}
                    side="right"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {isCompleted && (
          <div className="mt-6 bg-slate-800/90 backdrop-blur rounded-lg p-6 border border-slate-600">
            <h3 className="text-center flex items-center justify-center gap-2 text-xl font-bold mb-4 text-white">
              <Trophy className="w-6 h-6 text-yellow-400" />
              {t('fractions.results')}
            </h3>
            <div className="text-center space-y-4">
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                  <div className="text-2xl font-bold text-green-300">{score}</div>
                  <div className="text-sm text-slate-300">{t('fractions.score')}</div>
                </div>
                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-300">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-slate-300">{t('fractions.timeUsed')}</div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('fractions.playAgain')}
                </Button>
                <Button onClick={nextSet}>
                  {t('fractions.nextSet')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {!isCompleted && (
          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('fractions.restart')}
            </Button>
            <button
              onClick={generateRandomSet}
              className="px-6 py-3.5 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
              }}
            >
              <span className="text-2xl">✨</span>
              <span>{t('fractions.generateNew')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FractionMatchingApp;