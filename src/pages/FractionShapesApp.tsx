import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

// Shape Types
type ShapeType = 'circle' | 'triangle' | 'pentagon' | 'heptagon' | 'flower' | 'star' | 'plus' | 'cube';

interface Problem {
  id: number;
  shapeType: ShapeType;
  totalParts: number;
  filledParts: number;
  color: string;
  correctNumerator: number;
  correctDenominator: number;
}

interface UserAnswer {
  numerator: string;
  denominator: string;
}

// SVG Shape Components
const CircleFraction: React.FC<{ totalParts: number; filledParts: number; color: string }> = ({
  totalParts,
  filledParts,
  color
}) => {
  const anglePerPart = 360 / totalParts;
  const parts = [];

  for (let i = 0; i < totalParts; i++) {
    const startAngle = i * anglePerPart - 90;
    const endAngle = (i + 1) * anglePerPart - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const isFilled = i < filledParts;
    const fillColor = isFilled ? color : '#e5e7eb';

    parts.push(
      <path
        key={i}
        d={`M 100 100 L ${x1} ${y1} A 80 80 0 0 1 ${x2} ${y2} Z`}
        fill={fillColor}
        stroke="#374151"
        strokeWidth="2"
      />
    );
  }

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {parts}
    </svg>
  );
};

const TriangleFraction: React.FC<{ totalParts: number; filledParts: number; color: string }> = ({
  totalParts,
  filledParts,
  color
}) => {
  if (totalParts === 3) {
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <polygon points="100,30 30,170 170,170" fill="none" stroke="#374151" strokeWidth="2" />
        <line x1="100" y1="30" x2="100" y2="170" stroke="#374151" strokeWidth="2" />
        <line x1="100" y1="30" x2="30" y2="170" stroke="#374151" strokeWidth="2" />
        <line x1="100" y1="30" x2="170" y2="170" stroke="#374151" strokeWidth="2" />
        <polygon points="100,30 30,170 100,170" fill={filledParts >= 1 ? color : '#e5e7eb'} stroke="#374151" strokeWidth="2" />
        <polygon points="100,30 100,170 170,170" fill={filledParts >= 2 ? color : '#e5e7eb'} stroke="#374151" strokeWidth="2" />
        <polygon points="30,170 170,170 100,30" fill={filledParts >= 3 ? color : '#e5e7eb'} opacity="0" />
      </svg>
    );
  } else if (totalParts === 4) {
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <polygon points="100,30 30,170 170,170" fill="none" stroke="#374151" strokeWidth="2" />
        <line x1="100" y1="30" x2="100" y2="170" stroke="#374151" strokeWidth="2" />
        <line x1="30" y1="170" x2="170" y2="170" stroke="#374151" strokeWidth="2" />
        <polygon points="100,30 65,100 100,170" fill={filledParts >= 1 ? color : '#e5e7eb'} stroke="#374151" strokeWidth="2" />
        <polygon points="100,30 135,100 100,170" fill={filledParts >= 2 ? color : '#e5e7eb'} stroke="#374151" strokeWidth="2" />
        <polygon points="30,170 65,100 100,170" fill={filledParts >= 3 ? color : '#e5e7eb'} stroke="#374151" strokeWidth="2" />
        <polygon points="170,170 135,100 100,170" fill={filledParts >= 4 ? color : '#e5e7eb'} stroke="#374151" strokeWidth="2" />
      </svg>
    );
  } else {
    // 9 parts
    const parts = [];
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const isFilled = i < filledParts;
      parts.push(
        <polygon
          key={i}
          points={`${40 + col * 40},${50 + row * 40} ${60 + col * 40},${50 + row * 40} ${50 + col * 40},${70 + row * 40}`}
          fill={isFilled ? color : '#e5e7eb'}
          stroke="#374151"
          strokeWidth="2"
        />
      );
    }
    return (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <polygon points="100,30 30,170 170,170" fill="none" stroke="#374151" strokeWidth="3" />
        {parts}
      </svg>
    );
  }
};

const PentagonFraction: React.FC<{ totalParts: number; filledParts: number; color: string }> = ({
  totalParts,
  filledParts,
  color
}) => {
  const anglePerPart = 360 / totalParts;
  const parts = [];
  const cx = 100;
  const cy = 100;
  const r = 70;

  for (let i = 0; i < totalParts; i++) {
    const startAngle = i * anglePerPart - 90;
    const endAngle = (i + 1) * anglePerPart - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const isFilled = i < filledParts;
    parts.push(
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
        fill={isFilled ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
    );
  }

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {parts}
    </svg>
  );
};

const HeptagonFraction: React.FC<{ totalParts: number; filledParts: number; color: string }> = ({
  totalParts,
  filledParts,
  color
}) => {
  const anglePerPart = 360 / totalParts;
  const parts = [];
  const cx = 100;
  const cy = 100;
  const r = 70;

  for (let i = 0; i < totalParts; i++) {
    const startAngle = i * anglePerPart - 90;
    const endAngle = (i + 1) * anglePerPart - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const isFilled = i < filledParts;
    parts.push(
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
        fill={isFilled ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
    );
  }

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {parts}
    </svg>
  );
};

const FlowerFraction: React.FC<{ totalParts: number; filledParts: number; color: string }> = ({
  totalParts,
  filledParts,
  color
}) => {
  const petals = [];
  const anglePerPetal = 360 / totalParts;
  const cx = 100;
  const cy = 100;

  for (let i = 0; i < totalParts; i++) {
    const angle = (i * anglePerPetal - 90) * (Math.PI / 180);
    const x = cx + 40 * Math.cos(angle);
    const y = cy + 40 * Math.sin(angle);
    const isFilled = i < filledParts;

    petals.push(
      <ellipse
        key={i}
        cx={x}
        cy={y}
        rx="20"
        ry="35"
        fill={isFilled ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
        transform={`rotate(${i * anglePerPetal} ${x} ${y})`}
      />
    );
  }

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {petals}
      <circle cx={cx} cy={cy} r="15" fill="#fbbf24" stroke="#374151" strokeWidth="2" />
    </svg>
  );
};

const StarFraction: React.FC<{ totalParts: number; filledParts: number; color: string }> = ({
  totalParts,
  filledParts,
  color
}) => {
  const points = totalParts;
  const cx = 100;
  const cy = 100;
  const outerR = 70;
  const innerR = 30;
  const anglePerPoint = 360 / points;

  const starParts = [];
  for (let i = 0; i < points; i++) {
    const angle1 = (i * anglePerPoint - 90) * (Math.PI / 180);
    const angle2 = ((i + 0.5) * anglePerPoint - 90) * (Math.PI / 180);
    const angle3 = ((i + 1) * anglePerPoint - 90) * (Math.PI / 180);

    const x1 = cx + outerR * Math.cos(angle1);
    const y1 = cy + outerR * Math.sin(angle1);
    const x2 = cx + innerR * Math.cos(angle2);
    const y2 = cy + innerR * Math.sin(angle2);
    const x3 = cx + outerR * Math.cos(angle3);
    const y3 = cy + outerR * Math.sin(angle3);

    const isFilled = i < filledParts;
    starParts.push(
      <polygon
        key={i}
        points={`${cx},${cy} ${x1},${y1} ${x2},${y2} ${x3},${y3}`}
        fill={isFilled ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
    );
  }

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {starParts}
    </svg>
  );
};

const PlusFraction: React.FC<{ totalParts: number; filledParts: number; color: string }> = ({
  filledParts,
  color
}) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Center */}
      <rect
        x="75"
        y="75"
        width="50"
        height="50"
        fill={filledParts >= 1 ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
      {/* Top */}
      <rect
        x="75"
        y="25"
        width="50"
        height="50"
        fill={filledParts >= 2 ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
      {/* Right */}
      <rect
        x="125"
        y="75"
        width="50"
        height="50"
        fill={filledParts >= 3 ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
      {/* Bottom */}
      <rect
        x="75"
        y="125"
        width="50"
        height="50"
        fill={filledParts >= 4 ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
      {/* Left */}
      <rect
        x="25"
        y="75"
        width="50"
        height="50"
        fill={filledParts >= 5 ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
    </svg>
  );
};

const CubeFraction: React.FC<{ totalParts: number; filledParts: number; color: string }> = ({
  filledParts,
  color
}) => {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Top face */}
      <polygon
        points="100,50 150,75 100,100 50,75"
        fill={filledParts >= 1 ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
      {/* Left face */}
      <polygon
        points="50,75 50,150 100,175 100,100"
        fill={filledParts >= 2 ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
      {/* Right face */}
      <polygon
        points="100,100 100,175 150,150 150,75"
        fill={filledParts >= 3 ? color : '#e5e7eb'}
        stroke="#374151"
        strokeWidth="2"
      />
    </svg>
  );
};

// Main Shape Renderer Component
const ShapeRenderer: React.FC<{ problem: Problem }> = ({ problem }) => {
  const { shapeType, totalParts, filledParts, color } = problem;

  const shapeMap = {
    circle: CircleFraction,
    triangle: TriangleFraction,
    pentagon: PentagonFraction,
    heptagon: HeptagonFraction,
    flower: FlowerFraction,
    star: StarFraction,
    plus: PlusFraction,
    cube: CubeFraction,
  };

  const ShapeComponent = shapeMap[shapeType];

  return (
    <div className="w-48 h-48 mx-auto">
      <ShapeComponent totalParts={totalParts} filledParts={filledParts} color={color} />
    </div>
  );
};

// Fraction Input Component
const FractionInput: React.FC<{
  value: UserAnswer;
  onChange: (answer: UserAnswer) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  correctAnswer: { numerator: number; denominator: number };
  showAnswer: boolean;
}> = ({ value, onChange, isSubmitted, isCorrect, correctAnswer, showAnswer }) => {
  const { t } = useTranslation('exercises');

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <Label className="text-sm text-slate-300 mb-1">{t('fractionShapes.numerator')}</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={value.numerator}
            onChange={(e) => onChange({ ...value, numerator: e.target.value })}
            disabled={isSubmitted || showAnswer}
            className={`w-20 text-center text-lg font-semibold ${
              isSubmitted
                ? isCorrect
                  ? 'bg-green-900/50 border-green-500 text-green-300'
                  : 'bg-red-900/50 border-red-500 text-red-300'
                : showAnswer
                ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300'
                : 'bg-slate-700 border-slate-500 text-white'
            }`}
          />
        </div>
        <div className="text-3xl font-bold text-slate-300 pb-6">⁄</div>
        <div className="flex flex-col items-center">
          <Label className="text-sm text-slate-300 mb-1">{t('fractionShapes.denominator')}</Label>
          <Input
            type="text"
            inputMode="numeric"
            value={value.denominator}
            onChange={(e) => onChange({ ...value, denominator: e.target.value })}
            disabled={isSubmitted || showAnswer}
            className={`w-20 text-center text-lg font-semibold ${
              isSubmitted
                ? isCorrect
                  ? 'bg-green-900/50 border-green-500 text-green-300'
                  : 'bg-red-900/50 border-red-500 text-red-300'
                : showAnswer
                ? 'bg-yellow-900/50 border-yellow-500 text-yellow-300'
                : 'bg-slate-700 border-slate-500 text-white'
            }`}
          />
        </div>
      </div>

      {isSubmitted && !isCorrect && (
        <div className="text-sm text-red-300">
          {t('common.correct')}: {correctAnswer.numerator}/{correctAnswer.denominator}
        </div>
      )}

      {showAnswer && !isSubmitted && (
        <div className="text-sm text-yellow-300">
          {t('common.correct')}: {correctAnswer.numerator}/{correctAnswer.denominator}
        </div>
      )}
    </div>
  );
};

// Main App Component
const FractionShapesApp: React.FC = () => {
  const { t } = useTranslation('exercises');

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [problemCount, setProblemCount] = useState<5 | 10 | 15>(5);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isSubmitted) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isSubmitted]);

  // Generate problems based on difficulty
  const generateProblems = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const newProblems: Problem[] = [];

    const getDifficultyConfig = () => {
      switch (difficulty) {
        case 'easy':
          return {
            shapes: ['circle', 'triangle'] as ShapeType[],
            maxParts: 4,
          };
        case 'medium':
          return {
            shapes: ['circle', 'pentagon', 'flower', 'star'] as ShapeType[],
            maxParts: 7,
          };
        case 'hard':
          return {
            shapes: ['circle', 'pentagon', 'heptagon', 'flower', 'star', 'plus', 'cube'] as ShapeType[],
            maxParts: 10,
          };
      }
    };

    const config = getDifficultyConfig();

    for (let i = 0; i < problemCount; i++) {
      const shapeType = config.shapes[Math.floor(Math.random() * config.shapes.length)];
      let totalParts: number;

      // Determine valid parts for each shape
      if (shapeType === 'circle') {
        totalParts = Math.min(2 + Math.floor(Math.random() * (config.maxParts - 1)), 10);
      } else if (shapeType === 'triangle') {
        totalParts = [3, 4, 9][Math.floor(Math.random() * 3)];
      } else if (shapeType === 'pentagon') {
        totalParts = Math.random() < 0.5 ? 5 : 10;
      } else if (shapeType === 'heptagon') {
        totalParts = 7;
      } else if (shapeType === 'flower') {
        totalParts = Math.random() < 0.5 ? 6 : 8;
      } else if (shapeType === 'star') {
        totalParts = Math.random() < 0.5 ? 5 : 6;
      } else if (shapeType === 'plus') {
        totalParts = 5;
      } else {
        // cube
        totalParts = 3;
      }

      const filledParts = Math.floor(Math.random() * totalParts) + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];

      newProblems.push({
        id: i + 1,
        shapeType,
        totalParts,
        filledParts,
        color,
        correctNumerator: filledParts,
        correctDenominator: totalParts,
      });
    }

    setProblems(newProblems);
    setUserAnswers(new Array(problemCount).fill({ numerator: '', denominator: '' }));
    setIsSubmitted(false);
    setShowAnswers(false);
    setCorrectCount(0);
    setTimer(0);
    setIsRunning(true);
  };

  // Check answers
  const handleCheckAnswers = () => {
    let correct = 0;
    for (let i = 0; i < problems.length; i++) {
      const userAns = userAnswers[i];
      const problem = problems[i];
      if (
        parseInt(userAns.numerator) === problem.correctNumerator &&
        parseInt(userAns.denominator) === problem.correctDenominator
      ) {
        correct++;
      }
    }
    setCorrectCount(correct);
    setIsSubmitted(true);
    setIsRunning(false);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update answer
  const updateAnswer = (index: number, answer: UserAnswer) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = answer;
    setUserAnswers(newAnswers);
  };

  // Check if answer is correct
  const isAnswerCorrect = (index: number): boolean | null => {
    if (!isSubmitted) return null;
    const userAns = userAnswers[index];
    const problem = problems[index];
    return (
      parseInt(userAns.numerator) === problem.correctNumerator &&
      parseInt(userAns.denominator) === problem.correctDenominator
    );
  };

  // Generate on mount
  useEffect(() => {
    generateProblems();
  }, [problemCount, difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/profile">
            <Button
              variant="outline"
              className="border-slate-400 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.backToProfile')}
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t('fractionShapes.title')}
            </h1>
            <p className="text-slate-300">{t('fractionShapes.instruction')}</p>
          </div>
          <div className="text-xl font-mono text-white bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-600">
            ⏱️ {formatTime(timer)}
          </div>
        </div>

        {/* Settings Panel */}
        <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Difficulty */}
            <div>
              <Label className="text-slate-200 font-semibold mb-2 block">
                {t('common.difficulty')}
              </Label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <Button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    variant={difficulty === level ? 'default' : 'outline'}
                    className={
                      difficulty === level
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                  >
                    {t(`common.${level}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Problem Count */}
            <div>
              <Label className="text-slate-200 font-semibold mb-2 block">
                {t('settings.problemCount')}
              </Label>
              <div className="flex gap-2">
                {[5, 10, 15].map((count) => (
                  <Button
                    key={count}
                    onClick={() => setProblemCount(count as 5 | 10 | 15)}
                    variant={problemCount === count ? 'default' : 'outline'}
                    className={
                      problemCount === count
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <Label className="text-slate-200 font-semibold mb-2 block">{t('common.settings')}</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={generateProblems}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('settings.startNew')}
                </Button>

                {!isSubmitted && problems.length > 0 && (
                  <Button
                    onClick={() => setShowAnswers(!showAnswers)}
                    variant="outline"
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                  >
                    {showAnswers ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showAnswers ? t('common.hideAnswers') : t('common.showAnswers')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Problems */}
        <div className="space-y-6 mb-6">
          {problems.map((problem, index) => (
            <Card key={problem.id} className="bg-slate-800/90 backdrop-blur-sm border-slate-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Shape Display */}
                <div className="flex flex-col items-center">
                  <div className="text-lg font-semibold text-slate-200 mb-4">
                    {t('common.question')} {problem.id}
                  </div>
                  <ShapeRenderer problem={problem} />
                </div>

                {/* Answer Input */}
                <div className="flex flex-col items-center justify-center">
                  <p className="text-slate-300 mb-4 text-center">{t('fractionShapes.instruction')}</p>
                  <FractionInput
                    value={userAnswers[index]}
                    onChange={(answer) => updateAnswer(index, answer)}
                    isSubmitted={isSubmitted}
                    isCorrect={isAnswerCorrect(index)}
                    correctAnswer={{
                      numerator: problem.correctNumerator,
                      denominator: problem.correctDenominator,
                    }}
                    showAnswer={showAnswers}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Check Answers Button */}
        {!isSubmitted && problems.length > 0 && !showAnswers && (
          <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700 p-6">
            <Button
              onClick={handleCheckAnswers}
              disabled={userAnswers.some((ans) => ans.numerator === '' || ans.denominator === '')}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              {t('common.checkAnswers')}
            </Button>
          </Card>
        )}

        {/* Results */}
        {isSubmitted && (
          <Card className="bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-sm border-purple-500 p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">{t('results.completed')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-800/80 p-6 rounded-lg border border-slate-600">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {correctCount}/{problems.length}
                  </div>
                  <div className="text-slate-300">{t('results.correctAnswers')}</div>
                </div>
                <div className="bg-slate-800/80 p-6 rounded-lg border border-slate-600">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{formatTime(timer)}</div>
                  <div className="text-slate-300">{t('results.timeUsed')}</div>
                </div>
                <div className="bg-slate-800/80 p-6 rounded-lg border border-slate-600">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    {Math.round((correctCount / problems.length) * 100)}%
                  </div>
                  <div className="text-slate-300">{t('results.accuracy')}</div>
                </div>
              </div>
              <Button
                onClick={generateProblems}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {t('results.playAgain')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FractionShapesApp;
