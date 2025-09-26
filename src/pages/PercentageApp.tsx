import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle, Trophy, Target, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Types for percentage problems
interface PercentageProblem {
  id: number;
  type: 'fraction' | 'decimal';
  percentage: number;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean | null;
}

// Problem generator
const generateProblems = (): PercentageProblem[] => {
  const problems: PercentageProblem[] = [];
  
  // Generate fraction problems (1-15)
  const fractionPercentages = [7, 9, 13, 14, 26, 31, 43, 46, 49, 51, 58, 74, 86, 92, 99];
  fractionPercentages.forEach((percent, index) => {
    const answer = percent === 7 ? '7/100' : 
                   percent === 9 ? '9/100' :
                   percent === 13 ? '13/100' :
                   percent === 14 ? '7/50' :
                   percent === 26 ? '13/50' :
                   percent === 31 ? '31/100' :
                   percent === 43 ? '43/100' :
                   percent === 46 ? '23/50' :
                   percent === 49 ? '49/100' :
                   percent === 51 ? '51/100' :
                   percent === 58 ? '29/50' :
                   percent === 74 ? '37/50' :
                   percent === 86 ? '43/50' :
                   percent === 92 ? '23/25' :
                   '99/100';
    
    problems.push({
      id: index + 1,
      type: 'fraction',
      percentage: percent,
      correctAnswer: answer,
      userAnswer: '',
      isCorrect: null
    });
  });

  // Generate decimal problems (16-30)
  const decimalPercentages = [5, 10, 12, 14, 23, 27, 36, 47, 59, 63, 77, 80, 100, 250, 703];
  decimalPercentages.forEach((percent, index) => {
    const answer = percent === 5 ? '0.05' :
                   percent === 10 ? '0.10' :
                   percent === 12 ? '0.12' :
                   percent === 14 ? '0.14' :
                   percent === 23 ? '0.23' :
                   percent === 27 ? '0.27' :
                   percent === 36 ? '0.36' :
                   percent === 47 ? '0.47' :
                   percent === 59 ? '0.59' :
                   percent === 63 ? '0.63' :
                   percent === 77 ? '0.77' :
                   percent === 80 ? '0.80' :
                   percent === 100 ? '1.00' :
                   percent === 250 ? '2.50' :
                   '7.03';
    
    problems.push({
      id: index + 16,
      type: 'decimal',
      percentage: percent,
      correctAnswer: answer,
      userAnswer: '',
      isCorrect: null
    });
  });

  return problems;
};

const PercentageApp: React.FC = () => {
  const [problems, setProblems] = useState<PercentageProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameMode, setGameMode] = useState<'fraction' | 'decimal' | 'mixed'>('mixed');

  // Initialize problems
  useEffect(() => {
    resetGame();
  }, [gameMode]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const resetGame = () => {
    const allProblems = generateProblems();
    let filteredProblems: PercentageProblem[];
    
    switch (gameMode) {
      case 'fraction':
        filteredProblems = allProblems.filter(p => p.type === 'fraction');
        break;
      case 'decimal':
        filteredProblems = allProblems.filter(p => p.type === 'decimal');
        break;
      default:
        filteredProblems = allProblems;
    }
    
    setProblems(filteredProblems);
    setCurrentProblemIndex(0);
    setShowResults(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
  };

  const startGame = () => {
    setIsTimerRunning(true);
  };

  const handleAnswerChange = (problemId: number, answer: string) => {
    setProblems(prev => prev.map(p => 
      p.id === problemId ? { ...p, userAnswer: answer } : p
    ));
  };

  const checkAnswer = (problemId: number) => {
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;

    const isCorrect = problem.userAnswer.trim().toLowerCase() === problem.correctAnswer.toLowerCase();
    
    setProblems(prev => prev.map(p => 
      p.id === problemId ? { ...p, isCorrect } : p
    ));
  };

  const checkAllAnswers = () => {
    problems.forEach(problem => {
      if (problem.userAnswer.trim()) {
        checkAnswer(problem.id);
      }
    });
    setShowResults(true);
    setIsTimerRunning(false);
  };

  const getScore = () => {
    const answeredProblems = problems.filter(p => p.isCorrect !== null);
    const correctAnswers = problems.filter(p => p.isCorrect === true);
    return {
      correct: correctAnswers.length,
      total: answeredProblems.length,
      percentage: answeredProblems.length > 0 ? Math.round((correctAnswers.length / answeredProblems.length) * 100) : 0
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ProblemCard: React.FC<{ problem: PercentageProblem }> = ({ problem }) => {
    return (
      <Card className={`transition-all duration-200 ${
        problem.isCorrect === true ? 'border-green-500 bg-green-50' :
        problem.isCorrect === false ? 'border-red-500 bg-red-50' :
        'border-gray-200 hover:border-primary/50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-sm">
              ข้อ {problem.id}
            </Badge>
            {problem.isCorrect !== null && (
              problem.isCorrect ? 
                <CheckCircle className="w-5 h-5 text-green-500" /> :
                <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          
          <div className="space-y-3">
            <div className="text-lg font-medium">
              {problem.type === 'fraction' ? 
                `ร้อยละ ${problem.percentage} = ` :
                `${problem.percentage}% = `
              }
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={problem.userAnswer}
                onChange={(e) => handleAnswerChange(problem.id, e.target.value)}
                placeholder={problem.type === 'fraction' ? 'เช่น 7/100' : 'เช่น 0.07'}
                className="text-center font-medium"
                disabled={showResults}
              />
              {!showResults && (
                <Button
                  size="sm"
                  onClick={() => checkAnswer(problem.id)}
                  disabled={!problem.userAnswer.trim()}
                >
                  ตรวจ
                </Button>
              )}
            </div>
            
            {showResults && problem.isCorrect === false && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                คำตอบที่ถูก: {problem.correctAnswer}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const score = getScore();

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/profile">
            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              💯 แบบฝึกหัดร้อยละ
            </h1>
            <p className="text-white/90">เขียนร้อยละในรูปเศษส่วนอย่างต่ำและทศนิยม</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Game Mode Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              โหมดเกม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={gameMode === 'mixed' ? 'default' : 'outline'}
                onClick={() => setGameMode('mixed')}
                className={gameMode === 'mixed' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                ผสม (30 ข้อ)
              </Button>
              <Button
                variant={gameMode === 'fraction' ? 'default' : 'outline'}
                onClick={() => setGameMode('fraction')}
                className={gameMode === 'fraction' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                เศษส่วน (15 ข้อ)
              </Button>
              <Button
                variant={gameMode === 'decimal' ? 'default' : 'outline'}
                onClick={() => setGameMode('decimal')}
                className={gameMode === 'decimal' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                ทศนิยม (15 ข้อ)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          {!isTimerRunning && !showResults && (
            <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
              <Target className="w-4 h-4 mr-2" />
              เริ่มเกม
            </Button>
          )}
          
          {isTimerRunning && (
            <Button onClick={checkAllAnswers} className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              ตรวจคำตอบทั้งหมด
            </Button>
          )}
          
          <Button variant="outline" onClick={resetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            เริ่มใหม่
          </Button>
          
          <Button variant="outline" onClick={() => setProblems(prev => [...prev].sort(() => Math.random() - 0.5))}>
            <Shuffle className="w-4 h-4 mr-2" />
            สลับข้อ
          </Button>
        </div>

        {/* Results Summary */}
        {showResults && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="w-8 h-8" />
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    คะแนน: {score.correct}/{score.total} ({score.percentage}%)
                  </div>
                  <div className="text-sm opacity-90">
                    ใช้เวลา: {formatTime(timeElapsed)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map(problem => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-white/90">
          <CardHeader>
            <CardTitle>🎯 วิธีการเล่น</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>เศษส่วน:</strong> เขียนร้อยละในรูปเศษส่วนอย่างต่ำ (เช่น ร้อยละ 14 = 7/50)</p>
              <p><strong>ทศนิยม:</strong> เขียนร้อยละในรูปทศนิยม (เช่น 5% = 0.05)</p>
              <p><strong>เคล็ดลับ:</strong> ร้อยละ = ตัวเลข/100 แล้วทำให้เป็นเศษส่วนอย่างต่ำ</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PercentageApp;