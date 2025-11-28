import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Confetti from 'react-confetti';
import { CountingCard } from '@/components/CountingCard';
import { useCountingChallenge } from '@/hooks/useCountingChallenge';
import { Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';

export default function CountingChallengeApp() {
  const { t } = useTranslation(['countingchallenge', 'common']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('missionId');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const {
    score,
    streak,
    challenge1,
    challenge2,
    card1Correct,
    card2Correct,
    showConfetti,
    initializeChallenges,
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

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!showSettings && (!challenge1 || !challenge2)) {
      initializeChallenges();
    }
  }, [showSettings, challenge1, challenge2, initializeChallenges]);

  const handleStartGame = () => {
    setShowSettings(false);
    setStartTime(Date.now());
    setProblemsSolved(0);
  };

  const handleReset = () => {
    setShowSettings(true);
    setProblemsSolved(0);
  };

  const handleCardAnswer = (cardNumber: 1 | 2, answer: number) => {
    const result = handleAnswer(cardNumber, answer);
    
    if (result.isCorrect) {
      const newProblemsSolved = problemsSolved + 1;
      setProblemsSolved(newProblemsSolved);

      // Check if both cards are correct (round complete)
      const bothCorrect = cardNumber === 1 ? card2Correct : card1Correct;
      if (bothCorrect && isMissionMode) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        handleCompleteMission(newProblemsSolved, newProblemsSolved, timeSpent);
      }
    }
    
    return result;
  };

  const handleRetryMission = () => {
    setShowMissionComplete(false);
    setShowSettings(true);
    setProblemsSolved(0);
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
    
    // Extract card number and answer from tile ID (format: "tile-1-3")
    const [, cardNum, answerStr] = tileId.split('-');
    const cardNumber = parseInt(cardNum) as 1 | 2;
    const answer = parseInt(answerStr);
    
    // Check if dropped on correct zone
    if (dropZone === `drop-${cardNumber}`) {
      handleCardAnswer(cardNumber, answer);
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
                นับจำนวนวัตถุในการ์ดทั้ง 2 ใบ แล้วเลือกคำตอบที่ถูกต้อง!
              </p>
              <p className="text-md text-gray-600">
                ✅ ตอบถูกทั้ง 2 การ์ด = โจทย์ใหม่ + Confetti 🎉
              </p>
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
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex items-center justify-between text-white">
          <h1 className="text-2xl md:text-3xl font-bold">
            🧠 {t('header')}
          </h1>
          <div className="flex items-center gap-4 text-lg md:text-xl">
            <span className="font-bold">{t('score')}: {score}</span>
            <span className="font-bold">🔥 {streak}</span>
          </div>
        </div>
      </div>

      {/* Game Board - Split Screen */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {challenge1 && (
            <CountingCard
              challenge={challenge1}
              cardNumber={1}
              onAnswer={(answer) => handleCardAnswer(1, answer)}
              isCorrect={card1Correct}
              showHandHint={!card1Correct && !card2Correct}
            />
          )}
          {challenge2 && (
            <CountingCard
              challenge={challenge2}
              cardNumber={2}
              onAnswer={(answer) => handleCardAnswer(2, answer)}
              isCorrect={card2Correct}
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
