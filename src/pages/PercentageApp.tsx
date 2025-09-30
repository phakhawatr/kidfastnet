import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle, Trophy, Target, Shuffle, Eye } from 'lucide-react';
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

// Separate ProblemCard component to prevent re-creation
const ProblemCard: React.FC<{
  problem: PercentageProblem;
  onAnswerChange: (problemId: number, answer: string) => void;
  onCheckAnswer: (problemId: number) => void;
  showResults: boolean;
}> = React.memo(({ problem, onAnswerChange, onCheckAnswer, showResults }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(problem.id, e.target.value);
  }, [problem.id, onAnswerChange]);

  const handleCheck = useCallback(() => {
    onCheckAnswer(problem.id);
  }, [problem.id, onCheckAnswer]);

  return (
    <Card className={`transition-all duration-200 border-4 shadow-xl hover:shadow-2xl hover:scale-105 ${
      problem.isCorrect === true ? 'border-green-400 bg-gradient-to-br from-green-100 to-emerald-200 animate-scale-in' :
      problem.isCorrect === false ? 'border-red-400 bg-gradient-to-br from-red-100 to-pink-200' :
      'border-purple-300 bg-gradient-to-br from-white to-purple-50 hover:border-purple-400'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-lg font-black px-4 py-2 bg-purple-500 text-white border-2 border-white shadow-lg">
            ข้อ {problem.id}
          </Badge>
          {problem.isCorrect !== null && (
            problem.isCorrect ? 
              <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-full font-bold">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg">ถูกต้อง!</span>
              </div> :
              <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-full font-bold">
                <XCircle className="w-6 h-6" />
                <span className="text-lg">ลองใหม่!</span>
              </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="text-2xl font-black text-purple-800 bg-white/70 p-4 rounded-2xl text-center">
            {problem.type === 'fraction' ? 
              `🍕 ร้อยละ ${problem.percentage} = ` :
              `🔢 ${problem.percentage}% = `
            }
          </div>
          
          <div className="flex items-center gap-3">
            <Input
              value={problem.userAnswer}
              onChange={handleChange}
              className="text-center font-bold text-xl border-4 border-purple-300 rounded-2xl h-14 focus:border-purple-500 bg-white shadow-inner"
              disabled={showResults}
              autoComplete="off"
              placeholder="?"
            />
            {!showResults && (
              <Button
                size="lg"
                onClick={handleCheck}
                disabled={!problem.userAnswer.trim()}
                className="bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-black rounded-2xl px-6 shadow-lg hover:shadow-xl hover:scale-110 transition-all border-2 border-white"
              >
                ✓ ตรวจ
              </Button>
            )}
          </div>
          
          {showResults && problem.isCorrect === false && (
            <div className="text-lg font-bold text-red-700 bg-red-100 border-3 border-red-400 p-4 rounded-2xl shadow-lg animate-scale-in">
              💡 คำตอบที่ถูก: <span className="text-green-700">{problem.correctAnswer}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ProblemCard.displayName = 'ProblemCard';

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

  const resetGame = useCallback(() => {
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
    setShowResults(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
  }, [gameMode]);

  const startGame = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const handleAnswerChange = useCallback((problemId: number, answer: string) => {
    setProblems(prev => prev.map(p => 
      p.id === problemId ? { ...p, userAnswer: answer } : p
    ));
  }, []);

  const checkAnswer = useCallback((problemId: number) => {
    const problem = problems.find(p => p.id === problemId);
    if (!problem) return;

    const isCorrect = problem.userAnswer.trim().toLowerCase() === problem.correctAnswer.toLowerCase();
    
    setProblems(prev => prev.map(p => 
      p.id === problemId ? { ...p, isCorrect } : p
    ));
  }, [problems]);

  const checkAllAnswers = useCallback(() => {
    problems.forEach(problem => {
      if (problem.userAnswer.trim()) {
        const isCorrect = problem.userAnswer.trim().toLowerCase() === problem.correctAnswer.toLowerCase();
        setProblems(prev => prev.map(p => 
          p.id === problem.id ? { ...p, isCorrect } : p
        ));
      }
    });
    setShowResults(true);
    setIsTimerRunning(false);
  }, [problems]);

  const getScore = useCallback(() => {
    const answeredProblems = problems.filter(p => p.isCorrect !== null);
    const correctAnswers = problems.filter(p => p.isCorrect === true);
    return {
      correct: correctAnswers.length,
      total: answeredProblems.length,
      percentage: answeredProblems.length > 0 ? Math.round((correctAnswers.length / answeredProblems.length) * 100) : 0
    };
  }, [problems]);

  const shuffleProblems = useCallback(() => {
    setProblems(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  const showAllAnswers = useCallback(() => {
    setProblems(prev => prev.map(p => ({
      ...p,
      userAnswer: p.correctAnswer,
      isCorrect: true
    })));
    setShowResults(true);
    setIsTimerRunning(false);
  }, []);

  // Generate random new problems
  const generateRandomProblems = useCallback(() => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const simplifyFraction = (num: number, den: number) => {
      const divisor = gcd(num, den);
      return `${num / divisor}/${den / divisor}`;
    };

    const newProblems: PercentageProblem[] = [];
    let idCounter = 1;

    // Generate fraction problems
    const fractionCount = gameMode === 'decimal' ? 0 : gameMode === 'fraction' ? 15 : 15;
    for (let i = 0; i < fractionCount; i++) {
      const percent = Math.floor(Math.random() * 99) + 1; // 1-99
      const answer = simplifyFraction(percent, 100);
      newProblems.push({
        id: idCounter++,
        type: 'fraction',
        percentage: percent,
        correctAnswer: answer,
        userAnswer: '',
        isCorrect: null
      });
    }

    // Generate decimal problems
    const decimalCount = gameMode === 'fraction' ? 0 : gameMode === 'decimal' ? 15 : 15;
    for (let i = 0; i < decimalCount; i++) {
      const percent = Math.floor(Math.random() * 300) + 1; // 1-300 for variety
      const answer = (percent / 100).toFixed(2);
      newProblems.push({
        id: idCounter++,
        type: 'decimal',
        percentage: percent,
        correctAnswer: answer,
        userAnswer: '',
        isCorrect: null
      });
    }

    setProblems(newProblems);
    setShowResults(false);
    setTimeElapsed(0);
    setIsTimerRunning(false);
  }, [gameMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const score = getScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <Link to="/profile">
            <Button variant="outline" size="lg" className="bg-white hover:bg-purple-50 border-2 border-purple-300 text-purple-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <ArrowLeft className="w-5 h-5 mr-2" />
              🏠 กลับ
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-black mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent animate-scale-in">
              🎯 แบบฝึกหัดร้อยละ 💯
            </h1>
            <p className="text-xl font-bold text-purple-700 bg-white/70 rounded-full px-6 py-2 inline-block shadow-md">
              ✨ เขียนร้อยละในรูปเศษส่วนและทศนิยม ✨
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white px-5 py-3 rounded-2xl border-4 border-white shadow-xl font-bold text-lg">
            <Clock className="w-5 h-5" />
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Game Mode Selection */}
        <Card className="mb-6 border-4 border-purple-300 shadow-2xl bg-white/90 backdrop-blur animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-purple-800">
              <Target className="w-7 h-7" />
              🎮 โหมดเกม
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={gameMode === 'mixed' ? 'default' : 'outline'}
                onClick={() => setGameMode('mixed')}
                size="lg"
                className={`font-bold text-lg rounded-2xl transition-all hover:scale-105 ${
                  gameMode === 'mixed' 
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white shadow-lg' 
                    : 'border-3 border-green-400 hover:bg-green-50'
                }`}
              >
                🎨 ผสม (30 ข้อ)
              </Button>
              <Button
                variant={gameMode === 'fraction' ? 'default' : 'outline'}
                onClick={() => setGameMode('fraction')}
                size="lg"
                className={`font-bold text-lg rounded-2xl transition-all hover:scale-105 ${
                  gameMode === 'fraction' 
                    ? 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-lg' 
                    : 'border-3 border-orange-400 hover:bg-orange-50'
                }`}
              >
                🍕 เศษส่วน (15 ข้อ)
              </Button>
              <Button
                variant={gameMode === 'decimal' ? 'default' : 'outline'}
                onClick={() => setGameMode('decimal')}
                size="lg"
                className={`font-bold text-lg rounded-2xl transition-all hover:scale-105 ${
                  gameMode === 'decimal' 
                    ? 'bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white shadow-lg' 
                    : 'border-3 border-purple-400 hover:bg-purple-50'
                }`}
              >
                🔢 ทศนิยม (15 ข้อ)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          {!isTimerRunning && !showResults && (
            <Button 
              onClick={startGame} 
              size="lg"
              className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:from-green-500 hover:via-emerald-600 hover:to-teal-600 text-white font-black text-xl px-8 py-6 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all border-4 border-white"
            >
              <Target className="w-6 h-6 mr-3" />
              🎯 เริ่มเกม!
            </Button>
          )}
          
          {isTimerRunning && (
            <>
              <Button 
                onClick={checkAllAnswers} 
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-yellow-300 font-black text-xl px-8 py-6 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all border-4 border-white"
              >
                <CheckCircle className="w-6 h-6 mr-3" />
                ⭐ ตรวจคำตอบ!
              </Button>
              
              <Button 
                onClick={showAllAnswers} 
                size="lg"
                className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 hover:from-orange-500 hover:via-red-500 hover:to-pink-600 text-white font-black text-xl px-8 py-6 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all border-4 border-white"
              >
                <Eye className="w-6 h-6 mr-3" />
                👀 เฉลย
              </Button>
            </>
          )}
          
          <button
            onClick={generateRandomProblems}
            className="px-8 py-6 rounded-3xl text-xl font-black text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200 flex items-center gap-3 border-4 border-white"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
            }}
          >
            <span className="text-3xl">✨</span>
            <span>AI สร้างโจทย์ใหม่</span>
          </button>
          
          <button
            onClick={showAllAnswers}
            className="px-8 py-6 rounded-3xl text-xl font-black text-white shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200 flex items-center gap-3 border-4 border-white"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)',
            }}
          >
            <Eye className="w-6 h-6" />
            <span>👀 เฉลยทั้งหมด</span>
          </button>
        </div>

        {/* Results Summary */}
        {showResults && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 text-white border-4 border-white shadow-2xl animate-scale-in">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <Trophy className="w-20 h-20 animate-bounce" />
                <div className="text-center">
                  <div className="text-4xl font-black mb-2">
                    🎉 คะแนน: {score.correct}/{score.total} 🎉
                  </div>
                  <div className="text-3xl font-bold mb-3">
                    ({score.percentage}%) 
                    {score.percentage === 100 ? ' 🏆 เยี่ยมมาก!' : 
                     score.percentage >= 80 ? ' 🌟 เก่งมาก!' :
                     score.percentage >= 60 ? ' 👍 ดีมาก!' : ' 💪 พยายามต่อไปนะ!'}
                  </div>
                  <div className="text-xl font-bold bg-white/30 rounded-full px-6 py-2 inline-block">
                    ⏱️ ใช้เวลา: {formatTime(timeElapsed)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map(problem => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onAnswerChange={handleAnswerChange}
              onCheckAnswer={checkAnswer}
              showResults={showResults}
            />
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-4 border-purple-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-200 to-orange-200 rounded-t-xl">
            <CardTitle className="text-2xl font-black text-purple-800 flex items-center gap-2">
              🎯 วิธีการเล่น
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-lg font-bold">
              <p className="bg-orange-200 p-4 rounded-2xl">
                <span className="text-2xl mr-2">🍕</span>
                <strong className="text-orange-700">เศษส่วน:</strong> 
                <span className="text-purple-700"> เขียนร้อยละในรูปเศษส่วนอย่างต่ำ (เช่น ร้อยละ 14 = 7/50)</span>
              </p>
              <p className="bg-blue-200 p-4 rounded-2xl">
                <span className="text-2xl mr-2">🔢</span>
                <strong className="text-blue-700">ทศนิยม:</strong>
                <span className="text-purple-700"> เขียนร้อยละในรูปทศนิยม (เช่น 5% = 0.05)</span>
              </p>
              <p className="bg-green-200 p-4 rounded-2xl">
                <span className="text-2xl mr-2">💡</span>
                <strong className="text-green-700">เคล็ดลับ:</strong>
                <span className="text-purple-700"> ร้อยละ = ตัวเลข/100 แล้วทำให้เป็นเศษส่วนอย่างต่ำ</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PercentageApp;