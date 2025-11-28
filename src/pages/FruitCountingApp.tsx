import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, RotateCcw } from 'lucide-react';
import { WoodTableBackground } from '@/components/WoodTableBackground';
import { FruitShadowGame } from '@/components/FruitShadowGame';
import { useFruitCounting } from '@/hooks/useFruitCounting';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';

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
    if (!isCompleted) {
      nextProblem();
    } else {
      handleGameComplete(score);
    }
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

  if (showMissionComplete) {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const percentage = (finalScore / totalQuestions) * 100;
    const isPassed = percentage >= 80;
    const stars = percentage >= 90 ? 3 : percentage >= 80 ? 2 : 0;

    return (
      <MissionCompleteModal
        open={showMissionComplete}
        onOpenChange={setShowMissionComplete}
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <WoodTableBackground />
        <Card className="p-8 max-w-md w-full bg-white shadow-2xl">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold" style={{ fontFamily: "'Varela Round', sans-serif" }}>
              {stars >= 2 ? '🎉 เก่งมาก! 🎉' : '💪 ลองอีกครั้ง'}
            </h2>

            <div className="flex justify-center gap-2 text-6xl">
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

            <div className="space-y-2">
              <p className="text-3xl font-bold text-primary">
                {finalScore}/{totalQuestions}
              </p>
              <p className="text-xl text-muted-foreground">{percentage}%</p>
              <p className="text-lg text-muted-foreground">
                ⏱️ {Math.floor((Date.now() - startTime) / 60000)} นาที{' '}
                {Math.floor(((Date.now() - startTime) % 60000) / 1000)} วินาที
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleRetry} className="flex-1" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                เล่นอีกครั้ง
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline" className="flex-1" size="lg">
                <Home className="mr-2 h-5 w-5" />
                กลับหน้าหลัก
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <WoodTableBackground />
        <Card className="p-8 max-w-2xl w-full bg-white shadow-2xl">
          <h1 
            className="text-4xl font-bold text-center mb-8 text-primary"
            style={{ fontFamily: "'Varela Round', sans-serif" }}
          >
            {t('fruitcounting:title')}
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold mb-3">{t('fruitcounting:difficulty')}</label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map((level) => (
                  <Button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    variant={difficulty === level ? 'default' : 'outline'}
                    className="text-lg py-6"
                  >
                    {t(`fruitcounting:${level}`)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold mb-3">{t('fruitcounting:numberOfProblems')}</label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15].map((num) => (
                  <Button
                    key={num}
                    onClick={() => setTotalQuestions(num)}
                    variant={totalQuestions === num ? 'default' : 'outline'}
                    className="text-lg py-6"
                  >
                    {num} {t('common:questions')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button onClick={handleStart} size="lg" className="flex-1 text-xl py-8">
                {t('common:start')}
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline" size="lg">
                <Home className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <WoodTableBackground />

      <div className="mb-8 flex items-center justify-between w-full max-w-4xl">
        <Card className="px-6 py-3 bg-white/90 backdrop-blur">
          <p className="text-xl font-semibold">
            {t('common:question')} {currentQuestion}/{totalQuestions}
          </p>
        </Card>

        <Card className="px-6 py-3 bg-white/90 backdrop-blur">
          <p className="text-xl font-semibold">
            {t('common:score')}: {score}
          </p>
        </Card>

        <Button onClick={() => navigate('/profile')} variant="outline" size="lg">
          <Home className="h-6 w-6" />
        </Button>
      </div>

      <FruitShadowGame
        problem={currentProblem}
        matches={matches}
        onMatch={handleMatch}
        onComplete={handleProblemComplete}
      />

      {allMatched && !isCompleted && (
        <Button
          onClick={nextProblem}
          size="lg"
          className="mt-8 text-xl px-12 py-6 animate-bounce"
        >
          {t('common:next')} →
        </Button>
      )}
    </div>
  );
}
