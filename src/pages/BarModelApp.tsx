import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Lightbulb, CheckCircle, XCircle, RotateCcw, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BarVisualizer } from '@/components/BarVisualizer';
import { useBarModelGame } from '@/hooks/useBarModelGame';
import { formatTime } from '@/utils/barModelUtils';
import Confetti from 'react-confetti';

export default function BarModelApp() {
  console.log('🎯 BarModelApp loaded');
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const {
    count,
    type,
    difficulty,
    problems,
    currentIndex,
    showResults,
    showHint,
    celebrate,
    elapsedTime,
    handleAnswer,
    submitAnswer,
    nextProblem,
    previousProblem,
    submitAllAnswers,
    resetProblem,
    changeSettings,
    toggleHint,
    regenerateProblems,
    getCorrectCount,
    getCurrentProblem,
    getStars,
    getEncouragementText,
  } = useBarModelGame();

  const currentProblem = getCurrentProblem();

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const correctCount = getCorrectCount();
    const stars = getStars();
    const encouragement = getEncouragementText();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
        {celebrate && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-purple-700 hover:bg-white/50"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-purple-800">ผลการทำแบบฝึกหัด</h1>
            <div className="w-10"></div>
          </div>

          {/* Results Card */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm">
            <div className="text-center space-y-6">
              {/* Stars */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-16 h-16 ${
                      s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    } transition-all duration-500`}
                  />
                ))}
              </div>

              {/* Score */}
              <div>
                <div className="text-6xl font-bold text-purple-600 mb-2">
                  {correctCount}/{problems.length}
                </div>
                <div className="text-xl text-gray-600">คะแนนที่ได้</div>
              </div>

              {/* Encouragement */}
              <div className="text-2xl font-semibold text-purple-700">
                {encouragement}
              </div>

              {/* Time */}
              <div className="text-lg text-gray-600">
                ⏱️ เวลาที่ใช้: {formatTime(elapsedTime)}
              </div>

              {/* Problem Review */}
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-bold text-gray-800">รายละเอียดคำตอบ</h3>
                {problems.map((problem, idx) => (
                  <div
                    key={problem.id}
                    className={`p-4 rounded-lg border-2 ${
                      problem.isCorrect
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1">
                          ข้อ {idx + 1}: {problem.question}
                        </div>
                        <div className="text-sm text-gray-600">
                          คำตอบของคุณ: {problem.userAnswer || '-'} | 
                          คำตอบที่ถูก: {problem.correctAnswer}
                        </div>
                      </div>
                      {problem.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center pt-6">
                <Button
                  onClick={regenerateProblems}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  เริ่มใหม่
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="px-8"
                >
                  กลับหน้าหลัก
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Settings Panel
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 bg-white/80 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-purple-800 mb-6">⚙️ ตั้งค่า</h2>

            <div className="space-y-6">
              {/* Number of problems */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนโจทย์
                </label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <Button
                      key={n}
                      variant={count === n ? 'default' : 'outline'}
                      onClick={() => changeSettings(n, undefined, undefined)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Problem Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทโจทย์
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={type === 'part-whole' ? 'default' : 'outline'}
                    onClick={() => changeSettings(undefined, 'part-whole', undefined)}
                  >
                    แบบส่วนรวม
                  </Button>
                  <Button
                    variant={type === 'comparison' ? 'default' : 'outline'}
                    onClick={() => changeSettings(undefined, 'comparison', undefined)}
                  >
                    แบบเปรียบเทียบ
                  </Button>
                  <Button
                    variant={type === 'mixed' ? 'default' : 'outline'}
                    onClick={() => changeSettings(undefined, 'mixed', undefined)}
                  >
                    ผสม
                  </Button>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ระดับความยาก
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={difficulty === 'easy' ? 'default' : 'outline'}
                    onClick={() => changeSettings(undefined, undefined, 'easy')}
                  >
                    ง่าย
                  </Button>
                  <Button
                    variant={difficulty === 'medium' ? 'default' : 'outline'}
                    onClick={() => changeSettings(undefined, undefined, 'medium')}
                  >
                    ปานกลาง
                  </Button>
                  <Button
                    variant={difficulty === 'hard' ? 'default' : 'outline'}
                    onClick={() => changeSettings(undefined, undefined, 'hard')}
                  >
                    ยาก
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => {
                    regenerateProblems();
                    setShowSettings(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  เริ่มใหม่
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="text-purple-700 hover:bg-white/50"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-purple-800">📊 Bar Model Method</h1>
            <p className="text-sm text-gray-600">วิธีแท่งภาพ (Singapore Math)</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="text-purple-700 hover:bg-white/50"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>ข้อ {currentIndex + 1} / {problems.length}</span>
            <span>⏱️ {formatTime(elapsedTime)}</span>
          </div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Problem Card */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm mb-6">
          {/* Story */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-sm font-medium text-blue-800 mb-2">📖 โจทย์</div>
            <p className="text-gray-800 leading-relaxed">{currentProblem.story}</p>
          </div>

          {/* Question */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="text-sm font-medium text-purple-800 mb-2">❓ คำถาม</div>
            <p className="text-lg font-semibold text-gray-800">{currentProblem.question}</p>
          </div>

          {/* Bar Visualization */}
          <div className="mb-6">
            <BarVisualizer
              bars={currentProblem.bars}
              onValueChange={(barId, value) => handleAnswer(value)}
              showAnswers={currentProblem.isCorrect !== null}
            />
          </div>

          {/* Hint Button */}
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={toggleHint}
              className="w-full"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? 'ซ่อนคำใบ้' : 'แสดงคำใบ้'}
            </Button>
            {showHint && (
              <div className="mt-3 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div className="text-sm font-medium text-yellow-800 mb-1">💡 คำใบ้</div>
                <p className="text-gray-700">{currentProblem.hint}</p>
              </div>
            )}
          </div>

          {/* Feedback */}
          {currentProblem.isCorrect !== null && (
            <div
              className={`p-4 rounded-lg border-2 mb-4 ${
                currentProblem.isCorrect
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${
                  currentProblem.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {currentProblem.isCorrect ? '✅ ถูกต้อง!' : '❌ ไม่ถูกต้อง'}
                </span>
                {!currentProblem.isCorrect && (
                  <span className="text-gray-700">
                    คำตอบที่ถูก: {currentProblem.correctAnswer}
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={previousProblem}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            ⬅️ ก่อนหน้า
          </Button>

          {currentProblem.isCorrect === null ? (
            <Button
              onClick={submitAnswer}
              disabled={!currentProblem.userAnswer}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              ✅ ส่งคำตอบ
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => resetProblem(currentIndex)}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              ลองใหม่
            </Button>
          )}

          {currentIndex < problems.length - 1 ? (
            <Button
              variant="outline"
              onClick={nextProblem}
              className="flex-1"
            >
              ถัดไป ➡️
            </Button>
          ) : (
            <Button
              onClick={submitAllAnswers}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500"
            >
              🏁 ส่งทั้งหมด
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}