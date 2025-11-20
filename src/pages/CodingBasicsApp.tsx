import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, Code, RefreshCw, Trophy, Star, CheckCircle2, XCircle, Lightbulb, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type GameMode = 'menu' | 'sequencing' | 'patterns' | 'loops' | 'conditionals' | 'results';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Challenge {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number[];
  explanation: string;
  hint: string;
}

const CodingBasicsApp = () => {
  const { t } = useTranslation('codingbasics');
  const navigate = useNavigate();

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && gameMode !== 'menu' && gameMode !== 'results') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameMode]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate Sequencing Challenges
  const generateSequencingChallenges = (): Challenge[] => {
    const allChallenges = [
      {
        id: 'seq-1',
        question: t('challenges.sequencing.wake_up'),
        options: [
          t('challenges.sequencing.options.brush_teeth'),
          t('challenges.sequencing.options.wake_up'),
          t('challenges.sequencing.options.eat_breakfast'),
          t('challenges.sequencing.options.go_to_school')
        ],
        correctAnswer: [1, 0, 2, 3],
        explanation: t('challenges.sequencing.explanation_wake_up'),
        hint: t('challenges.sequencing.hint_morning')
      },
      {
        id: 'seq-2',
        question: t('challenges.sequencing.plant_tree'),
        options: [
          t('challenges.sequencing.options.water'),
          t('challenges.sequencing.options.dig_hole'),
          t('challenges.sequencing.options.put_seed'),
          t('challenges.sequencing.options.cover_soil')
        ],
        correctAnswer: [1, 2, 3, 0],
        explanation: t('challenges.sequencing.explanation_plant'),
        hint: t('challenges.sequencing.hint_plant')
      },
      {
        id: 'seq-3',
        question: t('challenges.sequencing.make_sandwich'),
        options: [
          t('challenges.sequencing.options.put_filling'),
          t('challenges.sequencing.options.get_bread'),
          t('challenges.sequencing.options.close_sandwich'),
          t('challenges.sequencing.options.spread_butter')
        ],
        correctAnswer: [1, 3, 0, 2],
        explanation: t('challenges.sequencing.explanation_sandwich'),
        hint: t('challenges.sequencing.hint_sandwich')
      }
    ];

    return difficulty === 'easy' 
      ? allChallenges.slice(0, 2)
      : difficulty === 'medium'
      ? allChallenges
      : allChallenges;
  };

  // Generate Pattern Challenges
  const generatePatternChallenges = (): Challenge[] => {
    const allChallenges = [
      {
        id: 'pat-1',
        question: t('challenges.patterns.number_pattern') + ': 2, 4, 6, 8, ?',
        options: ['9', '10', '11', '12'],
        correctAnswer: [1],
        explanation: t('challenges.patterns.explanation_even'),
        hint: t('challenges.patterns.hint_add_two')
      },
      {
        id: 'pat-2',
        question: t('challenges.patterns.shape_pattern') + ': ⭐🔵⭐🔵⭐?',
        options: ['⭐', '🔵', '🔴', '⚫'],
        correctAnswer: [1],
        explanation: t('challenges.patterns.explanation_alternate'),
        hint: t('challenges.patterns.hint_repeat')
      },
      {
        id: 'pat-3',
        question: t('challenges.patterns.color_pattern') + ': 🔴🔴🔵🔴🔴🔵🔴🔴?',
        options: ['🔴', '🔵', '🟡', '🟢'],
        correctAnswer: [1],
        explanation: t('challenges.patterns.explanation_two_one'),
        hint: t('challenges.patterns.hint_group')
      }
    ];

    return difficulty === 'easy' 
      ? allChallenges.slice(0, 2)
      : difficulty === 'medium'
      ? allChallenges
      : allChallenges;
  };

  // Generate Loop Challenges
  const generateLoopChallenges = (): Challenge[] => {
    const allChallenges = [
      {
        id: 'loop-1',
        question: t('challenges.loops.jump_5_times'),
        options: [
          t('challenges.loops.options.jump_once'),
          t('challenges.loops.options.repeat_5'),
          t('challenges.loops.options.jump_twice'),
          t('challenges.loops.options.stop')
        ],
        correctAnswer: [1],
        explanation: t('challenges.loops.explanation_repeat'),
        hint: t('challenges.loops.hint_loop')
      },
      {
        id: 'loop-2',
        question: t('challenges.loops.draw_3_stars'),
        options: [
          t('challenges.loops.options.draw_star'),
          t('challenges.loops.options.repeat_3'),
          t('challenges.loops.options.draw_circle'),
          t('challenges.loops.options.color_red')
        ],
        correctAnswer: [1],
        explanation: t('challenges.loops.explanation_three_times'),
        hint: t('challenges.loops.hint_same_action')
      },
      {
        id: 'loop-3',
        question: t('challenges.loops.count_to_10'),
        options: [
          t('challenges.loops.options.say_numbers'),
          t('challenges.loops.options.repeat_10'),
          t('challenges.loops.options.add_one'),
          t('challenges.loops.options.start_at_1')
        ],
        correctAnswer: [1],
        explanation: t('challenges.loops.explanation_count'),
        hint: t('challenges.loops.hint_increment')
      }
    ];

    return difficulty === 'easy' 
      ? allChallenges.slice(0, 2)
      : difficulty === 'medium'
      ? allChallenges
      : allChallenges;
  };

  // Generate Conditional Challenges
  const generateConditionalChallenges = (): Challenge[] => {
    const allChallenges = [
      {
        id: 'cond-1',
        question: t('challenges.conditionals.if_raining'),
        options: [
          t('challenges.conditionals.options.take_umbrella'),
          t('challenges.conditionals.options.wear_sunglasses'),
          t('challenges.conditionals.options.go_swimming'),
          t('challenges.conditionals.options.play_outside')
        ],
        correctAnswer: [0],
        explanation: t('challenges.conditionals.explanation_umbrella'),
        hint: t('challenges.conditionals.hint_weather')
      },
      {
        id: 'cond-2',
        question: t('challenges.conditionals.if_hungry'),
        options: [
          t('challenges.conditionals.options.sleep'),
          t('challenges.conditionals.options.eat_food'),
          t('challenges.conditionals.options.play_game'),
          t('challenges.conditionals.options.read_book')
        ],
        correctAnswer: [1],
        explanation: t('challenges.conditionals.explanation_eat'),
        hint: t('challenges.conditionals.hint_feeling')
      },
      {
        id: 'cond-3',
        question: t('challenges.conditionals.if_red_light'),
        options: [
          t('challenges.conditionals.options.stop'),
          t('challenges.conditionals.options.go_fast'),
          t('challenges.conditionals.options.turn_left'),
          t('challenges.conditionals.options.honk')
        ],
        correctAnswer: [0],
        explanation: t('challenges.conditionals.explanation_traffic'),
        hint: t('challenges.conditionals.hint_safety')
      }
    ];

    return difficulty === 'easy' 
      ? allChallenges.slice(0, 2)
      : difficulty === 'medium'
      ? allChallenges
      : allChallenges;
  };

  const startGame = (mode: 'sequencing' | 'patterns' | 'loops' | 'conditionals') => {
    let newChallenges: Challenge[] = [];
    
    switch (mode) {
      case 'sequencing':
        newChallenges = generateSequencingChallenges();
        break;
      case 'patterns':
        newChallenges = generatePatternChallenges();
        break;
      case 'loops':
        newChallenges = generateLoopChallenges();
        break;
      case 'conditionals':
        newChallenges = generateConditionalChallenges();
        break;
    }

    setChallenges(newChallenges);
    setGameMode(mode);
    setCurrentChallenge(0);
    setScore(0);
    setAttempts(0);
    setTimeElapsed(0);
    setSelectedAnswer([]);
    setShowExplanation(false);
    setShowHint(false);
    setIsRunning(true);
  };

  const handleAnswerSelect = (index: number) => {
    if (gameMode === 'sequencing') {
      // For sequencing, allow multiple selections in order
      if (!selectedAnswer.includes(index)) {
        setSelectedAnswer([...selectedAnswer, index]);
      }
    } else {
      // For other modes, single selection
      setSelectedAnswer([index]);
    }
  };

  const checkAnswer = () => {
    const challenge = challenges[currentChallenge];
    const isCorrect = JSON.stringify(selectedAnswer) === JSON.stringify(challenge.correctAnswer);

    if (isCorrect) {
      setScore(score + 1);
      toast.success(t('feedback.correct'));
    } else {
      toast.error(t('feedback.incorrect'));
    }

    setAttempts(attempts + 1);
    setShowExplanation(true);
  };

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setSelectedAnswer([]);
      setShowExplanation(false);
      setShowHint(false);
    } else {
      setIsRunning(false);
      setGameMode('results');
    }
  };

  const resetSequence = () => {
    setSelectedAnswer([]);
  };

  const calculateStars = (): number => {
    const percentage = (score / challenges.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const renderMenu = () => {
    const categories = [
      {
        id: 'sequencing',
        icon: '🔢',
        color: 'from-blue-500 to-cyan-600',
        title: t('categories.sequencing.title'),
        description: t('categories.sequencing.description')
      },
      {
        id: 'patterns',
        icon: '🔄',
        color: 'from-purple-500 to-pink-600',
        title: t('categories.patterns.title'),
        description: t('categories.patterns.description')
      },
      {
        id: 'loops',
        icon: '🔁',
        color: 'from-green-500 to-emerald-600',
        title: t('categories.loops.title'),
        description: t('categories.loops.description')
      },
      {
        id: 'conditionals',
        icon: '🔀',
        color: 'from-orange-500 to-amber-600',
        title: t('categories.conditionals.title'),
        description: t('categories.conditionals.description')
      }
    ];

    return (
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Code className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl font-bold text-white">{t('title')}</h1>
          </div>
          <p className="text-xl text-white/90 mb-2">{t('subtitle')}</p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{t('description')}</p>
        </div>

        {/* Difficulty Selection */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">{t('select_difficulty')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <Button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  variant={difficulty === level ? 'default' : 'outline'}
                  className={difficulty === level ? 'bg-blue-600 text-white' : 'bg-white/20 text-white border-white/30'}
                >
                  {t(`difficulty.${level}`)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 cursor-pointer"
              onClick={() => startGame(category.id as any)}
            >
              <CardHeader>
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <CardTitle className="text-center text-white text-xl">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/80 text-sm mb-4">
                  {category.description}
                </p>
                <Button className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30">
                  {t('start')} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/stem')}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            {t('back_to_stem')}
          </Button>
        </div>
      </div>
    );
  };

  const renderChallenge = () => {
    if (challenges.length === 0) return null;
    const challenge = challenges[currentChallenge];

    return (
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-semibold">
                {t('question')} {currentChallenge + 1} / {challenges.length}
              </span>
              <span className="text-white font-semibold">
                ⏱️ {formatTime(timeElapsed)}
              </span>
              <span className="text-white font-semibold">
                ⭐ {score} / {challenges.length}
              </span>
            </div>
            <Progress value={((currentChallenge + 1) / challenges.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Challenge */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl text-center">
              {challenge.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sequencing shows order */}
            {gameMode === 'sequencing' && selectedAnswer.length > 0 && (
              <div className="mb-4 p-4 bg-blue-500/20 rounded-lg">
                <div className="text-white text-center mb-2">{t('your_order')}:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedAnswer.map((idx, pos) => (
                    <div key={pos} className="bg-white/20 px-3 py-2 rounded-lg text-white text-sm">
                      {pos + 1}. {challenge.options[idx]}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={resetSequence}
                  variant="outline"
                  size="sm"
                  className="mt-2 mx-auto block bg-white/20 text-white border-white/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('reset')}
                </Button>
              </div>
            )}

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {challenge.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation || (gameMode === 'sequencing' && selectedAnswer.includes(index))}
                  variant="outline"
                  className={`h-auto py-4 text-left justify-start ${
                    selectedAnswer.includes(index)
                      ? 'bg-blue-500 text-white border-blue-400'
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  } ${gameMode === 'sequencing' && selectedAnswer.includes(index) ? 'opacity-50' : ''}`}
                >
                  <span className="font-bold mr-2">{index + 1}.</span>
                  {option}
                </Button>
              ))}
            </div>

            {/* Hint */}
            {!showExplanation && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="outline"
                  className="flex-1 bg-yellow-500/20 text-white border-yellow-400/30 hover:bg-yellow-500/30"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHint ? t('hide_hint') : t('show_hint')}
                </Button>
              </div>
            )}

            {showHint && !showExplanation && (
              <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                <p className="text-white text-sm">💡 {challenge.hint}</p>
              </div>
            )}

            {/* Explanation */}
            {showExplanation && (
              <div className={`mt-4 p-4 rounded-lg border ${
                JSON.stringify(selectedAnswer) === JSON.stringify(challenge.correctAnswer)
                  ? 'bg-green-500/20 border-green-400/30'
                  : 'bg-red-500/20 border-red-400/30'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  {JSON.stringify(selectedAnswer) === JSON.stringify(challenge.correctAnswer) ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-white text-sm">{challenge.explanation}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              {!showExplanation ? (
                <Button
                  onClick={checkAnswer}
                  disabled={selectedAnswer.length === 0 || 
                    (gameMode === 'sequencing' && selectedAnswer.length !== challenge.options.length)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t('check_answer')}
                </Button>
              ) : (
                <Button
                  onClick={nextChallenge}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {currentChallenge < challenges.length - 1 ? t('next') : t('see_results')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResults = () => {
    const stars = calculateStars();
    const percentage = Math.round((score / challenges.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
              <CardTitle className="text-white text-3xl mb-2">
                {t('results.title')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-12 h-12 ${
                    star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="space-y-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center text-white">
                  <span>{t('results.correct_answers')}:</span>
                  <span className="font-bold text-xl">{score} / {challenges.length}</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center text-white">
                  <span>{t('results.percentage')}:</span>
                  <span className="font-bold text-xl">{percentage}%</span>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center text-white">
                  <span>{t('results.time')}:</span>
                  <span className="font-bold text-xl">{formatTime(timeElapsed)}</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <p className="text-white text-lg">
                {percentage >= 90 ? t('results.excellent') :
                 percentage >= 70 ? t('results.good') :
                 percentage >= 50 ? t('results.fair') :
                 t('results.keep_practicing')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => setGameMode('menu')}
                variant="outline"
                className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {t('back_to_menu')}
              </Button>
              <Button
                onClick={() => startGame(gameMode as any)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('play_again')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {gameMode === 'menu' && renderMenu()}
        {(gameMode === 'sequencing' || gameMode === 'patterns' || gameMode === 'loops' || gameMode === 'conditionals') && renderChallenge()}
        {gameMode === 'results' && renderResults()}
      </main>

      <Footer />
    </div>
  );
};

export default CodingBasicsApp;
