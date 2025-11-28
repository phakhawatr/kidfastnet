import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Home, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BeachBackground from '@/components/BeachBackground';
import CompareStarsGame from '@/components/CompareStarsGame';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import { useMissionMode } from '@/hooks/useMissionMode';
import { useRecentApps } from '@/hooks/useRecentApps';
import Confetti from 'react-confetti';

export default function CompareStarsApp() {
  const { t } = useTranslation(['comparestars', 'common']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trackAppUsage } = useRecentApps();
  
  useEffect(() => {
    trackAppUsage('compare-stars');
  }, []);
  
  const {
    isMissionMode,
    missionId,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startTime] = useState(Date.now());

  // Auto-start if coming from mission
  useEffect(() => {
    if (isMissionMode && searchParams.get('autostart') === 'true') {
      setGameStarted(true);
    }
  }, [isMissionMode, searchParams]);

  const handleGameComplete = async (correct: number, total: number) => {
    const timeSpent = Date.now() - startTime;
    
    if (isMissionMode && missionId) {
      await handleCompleteMission(correct, total, timeSpent);
    } else {
      // Show regular confetti for non-mission mode
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    setTotalQuestions(totalQuestions + 1);

    // Check if mission complete (15 questions)
    if (isMissionMode && totalQuestions + 1 >= 15) {
      handleGameComplete(score + (isCorrect ? 1 : 0), totalQuestions + 1);
    }
  };

  const handleRetry = () => {
    setScore(0);
    setTotalQuestions(0);
    setGameStarted(false);
  };

  const handleMissionRetry = () => {
    setShowMissionComplete(false);
    setScore(0);
    setTotalQuestions(0);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 flex items-center justify-center p-4 relative overflow-hidden">
        <BeachBackground />
        
        <Card className="relative z-10 bg-white/95 backdrop-blur-sm p-8 max-w-md w-full shadow-2xl">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl">⭐</span>
              <h1 className="text-3xl font-bold text-slate-800">
                {t('title')}
              </h1>
              <span className="text-5xl">⭐</span>
            </div>
            
            <p className="text-lg text-slate-600">{t('subtitle')}</p>
            <p className="text-sm text-slate-500">{t('age')}</p>

            <div className="space-y-3">
              <p className="font-semibold text-slate-700">{t('common:selectDifficulty')}</p>
              <div className="grid grid-cols-1 gap-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <Button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    variant={difficulty === level ? 'default' : 'outline'}
                    size="lg"
                    className={`text-lg ${
                      difficulty === level
                        ? level === 'easy'
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : level === 'medium'
                          ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                        : ''
                    }`}
                  >
                    {t(`difficulty.${level}`)}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setGameStarted(true)}
              size="lg"
              className="w-full text-xl py-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
            >
              <Play className="mr-2" size={24} />
              {t('common:startGame')}
            </Button>

            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2" size={20} />
              {t('common:backToHome')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 relative overflow-hidden">
      <BeachBackground />
      
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      
      <CompareStarsGame
        difficulty={difficulty}
        score={score}
        totalQuestions={totalQuestions}
        onAnswer={handleAnswer}
        onGameEnd={() => handleGameComplete(score, totalQuestions)}
        onRetry={handleRetry}
        isMissionMode={isMissionMode}
        maxQuestions={isMissionMode ? 15 : 10}
      />

      {isMissionMode && missionResult && (
        <MissionCompleteModal
          open={showMissionComplete}
          onOpenChange={setShowMissionComplete}
          stars={missionResult.stars}
          correct={missionResult.correct}
          total={missionResult.total}
          timeSpent={missionResult.timeSpent}
          isPassed={missionResult.isPassed}
          onRetry={handleMissionRetry}
        />
      )}
    </div>
  );
}
