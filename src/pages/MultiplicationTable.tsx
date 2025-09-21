import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, RotateCcw, CheckCircle, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const MultiplicationTable = () => {
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [gameMode, setGameMode] = useState<'learn' | 'practice'>('learn');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();

  const correctAnswer = selectedTable * currentQuestion;

  const checkAnswer = () => {
    const answer = parseInt(userAnswer);
    const correct = answer === correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 1);
      toast({
        title: "ถูกต้อง! 🎉",
        description: `${selectedTable} × ${currentQuestion} = ${correctAnswer}`,
      });
    } else {
      toast({
        title: "ลองใหม่นะ 💪",
        description: `คำตอบที่ถูกต้องคือ ${correctAnswer}`,
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < 12) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setCurrentQuestion(1);
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult && userAnswer) {
      checkAnswer();
    } else if (e.key === 'Enter' && showResult) {
      nextQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile" className="btn-secondary p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))]">🔢 ตารางสูตรคูณ</h1>
            <p className="text-[hsl(var(--text-secondary))]">ฝึกจำสูตรคูณให้แม่น!</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Multiplication Table Display */}
          <div className="lg:col-span-1">
            <div className="card-glass p-6">
              <h2 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-4">
                สูตรคูณ {selectedTable}
              </h2>
              <div className="space-y-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                  <div 
                    key={num}
                    className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                      num === currentQuestion 
                        ? 'bg-blue-100 ring-2 ring-blue-300' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">
                      {selectedTable} × {num}
                    </span>
                    <span className="font-bold text-blue-600">
                      = {selectedTable * num}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Selection */}
            <div className="card-glass p-6 mt-6">
              <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] mb-4">
                เลือกสูตรคูณ
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(table => (
                  <button
                    key={table}
                    onClick={() => {
                      setSelectedTable(table);
                      resetGame();
                    }}
                    className={`p-3 rounded-lg font-medium transition-colors ${
                      selectedTable === table
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {table}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Practice Area */}
          <div className="lg:col-span-2">
            <div className="card-glass p-8">
              {/* Score */}
              <div className="flex justify-between items-center mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-[hsl(var(--text-muted))]">ถูก</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{totalQuestions}</div>
                  <div className="text-sm text-[hsl(var(--text-muted))]">ข้อทั้งหมด</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%
                  </div>
                  <div className="text-sm text-[hsl(var(--text-muted))]">คะแนน</div>
                </div>
              </div>

              {/* Question */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-[hsl(var(--text-primary))] mb-4">
                  {selectedTable} × {currentQuestion} = ?
                </div>
                
                <div className="flex justify-center mb-6">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-center text-4xl font-bold w-32 h-16 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="?"
                    disabled={showResult}
                  />
                </div>

                {/* Result Display */}
                {showResult && (
                  <div className={`mb-6 p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                      <span className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? 'ถูกต้อง!' : 'ไม่ถูกต้อง'}
                      </span>
                    </div>
                    <div className="text-lg">
                      {selectedTable} × {currentQuestion} = {correctAnswer}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  {!showResult ? (
                    <button
                      onClick={checkAnswer}
                      disabled={!userAnswer}
                      className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ตรวจสอบ
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="btn-primary px-8 py-3 text-lg"
                    >
                      ข้อต่อไป
                    </button>
                  )}
                  
                  <button
                    onClick={resetGame}
                    className="btn-secondary px-6 py-3 text-lg flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    เริ่มใหม่
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Grid */}
            <div className="card-glass p-6 mt-6">
              <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] mb-4">
                แสดงผลด้วยภาพ
              </h3>
              <div className="grid gap-1 max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${selectedTable}, 1fr)` }}>
                {Array.from({ length: selectedTable * currentQuestion }, (_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 bg-blue-200 border border-blue-300 rounded-sm flex items-center justify-center text-xs font-bold text-blue-700"
                  >
                    •
                  </div>
                ))}
              </div>
              <div className="text-center mt-4 text-sm text-[hsl(var(--text-muted))]">
                {currentQuestion} กลุม์ × {selectedTable} ช้ิน = {selectedTable * currentQuestion} ช้ิน
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MultiplicationTable;