import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMoneyGame } from '../hooks/useMoneyGame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Settings, Lightbulb, Trophy, Clock } from 'lucide-react';
import Confetti from 'react-confetti';
import { getCoinEmoji, getMoneyColor } from '../utils/moneyUtils';
import { useTranslation } from 'react-i18next';
import { useMissionMode } from '@/hooks/useMissionMode';
import { useRecentApps } from '@/hooks/useRecentApps';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import { type QuestionAttempt } from '@/hooks/useTrainingCalendar';

// Import mascots and images
import moneyMascot from '../assets/mascot-money.png';
import piggyBank from '../assets/money-piggybank.png';
import shopImage from '../assets/money-shop.png';

// Import coin images
import coin1Baht from '../assets/coins/coin-1-baht.png';
import coin2Baht from '../assets/coins/coin-2-baht.png';
import coin5Baht from '../assets/coins/coin-5-baht.png';
import coin10Baht from '../assets/coins/coin-10-baht.png';

// Import bill images
import bill20Baht from '../assets/coins/bill-20-baht.png';
import bill50Baht from '../assets/coins/bill-50-baht.png';
import bill100Baht from '../assets/coins/bill-100-baht.png';
import bill500Baht from '../assets/coins/bill-500-baht.png';
import bill1000Baht from '../assets/coins/bill-1000-baht.png';

// Helper function to get coin/bill image
const getMoneyImage = (value: number, unit: string) => {
  if (unit === 'สตางค์') {
    if (value === 25) return coin1Baht; // Use 1 baht as placeholder
    if (value === 50) return coin1Baht; // Use 1 baht as placeholder
  }
  if (unit === 'บาท') {
    if (value === 1) return coin1Baht;
    if (value === 2) return coin2Baht;
    if (value === 5) return coin5Baht;
    if (value === 10) return coin10Baht;
    if (value === 20) return bill20Baht;
    if (value === 50) return bill50Baht;
    if (value === 100) return bill100Baht;
    if (value === 500) return bill500Baht;
    if (value === 1000) return bill1000Baht;
  }
  return coin1Baht; // Default fallback
};

const MoneyApp = () => {
  const { t } = useTranslation('exercises');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSettings, setShowSettings] = useState(false);
  const { trackAppUsage } = useRecentApps();
  
  useEffect(() => {
    trackAppUsage('money');
  }, []);
  
  // Mission mode integration
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  const {
    problemCount,
    problemType,
    difficulty,
    changeSettings,
    problems,
    currentProblemIndex,
    showResults,
    showHints,
    showCelebration,
    startTimer,
    handleAnswer,
    submitAnswer,
    nextProblem,
    previousProblem,
    submitAllAnswers,
    resetProblem,
    regenerateProblems,
    toggleHint,
    getCorrectCount,
    getCurrentProblem,
    getStars,
    getEncouragementText,
    getFormattedTime
  } = useMoneyGame();
  
  const currentProblem = getCurrentProblem();
  
  // Track time for mission mode
  const [missionStartTime, setMissionStartTime] = useState<number | null>(null);
  
  // Start mission timer when entering mission mode
  useEffect(() => {
    if (isMissionMode && !missionStartTime && !showResults) {
      setMissionStartTime(Date.now());
      startTimer(); // Start the game timer too
    }
  }, [isMissionMode, missionStartTime, showResults, startTimer]);
  
  // Wrap submitAllAnswers to handle mission mode
  const handleSubmitAllAnswers = async () => {
    // Check all answers first
    const updatedProblems = problems.map(problem => {
      if (problem.isCorrect === null) {
        const userAns = parseFloat(problem.userAnswer || '0');
        const correctAns = problem.correctAnswer;
        return {
          ...problem,
          isCorrect: Math.abs(userAns - correctAns) < 0.01
        };
      }
      return problem;
    });
    
    // If mission mode, complete mission
    if (isMissionMode) {
      const correctCount = updatedProblems.filter(p => p.isCorrect === true).length;
      // Calculate actual duration from mission start time
      const duration = missionStartTime ? Date.now() - missionStartTime : 10000; // Default 10s if no start time
      
      // Build questionAttempts for parent dashboard
      // Use consistent format without "บาท" suffix for proper comparison
      const questionAttempts: QuestionAttempt[] = updatedProblems.map((problem, index) => ({
        index: index + 1,
        question: problem.question,
        userAnswer: problem.userAnswer || '-',
        correctAnswer: problem.correctAnswer.toString(),
        isCorrect: problem.isCorrect === true
      }));
      
      await handleCompleteMission(correctCount, problems.length, duration, questionAttempts);
      return;
    }
    
    // Otherwise, use regular flow
    submitAllAnswers();
  };
  
  if (!currentProblem && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Results Screen
  if (showResults) {
    const stars = getStars();
    const correctCount = getCorrectCount();
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 p-4">
        {showCelebration && <Confetti recycle={false} numberOfPieces={500} />}
        
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/profile')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('money.backToProfile')}
          </Button>
          
          <Card className="bg-white/90 backdrop-blur shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <img 
                    src={moneyMascot} 
                    alt="Money Mascot Celebration" 
                    className="w-32 h-32 animate-bounce"
                  />
                </div>
                <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                <h1 className="text-4xl font-bold mb-2 text-primary">{t('money.excellent')}</h1>
                <p className="text-2xl text-muted-foreground mb-4">
                  {t('money.youScored')} {correctCount}/{problems.length} {t('money.problems')}
                </p>
                
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3].map((star) => (
                    <span
                      key={star}
                      className={`text-5xl ${
                        star <= stars ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                
                <p className="text-xl text-primary font-semibold mb-2">
                  {getEncouragementText()}
                </p>
                
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{t('money.timeUsed')}: {getFormattedTime()}</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <h2 className="text-xl font-bold text-primary">{t('money.problemSummary')}</h2>
                {problems.map((problem, index) => (
                  <div
                    key={problem.id}
                    className={`p-4 rounded-lg border-2 ${
                      problem.isCorrect
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {problem.isCorrect ? '✅' : '❌'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium mb-1">{t('money.problem')} {index + 1}: {problem.story}</p>
                        <p className="text-sm text-muted-foreground mb-2">{problem.question}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600 font-semibold">
                            {t('money.correctAnswer')}: {problem.correctAnswer} {t('money.baht')}
                          </span>
                          {problem.userAnswer && (
                            <span className={problem.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {t('money.yourAnswer')}: {problem.userAnswer} {t('money.baht')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    regenerateProblems();
                  }}
                  size="lg"
                  className="gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  {t('money.playAgain')}
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  size="lg"
                >
                  {t('money.backToProfile')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mission Complete Modal */}
          {missionResult && (
            <MissionCompleteModal
              open={showMissionComplete}
              onOpenChange={setShowMissionComplete}
              stars={missionResult.stars}
              correct={missionResult.correct}
              total={missionResult.total}
              timeSpent={missionResult.timeSpent}
              isPassed={missionResult.isPassed}
              onRetry={() => {
                regenerateProblems();
                setShowMissionComplete(false);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // Settings Panel
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => setShowSettings(false)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('money.backToGame')}
          </Button>
          
          <Card className="bg-white/90 backdrop-blur shadow-xl">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-primary">{t('money.gameSettings')}</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('money.problemCount')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((count) => (
                    <Button
                      key={count}
                      onClick={() => changeSettings(count)}
                      variant={problemCount === count ? 'default' : 'outline'}
                    >
                      {count} {t('money.problems')}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('money.problemType')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => changeSettings(undefined, 'counting')}
                    variant={problemType === 'counting' ? 'default' : 'outline'}
                  >
                    {t('money.counting')}
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, 'change')}
                    variant={problemType === 'change' ? 'default' : 'outline'}
                  >
                    {t('money.change')}
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, 'shopping')}
                    variant={problemType === 'shopping' ? 'default' : 'outline'}
                  >
                    {t('money.shopping')}
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, 'mixed')}
                    variant={problemType === 'mixed' ? 'default' : 'outline'}
                  >
                    {t('money.mixed')}
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{t('common.difficulty')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => changeSettings(undefined, undefined, 'easy')}
                    variant={difficulty === 'easy' ? 'default' : 'outline'}
                  >
                    {t('common.easy')}
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, undefined, 'medium')}
                    variant={difficulty === 'medium' ? 'default' : 'outline'}
                  >
                    {t('common.medium')}
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, undefined, 'hard')}
                    variant={difficulty === 'hard' ? 'default' : 'outline'}
                  >
                    {t('common.hard')}
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  regenerateProblems();
                  setShowSettings(false);
                }}
                className="w-full"
                size="lg"
              >
                {t('money.startNew')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Main Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button onClick={() => navigate('/profile')} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <div className="flex items-center gap-3">
            <img src={moneyMascot} alt="Money Mascot" className="w-10 h-10" />
            <div>
              <div className="text-lg font-semibold">{t('money.title')}</div>
              <div className="text-xs text-muted-foreground">
                {t('money.problem')} {currentProblemIndex + 1}/{problems.length}
              </div>
            </div>
          </div>
          <Button onClick={() => setShowSettings(true)} variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Problem Card */}
        <Card className="bg-white/90 backdrop-blur shadow-xl mb-4">
          <CardContent className="p-6 space-y-6">
            {/* Problem Story */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-3 mb-4">
                {currentProblem.type === 'counting' && (
                  <img src={piggyBank} alt="Piggy Bank" className="w-20 h-20" />
                )}
                {(currentProblem.type === 'shopping' || currentProblem.type === 'change') && (
                  <img src={shopImage} alt="Shop" className="w-24 h-24" />
                )}
                <div className="inline-block bg-gradient-to-r from-green-100 to-yellow-100 rounded-lg p-4">
                  <p className="text-lg font-medium text-primary">{currentProblem.story}</p>
                </div>
              </div>
            </div>
            
            {/* Coins Display (for counting problems) */}
            {currentProblem.type === 'counting' && currentProblem.coins.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                {currentProblem.coins.map((coin, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <img 
                      src={getMoneyImage(coin.value, coin.unit)} 
                      alt={`${coin.value} ${coin.unit}`}
                      className={`${coin.unit === 'บาท' && coin.value >= 20 ? 'w-24 h-16' : 'w-16 h-16'} object-contain`}
                    />
                      <div className="text-center">
                        <div className="text-sm font-bold text-primary">{coin.value} {coin.unit}</div>
                        <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                          จำนวน {coin.count} {coin.unit === 'บาท' && coin.value >= 20 ? t('money.pieces') : t('money.coins')}
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Question */}
            <div className="text-center">
              <p className="text-xl font-bold text-primary mb-4">{currentProblem.question}</p>
            </div>
            
            {/* Answer Input */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={currentProblem.userAnswer}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={t('money.enterAnswer')}
                  className="text-xl text-center"
                  disabled={currentProblem.isCorrect !== null}
                />
                <span className="text-xl font-semibold">{t('money.baht')}</span>
              </div>
            </div>
            
            {/* Feedback */}
            {currentProblem.isCorrect !== null && (
              <div
                className={`text-center p-6 rounded-xl ${
                  currentProblem.isCorrect
                    ? 'bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-300'
                    : 'bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <img 
                    src={moneyMascot} 
                    alt={currentProblem.isCorrect ? "Happy" : "Sad"}
                    className={`w-16 h-16 ${currentProblem.isCorrect ? 'animate-bounce' : ''}`}
                  />
                  <p className="text-xl font-bold">
                    {currentProblem.isCorrect ? `✅ ${t('common.correct')}!` : `❌ ${t('common.tryAgain')}`}
                  </p>
                  {!currentProblem.isCorrect && (
                    <p className="text-sm mt-2 bg-white/70 px-4 py-2 rounded-lg">
                      {t('money.correctAnswer')}: <span className="font-bold text-lg">{currentProblem.correctAnswer} {t('money.baht')}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Hint */}
            {showHints && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                  <p className="text-sm text-blue-800">{currentProblem.hint}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            onClick={previousProblem}
            disabled={currentProblemIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.previous')}
          </Button>
          
          <Button onClick={toggleHint} variant="outline">
            <Lightbulb className="mr-2 h-4 w-4" />
            {showHints ? t('common.hideHint') : t('common.showHint')}
          </Button>
          
          {currentProblem.isCorrect === null ? (
            <Button onClick={submitAnswer} disabled={!currentProblem.userAnswer}>
              <Check className="mr-2 h-4 w-4" />
              {t('common.checkAnswer')}
            </Button>
          ) : (
            <Button onClick={() => resetProblem(currentProblemIndex)} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('common.reset')}
            </Button>
          )}
          
          {currentProblemIndex < problems.length - 1 ? (
            <Button onClick={nextProblem} variant="outline">
              {t('common.next')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitAllAnswers} className="bg-green-600 hover:bg-green-700">
              <Trophy className="mr-2 h-4 w-4" />
              {t('common.submitAll')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoneyApp;
