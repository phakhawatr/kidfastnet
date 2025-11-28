import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompareStarsVisual from '@/components/CompareStarsVisual';
import MascotCharacters from '@/components/MascotCharacters';
import { generateComparison } from '@/utils/compareStarsUtils';
import Confetti from 'react-confetti';

interface CompareStarsGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
  onGameEnd: () => void;
  onRetry: () => void;
  isMissionMode: boolean;
  maxQuestions: number;
}

type ComparisonSymbol = '>' | '=' | '<';

export default function CompareStarsGame({
  difficulty,
  score,
  totalQuestions,
  onAnswer,
  onGameEnd,
  onRetry,
  isMissionMode,
  maxQuestions
}: CompareStarsGameProps) {
  const { t } = useTranslation(['comparestars', 'common']);
  const navigate = useNavigate();
  
  const [currentProblem, setCurrentProblem] = useState(() => generateComparison(difficulty));
  const [selectedAnswer, setSelectedAnswer] = useState<ComparisonSymbol | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [bounceStars, setBounceStars] = useState(false);
  const [showHand, setShowHand] = useState(totalQuestions === 0);

  useEffect(() => {
    if (totalQuestions >= maxQuestions) {
      onGameEnd();
    }
  }, [totalQuestions, maxQuestions, onGameEnd]);

  const handleAnswerClick = (answer: ComparisonSymbol) => {
    if (isCorrect !== null) return; // Already answered

    setSelectedAnswer(answer);
    const correct = answer === currentProblem.correctAnswer;
    setIsCorrect(correct);
    setShowHand(false);

    if (correct) {
      setShowConfetti(true);
      setBounceStars(true);
      setTimeout(() => {
        setShowConfetti(false);
        setBounceStars(false);
      }, 2000);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    onAnswer(correct);

    // Move to next question after delay
    setTimeout(() => {
      if (totalQuestions + 1 < maxQuestions) {
        setCurrentProblem(generateComparison(difficulty));
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    }, 2000);
  };

  const getButtonColor = (symbol: ComparisonSymbol) => {
    if (symbol === '>') return 'from-purple-400 to-purple-600 border-purple-700';
    if (symbol === '=') return 'from-orange-400 to-orange-600 border-orange-700';
    return 'from-lime-400 to-lime-600 border-lime-700';
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            🏝️ {t('header')} 🏝️
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="font-bold text-slate-800">
              {t('score')}: {score}/{totalQuestions}
            </span>
          </div>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="icon"
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <X size={24} />
          </Button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-6xl">
          {/* Mascots */}
          <MascotCharacters />

          {/* Main Container */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
            {/* Chalkboard */}
            <div className={`relative ${shake ? 'animate-shake' : ''}`}>
              {/* Wooden Frame */}
              <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-4 md:p-6 rounded-lg shadow-2xl border-4 border-amber-900">
                {/* Green Chalkboard */}
                <div className="bg-gradient-to-br from-green-700 to-green-900 p-6 md:p-8 rounded shadow-inner min-h-[300px] md:min-h-[400px]">
                  {/* 3 Column Layout */}
                  <div className="grid grid-cols-3 gap-4 md:gap-8 h-full items-center">
                    {/* Left Side - Number and Stars */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg">
                        {currentProblem.left}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 max-w-[150px]">
                        {Array.from({ length: currentProblem.left }).map((_, i) => (
                          <div
                            key={i}
                            className={bounceStars ? 'animate-bounce' : ''}
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            <CompareStarsVisual />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Center - Question Mark or Answer */}
                    <div className="flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm border-4 border-white/40 rounded-2xl w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shadow-xl">
                        <span className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg">
                          {isCorrect === null ? '?' : selectedAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Number and Stars */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg">
                        {currentProblem.right}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 max-w-[150px]">
                        {Array.from({ length: currentProblem.right }).map((_, i) => (
                          <div
                            key={i}
                            className={bounceStars ? 'animate-bounce' : ''}
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            <CompareStarsVisual />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {isCorrect !== null && (
                <div className={`absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center ${
                  isCorrect ? 'animate-bounce' : 'animate-shake'
                }`}>
                  <div className={`px-6 py-3 rounded-full font-bold text-xl shadow-lg ${
                    isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {isCorrect ? t('correct') : t('tryAgain')}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Buttons Panel */}
            <div className="flex lg:flex-col gap-4 mt-8 lg:mt-0">
              {(['>', '=', '<'] as ComparisonSymbol[]).map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleAnswerClick(symbol)}
                  disabled={isCorrect !== null}
                  className={`relative w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br ${getButtonColor(
                    symbol
                  )} border-b-4 shadow-xl hover:shadow-2xl active:border-b-0 active:mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:scale-105 active:scale-95`}
                >
                  <span className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                    {symbol}
                  </span>
                  
                  {/* Hand Guide Animation */}
                  {showHand && symbol === currentProblem.correctAnswer && (
                    <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 animate-pulse">
                      <div className="text-4xl animate-bounce">👉</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      {!isMissionMode && (
        <div className="p-4 flex justify-center gap-4">
          <Button
            onClick={onRetry}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
          >
            <RotateCcw className="mr-2" size={20} />
            {t('common:reset')}
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm"
          >
            <Home className="mr-2" size={20} />
            {t('common:backToHome')}
          </Button>
        </div>
      )}
    </div>
  );
}
