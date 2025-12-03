import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMissionMode } from '@/hooks/useMissionMode';
import { useRecentApps } from '@/hooks/useRecentApps';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import { type QuestionAttempt } from '@/hooks/useTrainingCalendar';
import { Home, Settings, RefreshCw, Eye, EyeOff, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PlaceValueVisualizer from '@/components/PlaceValueVisualizer';
import {
  generatePlaceValueProblems,
  checkAnswer,
  calculateStars,
  type PlaceValueProblem,
  type Difficulty,
} from '@/utils/placeValueUtils';
import { supabase } from '@/integrations/supabase/client';
import Confetti from 'react-confetti';

const PlaceValueApp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('exercises');
  const [searchParams] = useSearchParams();
  const { trackAppUsage } = useRecentApps();
  
  useEffect(() => {
    trackAppUsage('place-value');
  }, []);
  
  // Mission mode
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
  const [problems, setProblems] = useState<PlaceValueProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | number)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Timer
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Input state for decompose questions
  const [decomposeInputs, setDecomposeInputs] = useState<{ [key: string]: string }>({});

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

  const startNewGame = () => {
    const newProblems = generatePlaceValueProblems(problemCount, difficulty);
    setProblems(newProblems);
    setCurrentIndex(0);
    setUserAnswers(new Array(problemCount).fill(''));
    setShowExplanation(false);
    setIsFinished(false);
    setResults([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setDecomposeInputs({});
    setShowConfetti(false);
  };

  const handleAnswerSubmit = (answer: string | number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    setShowExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCheckAnswers = async () => {
    const newResults = problems.map((problem, index) => 
      checkAnswer(problem, userAnswers[index])
    );
    setResults(newResults);
    setIsFinished(true);
    
    const correctCount = newResults.filter(r => r).length;
    const stars = calculateStars(correctCount, problems.length);
    
    if (stars >= 2) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    // Mission mode completion
    if (isMissionMode) {
      // Build questionAttempts for parent dashboard
      const questionAttempts: QuestionAttempt[] = problems.map((problem, index) => ({
        index: index + 1,
        question: problem.question,
        userAnswer: String(userAnswers[index]) || '-',
        correctAnswer: String(problem.answer),
        isCorrect: newResults[index]
      }));
      
      await handleCompleteMission(correctCount, problems.length, elapsedTime, questionAttempts);
    } else {
      // Save to Supabase (only in normal mode)
      await savePracticeSession(correctCount, problems.length, elapsedTime);
    }
  };

  const savePracticeSession = async (correctCount: number, totalCount: number, durationMs: number) => {
    try {
      const userId = localStorage.getItem('kidfast_user_id');
      const lastEmail = localStorage.getItem('kidfast_last_email');
      
      if (!userId && !lastEmail) {
        console.warn('[PlaceValueApp] No userId or email found');
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
        console.warn('[PlaceValueApp] Unable to determine userId');
        return;
      }

      // Save practice session
      const { error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: finalUserId,
          skill_name: 'ค่าประจำหลัก',
          difficulty: difficulty,
          problems_attempted: totalCount,
          problems_correct: correctCount,
          accuracy: Math.round((correctCount / totalCount) * 100),
          time_spent: Math.round(durationMs / 1000),
          hints_used: 0,
          session_date: new Date().toISOString()
        });

      if (sessionError) {
        console.error('[PlaceValueApp] Error saving practice session:', sessionError);
      }

      // Update skill assessments
      const avgTimePerProblem = Math.round(durationMs / totalCount);
      
      for (let i = 0; i < totalCount; i++) {
        const isCorrect = results[i];
        
        await supabase.rpc('update_skill_assessment', {
          p_user_id: finalUserId,
          p_skill_name: 'ค่าประจำหลัก',
          p_correct: isCorrect,
          p_time_spent: avgTimePerProblem
        });
      }

    } catch (error) {
      console.error('[PlaceValueApp] Error in savePracticeSession:', error);
    }
  };

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="bg-white/90 hover:bg-white"
          >
            <Home className="mr-2 h-4 w-4" />
            {t('placeValue.backToHome')}
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
          🔢 {t('placeValue.title')}
        </h1>
        <p className="text-white/90 text-center mb-4">
          {t('placeValue.description')}
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
        <div className="max-w-6xl mx-auto mb-6 bg-white rounded-xl p-6 shadow-xl">
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
                    {level === 'easy' && `😊 ${t('common.easy')} (2 ${t('placeValue.digits')})`}
                    {level === 'medium' && `😎 ${t('common.medium')} (3 ${t('placeValue.digits')})`}
                    {level === 'hard' && `🔥 ${t('common.hard')} (4 ${t('placeValue.digits')})`}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t('placeValue.numberOfProblems')}: {problemCount}</label>
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
              {t('placeValue.startNewGame')}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isFinished ? (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-xl">
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center mb-6 text-primary">
                {currentProblem.question}
              </h2>
              
              {/* Visualizer */}
              <PlaceValueVisualizer number={currentProblem.number} />
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              {currentProblem.questionType === 'decompose' ? (
                <DecomposeInput
                  problem={currentProblem}
                  value={userAnswers[currentIndex] as string}
                  onChange={handleAnswerSubmit}
                />
              ) : currentProblem.options ? (
                <div className="grid grid-cols-2 gap-4">
                  {currentProblem.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={userAnswers[currentIndex] === option ? 'default' : 'outline'}
                      className="h-16 text-lg"
                      onClick={() => handleAnswerSubmit(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={userAnswers[currentIndex]}
                  onChange={(e) => handleAnswerSubmit(e.target.value)}
                  className="w-full p-4 text-xl border-2 rounded-lg text-center"
                  placeholder={t('placeValue.answerPlaceholder')}
                />
              )}
            </div>

            {/* Explanation Toggle */}
            {currentProblem.explanation && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full"
                >
                  {showExplanation ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showExplanation ? t('placeValue.hideExplanation') : t('placeValue.showExplanation')}
                </Button>
                
                {showExplanation && (
                  <div className="mt-4 p-4 bg-accent rounded-lg">
                    <p className="text-sm">{currentProblem.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                ← {t('common.previous')}
              </Button>

              {currentIndex === problems.length - 1 ? (
                <Button onClick={handleCheckAnswers} size="lg">
                  {t('placeValue.checkAnswers')} ✓
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {t('common.next')} →
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : !isMissionMode ? (
        <ResultsScreen
          problems={problems}
          userAnswers={userAnswers}
          results={results}
          elapsedTime={elapsedTime}
          onRestart={startNewGame}
          onHome={() => navigate('/profile')}
        />
      ) : null}
      
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
          onRetry={startNewGame}
        />
      )}
    </div>
  );
};

// Decompose input component
const DecomposeInput = ({ problem, value, onChange }: any) => {
  const { t } = useTranslation('exercises');
  const digitCount = problem.number.toString().length;
  
  return (
    <div className="space-y-2">
      <p className="text-center text-sm text-muted-foreground">
        {t('placeValue.decomposeInstruction')}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 text-xl border-2 rounded-lg text-center"
        placeholder={digitCount === 2 ? t('placeValue.decompose2Digits') : t('placeValue.decompose3Digits')}
      />
    </div>
  );
};

// Results screen
const ResultsScreen = ({ problems, userAnswers, results, elapsedTime, onRestart, onHome }: any) => {
  const { t } = useTranslation('exercises');
  const correctCount = results.filter((r: boolean) => r).length;
  const stars = calculateStars(correctCount, problems.length);
  const percentage = Math.round((correctCount / problems.length) * 100);

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
            <Clock className="h-16 w-16 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {Math.floor(elapsedTime / 60000)}:{String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0')}
            </div>
            <p className="text-sm text-muted-foreground">{t('results.timeUsed')}</p>
          </div>
        </div>

        <div className="text-lg mb-6">
          {t('results.correctAnswers', { correct: correctCount, total: problems.length })}
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

export default PlaceValueApp;
