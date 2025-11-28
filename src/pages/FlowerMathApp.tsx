import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FlowerMathGame from '@/components/FlowerMathGame';
import { useFlowerMath } from '@/hooks/useFlowerMath';
import { type Operation, type Difficulty } from '@/utils/flowerMathUtils';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';

const FlowerMathApp = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('missionId');

  const [gameStarted, setGameStarted] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation>('multiplication');
  const [selectedTable, setSelectedTable] = useState(4);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');

  const {
    currentProblem,
    choices,
    selectedAnswer,
    isCorrect,
    score,
    streak,
    problemNumber,
    totalProblems,
    timeRemaining,
    isGameOver,
    handleAnswerSelect,
    resetGame,
    getElapsedTime,
  } = useFlowerMath(selectedOperation, selectedTable, selectedDifficulty);

  const { 
    isMissionMode, 
    showMissionComplete, 
    setShowMissionComplete,
    missionResult,
    handleCompleteMission 
  } = useMissionMode();

  const operations: { value: Operation; label: string; icon: string }[] = [
    { value: 'addition', label: t('flowermath.operations.addition', 'บวก'), icon: '➕' },
    { value: 'subtraction', label: t('flowermath.operations.subtraction', 'ลบ'), icon: '➖' },
    { value: 'multiplication', label: t('flowermath.operations.multiplication', 'คูณ'), icon: '✖️' },
    { value: 'division', label: t('flowermath.operations.division', 'หาร'), icon: '➗' },
  ];

  const difficulties: { value: Difficulty; label: string; icon: string }[] = [
    { value: 'easy', label: t('flowermath.difficulty.easy', 'ง่าย'), icon: '😊' },
    { value: 'medium', label: t('flowermath.difficulty.medium', 'ปานกลาง'), icon: '😐' },
    { value: 'hard', label: t('flowermath.difficulty.hard', 'ยาก'), icon: '😤' },
  ];

  const tables = Array.from({ length: 11 }, (_, i) => i + 2); // 2-12

  const handleStartGame = () => {
    setGameStarted(true);
    resetGame();
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    resetGame();
  };

  const handleGameEnd = async () => {
    if (missionId) {
      const timeSpent = getElapsedTime();
      await handleCompleteMission(score, totalProblems, timeSpent * 1000);
    }
  };

  const handleRetry = () => {
    resetGame();
  };

  const handleBackToCalendar = () => {
    navigate('/training-calendar');
  };

  // Handle game over
  if (isGameOver && gameStarted) {
    if (missionId) {
      handleGameEnd();
    }

    if (showMissionComplete && missionResult && missionId) {
      return (
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
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-secondary/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl border border-border">
          <h2 className="text-3xl font-bold text-center mb-6 text-foreground">
            🌸 {t('flowermath.gameOver', 'เกมจบแล้ว!')}
          </h2>
          <div className="space-y-4 mb-6">
            <div className="text-center">
              <p className="text-foreground/80 mb-2">{t('flowermath.finalScore', 'คะแนนรวม')}</p>
              <p className="text-5xl font-bold text-foreground">{score}/{totalProblems}</p>
              <p className="text-2xl text-foreground/80 mt-2">
                {Math.round((score / totalProblems) * 100)}%
              </p>
            </div>
            {streak > 1 && (
              <div className="text-center">
                <p className="text-foreground/80">{t('flowermath.bestStreak', 'Streak สูงสุด')}</p>
                <p className="text-3xl">🔥 {streak}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full" size="lg">
              🔄 {t('flowermath.playAgain', 'เล่นอีกครั้ง')}
            </Button>
            <Button onClick={handleBackToMenu} variant="outline" className="w-full" size="lg">
              ⚙️ {t('flowermath.changeSettings', 'เปลี่ยนการตั้งค่า')}
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              {t('flowermath.backToHome', 'กลับหน้าหลัก')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-foreground/80"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              {t('common.back', 'กลับ')}
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center flex-1">
              🌸 {t('flowermath.title', 'ดอกไม้คณิตศาสตร์')}
            </h1>
            <div className="w-20"></div>
          </div>

          {/* Settings Card */}
          <div className="bg-secondary/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-border">
            {/* Operation Selection */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {t('flowermath.selectOperation', 'เลือกการดำเนินการ')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {operations.map(op => (
                  <button
                    key={op.value}
                    onClick={() => setSelectedOperation(op.value)}
                    className={`
                      p-4 rounded-lg font-bold transition-all
                      ${selectedOperation === op.value
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{op.icon}</div>
                    <div className="text-sm">{op.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Table Selection (for multiplication/division) */}
            {(selectedOperation === 'multiplication' || selectedOperation === 'division') && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {t('flowermath.selectTable', 'เลือกตารางสูตร')}
                </h3>
                <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
                  {tables.map(num => (
                    <button
                      key={num}
                      onClick={() => setSelectedTable(num)}
                      className={`
                        p-3 rounded-lg font-bold transition-all
                        ${selectedTable === num
                          ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {t('flowermath.selectDifficulty', 'เลือกระดับความยาก')}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {difficulties.map(diff => (
                  <button
                    key={diff.value}
                    onClick={() => setSelectedDifficulty(diff.value)}
                    className={`
                      p-4 rounded-lg font-bold transition-all
                      ${selectedDifficulty === diff.value
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{diff.icon}</div>
                    <div className="text-sm">{diff.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartGame}
              className="w-full"
              size="lg"
            >
              🚀 {t('flowermath.startGame', 'เริ่มเล่น')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
        <Button
          onClick={handleBackToMenu}
          variant="ghost"
          size="sm"
          className="text-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          {t('common.back', 'กลับ')}
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          🌸 {t('flowermath.title', 'ดอกไม้คณิตศาสตร์')}
        </h1>
        <div className="w-20"></div>
      </div>

      {/* Game */}
      {currentProblem && (
        <FlowerMathGame
          problem={currentProblem}
          choices={choices}
          selectedAnswer={selectedAnswer}
          isCorrect={isCorrect}
          onAnswerSelect={handleAnswerSelect}
          score={score}
          streak={streak}
          problemNumber={problemNumber}
          totalProblems={totalProblems}
          timeRemaining={timeRemaining}
        />
      )}
    </div>
  );
};

export default FlowerMathApp;
