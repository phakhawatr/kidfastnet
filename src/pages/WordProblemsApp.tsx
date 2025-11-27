import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import {
  ProblemCategory,
  Difficulty,
  WordProblem,
  generateWordProblems,
  calculateScore
} from '@/utils/wordProblemsUtils';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type GameState = 'menu' | 'category' | 'settings' | 'playing' | 'results';

const WordProblemsApp = () => {
  const { t } = useTranslation(['wordproblems', 'common']);
  const navigate = useNavigate();
  
  // Mission Mode
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  const [gameState, setGameState] = useState<GameState>('category');
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [problems, setProblems] = useState<WordProblem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSymbolHint, setShowSymbolHint] = useState(false);
  const [showConceptHint, setShowConceptHint] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCategorySelect = (category: ProblemCategory) => {
    setSelectedCategory(category);
    setGameState('settings');
  };

  const handleStartQuiz = () => {
    if (!selectedCategory) {
      toast.error(t('errors.noCategory'));
      return;
    }

    const newProblems = generateWordProblems(selectedCategory, selectedDifficulty, selectedCount);
    setProblems(newProblems);
    setUserAnswers(new Array(selectedCount).fill(null));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setGameState('playing');
  };

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer);
    setShowExplanation(false);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error(t('errors.selectAnswer'));
      return;
    }

    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newUserAnswers);
    setShowExplanation(true);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < problems.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1]);
      setShowExplanation(false);
      setShowSymbolHint(false);
      setShowConceptHint(false);
    } else {
      setGameState('results');
      
      // Mission Mode: Complete mission
      if (isMissionMode) {
        const correctCount = userAnswers.filter(
          (answer, index) => answer === problems[index].correctAnswer
        ).length;
        await handleCompleteMission(correctCount, problems.length, elapsedTime * 1000);
      }
    }
  };

  const handleAIGenerate = async () => {
    if (!selectedCategory) return;
    
    setIsAIGenerating(true);
    try {
      // Simulate AI generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newProblems = generateWordProblems(selectedCategory, selectedDifficulty, selectedCount);
      setProblems(newProblems);
      setUserAnswers(new Array(selectedCount).fill(null));
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      toast.success('สร้างโจทย์ใหม่สำเร็จ!');
    } catch (error) {
      toast.error('ไม่สามารถสร้างโจทย์ใหม่ได้');
    } finally {
      setIsAIGenerating(false);
    }
  };

  const calculateResults = () => {
    const correctCount = userAnswers.filter(
      (answer, index) => answer === problems[index].correctAnswer
    ).length;
    return calculateScore(correctCount, problems.length);
  };

  const currentProblem = problems[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / problems.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common:back')}
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Category Selection */}
        {gameState === 'category' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  {t('categories.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['length', 'weight', 'volume', 'time'] as ProblemCategory[]).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    className="h-24 text-lg font-semibold hover:scale-105 transition-transform"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {t(`categories.${category}`)}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings */}
        {gameState === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle>{t('difficulty.title')}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <Button
                    key={level}
                    variant={selectedDifficulty === level ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setSelectedDifficulty(level)}
                  >
                    {t(`difficulty.${level}`)}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Question Count */}
            <Card>
              <CardHeader>
                <CardTitle>{t('questionCount.title')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-4 gap-4">
                {[10, 15, 30, 40].map((count) => (
                  <Button
                    key={count}
                    variant={selectedCount === count ? 'default' : 'outline'}
                    onClick={() => setSelectedCount(count)}
                  >
                    {t(`questionCount.${count}`)}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setGameState('category')}
              >
                {t('common:back')}
              </Button>
              <Button
                className="flex-1"
                onClick={handleStartQuiz}
              >
                {t('buttons.start')}
              </Button>
            </div>
          </div>
        )}

        {/* Playing */}
        {gameState === 'playing' && currentProblem && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {t('progress.question')} {currentQuestionIndex + 1} {t('progress.of')} {problems.length}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatTime(elapsedTime)}
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Question */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {t(`categories.${currentProblem.category}`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg leading-relaxed">
                  {currentProblem.question}
                </p>

                {/* Choices */}
                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(value) => handleAnswerSelect(Number(value))}
                >
                  <div className="space-y-3">
                    {currentProblem.choices.map((choice, index) => {
                      const isCorrect = choice === currentProblem.correctAnswer;
                      const isSelected = choice === selectedAnswer;
                      const showResult = showExplanation;
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                            showResult && isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-950'
                              : showResult && isSelected && !isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-950'
                              : isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={choice.toString()} id={`choice-${index}`} />
                          <Label
                            htmlFor={`choice-${index}`}
                            className="flex-1 cursor-pointer text-base"
                          >
                            {choice} {currentProblem.unit}
                          </Label>
                          {showResult && isCorrect && (
                            <span className="text-green-600 font-semibold">✓</span>
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <span className="text-red-600 font-semibold">✗</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {/* Hint Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSymbolHint(!showSymbolHint)}
                    className="flex-1"
                  >
                    {showSymbolHint ? t('buttons.hideSymbolHint', '🔢 ซ่อนประโยคสัญลักษณ์') : t('buttons.showSymbolHint', '🔢 แสดงประโยคสัญลักษณ์')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConceptHint(!showConceptHint)}
                    className="flex-1"
                  >
                    {showConceptHint ? t('buttons.hideConceptHint', '💡 ซ่อนแนวคิด') : t('buttons.showConceptHint', '💡 แสดงแนวคิด')}
                  </Button>
                </div>

                {/* Symbol Hint Display */}
                {showSymbolHint && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                      🔢 {t('hints.symbolTitle', 'ประโยคสัญลักษณ์')}:
                    </p>
                    <p className="text-lg font-mono text-blue-900 dark:text-blue-100">
                      {currentProblem.symbolHint}
                    </p>
                  </div>
                )}

                {/* Concept Hint Display */}
                {showConceptHint && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      💡 {t('hints.conceptTitle', 'แนวคิด')}:
                    </p>
                    <p className="text-base text-amber-900 dark:text-amber-100">
                      {currentProblem.conceptHint}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                {showExplanation && (
                  <div className={`p-4 rounded-lg ${
                    selectedAnswer === currentProblem.correctAnswer
                      ? 'bg-green-50 dark:bg-green-950 border-2 border-green-500'
                      : 'bg-red-50 dark:bg-red-950 border-2 border-red-500'
                  }`}>
                    <p className="font-semibold mb-2">
                      {selectedAnswer === currentProblem.correctAnswer
                        ? t('feedback.correct')
                        : t('feedback.incorrect')}
                    </p>
                    <p className="text-sm">{currentProblem.explanation}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  {!showExplanation ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      className="flex-1"
                      disabled={selectedAnswer === null}
                    >
                      {t('buttons.submit')}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="flex-1"
                    >
                      {currentQuestionIndex < problems.length - 1
                        ? t('buttons.next')
                        : t('buttons.finish')}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleAIGenerate}
                    disabled={isAIGenerating}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isAIGenerating ? t('loading.aiGenerating') : t('buttons.generateNew')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {gameState === 'results' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-3xl">
                  {t('results.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(() => {
                  const results = calculateResults();
                  const correctCount = userAnswers.filter(
                    (answer, index) => answer === problems[index].correctAnswer
                  ).length;
                  
                  return (
                    <>
                      <div className="text-center space-y-4">
                        <p className="text-5xl font-bold text-primary">
                          {results.percentage}%
                        </p>
                        <p className="text-2xl">
                          {t(`results.${results.message}`)}
                        </p>
                        <div className="flex justify-center gap-2 text-4xl">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} className={i < results.stars ? 'text-yellow-500' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-secondary rounded-lg">
                          <p className="text-sm text-muted-foreground">{t('results.correct')}</p>
                          <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                        </div>
                        <div className="text-center p-4 bg-secondary rounded-lg">
                          <p className="text-sm text-muted-foreground">{t('results.incorrect')}</p>
                          <p className="text-2xl font-bold text-red-600">{problems.length - correctCount}</p>
                        </div>
                      </div>

                      <div className="text-center p-4 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">{t('results.timeUsed')}</p>
                        <p className="text-xl font-bold">{formatTime(elapsedTime)}</p>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setGameState('category')}
                        >
                          {t('buttons.backToMenu')}
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleStartQuiz}
                        >
                          {t('buttons.tryAgain')}
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
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
              handleStartQuiz();
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WordProblemsApp;
