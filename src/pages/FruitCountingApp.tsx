import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw } from 'lucide-react';
import { FruitCountingGame } from '@/components/FruitCountingGame';
import { useFruitCounting } from '@/hooks/useFruitCounting';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import Confetti from 'react-confetti';

export default function FruitCountingApp() {
  const navigate = useNavigate();
  const { t } = useTranslation(['fruitcounting', 'common']);
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('missionId');

  const [difficulty, setDifficulty] = useState('easy');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    currentProblem,
    currentQuestion,
    score,
    matches,
    handleMatch,
    nextProblem,
    reset,
    isCompleted,
    allMatched,
  } = useFruitCounting(difficulty, totalQuestions);

  const {
    showMissionComplete,
    handleCompleteMission: completeMission,
    setShowMissionComplete,
  } = useMissionMode();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStart = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    reset();
  };

  const handleGameComplete = (finalScore: number) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setFinalScore(finalScore);
    setGameCompleted(true);

    if (missionId) {
      completeMission(finalScore, totalQuestions, timeSpent);
    }
  };

  const handleProblemComplete = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      if (!isCompleted) {
        nextProblem();
      } else {
        handleGameComplete(score);
      }
    }, 1500);
  };

  const handleRetry = () => {
    setGameCompleted(false);
    setFinalScore(0);
    setGameStarted(true);
    setStartTime(Date.now());
    reset();
  };

  const calculateStars = () => {
    const percentage = (finalScore / totalQuestions) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const handleCloseMissionModal = () => {
    setShowMissionComplete(false);
    navigate('/today-mission?refresh=true');
  };

  if (showMissionComplete) {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const percentage = (finalScore / totalQuestions) * 100;
    const isPassed = percentage >= 80;
    const stars = percentage >= 90 ? 3 : percentage >= 80 ? 2 : 0;

    return (
      <MissionCompleteModal
        open={showMissionComplete}
        onOpenChange={handleCloseMissionModal}
        stars={stars}
        correct={finalScore}
        total={totalQuestions}
        timeSpent={timeSpent}
        isPassed={isPassed}
        onRetry={handleRetry}
      />
    );
  }

  if (gameCompleted && !missionId) {
    const stars = calculateStars();
    const percentage = Math.round((finalScore / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400 flex items-center justify-center p-4">
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height} 
          recycle={false} 
          numberOfPieces={200} 
        />
        
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl">
          <h1 className="text-5xl font-bold text-green-600 mb-6">
            {stars >= 2 ? '🎉 เก่งมาก! 🎉' : '💪 ลองอีกครั้ง'}
          </h1>

          <div className="flex justify-center gap-2 text-6xl mb-6">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={`${i < stars ? 'animate-bounce text-yellow-400' : 'text-gray-300'}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                ⭐
              </span>
            ))}
          </div>

          <div className="space-y-2 mb-8">
            <p className="text-3xl font-bold text-purple-600">
              {finalScore}/{totalQuestions}
            </p>
            <p className="text-xl text-gray-600">{percentage}%</p>
            <p className="text-lg text-gray-600">
              ⏱️ {Math.floor((Date.now() - startTime) / 60000)} นาที{' '}
              {Math.floor(((Date.now() - startTime) % 60000) / 1000)} วินาที
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={handleRetry} size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <RotateCcw className="mr-2" />
              เล่นอีกครั้ง
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="lg" className="bg-white/90 hover:bg-white">
              <Home className="mr-2" />
              กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <h1 className="text-5xl font-bold text-purple-600 mb-4">
              🍎 {t('title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('description')}
            </p>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{t('difficulty')}</h3>
              <div className="grid grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <Button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-6 text-lg font-semibold transition-all ${
                      difficulty === level
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t(level)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{t('numberOfProblems')}</h3>
              <div className="grid grid-cols-3 gap-4">
                {[5, 10, 15].map((num) => (
                  <Button
                    key={num}
                    onClick={() => setTotalQuestions(num)}
                    className={`py-6 text-lg font-semibold transition-all ${
                      totalQuestions === num
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {num} {t('questions', { ns: 'common' })}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStart}
              size="lg"
              className="text-2xl px-12 py-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-xl"
            >
              🚀 {t('start', { ns: 'common' })}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400 p-4 md:p-8">
      {showConfetti && (
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height} 
          recycle={false} 
          numberOfPieces={200} 
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex items-center justify-between text-white">
          <h1 className="text-2xl md:text-3xl font-bold">
            🍎 {t('header')}
          </h1>
          <div className="flex items-center gap-4 text-lg md:text-xl">
            <span className="font-bold">{t('question', { ns: 'common' })} {currentQuestion}/{totalQuestions}</span>
            <span className="font-bold">{t('score', { ns: 'common' })}: {score}</span>
          </div>
        </div>
      </div>

      {/* Game */}
      {currentProblem && (
        <FruitCountingGame
          problem={currentProblem}
          matches={matches}
          onMatch={handleMatch}
          onComplete={handleProblemComplete}
        />
      )}

      {/* Next Button */}
      {allMatched && !isCompleted && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => {
              nextProblem();
            }}
            size="lg"
            className="text-xl px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 animate-bounce"
          >
            {t('next', { ns: 'common' })} →
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="lg"
          className="bg-white/90 hover:bg-white"
        >
          <Home className="mr-2" />
          {t('backToHome', { ns: 'common' })}
        </Button>
        <Button
          onClick={() => {
            setGameStarted(false);
            reset();
          }}
          variant="outline"
          size="lg"
          className="bg-white/90 hover:bg-white"
        >
          <RotateCcw className="mr-2" />
          {t('reset', { ns: 'common' })}
        </Button>
      </div>
    </div>
  );
}
