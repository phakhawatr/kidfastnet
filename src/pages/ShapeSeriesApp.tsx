import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ShapeDisplay from '@/components/ShapeDisplay';

type ShapeType = 'circle' | 'square' | 'triangle' | 'ellipse';
type ColorType = 'red' | 'blue' | 'green' | 'orange' | 'yellow' | 'sky' | 'purple' | 'pink' | 'teal';

interface ShapeItem {
  type: ShapeType;
  color: ColorType;
}

interface Problem {
  sequence: ShapeItem[];
  answer: ShapeItem;
  choices: ShapeItem[];
  patternType: string;
}

const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'ellipse'];
const COLORS: ColorType[] = ['red', 'blue', 'green', 'orange', 'yellow', 'sky', 'purple', 'pink', 'teal'];

const ShapeSeriesApp = () => {
  const { t } = useTranslation('exercises');
  
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [problemCount, setProblemCount] = useState(5);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Generate random shape
  const getRandomShape = (): ShapeItem => {
    return {
      type: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  };

  // Check if two shapes are equal
  const shapesEqual = (a: ShapeItem, b: ShapeItem) => {
    return a.type === b.type && a.color === b.color;
  };

  // Generate pattern AB
  const generateABPattern = (): Problem => {
    const shapeA = getRandomShape();
    const shapeB = getRandomShape();
    const sequence = [shapeA, shapeB, shapeA, shapeB, shapeA];
    const answer = shapeB;
    
    const choices = [answer];
    while (choices.length < 4) {
      const newShape = getRandomShape();
      if (!choices.some(c => shapesEqual(c, newShape))) {
        choices.push(newShape);
      }
    }
    
    return {
      sequence,
      answer,
      choices: choices.sort(() => Math.random() - 0.5),
      patternType: 'AB'
    };
  };

  // Generate pattern ABC
  const generateABCPattern = (): Problem => {
    const shapeA = getRandomShape();
    const shapeB = getRandomShape();
    const shapeC = getRandomShape();
    const sequence = [shapeA, shapeB, shapeC, shapeA, shapeB];
    const answer = shapeC;
    
    const choices = [answer];
    while (choices.length < 4) {
      const newShape = getRandomShape();
      if (!choices.some(c => shapesEqual(c, newShape))) {
        choices.push(newShape);
      }
    }
    
    return {
      sequence,
      answer,
      choices: choices.sort(() => Math.random() - 0.5),
      patternType: 'ABC'
    };
  };

  // Generate pattern AABB
  const generateAABBPattern = (): Problem => {
    const shapeA = getRandomShape();
    const shapeB = getRandomShape();
    const sequence = [shapeA, shapeA, shapeB, shapeB, shapeA];
    const answer = shapeA;
    
    const choices = [answer];
    while (choices.length < 4) {
      const newShape = getRandomShape();
      if (!choices.some(c => shapesEqual(c, newShape))) {
        choices.push(newShape);
      }
    }
    
    return {
      sequence,
      answer,
      choices: choices.sort(() => Math.random() - 0.5),
      patternType: 'AABB'
    };
  };

  // Generate pattern ABBA
  const generateABBAPattern = (): Problem => {
    const shapeA = getRandomShape();
    const shapeB = getRandomShape();
    const sequence = [shapeA, shapeB, shapeB, shapeA, shapeA];
    const answer = shapeB;
    
    const choices = [answer];
    while (choices.length < 4) {
      const newShape = getRandomShape();
      if (!choices.some(c => shapesEqual(c, newShape))) {
        choices.push(newShape);
      }
    }
    
    return {
      sequence,
      answer,
      choices: choices.sort(() => Math.random() - 0.5),
      patternType: 'ABBA'
    };
  };

  // Generate problem based on difficulty
  const generateProblem = (): Problem => {
    if (difficulty === 'easy') {
      return generateABPattern();
    } else if (difficulty === 'medium') {
      const rand = Math.random();
      if (rand < 0.5) return generateABCPattern();
      return generateAABBPattern();
    } else {
      const rand = Math.random();
      if (rand < 0.33) return generateABCPattern();
      if (rand < 0.66) return generateAABBPattern();
      return generateABBAPattern();
    }
  };

  // Generate all problems
  const generateProblems = () => {
    const newProblems: Problem[] = [];
    for (let i = 0; i < problemCount; i++) {
      newProblems.push(generateProblem());
    }
    setProblems(newProblems);
    setSelectedAnswers(new Array(problemCount).fill(-1));
    setIsSubmitted(false);
    setShowAnswers(false);
    setCorrectCount(0);
    setTimer(0);
    setIsRunning(true);
  };

  // Handle answer selection
  const handleSelectAnswer = (problemIndex: number, choiceIndex: number) => {
    if (isSubmitted) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[problemIndex] = choiceIndex;
    setSelectedAnswers(newAnswers);
    
    if (soundEnabled) {
      const audio = new Audio('/sounds/click.mp3');
      audio.play().catch(() => {});
    }
  };

  // Check answers
  const handleCheckAnswers = () => {
    setIsRunning(false);
    setIsSubmitted(true);
    
    let correct = 0;
    problems.forEach((problem, index) => {
      if (selectedAnswers[index] >= 0) {
        const selectedShape = problem.choices[selectedAnswers[index]];
        if (shapesEqual(selectedShape, problem.answer)) {
          correct++;
        }
      }
    });
    
    setCorrectCount(correct);
    
    if (soundEnabled) {
      const audio = correct === problems.length 
        ? new Audio('/sounds/success.mp3') 
        : new Audio('/sounds/complete.mp3');
      audio.play().catch(() => {});
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize problems on mount and when settings change
  useEffect(() => {
    generateProblems();
  }, [problemCount, difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 text-foreground p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/profile">
            <Button variant="ghost" className="gap-2 text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
              {t('common.backToProfile')}
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:text-white hover:bg-white/10"
          >
            <Volume2 className={`w-5 h-5 ${!soundEnabled ? 'opacity-50' : ''}`} />
          </Button>
        </div>

        <Card className="bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-700 p-6">
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-2 mb-2">
            🔄 {t('shapeSeries.title')}
          </h1>
          <p className="text-slate-300 dark:text-slate-400">{t('shapeSeries.subtitle')}</p>
        </Card>
      </div>

      {/* Settings Panel */}
      <div className="max-w-6xl mx-auto mb-6">
        <Card className="bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-700 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-400 mb-2">
                {t('common.difficulty')}
              </label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                    className={difficulty === level 
                      ? 'bg-green-600 hover:bg-green-700 text-white font-medium border-green-600' 
                      : 'border-slate-400 bg-slate-700/80 text-white hover:bg-slate-600/80 hover:border-slate-300'}
                  >
                    {t(`common.${level}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Problem Count */}
            <div>
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-400 mb-2">
                {t('shapeSeries.problemCount')}
              </label>
              <div className="flex gap-2">
                {[5, 10, 15].map((count) => (
                  <Button
                    key={count}
                    variant={problemCount === count ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProblemCount(count)}
                    className={problemCount === count 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white font-medium border-blue-600' 
                      : 'border-slate-400 bg-slate-700/80 text-white hover:bg-slate-600/80 hover:border-slate-300'}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex flex-col items-end justify-center">
              <div className="text-sm text-slate-300 dark:text-slate-400 mb-1">{t('shapeSeries.timer')}</div>
              <div className="text-2xl font-bold text-white">{formatTime(timer)}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <Button
              onClick={generateProblems}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {t('common.aiGenerate')}
            </Button>
            
            {!isSubmitted && problems.length > 0 && (
              <Button
                onClick={() => setShowAnswers(!showAnswers)}
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
              >
                {showAnswers ? t('common.hideAnswers') : t('common.showAnswers')}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Problems */}
      <div className="max-w-6xl mx-auto space-y-6">
        {problems.map((problem, problemIndex) => {
          const selectedChoice = selectedAnswers[problemIndex];
          const isCorrect = isSubmitted && selectedChoice >= 0 && 
            shapesEqual(problem.choices[selectedChoice], problem.answer);
          const isWrong = isSubmitted && selectedChoice >= 0 && 
            !shapesEqual(problem.choices[selectedChoice], problem.answer);

          return (
            <Card
              key={problemIndex}
              className={`p-6 ${
                isCorrect
                  ? 'bg-green-900/50 border-green-600'
                  : isWrong
                  ? 'bg-red-900/50 border-red-600'
                  : 'bg-slate-800/90 border-slate-700'
              } backdrop-blur-sm`}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('common.question')} {problemIndex + 1}
                </h3>
                <p className="text-slate-300 dark:text-slate-400 mb-4">
                  {t('shapeSeries.whatComesNext')}
                </p>
              </div>

              {/* Sequence */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                {problem.sequence.map((shape, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ShapeDisplay shape={`${shape.type}-${shape.color}`} size={64} />
                    {i < problem.sequence.length - 1 && (
                      <span className="text-2xl text-slate-400">→</span>
                    )}
                  </div>
                ))}
                <span className="text-3xl font-bold text-yellow-400">?</span>
              </div>

              {/* Choices */}
              <div>
                <p className="text-sm font-medium text-slate-300 dark:text-slate-400 mb-3">
                  {t('shapeSeries.selectAnswer')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {problem.choices.map((choice, choiceIndex) => {
                    const isSelected = selectedAnswers[problemIndex] === choiceIndex;
                    const showAsCorrect = (isSubmitted || showAnswers) && shapesEqual(choice, problem.answer);
                    
                    return (
                      <button
                        key={choiceIndex}
                        onClick={() => handleSelectAnswer(problemIndex, choiceIndex)}
                        disabled={isSubmitted || showAnswers}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          showAsCorrect
                            ? 'border-green-500 bg-green-900/50'
                            : isSelected && isSubmitted
                            ? 'border-red-500 bg-red-900/50'
                            : isSelected
                            ? 'border-blue-500 bg-blue-900/50'
                            : 'border-slate-400 hover:border-white bg-slate-700/80 hover:bg-slate-600/80'
                        } ${(isSubmitted || showAnswers) ? 'cursor-default' : 'cursor-pointer hover:scale-105'}`}
                      >
                        <div className="flex justify-center items-center">
                          <ShapeDisplay shape={`${choice.type}-${choice.color}`} size={64} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {isSubmitted && (
                <div className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                  <p className={`font-medium ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                    {isCorrect ? t('common.correct') : t('common.tryAgain')}
                  </p>
                </div>
              )}
              
              {showAnswers && !isSubmitted && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-900/50 border border-yellow-500">
                  <p className="font-medium text-yellow-300">
                    💡 {t('common.answersShown')}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
        
        {/* Check Answers Button - After all problems */}
        {!isSubmitted && problems.length > 0 && !showAnswers && (
          <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700 p-6">
            <Button
              onClick={handleCheckAnswers}
              disabled={selectedAnswers.every(a => a === -1)}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              size="lg"
            >
              ✓ {t('common.checkAnswers')}
            </Button>
          </Card>
        )}
      </div>

      {/* Results */}
      {isSubmitted && (
        <div className="max-w-6xl mx-auto mt-6">
          <Card className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm border-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{t('results.completed')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{correctCount}/{problems.length}</div>
                <div className="text-slate-300">{t('results.correctAnswers')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{Math.round((correctCount / problems.length) * 100)}%</div>
                <div className="text-slate-300">{t('results.accuracy')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{formatTime(timer)}</div>
                <div className="text-slate-300">{t('results.timeUsed')}</div>
              </div>
            </div>
            <Button
              onClick={generateProblems}
              className="mt-6 w-full bg-white text-purple-900 hover:bg-slate-100"
            >
              {t('results.playAgain')}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ShapeSeriesApp;
