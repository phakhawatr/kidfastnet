import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle, Trophy, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface ShapeMatchingPair {
  id: number;
  shape: string;
  shapeName: string;
  shapeEmoji: string;
  shapeColor: string;
  name: string;
}

interface Connection {
  leftId: number;
  rightId: number;
  isCorrect: boolean;
}

const questionSets: ShapeMatchingPair[][] = [
  [
    { id: 1, shape: 'cone', shapeName: 'กรวย', shapeEmoji: '🍦', shapeColor: 'bg-pink-200', name: 'ทรงกรวย' },
    { id: 2, shape: 'sphere', shapeName: 'ทรงกลม', shapeEmoji: '⚽', shapeColor: 'bg-blue-200', name: 'ทรงกลม' },
    { id: 3, shape: 'prism', shapeName: 'ปริซึม', shapeEmoji: '📦', shapeColor: 'bg-green-200', name: 'ทรงปริซึม' },
    { id: 4, shape: 'pyramid', shapeName: 'ปิรามิด', shapeEmoji: '🔺', shapeColor: 'bg-orange-200', name: 'ทรงปิรามิด' },
    { id: 5, shape: 'cylinder', shapeName: 'กระบอก', shapeEmoji: '🥫', shapeColor: 'bg-yellow-200', name: 'ทรงกระบอก' },
    { id: 6, shape: 'cube', shapeName: 'ลูกบาศก์', shapeEmoji: '🎲', shapeColor: 'bg-purple-200', name: 'ทรงลูกบาศก์' }
  ],
  [
    { id: 1, shape: 'triangular_prism', shapeName: 'ปริซึมสามเหลี่ยม', shapeEmoji: '🔻', shapeColor: 'bg-red-200', name: 'ทรงปริซึมสามเหลี่ยม' },
    { id: 2, shape: 'rectangular_prism', shapeName: 'ปริซึมสี่เหลี่ยม', shapeEmoji: '📚', shapeColor: 'bg-indigo-200', name: 'ทรงปริซึมสี่เหลี่ยม' },
    { id: 3, shape: 'pentagonal_prism', shapeName: 'ปริซึมห้าเหลี่ยม', shapeEmoji: '🏠', shapeColor: 'bg-teal-200', name: 'ทรงปริซึมห้าเหลี่ยม' },
    { id: 4, shape: 'hexagonal_prism', shapeName: 'ปริซึมหกเหลี่ยม', shapeEmoji: '⬡', shapeColor: 'bg-rose-200', name: 'ทรงปริซึมหกเหลี่ยม' },
    { id: 5, shape: 'octahedron', shapeName: 'ออกตาฮีดรอน', shapeEmoji: '💎', shapeColor: 'bg-cyan-200', name: 'ทรงแปดหน้า' }
  ],
  [
    { id: 1, shape: 'tetrahedron', shapeName: 'เตตระฮีดรอน', shapeEmoji: '🔷', shapeColor: 'bg-emerald-200', name: 'ทรงสี่หน้า' },
    { id: 2, shape: 'dodecahedron', shapeName: 'โดเดคะฮีดรอน', shapeEmoji: '⚪', shapeColor: 'bg-amber-200', name: 'ทรงสิบสองหน้า' },
    { id: 3, shape: 'icosahedron', shapeName: 'ไอโคซะฮีดรอน', shapeEmoji: '🔘', shapeColor: 'bg-lime-200', name: 'ทรงยี่สิบหน้า' },
    { id: 4, shape: 'ellipsoid', shapeName: 'ทรงรี', shapeEmoji: '🥚', shapeColor: 'bg-violet-200', name: 'ทรงรี' },
    { id: 5, shape: 'torus', shapeName: 'โทรัส', shapeEmoji: '🍩', shapeColor: 'bg-fuchsia-200', name: 'ทรงโดนัท' }
  ]
];

const ShapeCard: React.FC<{
  shape: ShapeMatchingPair;
  isSelected: boolean;
  isConnected: boolean;
  isCorrect?: boolean;
  onClick: () => void;
  side: 'left' | 'right';
}> = ({ shape, isSelected, isConnected, isCorrect, onClick, side }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[80px] sm:min-h-[100px] flex items-center
        ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}
        ${isConnected ? (isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50') : ''}
      `}
    >
      <div className="flex items-center justify-center w-full">
        {side === 'left' && (
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg ${shape.shapeColor} flex items-center justify-center text-2xl sm:text-3xl mx-auto`}>
            {shape.shapeEmoji}
          </div>
        )}
        
        {side === 'right' && (
          <span className="font-medium text-gray-800 text-sm sm:text-base w-full">{shape.name}</span>
        )}
        
        {isConnected && (
          isCorrect ? 
          <CheckCircle className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" /> :
          <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

const ShapeMatchingApp: React.FC = () => {
  const { t } = useTranslation('exercises');
  const [currentSet, setCurrentSet] = useState(0);
  const [questions, setQuestions] = useState<ShapeMatchingPair[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<ShapeMatchingPair[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

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
      const isCorrect = leftItem.shape === rightItem.shape;
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
    const allShapes = [
      { shape: 'cone', shapeName: 'กรวย', shapeEmoji: '🍦', shapeColor: 'bg-pink-200', name: 'ทรงกรวย' },
      { shape: 'sphere', shapeName: 'ทรงกลม', shapeEmoji: '⚽', shapeColor: 'bg-blue-200', name: 'ทรงกลม' },
      { shape: 'prism', shapeName: 'ปริซึม', shapeEmoji: '📦', shapeColor: 'bg-green-200', name: 'ทรงปริซึม' },
      { shape: 'pyramid', shapeName: 'ปิรามิด', shapeEmoji: '🔺', shapeColor: 'bg-orange-200', name: 'ทรงปิรามิด' },
      { shape: 'cylinder', shapeName: 'กระบอก', shapeEmoji: '🥫', shapeColor: 'bg-yellow-200', name: 'ทรงกระบอก' },
      { shape: 'cube', shapeName: 'ลูกบาศก์', shapeEmoji: '🎲', shapeColor: 'bg-purple-200', name: 'ทรงลูกบาศก์' },
      { shape: 'triangular_prism', shapeName: 'ปริซึมสามเหลี่ยม', shapeEmoji: '🔻', shapeColor: 'bg-red-200', name: 'ทรงปริซึมสามเหลี่ยม' },
      { shape: 'ellipsoid', shapeName: 'ทรงรี', shapeEmoji: '🥚', shapeColor: 'bg-violet-200', name: 'ทรงรี' },
      { shape: 'torus', shapeName: 'โทรัส', shapeEmoji: '🍩', shapeColor: 'bg-fuchsia-200', name: 'ทรงโดนัท' }
    ];

    // Select 6 random shapes
    const shuffled = [...allShapes].sort(() => 0.5 - Math.random()).slice(0, 6);
    const randomQuestions = shuffled.map((shape, index) => ({
      ...shape,
      id: index + 1
    }));

    setQuestions(randomQuestions);
    
    // Shuffle answers
    const answers = [...randomQuestions];
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

  const isRightConnected = (rightId: number) => {
    return connections.find(conn => conn.rightId === rightId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">{t('shapes.title')}</h1>
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
              🎯 {t('shapes.instructions')}
            </p>
          </CardContent>
        </Card>

        {/* Game Area */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Left Side - Shapes */}
            <div className="space-y-2">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-4">{t('shapes.shapes')}</h2>
              {questions.map((question) => {
                const connection = getConnectionForLeft(question.id);
                const isSelected = selectedLeft === question.id;
                const isConnected = connection !== undefined;
                
                return (
                  <ShapeCard
                    key={question.id}
                    shape={question}
                    isSelected={isSelected}
                    isConnected={isConnected}
                    isCorrect={connection?.isCorrect}
                    onClick={() => handleLeftClick(question.id)}
                    side="left"
                  />
                );
              })}
            </div>

            {/* Right Side - Names */}
            <div className="space-y-2">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-4">{t('shapes.names')}</h2>
              {shuffledAnswers.map((answer) => {
                const connection = isRightConnected(answer.id);
                const isConnected = connection !== undefined;
                
                return (
                  <ShapeCard
                    key={answer.id}
                    shape={answer}
                    isSelected={false}
                    isConnected={isConnected}
                    isCorrect={connection?.isCorrect}
                    onClick={() => handleRightClick(answer.id)}
                    side="right"
                  />
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
                {t('shapes.results')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-gray-600">{t('shapes.score')}</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                    <div className="text-sm text-gray-600">{t('shapes.timeUsed')}</div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetGame} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('shapes.playAgain')}
                  </Button>
                  <Button onClick={nextSet}>
                    {t('shapes.nextSet')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        {!isCompleted && (
          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('shapes.restart')}
            </Button>
            <button
              onClick={generateRandomSet}
              className="px-6 py-3.5 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
              }}
            >
              <span className="text-2xl">✨</span>
              <span>{t('shapes.generateNew')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShapeMatchingApp;