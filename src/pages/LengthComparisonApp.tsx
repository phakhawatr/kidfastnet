import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle, Trophy, Shuffle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import giraffeMascot from '@/assets/giraffe-mascot.png';
import elephantMascot from '@/assets/elephant-mascot.png';
import mouseMascot from '@/assets/mouse-mascot.png';
import { useTranslation } from 'react-i18next';

interface MatchingPair {
  id: number;
  left: string;
  right: string;
  leftValue: number; // value in centimeters for comparison
  rightValue: number;
}

interface Connection {
  leftId: number;
  rightId: number;
  isCorrect: boolean;
}

const questionSets: MatchingPair[][] = [
  [
    { id: 1, left: '1 เมตร 50 เซนติเมตร', right: '150 เซนติเมตร', leftValue: 150, rightValue: 150 },
    { id: 2, left: '320 เซนติเมตร', right: '3 เมตร 20 เซนติเมตร', leftValue: 320, rightValue: 320 },
    { id: 3, left: '250 เซนติเมตร', right: '2 เมตร 50 เซนติเมตร', leftValue: 250, rightValue: 250 },
    { id: 4, left: '2 เมตร 99 เซนติเมตร', right: '299 เซนติเมตร', leftValue: 299, rightValue: 299 },
    { id: 5, left: '302 เซนติเมตร', right: '3 เมตร 2 เซนติเมตร', leftValue: 302, rightValue: 302 },
    { id: 6, left: '4 เมตร 5 เซนติเมตร', right: '405 เซนติเมตร', leftValue: 405, rightValue: 405 },
    { id: 7, left: '5 เมตร 10 เซนติเมตร', right: '510 เซนติเมตร', leftValue: 510, rightValue: 510 },
    { id: 8, left: '6 เมตร 12 เซนติเมตร', right: '612 เซนติเมตร', leftValue: 612, rightValue: 612 }
  ],
  [
    { id: 1, left: '2 เมตร 30 เซนติเมตร', right: '230 เซนติเมตร', leftValue: 230, rightValue: 230 },
    { id: 2, left: '450 เซนติเมตร', right: '4 เมตร 50 เซนติเมตร', leftValue: 450, rightValue: 450 },
    { id: 3, left: '180 เซนติเมตร', right: '1 เมตร 80 เซนติเมตร', leftValue: 180, rightValue: 180 },
    { id: 4, left: '3 เมตร 7 เซนติเมตร', right: '307 เซนติเมตร', leftValue: 307, rightValue: 307 },
    { id: 5, left: '95 เซนติเมตร', right: '0 เมตร 95 เซนติเมตร', leftValue: 95, rightValue: 95 },
    { id: 6, left: '5 เมตร 25 เซนติเมตร', right: '525 เซนติเมตร', leftValue: 525, rightValue: 525 }
  ],
  [
    { id: 1, left: '7 เมตร 8 เซนติเมตร', right: '708 เซนติเมตร', leftValue: 708, rightValue: 708 },
    { id: 2, left: '890 เซนติเมตร', right: '8 เมตร 90 เซนติเมตร', leftValue: 890, rightValue: 890 },
    { id: 3, left: '156 เซนติเมตร', right: '1 เมตร 56 เซนติเมตร', leftValue: 156, rightValue: 156 },
    { id: 4, left: '9 เมตร 3 เซนติเมตร', right: '903 เซนติเมตร', leftValue: 903, rightValue: 903 },
    { id: 5, left: '274 เซนติเมตร', right: '2 เมตร 74 เซนติเมตร', leftValue: 274, rightValue: 274 }
  ]
];

const LengthComparisonApp: React.FC = () => {
  const { t } = useTranslation('exercises');
  const [currentSet, setCurrentSet] = useState(0);
  const [questions, setQuestions] = useState<MatchingPair[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<MatchingPair[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeGame();
  }, [currentSet]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const initializeGame = () => {
    const currentQuestions = questionSets[currentSet];
    setQuestions(currentQuestions);
    
    // Shuffle answers
    const answers = [...currentQuestions];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    setShuffledAnswers(answers);
    
    setConnections([]);
    setSelectedLeft(null);
    setIsCompleted(false);
    setScore(0);
    setTimeElapsed(0);
    setIsTimerRunning(true);
  };

  const handleLeftClick = (id: number) => {
    if (selectedLeft === id) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(id);
    }
  };

  const handleRightClick = (rightId: number) => {
    if (selectedLeft === null) return;

    // Remove existing connection for this left item
    const newConnections = connections.filter(conn => conn.leftId !== selectedLeft);
    
    // Find the matching pair
    const leftItem = questions.find(q => q.id === selectedLeft);
    const rightItem = shuffledAnswers.find(q => q.id === rightId);
    
    if (leftItem && rightItem) {
      const isCorrect = leftItem.leftValue === rightItem.rightValue;
      newConnections.push({
        leftId: selectedLeft,
        rightId: rightId,
        isCorrect
      });
    }

    setConnections(newConnections);
    setSelectedLeft(null);

    // Check if all connections are made
    if (newConnections.length === questions.length) {
      const correctCount = newConnections.filter(conn => conn.isCorrect).length;
      setScore(correctCount);
      setIsCompleted(true);
      setIsTimerRunning(false);
    }
  };

  const resetGame = () => {
    initializeGame();
  };

  const generateRandomSet = () => {
    // สร้างโจทย์แบบสุ่ม
    const randomQuestions: MatchingPair[] = [];
    const usedValues = new Set<number>();
    
    for (let i = 1; i <= 8; i++) {
      let value;
      do {
        // สุ่มค่าระหว่าง 50-999 เซนติเมตร
        value = Math.floor(Math.random() * 950) + 50;
      } while (usedValues.has(value));
      
      usedValues.add(value);
      
      // แปลงเป็นเมตรและเซนติเมตร
      const meters = Math.floor(value / 100);
      const centimeters = value % 100;
      
      const leftText = meters > 0 
        ? (centimeters > 0 ? `${meters} เมตร ${centimeters} เซนติเมตร` : `${meters} เมตร`)
        : `${centimeters} เซนติเมตร`;
      
      const rightText = `${value} เซนติเมตร`;
      
      randomQuestions.push({
        id: i,
        left: leftText,
        right: rightText,
        leftValue: value,
        rightValue: value
      });
    }
    
    return randomQuestions;
  };

  const handleRandomSet = () => {
    const newQuestions = generateRandomSet();
    setQuestions(newQuestions);
    
    // Shuffle answers
    const answers = [...newQuestions];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    setShuffledAnswers(answers);
    
    setConnections([]);
    setSelectedLeft(null);
    setIsCompleted(false);
    setScore(0);
    setTimeElapsed(0);
    setIsTimerRunning(true);
  };

  const nextSet = () => {
    if (currentSet < questionSets.length - 1) {
      setCurrentSet(currentSet + 1);
    } else {
      setCurrentSet(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionForLeft = (leftId: number) => {
    return connections.find(conn => conn.leftId === leftId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 relative overflow-hidden">
      {/* Floating cartoon decorations - gentler animations */}
      <div className="absolute top-10 left-10 animate-pulse">
        <img src={giraffeMascot} alt="Giraffe" className="w-16 h-16 opacity-40" />
      </div>
      <div className="absolute top-20 right-20">
        <img src={elephantMascot} alt="Elephant" className="w-14 h-14 opacity-40" />
      </div>
      <div className="absolute bottom-20 left-20 animate-pulse">
        <img src={mouseMascot} alt="Mouse" className="w-12 h-12 opacity-40" />
      </div>
      
      {/* Floating stars - slower rotation */}
      <div className="absolute top-32 left-1/4 text-yellow-400">
        <Star className="w-6 h-6" fill="currentColor" />
      </div>
      <div className="absolute top-40 right-1/3 text-pink-400">
        <Star className="w-4 h-4" fill="currentColor" />
      </div>
      <div className="absolute bottom-32 right-1/4 text-blue-400">
        <Star className="w-5 h-5" fill="currentColor" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with mascot */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                🏠 {t('lengthComparison.backHome')}
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src={giraffeMascot} alt="Giraffe Mascot" className="w-12 h-12" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎯 {t('lengthComparison.title')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm bg-yellow-100 border-yellow-300">
              <Clock className="w-4 h-4 mr-1 text-yellow-600" />
              ⏰ {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="outline" className="text-sm border-blue-300 text-blue-700">
              📚 ชุดที่ {currentSet + 1}/{questionSets.length}
            </Badge>
          </div>
        </div>

        {/* Game Instructions with mascots */}
        <Card className="mb-6 border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <img src={elephantMascot} alt="Elephant" className="w-16 h-16" />
              <div className="text-center">
                <p className="text-lg font-semibold text-purple-700 mb-2">
                  🎯 {t('lengthComparison.howToPlay')}
                </p>
                <p className="text-purple-600">
                  {t('lengthComparison.instructions')} ✨
                </p>
              </div>
              <img src={mouseMascot} alt="Mouse" className="w-16 h-16" />
            </div>
          </CardContent>
        </Card>

        {/* Game Area */}
        <div className="relative" ref={containerRef}>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Left Side - Questions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <img src={giraffeMascot} alt="Giraffe" className="w-8 h-8" />
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  📝 {t('lengthComparison.questions')}
                </h2>
              </div>
              {questions.map((question, index) => {
                const connection = getConnectionForLeft(question.id);
                const isSelected = selectedLeft === question.id;
                const isConnected = connection !== undefined;
                
                return (
                  <div
                    key={question.id}
                    onClick={() => handleLeftClick(question.id)}
                    className={`
                      relative p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 min-h-[70px] sm:min-h-[80px]
                      ${isSelected ? 'border-blue-400 bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg' : 'border-pink-200 bg-gradient-to-r from-white to-pink-50 hover:border-pink-300 shadow-md'}
                      ${isConnected ? (connection.isCorrect ? 'border-green-400 bg-gradient-to-r from-green-100 to-green-50' : 'border-red-400 bg-gradient-to-r from-red-100 to-red-50') : ''}
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-lg">
                        {index + 1}
                      </div>
                      <span className="font-bold text-purple-800 text-sm sm:text-lg">{question.left}</span>
                      {isConnected && (
                        connection.isCorrect ? 
                        <div className="ml-auto flex items-center gap-1">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                          <span className="text-green-600 font-bold">✨</span>
                        </div> :
                        <div className="ml-auto flex items-center gap-1">
                          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                          <span className="text-red-600">❌</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Side - Answers */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <img src={elephantMascot} alt="Elephant" className="w-8 h-8" />
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  💡 {t('lengthComparison.answers')}
                </h2>
              </div>
              {shuffledAnswers.map((answer, index) => {
                const connection = connections.find(conn => conn.rightId === answer.id);
                const isConnected = connection !== undefined;
                
                return (
                  <div
                    key={answer.id}
                    onClick={() => handleRightClick(answer.id)}
                    className={`
                      relative p-3 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 min-h-[70px] sm:min-h-[80px] flex items-center
                      ${selectedLeft && !isConnected ? 'hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 shadow-lg' : ''}
                      ${isConnected ? (connection.isCorrect ? 'border-green-400 bg-gradient-to-r from-green-100 to-green-50' : 'border-red-400 bg-gradient-to-r from-red-100 to-red-50') : 'border-yellow-200 bg-gradient-to-r from-white to-yellow-50 shadow-md'}
                      ${selectedLeft === null || isConnected ? 'cursor-not-allowed opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-orange-800 text-sm sm:text-lg">{answer.right}</span>
                      {isConnected && (
                        connection.isCorrect ? 
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                          <span className="text-green-600 font-bold">🎉</span>
                        </div> :
                        <div className="flex items-center gap-1">
                          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                          <span className="text-red-600">😢</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results with celebration */}
        {isCompleted && (
          <Card className="mt-6 border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-3">
                <img src={giraffeMascot} alt="Celebrating Giraffe" className="w-12 h-12" />
                <div className="flex items-center gap-2">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    🎉 {t('lengthComparison.results')} 🎉
                  </span>
                </div>
                <img src={mouseMascot} alt="Celebrating Mouse" className="w-12 h-12" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-green-100 to-green-200 p-6 rounded-2xl border-2 border-green-300 shadow-lg">
                    <div className="text-3xl font-bold text-green-600">{score} ⭐</div>
                    <div className="text-sm font-semibold text-green-700">คะแนน</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-2xl border-2 border-blue-300 shadow-lg">
                    <div className="text-3xl font-bold text-blue-600">⏱️ {formatTime(timeElapsed)}</div>
                    <div className="text-sm font-semibold text-blue-700">เวลาที่ใช้</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl border-2 border-purple-200">
                  <p className="text-lg font-bold text-purple-700">
                    {score === questions.length ? '🌟 เก่งมาก! คุณตอบถูกทุกข้อ! 🌟' : 
                     score >= questions.length * 0.8 ? '👏 ดีมาก! พยายามต่อไป! 👏' : 
                     '💪 ไม่เป็นไร ลองใหม่นะ! 💪'}
                  </p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={resetGame} variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-bold">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    🔄 เล่นใหม่
                  </Button>
                  <Button onClick={nextSet} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold">
                    🚀 ชุดต่อไป
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls with mascots */}
        {!isCompleted && (
          <div className="flex justify-center gap-4 mt-8">
            <img src={elephantMascot} alt="Elephant" className="w-12 h-12" />
            <Button onClick={resetGame} variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-bold">
              <RotateCcw className="w-4 h-4 mr-2" />
              🔄 เริ่มใหม่
            </Button>
            <button
              onClick={handleRandomSet}
              className="px-6 py-3.5 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
              }}
            >
              <span className="text-2xl">✨</span>
              <span>AI สร้างโจทย์ใหม่</span>
            </button>
            <img src={mouseMascot} alt="Mouse" className="w-12 h-12" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LengthComparisonApp;