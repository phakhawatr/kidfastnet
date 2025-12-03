import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { BalloonMathGame } from '@/components/BalloonMathGame';
import { useBalloonMath } from '@/hooks/useBalloonMath';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import { useMissionMode } from '@/hooks/useMissionMode';
import { useRecentApps } from '@/hooks/useRecentApps';
import type { Operation, Difficulty } from '@/utils/balloonMathUtils';
import { type QuestionAttempt } from '@/hooks/useTrainingCalendar';
import { Home, RotateCcw } from 'lucide-react';
import elephantMascot from '@/assets/elephant-mascot.png';

export default function BalloonMathApp() {
  const { t } = useTranslation('balloonmath');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [operation, setOperation] = useState<Operation>('addition');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showSettings, setShowSettings] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // Track problem history for mission completion
  const [problemHistory, setProblemHistory] = useState<QuestionAttempt[]>([]);

  const {
    problem,
    choices,
    selectedAnswer,
    isCorrect,
    score,
    totalProblems,
    streak,
    showConfetti,
    checkAnswer,
    reset
  } = useBalloonMath(operation, difficulty);

  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  const { trackAppUsage } = useRecentApps();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const showVisuals = difficulty !== 'hard';

  useEffect(() => {
    trackAppUsage('balloon-math');
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMissionMode && searchParams.get('autoStart') === 'true' && showSettings) {
      setShowSettings(false);
      setStartTime(Date.now());
    }
  }, [isMissionMode, searchParams, showSettings]);

  const handleStartGame = () => {
    setShowSettings(false);
    setStartTime(Date.now());
    setProblemHistory([]); // Reset problem history
    reset();
  };

  const handleAnswerSelect = (answer: number) => {
    if (selectedAnswer !== null) return;
    
    const answerIsCorrect = answer === problem.answer;
    
    // Track this problem attempt
    const newAttempt: QuestionAttempt = {
      index: totalProblems + 1,
      question: `${problem.num1} ${problem.operatorSymbol} ${problem.num2}`,
      userAnswer: String(answer),
      correctAnswer: String(problem.answer),
      isCorrect: answerIsCorrect
    };
    const updatedHistory = [...problemHistory, newAttempt];
    setProblemHistory(updatedHistory);
    
    checkAnswer(answer);

    // Check if mission complete (10 problems)
    if (isMissionMode && totalProblems + 1 >= 10) {
      const timeSpent = startTime ? Date.now() - startTime : 0;
      const finalScore = answerIsCorrect ? score + 1 : score;
      handleCompleteMission(finalScore, 10, timeSpent, updatedHistory);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'answer-dropzone' && active.data.current) {
      const answer = active.data.current.value as number;
      handleAnswerSelect(answer);
    }
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-100 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-6 shadow-2xl mb-8 text-center">
            <h1 className="text-white text-4xl font-bold mb-2">🎈 {t('header')}</h1>
            <span className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full text-sm font-bold">
              {t('age')}
            </span>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-purple-900 mb-6">{t('selectOperation')}</h2>
            
            {/* Operation Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                onClick={() => setOperation('addition')}
                className={`h-20 text-2xl ${operation === 'addition' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gray-300'}`}
              >
                ➕ {t('operations.addition')}
              </Button>
              <Button
                onClick={() => setOperation('subtraction')}
                className={`h-20 text-2xl ${operation === 'subtraction' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gray-300'}`}
              >
                ➖ {t('operations.subtraction')}
              </Button>
              <Button
                onClick={() => setOperation('multiplication')}
                className={`h-20 text-2xl ${operation === 'multiplication' ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gray-300'}`}
              >
                ✖️ {t('operations.multiplication')}
              </Button>
              <Button
                onClick={() => setOperation('division')}
                className={`h-20 text-2xl ${operation === 'division' ? 'bg-gradient-to-br from-orange-500 to-orange-700' : 'bg-gray-300'}`}
              >
                ➗ {t('operations.division')}
              </Button>
            </div>

            {/* Difficulty Selection */}
            <h2 className="text-3xl font-bold text-purple-900 mb-6">{t('selectDifficulty')}</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Button
                onClick={() => setDifficulty('easy')}
                className={`h-16 text-xl ${difficulty === 'easy' ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gray-300'}`}
              >
                😊 {t('difficulty.easy')}
              </Button>
              <Button
                onClick={() => setDifficulty('medium')}
                className={`h-16 text-xl ${difficulty === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' : 'bg-gray-300'}`}
              >
                😐 {t('difficulty.medium')}
              </Button>
              <Button
                onClick={() => setDifficulty('hard')}
                className={`h-16 text-xl ${difficulty === 'hard' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gray-300'}`}
              >
                😤 {t('difficulty.hard')}
              </Button>
            </div>

            <Button
              onClick={handleStartGame}
              className="w-full h-16 text-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {t('startGame')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-sky-100 p-4">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />}
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-4 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full text-sm font-bold">
              {t('age')}
            </span>
            <h1 className="text-white text-2xl md:text-4xl font-bold">🎈 {t('header')}</h1>
          </div>
          <div className="flex items-center gap-6 text-white">
            <div className="text-center">
              <p className="text-sm opacity-80">{t('score')}</p>
              <p className="text-2xl font-bold">{score}/{totalProblems}</p>
            </div>
            {streak > 0 && (
              <div className="text-center">
                <p className="text-sm opacity-80">Streak</p>
                <p className="text-2xl font-bold">🔥 {streak}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <BalloonMathGame
          problem={problem}
          choices={choices}
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          showVisuals={showVisuals}
          onAnswerSelect={handleAnswerSelect}
        />
      </DndContext>

      {/* Mascot */}
      <div className="fixed bottom-8 left-8 hidden lg:block">
        <img 
          src={elephantMascot} 
          alt="Mascot" 
          className={`w-32 h-32 ${isCorrect ? 'animate-bounce' : ''}`}
        />
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-8 right-8 flex gap-4">
        <Button
          onClick={() => navigate('/profile')}
          variant="secondary"
          size="lg"
          className="shadow-xl"
        >
          <Home className="mr-2" />
          {t('backToHome')}
        </Button>
        <Button
          onClick={reset}
          variant="secondary"
          size="lg"
          className="shadow-xl"
        >
          <RotateCcw className="mr-2" />
          {t('reset')}
        </Button>
      </div>

      {/* Mission Complete Modal */}
      {isMissionMode && missionResult && (
        <MissionCompleteModal
          open={showMissionComplete}
          onOpenChange={setShowMissionComplete}
          stars={missionResult.stars}
          correct={missionResult.correct}
          total={missionResult.total}
          timeSpent={missionResult.timeSpent}
          isPassed={missionResult.isPassed}
          onRetry={() => {
            setShowMissionComplete(false);
            reset();
            setStartTime(Date.now());
          }}
        />
      )}
    </div>
  );
}
