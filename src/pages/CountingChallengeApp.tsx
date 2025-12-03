import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DndContext, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import Confetti from 'react-confetti';
import { CountingCard } from '@/components/CountingCard';
import { useCountingChallenge } from '@/hooks/useCountingChallenge';
import { Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMissionMode } from '@/hooks/useMissionMode';
import { useRecentApps } from '@/hooks/useRecentApps';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import { type QuestionAttempt } from '@/hooks/useTrainingCalendar';

export default function CountingChallengeApp() {
  const { t } = useTranslation(['countingchallenge', 'common']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('missionId');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const { trackAppUsage } = useRecentApps();
  
  useEffect(() => {
    trackAppUsage('counting-challenge');
  }, []);

  const {
    score,
    streak,
    challenge,
    isCorrect,
    showConfetti,
    initializeChallenge,
    handleAnswer,
  } = useCountingChallenge();

  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission,
  } = useMissionMode();

  const [showSettings, setShowSettings] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [problemCount, setProblemCount] = useState<5 | 10 | 20 | 30>(10);
  const [showSummary, setShowSummary] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [problemHistory, setProblemHistory] = useState<QuestionAttempt[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!showSettings) {
      initializeChallenge();
    }
  }, [showSettings, initializeChallenge]);

  const handleStartGame = () => {
    setShowSettings(false);
    setStartTime(Date.now());
    setProblemsSolved(0);
    setCorrectCount(0);
    setProblemHistory([]);
  };

  const handleReset = () => {
    setShowSettings(true);
    setProblemsSolved(0);
    setCorrectCount(0);
    setShowSummary(false);
    setProblemHistory([]);
  };

  const handleCardAnswer = (answer: number) => {
    const result = handleAnswer(answer);
    
    // Track problem history
    const newAttempt: QuestionAttempt = {
      index: problemHistory.length + 1,
      question: `นับจำนวน ${challenge?.theme || 'วัตถุ'}: ${challenge?.count || '?'}`,
      userAnswer: answer.toString(),
      correctAnswer: challenge?.count?.toString() || '-',
      isCorrect: result.isCorrect
    };
    const updatedHistory = [...problemHistory, newAttempt];
    setProblemHistory(updatedHistory);
    
    if (result.isCorrect) {
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      const newProblemsSolved = problemsSolved + 1;
      setProblemsSolved(newProblemsSolved);

      // Check if completed all problems
      if (newProblemsSolved >= problemCount) {
        if (isMissionMode) {
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          handleCompleteMission(newCorrect, problemCount, timeSpent, updatedHistory);
        } else {
          setShowSummary(true);
        }
      }
    }
    
    return result;
  };

  const handleRetryMission = () => {
    setShowMissionComplete(false);
    setShowSettings(true);
    setProblemsSolved(0);
    setCorrectCount(0);
    setProblemHistory([]);
  };

  const handleCloseMissionModal = () => {
    setShowMissionComplete(false);
    navigate('/today-mission?refresh=true');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const tileId = active.id.toString();
    const dropZone = over.id.toString();
    
    // Extract answer from tile ID (format: "tile-1-3")
    const parts = tileId.split('-');
    const answer = parseInt(parts[parts.length - 1]);
    
    // Check if dropped on correct zone
    if (dropZone === 'drop-1') {
      handleCardAnswer(answer);
    }
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <h1 className="text-5xl font-bold text-purple-600 mb-4">
              🐠 {t('title')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('age')}
            </p>
            
            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-4">
                นับจำนวนวัตถุในการ์ด แล้วเลือกคำตอบที่ถูกต้อง!
              </p>
              <p className="text-md text-gray-600">
                ✅ ตอบถูก = โจทย์ใหม่ + Confetti 🎉
              </p>
            </div>

            {/* Problem Count Selection */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-4">เลือกจำนวนข้อ:</p>
              <div className="flex justify-center gap-3">
                {[5, 10, 20, 30].map((count) => (
                  <Button
                    key={count}
                    onClick={() => setProblemCount(count as 5 | 10 | 20 | 30)}
                    variant={problemCount === count ? 'default' : 'outline'}
                    className={problemCount === count
                      ? 'bg-green-500 hover:bg-green-600 text-white text-xl px-6 py-4'
                      : 'bg-white text-gray-700 border-2 text-xl px-6 py-4'
                    }
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleStartGame}
              size="lg"
              className="text-2xl px-12 py-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-xl"
            >
              🚀 เริ่มเกม!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-300 to-blue-400 p-4 md:p-8">
      {/* Confetti */}
      {showConfetti && (
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height} 
          recycle={false} 
          numberOfPieces={windowSize.width < 768 ? 100 : 200}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex items-center justify-between text-white">
          <h1 className="text-2xl md:text-3xl font-bold">
            🧠 {t('header')}
          </h1>
          <div className="flex items-center gap-4 text-lg md:text-xl">
            <span className="font-bold">ข้อ: {problemsSolved}/{problemCount}</span>
            <span className="font-bold">{t('score')}: {score}</span>
            <span className="font-bold">🔥 {streak}</span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="max-w-md mx-auto mb-6">
          {challenge && (
            <CountingCard
              key={challenge.id}
              challenge={challenge}
              cardNumber={1}
              onAnswer={handleCardAnswer}
              isCorrect={isCorrect}
              showHandHint={!isCorrect}
            />
          )}
        </div>
      </DndContext>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => navigate('/profile')}
          variant="outline"
          size="lg"
          className="bg-white/90 hover:bg-white"
        >
          <Home className="mr-2" />
          {t('backToHome', { ns: 'common' })}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="bg-white/90 hover:bg-white"
        >
          <RotateCcw className="mr-2" />
          {t('reset', { ns: 'common' })}
        </Button>
      </div>

      {/* Summary Modal */}
      {showSummary && !isMissionMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-4xl font-bold text-purple-600 mb-4">🎉 เก่งมาก!</h2>
            
            {/* Stars based on accuracy */}
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={`text-5xl ${
                    i < Math.ceil((correctCount / problemCount) * 3) ? 'animate-bounce' : 'opacity-30'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  ⭐
                </span>
              ))}
            </div>
            
            <p className="text-2xl text-gray-700 mb-2">
              คะแนน: {correctCount}/{problemCount}
            </p>
            <p className="text-xl text-gray-500 mb-6">
              ({Math.round((correctCount / problemCount) * 100)}%)
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setShowSummary(false);
                  setShowSettings(true);
                  setProblemsSolved(0);
                  setCorrectCount(0);
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3"
              >
                🔄 เล่นอีกครั้ง
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="px-6 py-3"
              >
                🏠 กลับหน้าหลัก
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Complete Modal */}
      {isMissionMode && (
        <MissionCompleteModal
          open={showMissionComplete}
          onOpenChange={handleCloseMissionModal}
          stars={missionResult.stars}
          correct={missionResult.correct}
          total={missionResult.total}
          timeSpent={missionResult.timeSpent}
          isPassed={missionResult.isPassed}
          onRetry={handleRetryMission}
        />
      )}
    </div>
  );
}
