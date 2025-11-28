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
import { useRecentApps } from '@/hooks/useRecentApps';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function BoardCountingApp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('missionId');
  const autoStart = searchParams.get('autoStart') === 'true';
  const { trackAppUsage } = useRecentApps();
  
  useEffect(() => {
    trackAppUsage('board-counting');
  }, []);

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [startTime, setStartTime] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

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

  const handleGameComplete = (completedScore: number) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setFinalScore(completedScore);
    setGameCompleted(true);
    
    if (missionId) {
      handleCompleteMission(completedScore, totalQuestions, timeSpent);
    }
  };

  const handleRetry = () => {
    setScore(0);
    setFinalScore(0);
    setGameCompleted(false);
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
        {!gameCompleted ? (
          <ChalkboardGame
            difficulty={difficulty}
            totalQuestions={totalQuestions}
            onComplete={handleGameComplete}
            onScoreChange={setScore}
          />
        ) : !missionId ? (
          <Card className="w-full max-w-2xl mx-auto p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-slate-800">
                🎉 {t('boardcounting.correct', 'เก่งมาก!')} 🎉
              </h2>

              {/* Stars Display */}
              <div className="flex justify-center gap-2 text-6xl">
                {finalScore / totalQuestions >= 0.9 && (
                  <>
                    <span className="animate-bounce">⭐</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
                  </>
                )}
                {finalScore / totalQuestions >= 0.7 && finalScore / totalQuestions < 0.9 && (
                  <>
                    <span className="animate-bounce">⭐</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</span>
                  </>
                )}
                {finalScore / totalQuestions >= 0.5 && finalScore / totalQuestions < 0.7 && (
                  <span className="animate-bounce">⭐</span>
                )}
                {finalScore / totalQuestions < 0.5 && (
                  <span className="text-5xl text-slate-400">💪 {t('boardcounting.tryAgain', 'ลองอีกครั้ง!')}</span>
                )}
              </div>

              {/* Score Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <p className="text-3xl font-bold text-blue-900">
                  {t('boardcounting.score', 'คะแนน')}: {finalScore}/{totalQuestions}
                </p>
                <p className="text-xl text-blue-700 mt-2">
                  {Math.round((finalScore / totalQuestions) * 100)}%
                </p>
              </div>

              {/* Time Display */}
              <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                <p className="text-lg text-amber-900">
                  ⏱️ เวลา: {Math.floor((Date.now() - startTime) / 60000)} นาที {Math.floor(((Date.now() - startTime) % 60000) / 1000)} วินาที
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button
                  onClick={handleRetry}
                  size="lg"
                  className="text-xl py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg"
                >
                  🔄 เล่นอีกครั้ง
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  size="lg"
                  variant="outline"
                  className="text-xl py-6 border-2 border-slate-300 hover:bg-slate-100 font-bold"
                >
                  🏠 กลับหน้าหลัก
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
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
