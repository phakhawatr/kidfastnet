import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับ
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">จับคู่ความยาว</h1>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="outline" className="text-sm">
              ชุดที่ {currentSet + 1}/{questionSets.length}
            </Badge>
          </div>
        </div>

        {/* Game Instructions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-center text-gray-600">
              🎯 คลิกที่โจทย์ด้านซ้าย แล้วคลิกที่คำตอบด้านขวาที่มีความยาวเท่ากัน
            </p>
          </CardContent>
        </Card>

        {/* Game Area */}
        <div className="relative" ref={containerRef}>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Left Side - Questions */}
            <div className="space-y-2">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-4">โจทย์</h2>
              {questions.map((question, index) => {
                const connection = getConnectionForLeft(question.id);
                const isSelected = selectedLeft === question.id;
                const isConnected = connection !== undefined;
                
                return (
                  <div
                    key={question.id}
                    onClick={() => handleLeftClick(question.id)}
                    className={`
                      relative p-2 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[60px] sm:min-h-[72px]
                      ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}
                      ${isConnected ? (connection.isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : ''}
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs sm:text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800 text-xs sm:text-base">{question.left}</span>
                      {isConnected && (
                        connection.isCorrect ? 
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-auto" /> :
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Side - Answers */}
            <div className="space-y-2">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-4">คำตอบ</h2>
              {shuffledAnswers.map((answer, index) => {
                const connection = connections.find(conn => conn.rightId === answer.id);
                const isConnected = connection !== undefined;
                
                return (
                  <div
                    key={answer.id}
                    onClick={() => handleRightClick(answer.id)}
                    className={`
                      relative p-2 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[60px] sm:min-h-[72px] flex items-center
                      ${selectedLeft && !isConnected ? 'hover:border-blue-300 hover:bg-blue-50' : ''}
                      ${isConnected ? (connection.isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : 'border-gray-200 bg-white'}
                      ${selectedLeft === null || isConnected ? 'cursor-not-allowed opacity-75' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-gray-800 text-xs sm:text-base">{answer.right}</span>
                      {isConnected && (
                        connection.isCorrect ? 
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> :
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results */}
        {isCompleted && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                ผลลัพธ์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-gray-600">คะแนน</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                    <div className="text-sm text-gray-600">เวลาที่ใช้</div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetGame} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    เล่นใหม่
                  </Button>
                  <Button onClick={nextSet}>
                    ชุดต่อไป
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {!isCompleted && (
          <div className="flex justify-center mt-6">
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              เริ่มใหม่
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LengthComparisonApp;