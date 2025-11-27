import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Settings, RefreshCw, Lightbulb, Award, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import {
  generateMentalMathProblems,
  checkAnswer,
  calculateStars,
  getStrategyName,
  type MentalMathProblem,
  type Difficulty,
} from '@/utils/mentalMathUtils';
import { supabase } from '@/integrations/supabase/client';
import Confetti from 'react-confetti';

const MentalMathApp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('exercises');
  
  // Mission Mode
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  // Settings
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [problemCount, setProblemCount] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  
  // Game state
  const [problems, setProblems] = useState<MentalMathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [showSteps, setShowSteps] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Timer
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [problemStartTime, setProblemStartTime] = useState<number | null>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (startTime && !isFinished) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, isFinished]);

  useEffect(() => {
    setProblemStartTime(Date.now());
  }, [currentIndex]);

  const startNewGame = () => {
    const newProblems = generateMentalMathProblems(problemCount, difficulty);
    setProblems(newProblems);
    setCurrentIndex(0);
    setUserAnswers(new Array(problemCount).fill(0));
    setCurrentInput('');
    setShowSteps(false);
    setCurrentStepIndex(0);
    setIsFinished(false);
    setResults([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setProblemStartTime(Date.now());
    setShowConfetti(false);
  };

  const handleInputChange = (value: string) => {
    // Only allow numbers and minus sign
    if (value === '' || /^-?\d*$/.test(value)) {
      setCurrentInput(value);
    }
  };

  const handleSubmitAnswer = () => {
    const answer = parseInt(currentInput) || 0;
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);
    
    // Move to next question
    setCurrentInput('');
    setShowSteps(false);
    setCurrentStepIndex(0);
    
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleShowSteps = () => {
    setShowSteps(true);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < currentProblem.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinish = async (answers: number[]) => {
    const newResults = problems.map((problem, index) => 
      checkAnswer(problem, answers[index])
    );
    setResults(newResults);
    setIsFinished(true);
    
    const correctCount = newResults.filter(r => r).length;
    const stars = calculateStars(correctCount, problems.length);
    
    if (stars >= 2) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    // Mission Mode: Complete mission
    if (isMissionMode) {
      await handleCompleteMission(correctCount, problems.length, elapsedTime);
      return;
    }

    // Save to Supabase
    await savePracticeSession(correctCount, problems.length, elapsedTime);
  };

  const savePracticeSession = async (correctCount: number, totalCount: number, durationMs: number) => {
    try {
      const userId = localStorage.getItem('kidfast_user_id');
      const lastEmail = localStorage.getItem('kidfast_last_email');
      
      if (!userId && !lastEmail) {
        console.warn('[MentalMathApp] No userId or email found');
        return;
      }

      let finalUserId = userId;
      
      if (!finalUserId && lastEmail) {
        const { data: registration } = await supabase
          .from('user_registrations')
          .select('id')
          .eq('parent_email', lastEmail)
          .single();
        
        if (registration) {
          finalUserId = registration.id;
          localStorage.setItem('kidfast_user_id', finalUserId);
        }
      }

      if (!finalUserId) {
        console.warn('[MentalMathApp] Unable to determine userId');
        return;
      }

      // Save practice session
      const { error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: finalUserId,
          skill_name: 'คิดเลขเร็ว',
          difficulty: difficulty,
          problems_attempted: totalCount,
          problems_correct: correctCount,
          accuracy: Math.round((correctCount / totalCount) * 100),
          time_spent: Math.round(durationMs / 1000),
          hints_used: 0,
          session_date: new Date().toISOString()
        });

      if (sessionError) {
        console.error('[MentalMathApp] Error saving practice session:', sessionError);
      }

      // Update skill assessments
      const avgTimePerProblem = Math.round(durationMs / totalCount);
      
      for (let i = 0; i < totalCount; i++) {
        const isCorrect = results[i];
        
        await supabase.rpc('update_skill_assessment', {
          p_user_id: finalUserId,
          p_skill_name: 'คิดเลขเร็ว',
          p_correct: isCorrect,
          p_time_spent: avgTimePerProblem
        });
      }

    } catch (error) {
      console.error('[MentalMathApp] Error in savePracticeSession:', error);
    }
  };

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="bg-white/90 hover:bg-white"
          >
            <Home className="mr-2 h-4 w-4" />
            {t('mentalMath.backToHome')}
          </Button>
          
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span className="font-semibold">
              {Math.floor(elapsedTime / 60000)}:{String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0')}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/90 hover:bg-white"
          >
            <Settings className="mr-2 h-4 w-4" />
            {t('common.settings')}
          </Button>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
          ⚡ {t('mentalMath.title')}
        </h1>
        <p className="text-white/90 text-center mb-4">
          {t('mentalMath.description')}
        </p>

        {/* Progress Bar */}
        <div className="bg-white/90 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">{t('common.question', { current: currentIndex + 1, total: problems.length })}</span>
            <span className="text-sm font-semibold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-4xl mx-auto mb-6 bg-white rounded-xl p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-4">⚙️ {t('common.settings')}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('common.difficulty')}:</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                  >
                    {level === 'easy' && `😊 ${t('common.easy')} (${t('mentalMath.makeRound10')})`}
                    {level === 'medium' && `😎 ${t('common.medium')} (2 ${t('mentalMath.digits')})`}
                    {level === 'hard' && `🔥 ${t('common.hard')} (${t('mentalMath.makeRound100')})`}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('mentalMath.numberOfProblems')}: {problemCount}</label>
              <input
                type="range"
                min="3"
                max="15"
                value={problemCount}
                onChange={(e) => setProblemCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <Button onClick={startNewGame} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('mentalMath.startNewGame')}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isFinished ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-xl">
            {/* Strategy Badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold">
                <Zap className="h-4 w-4" />
                {getStrategyName(currentProblem.strategy)}
              </div>
            </div>

            {/* Question */}
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">
              {currentProblem.question}
            </h2>

            {/* Steps Animation */}
            {showSteps && (
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-lg">วิธีคิด:</span>
                </div>
                
                {currentProblem.steps.slice(0, currentStepIndex + 1).map((step, index) => (
                  <div
                    key={index}
                    className={`mb-3 p-4 rounded-lg transition-all duration-500 ${
                      index === currentStepIndex 
                        ? 'bg-white shadow-lg scale-105' 
                        : 'bg-white/50'
                    }`}
                  >
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    <p className="text-2xl font-bold text-primary">{step.expression}</p>
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={currentStepIndex === 0}
                    size="sm"
                  >
                    ← ย้อนกลับ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextStep}
                    disabled={currentStepIndex === currentProblem.steps.length - 1}
                    size="sm"
                  >
                    ถัดไป →
                  </Button>
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && currentInput) {
                      handleSubmitAnswer();
                    }
                  }}
                  className="flex-1 p-4 text-3xl border-2 rounded-lg text-center font-bold"
                  placeholder="?"
                  autoFocus
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentInput}
                  size="lg"
                  className="px-8"
                >
                  {t('mentalMath.answer')}
                </Button>
              </div>

              {!showSteps && (
                <Button
                  variant="outline"
                  onClick={handleShowSteps}
                  className="w-full"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  {t('mentalMath.showThinking')}
                </Button>
              )}
            </div>

            {/* Quick Number Pad */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  onClick={() => handleInputChange(currentInput + num)}
                  className="h-14 text-xl"
                >
                  {num}
                </Button>
              ))}
                <Button
                  variant="outline"
                  onClick={() => handleInputChange(currentInput.slice(0, -1))}
                  className="h-14"
                >
                  ← {t('mentalMath.delete')}
                </Button>
            </div>
          </div>
        </div>
      ) : (
        <ResultsScreen
          problems={problems}
          userAnswers={userAnswers}
          results={results}
          elapsedTime={elapsedTime}
          onRestart={startNewGame}
          onHome={() => navigate('/profile')}
        />
      )}

      {/* Mission Complete Modal */}
      {showMissionComplete && missionResult && (
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
            startNewGame();
          }}
        />
      )}
    </div>
  );
};

// Results screen
const ResultsScreen = ({ problems, userAnswers, results, elapsedTime, onRestart, onHome }: any) => {
  const { t } = useTranslation('exercises');
  const correctCount = results.filter((r: boolean) => r).length;
  const stars = calculateStars(correctCount, problems.length);
  const percentage = Math.round((correctCount / problems.length) * 100);
  const avgTime = Math.round(elapsedTime / problems.length / 1000);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-xl text-center">
        <h2 className="text-3xl font-bold mb-4">🎉 {t('results.completed')}</h2>
        
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto mb-2 text-primary" />
            <div className="text-4xl mb-2">{'⭐'.repeat(stars)}</div>
            <p className="text-sm text-muted-foreground">{stars} {t('results.stars')}</p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-primary">{percentage}%</div>
            <p className="text-sm text-muted-foreground">{t('results.accuracy')}</p>
          </div>
          
          <div className="text-center">
            <Zap className="h-16 w-16 mx-auto mb-2 text-amber-500" />
            <div className="text-2xl font-bold">{avgTime}s</div>
            <p className="text-sm text-muted-foreground">{t('mentalMath.avgPerQuestion')}</p>
          </div>
        </div>

        <div className="text-lg mb-6">
          {t('results.correctAnswers', { correct: correctCount, total: problems.length })}
        </div>

        {/* Review Answers */}
        <div className="mb-6 max-h-64 overflow-y-auto">
          <h3 className="font-semibold mb-3">{t('mentalMath.details')}:</h3>
          {problems.map((problem: any, index: number) => (
            <div
              key={index}
              className={`p-3 mb-2 rounded-lg text-left ${
                results[index] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              } border`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{problem.question}</span>
                <span className={results[index] ? 'text-green-600' : 'text-red-600'}>
                  {results[index] ? '✓' : '✗'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('mentalMath.yourAnswer')}: <span className="font-semibold">{userAnswers[index]}</span>
                {!results[index] && (
                  <span className="ml-2">
                    ({t('mentalMath.correct')}: <span className="font-semibold">{problem.answer}</span>)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={onRestart} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('results.playAgain')}
          </Button>
          <Button onClick={onHome} variant="outline" size="lg">
            <Home className="mr-2 h-4 w-4" />
            {t('common.backToProfile')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentalMathApp;
