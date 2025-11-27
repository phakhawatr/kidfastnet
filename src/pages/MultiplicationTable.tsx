import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, CheckCircle, X, Trophy, Target, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '../hooks/use-toast';

const MultiplicationTable = () => {
  const { t } = useTranslation('exercises');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Mission mode
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [gameMode, setGameMode] = useState<'learn' | 'practice'>('practice');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const { toast } = useToast();

  const correctAnswer = selectedTable * currentQuestion;

  // Timer effect
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameActive && timeLeft === 0) {
      endGame();
    }
  }, [gameActive, timeLeft]);

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(30);
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
    setCurrentQuestion(Math.floor(Math.random() * 12) + 1);
    setUserAnswer('');
    setShowResult(false);
  };

  const endGame = async () => {
    setGameActive(false);
    if (streak > bestStreak) {
      setBestStreak(streak);
      localStorage.setItem('multiplicationBestStreak', streak.toString());
    }
    
    // Mission mode completion
    if (isMissionMode && totalQuestions > 0) {
      const elapsedMs = (30 - timeLeft) * 1000; // Time used
      await handleCompleteMission(score, totalQuestions, elapsedMs);
    } else {
      toast({
        title: "เกมส์จบแล้ว! 🎮",
        description: `คะแนน: ${score}/${totalQuestions} | Streak: ${streak}`,
      });
    }
  };

  const checkAnswer = () => {
    const answer = parseInt(userAnswer);
    const correct = answer === correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      toast({
        title: "ถูกต้อง! 🎉",
        description: `${selectedTable} × ${currentQuestion} = ${correctAnswer}`,
      });
    } else {
      setStreak(0);
      toast({
        title: "ลองใหม่นะ 💪",
        description: `คำตอบที่ถูกต้องคือ ${correctAnswer}`,
      });
    }

    if (gameActive) {
      setTimeout(nextQuestion, 1500);
    }
  };

  const nextQuestion = () => {
    if (gameActive) {
      setCurrentQuestion(Math.floor(Math.random() * 12) + 1);
    } else {
      if (currentQuestion < 12) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setCurrentQuestion(1);
      }
    }
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(null);
  };

  const resetGame = () => {
    setCurrentQuestion(1);
    setUserAnswer('');
    setScore(0);
    setTotalQuestions(0);
    setShowResult(false);
    setIsCorrect(null);
    setGameActive(false);
    setTimeLeft(30);
    setStreak(0);
  };

  // Load best streak from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('multiplicationBestStreak');
    if (saved) setBestStreak(parseInt(saved));
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult && userAnswer) {
      checkAnswer();
    } else if (e.key === 'Enter' && showResult) {
      nextQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/profile')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.backToProfile')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('multiplication.tableTitle')}</h1>
              <p className="text-muted-foreground">{t('multiplication.tableSubtitle')}</p>
            </div>
          </div>
          
          {/* Game Stats */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {t('results.bestStreak')}: {bestStreak}
            </Badge>
            {gameActive && (
              <Badge variant={timeLeft < 10 ? "destructive" : "default"} className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {timeLeft}s
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Mode Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t('common.gameMode')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    variant="outline"
                    onClick={() => setGameMode('learn')}
                    className={`w-full justify-start transition-all duration-200 ${
                      gameMode === 'learn' 
                        ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300 ring-2 ring-green-200' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {t('common.learn')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setGameMode('practice')}
                    className={`w-full justify-start transition-all duration-200 ${
                      gameMode === 'practice' 
                        ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300 ring-2 ring-green-200' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {t('multiplication.speedTest')}
                  </Button>
                </div>
                
                {gameMode === 'practice' && (
                  <button 
                    onClick={gameActive ? endGame : startGame}
                    className={`w-full px-6 py-3.5 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2.5 ${
                      gameActive ? 'bg-red-600 hover:bg-red-700' : ''
                    }`}
                    style={!gameActive ? {
                      background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
                    } : undefined}
                  >
                    {gameActive ? (
                      <>
                        <span>⏹️</span>
                        <span>{t('common.stopGame')}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">✨</span>
                        <span>{t('common.aiStartGame')}</span>
                      </>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Table Selection */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('multiplication.selectTable')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(table => (
                    <Button
                      key={table}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTable(table);
                        resetGame();
                      }}
                      disabled={gameActive}
                      className={`transition-all duration-200 ${
                        selectedTable === table 
                          ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300 ring-2 ring-green-200' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {table}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Practice Area */}
          <div className="lg:col-span-2">
            <Card className="h-fit">
              <CardContent className="p-8">
                {/* Game Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-muted-foreground">{t('results.correct')}</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">{totalQuestions}</div>
                    <div className="text-sm text-muted-foreground">{t('results.totalQuestions')}</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">{t('results.score')}</div>
                  </div>
                </div>

                {gameMode === 'practice' && gameActive && (
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg font-medium">{t('results.streak')}:</span>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        🔥 {streak}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Question */}
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-primary mb-6 animate-pulse">
                    {selectedTable} × {currentQuestion} = ?
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-center text-4xl font-bold w-40 h-20 border-2 border-input rounded-lg focus:border-ring focus:ring-2 focus:ring-ring/30 outline-none bg-background"
                      placeholder="?"
                      disabled={showResult || (gameMode === 'practice' && !gameActive)}
                      autoFocus
                    />
                  </div>

                  {/* Result Display */}
                  {showResult && (
                    <div className={`mb-6 p-4 rounded-lg border-2 ${
                      isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        ) : (
                          <X className="w-8 h-8 text-red-600" />
                        )}
                        <span className={`text-xl font-bold ${
                          isCorrect ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isCorrect ? t('common.correct') + ' 🎉' : t('common.tryAgain') + ' 💪'}
                        </span>
                      </div>
                      <div className="text-2xl font-medium">
                        {selectedTable} × {currentQuestion} = {correctAnswer}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    {!showResult && gameMode === 'learn' && (
                      <Button
                        onClick={checkAnswer}
                        disabled={!userAnswer}
                        size="lg"
                        className="px-8 py-3 text-lg"
                      >
                        {t('common.check')}
                      </Button>
                    )}
                    
                    {!showResult && gameMode === 'practice' && gameActive && (
                      <Button
                        onClick={checkAnswer}
                        disabled={!userAnswer}
                        size="lg"
                        className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
                      >
                        {t('common.submitAnswer')}
                      </Button>
                    )}
                    
                    {showResult && gameMode === 'learn' && (
                      <Button
                        onClick={nextQuestion}
                        size="lg"
                        className="px-8 py-3 text-lg"
                      >
                        {t('common.nextQuestion')}
                      </Button>
                    )}
                    
                    {!gameActive && (
                      <Button
                        onClick={resetGame}
                        variant="outline"
                        size="lg"
                        className="px-6 py-3 text-lg flex items-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        {t('common.startNew')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multiplication Table Display */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('multiplication.table')} {selectedTable}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                    <div 
                      key={num}
                      className={`grid grid-cols-3 gap-2 items-center p-3 rounded-lg transition-all duration-200 ${
                        num === currentQuestion 
                          ? 'bg-primary/10 ring-2 ring-primary/30 scale-105' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <span className="font-medium text-right">
                        {selectedTable} × {num}
                      </span>
                      <span className="font-medium text-center">
                        =
                      </span>
                      <span className="font-bold text-primary text-left">
                        {selectedTable * num}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Visual Grid */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t('multiplication.visualDisplay')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1 max-w-sm mx-auto" style={{ 
                  gridTemplateColumns: `repeat(${Math.min(selectedTable, 10)}, 1fr)` 
                }}>
                  {Array.from({ length: Math.min(selectedTable * currentQuestion, 100) }, (_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 bg-blue-200 border border-blue-300 rounded-sm flex items-center justify-center text-xs font-bold text-blue-700"
                    >
                      •
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  {currentQuestion} {t('multiplication.groupsTimesItems').replace('×', `× ${selectedTable}`).replace('=', `= ${selectedTable * currentQuestion}`)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
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
          onRetry={startGame}
        />
      )}
    </div>
  );
};

export default MultiplicationTable;