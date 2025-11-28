import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BeachBackground from '@/components/BeachBackground';
import MascotCharacters from '@/components/MascotCharacters';
import { ChalkboardGame } from '@/components/ChalkboardGame';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function BoardCountingApp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('missionId');
  const autoStart = searchParams.get('autoStart') === 'true';

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [startTime, setStartTime] = useState<number>(0);

  const { 
    showMissionComplete, 
    setShowMissionComplete,
    missionResult, 
    handleCompleteMission 
  } = useMissionMode();

  useEffect(() => {
    if (autoStart && missionId) {
      setGameStarted(true);
      setStartTime(Date.now());
    }
  }, [autoStart, missionId]);

  const handleStartGame = () => {
    setGameStarted(true);
    setScore(0);
    setStartTime(Date.now());
  };

  const handleGameComplete = (finalScore: number) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    if (missionId) {
      handleCompleteMission(finalScore, totalQuestions, timeSpent);
    }
  };

  const handleRetry = () => {
    setScore(0);
    setGameStarted(true);
    setStartTime(Date.now());
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200">
        <BeachBackground />
        <MascotCharacters />

        <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <Card className="w-full max-w-2xl p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl">🐴</span>
                <h1 className="text-4xl font-bold text-slate-800">
                  {t('boardcounting.title', 'นับบนกระดาน')}
                </h1>
              </div>

              <p className="text-xl text-slate-600">
                {t('boardcounting.subtitle', 'ลากตัวเลขมาวาง')}
              </p>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-lg text-amber-900">
                  {t('boardcounting.dragHint', 'ลากตัวเลขที่ถูกต้องมาวางในกล่อง')}
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-slate-700">
                  {t('common.selectDifficulty', 'เลือกระดับความยาก')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                    <Button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      variant={difficulty === level ? 'default' : 'outline'}
                      className="text-lg py-6"
                    >
                      {t(`common.difficulty.${level}`, level)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-slate-700">
                  {t('common.numberOfProblems', 'จำนวนโจทย์')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 15].map((num) => (
                    <Button
                      key={num}
                      onClick={() => setTotalQuestions(num)}
                      variant={totalQuestions === num ? 'default' : 'outline'}
                      className="text-lg py-6"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleStartGame}
                size="lg"
                className="w-full text-2xl py-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg"
              >
                {t('common.startGame', 'เริ่มเกม')} 🎮
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-400 to-sky-200">
      <BeachBackground />
      <MascotCharacters />

      <Button
        onClick={() => navigate('/profile')}
        className="absolute top-4 right-4 z-50 rounded-full w-12 h-12 p-0 bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 shadow-lg"
      >
        <X className="w-6 h-6 text-white" />
      </Button>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <ChalkboardGame
          difficulty={difficulty}
          totalQuestions={totalQuestions}
          onComplete={handleGameComplete}
          onScoreChange={setScore}
        />
      </div>

      {missionId && missionResult && (
        <MissionCompleteModal
          open={showMissionComplete}
          onOpenChange={setShowMissionComplete}
          stars={missionResult.stars}
          correct={missionResult.correct}
          total={missionResult.total}
          timeSpent={missionResult.timeSpent}
          isPassed={missionResult.isPassed}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
