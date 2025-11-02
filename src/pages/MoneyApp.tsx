import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMoneyGame } from '../hooks/useMoneyGame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Settings, Lightbulb, Trophy, Clock } from 'lucide-react';
import Confetti from 'react-confetti';
import { getCoinEmoji, getMoneyColor } from '../utils/moneyUtils';

const MoneyApp = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  
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
            กลับหน้าโปรไฟล์
          </Button>
          
          <Card className="bg-white/90 backdrop-blur shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                <h1 className="text-4xl font-bold mb-2 text-primary">เยี่ยมมาก!</h1>
                <p className="text-2xl text-muted-foreground mb-4">
                  คุณทำได้ {correctCount}/{problems.length} ข้อ
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
                  <span>เวลาที่ใช้: {getFormattedTime()}</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <h2 className="text-xl font-bold text-primary">สรุปผลการทำโจทย์</h2>
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
                        <p className="font-medium mb-1">ข้อ {index + 1}: {problem.story}</p>
                        <p className="text-sm text-muted-foreground mb-2">{problem.question}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600 font-semibold">
                            คำตอบที่ถูก: {problem.correctAnswer} บาท
                          </span>
                          {problem.userAnswer && (
                            <span className={problem.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              คำตอบของคุณ: {problem.userAnswer} บาท
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
                  เล่นอีกครั้ง
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  size="lg"
                >
                  กลับหน้าโปรไฟล์
                </Button>
              </div>
            </CardContent>
          </Card>
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
            กลับไปทำโจทย์
          </Button>
          
          <Card className="bg-white/90 backdrop-blur shadow-xl">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-primary">ตั้งค่าการเล่น</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">จำนวนโจทย์</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 15].map((count) => (
                    <Button
                      key={count}
                      onClick={() => changeSettings(count)}
                      variant={problemCount === count ? 'default' : 'outline'}
                    >
                      {count} ข้อ
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">ประเภทโจทย์</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => changeSettings(undefined, 'counting')}
                    variant={problemType === 'counting' ? 'default' : 'outline'}
                  >
                    นับเงิน
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, 'change')}
                    variant={problemType === 'change' ? 'default' : 'outline'}
                  >
                    ทอนเงิน
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, 'shopping')}
                    variant={problemType === 'shopping' ? 'default' : 'outline'}
                  >
                    ซื้อของ
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, 'mixed')}
                    variant={problemType === 'mixed' ? 'default' : 'outline'}
                  >
                    ผสม
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">ระดับความยาก</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => changeSettings(undefined, undefined, 'easy')}
                    variant={difficulty === 'easy' ? 'default' : 'outline'}
                  >
                    ง่าย
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, undefined, 'medium')}
                    variant={difficulty === 'medium' ? 'default' : 'outline'}
                  >
                    ปานกลาง
                  </Button>
                  <Button
                    onClick={() => changeSettings(undefined, undefined, 'hard')}
                    variant={difficulty === 'hard' ? 'default' : 'outline'}
                  >
                    ยาก
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
                เริ่มเล่นใหม่
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
            กลับ
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              💰 เงินตรา
            </span>
            <span className="text-sm text-muted-foreground">
              ({currentProblemIndex + 1}/{problems.length})
            </span>
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
              <div className="inline-block bg-gradient-to-r from-green-100 to-yellow-100 rounded-lg p-4 mb-4">
                <p className="text-lg font-medium text-primary">{currentProblem.story}</p>
              </div>
            </div>
            
            {/* Coins Display (for counting problems) */}
            {currentProblem.type === 'counting' && currentProblem.coins.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                {currentProblem.coins.map((coin, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 ${getMoneyColor(coin.value, coin.unit)} rounded-lg p-3 shadow-md`}
                  >
                    <span className="text-3xl">{getCoinEmoji(coin.value, coin.unit)}</span>
                    <div className="text-sm font-semibold">
                      <div>{coin.value} {coin.unit}</div>
                      <div className="text-xs text-muted-foreground">x {coin.count}</div>
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
                  placeholder="กรอกคำตอบ"
                  className="text-xl text-center"
                  disabled={currentProblem.isCorrect !== null}
                />
                <span className="text-xl font-semibold">บาท</span>
              </div>
            </div>
            
            {/* Feedback */}
            {currentProblem.isCorrect !== null && (
              <div
                className={`text-center p-4 rounded-lg ${
                  currentProblem.isCorrect
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <p className="text-lg font-semibold">
                  {currentProblem.isCorrect ? '✅ ถูกต้อง!' : '❌ ไม่ถูกต้อง'}
                </p>
                {!currentProblem.isCorrect && (
                  <p className="text-sm mt-2">
                    คำตอบที่ถูกต้องคือ {currentProblem.correctAnswer} บาท
                  </p>
                )}
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
            ข้อก่อนหน้า
          </Button>
          
          <Button onClick={toggleHint} variant="outline">
            <Lightbulb className="mr-2 h-4 w-4" />
            {showHints ? 'ซ่อนคำใบ้' : 'แสดงคำใบ้'}
          </Button>
          
          {currentProblem.isCorrect === null ? (
            <Button onClick={submitAnswer} disabled={!currentProblem.userAnswer}>
              <Check className="mr-2 h-4 w-4" />
              ตรวจคำตอบ
            </Button>
          ) : (
            <Button onClick={() => resetProblem(currentProblemIndex)} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              ทำใหม่
            </Button>
          )}
          
          {currentProblemIndex < problems.length - 1 ? (
            <Button onClick={nextProblem} variant="outline">
              ข้อถัดไป
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submitAllAnswers} className="bg-green-600 hover:bg-green-700">
              <Trophy className="mr-2 h-4 w-4" />
              ส่งคำตอบทั้งหมด
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoneyApp;
