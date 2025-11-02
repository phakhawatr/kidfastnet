import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, RotateCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNumberBondsGame } from '@/hooks/useNumberBondsGame';
import { formatTime, calculateStars, getEncouragement } from '@/utils/numberBondsUtils';
import Confetti from 'react-confetti';

const NumberBondsApp = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    count,
    maxNumber,
    difficulty,
    problems,
    currentIndex,
    showResults,
    celebrate,
    elapsedTime,
    isFinished,
    regenerateProblems,
    handleAnswer,
    nextProblem,
    previousProblem,
    submitAnswers,
    resetProblem,
    changeSettings,
    getCorrectCount,
    getCurrentProblem,
    getCorrectAnswer,
  } = useNumberBondsGame();

  const currentProblem = getCurrentProblem();
  const bond = currentProblem?.bond;

  // Safety check - don't render if no problems yet
  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  const handleInputChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      handleAnswer(value);
    }
  };

  const handleSubmit = () => {
    if (currentIndex < problems.length - 1) {
      nextProblem();
    } else {
      submitAnswers();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {celebrate && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </Button>
          
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Number Bonds
          </h1>
          
          <Button
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress & Timer */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="font-semibold text-gray-700">
            ข้อ {currentIndex + 1} / {problems.length}
          </div>
          <div className="font-mono text-blue-600 font-bold">
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / problems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-4xl mx-auto mb-6 bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
          <h3 className="font-bold text-lg mb-4">ตั้งค่า</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Number of problems */}
            <div>
              <label className="block text-sm font-medium mb-2">จำนวนข้อ</label>
              <select
                value={count}
                onChange={(e) => changeSettings(Number(e.target.value), maxNumber, difficulty)}
                className="w-full p-2 border rounded-lg"
              >
                <option value={5}>5 ข้อ</option>
                <option value={10}>10 ข้อ</option>
                <option value={15}>15 ข้อ</option>
                <option value={20}>20 ข้อ</option>
              </select>
            </div>

            {/* Max Number */}
            <div>
              <label className="block text-sm font-medium mb-2">เลขสูงสุด</label>
              <select
                value={maxNumber}
                onChange={(e) => changeSettings(count, Number(e.target.value), difficulty)}
                className="w-full p-2 border rounded-lg"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">ระดับ</label>
              <select
                value={difficulty}
                onChange={(e) => changeSettings(count, maxNumber, e.target.value as any)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="easy">ง่าย</option>
                <option value="medium">ปานกลาง</option>
                <option value="hard">ยาก</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!showResults ? (
        <div className="max-w-4xl mx-auto">
          {/* Number Bond Visualization */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              {/* Top Circle (Whole) */}
              <div className="relative mb-12">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl transition-all duration-300 ${
                  bond?.missingPart === 'whole'
                    ? 'bg-gradient-to-br from-yellow-300 to-orange-300 animate-pulse-slow'
                    : 'bg-gradient-to-br from-blue-400 to-purple-400 text-white'
                }`}>
                  {bond?.missingPart === 'whole' ? (
                    <input
                      type="text"
                      value={currentProblem.userAnswer}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-20 h-20 text-center text-4xl font-bold bg-white rounded-full border-4 border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-200"
                      placeholder="?"
                      autoFocus
                      disabled={showResults}
                    />
                  ) : (
                    bond?.whole
                  )}
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-600">
                  ทั้งหมด
                </div>
              </div>

              {/* Connecting Lines */}
              <div className="w-1 h-16 bg-gradient-to-b from-purple-300 to-pink-300 mb-4" />

              {/* Bottom Circles (Parts) */}
              <div className="flex gap-16 items-center">
                {/* Part 1 */}
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg transition-all duration-300 ${
                    bond?.missingPart === 'part1'
                      ? 'bg-gradient-to-br from-yellow-300 to-orange-300 animate-pulse-slow'
                      : 'bg-gradient-to-br from-green-400 to-teal-400 text-white'
                  }`}>
                    {bond?.missingPart === 'part1' ? (
                      <input
                        type="text"
                        value={currentProblem.userAnswer}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-16 h-16 text-center text-3xl font-bold bg-white rounded-full border-4 border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-200"
                        placeholder="?"
                        autoFocus
                        disabled={showResults}
                      />
                    ) : (
                      bond?.part1
                    )}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    ส่วนที่ 1
                  </div>
                </div>

                {/* Plus Sign */}
                <div className="text-4xl font-bold text-pink-400">+</div>

                {/* Part 2 */}
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg transition-all duration-300 ${
                    bond?.missingPart === 'part2'
                      ? 'bg-gradient-to-br from-yellow-300 to-orange-300 animate-pulse-slow'
                      : 'bg-gradient-to-br from-pink-400 to-rose-400 text-white'
                  }`}>
                    {bond?.missingPart === 'part2' ? (
                      <input
                        type="text"
                        value={currentProblem.userAnswer}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="w-16 h-16 text-center text-3xl font-bold bg-white rounded-full border-4 border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-200"
                        placeholder="?"
                        autoFocus
                        disabled={showResults}
                      />
                    ) : (
                      bond?.part2
                    )}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-600 whitespace-nowrap">
                    ส่วนที่ 2
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {currentProblem.isCorrect !== null && (
                <div className={`mt-12 text-2xl font-bold animate-scale-in ${
                  currentProblem.isCorrect ? 'text-green-600' : 'text-red-500'
                }`}>
                  {currentProblem.isCorrect ? '✓ ถูกต้อง!' : `✗ คำตอบที่ถูก: ${getCorrectAnswer(currentIndex)}`}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="outline"
              onClick={previousProblem}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              ก่อนหน้า
            </Button>

            <Button
              variant="outline"
              onClick={() => resetProblem(currentIndex)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              ล้าง
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!currentProblem.userAnswer}
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {currentIndex < problems.length - 1 ? (
                <>
                  ถัดไป
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  ส่งคำตอบ
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        // Results Screen
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              สรุปผลการทำ
            </h2>

            {/* Stars */}
            <div className="flex justify-center gap-2 text-6xl mb-6">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={i < calculateStars(getCorrectCount(), problems.length) ? 'text-yellow-400' : 'text-gray-300'}>
                  ⭐
                </span>
              ))}
            </div>

            {/* Score */}
            <div className="text-5xl font-bold mb-4 text-blue-600">
              {getCorrectCount()} / {problems.length}
            </div>

            <div className="text-xl mb-6 text-gray-600">
              {getEncouragement(getCorrectCount(), problems.length)}
            </div>

            {/* Time */}
            <div className="text-lg mb-8 text-gray-500">
              ใช้เวลา: <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={regenerateProblems}
                className="gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
              >
                <RotateCcw className="w-4 h-4" />
                เริ่มใหม่
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
              >
                กลับหน้าหลัก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberBondsApp;
