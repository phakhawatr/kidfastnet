import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, RefreshCw, Eye, EyeOff, Award, Clock, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AreaModelVisualizer from '@/components/AreaModelVisualizer';
import {
  generateAreaModelProblems,
  checkAnswer,
  calculateStars,
  getSolutionSteps,
  type AreaModelProblem,
  type Difficulty,
} from '@/utils/areaModelUtils';
import { supabase } from '@/integrations/supabase/client';
import Confetti from 'react-confetti';

const AreaModelApp = () => {
  const navigate = useNavigate();
  
  // Settings
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [problemCount, setProblemCount] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  
  // Game state
  const [problems, setProblems] = useState<AreaModelProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [highlightPart, setHighlightPart] = useState<number | undefined>(undefined);
  const [showSteps, setShowSteps] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Timer
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (startTime && !isFinished) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, isFinished]);

  const startNewGame = () => {
    const newProblems = generateAreaModelProblems(problemCount, difficulty);
    setProblems(newProblems);
    setCurrentIndex(0);
    setUserAnswers(new Array(problemCount).fill(0));
    setCurrentInput('');
    setShowBreakdown(false);
    setHighlightPart(undefined);
    setShowSteps(false);
    setIsFinished(false);
    setResults([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setShowConfetti(false);
  };

  const handleInputChange = (value: string) => {
    if (value === '' || /^\d*$/.test(value)) {
      setCurrentInput(value);
    }
  };

  const handleSubmitAnswer = () => {
    const answer = parseInt(currentInput) || 0;
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);
    
    // Move to next question
    setCurrentInput('');
    setShowBreakdown(false);
    setHighlightPart(undefined);
    setShowSteps(false);
    
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleToggleBreakdown = () => {
    setShowBreakdown(!showBreakdown);
    if (!showBreakdown) {
      // Animate through parts
      let part = 0;
      const interval = setInterval(() => {
        setHighlightPart(part);
        part++;
        if (part >= currentProblem.breakdown.parts.length) {
          clearInterval(interval);
          setTimeout(() => setHighlightPart(undefined), 500);
        }
      }, 800);
    }
  };

  const handleFinish = async (answers: number[]) => {
    const newResults = problems.map((problem, index) => 
      checkAnswer(problem, answers[index])
    );
    setResults(newResults);
    setIsFinished(true);
    
    const correctCount = newResults.filter(r => r).length;
    const stars = calculateStars(correctCount, problems.length);
    
    if (stars >= 2) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    // Save to Supabase
    await savePracticeSession(correctCount, problems.length, elapsedTime);
  };

  const savePracticeSession = async (correctCount: number, totalCount: number, durationMs: number) => {
    try {
      const userId = localStorage.getItem('kidfast_user_id');
      const lastEmail = localStorage.getItem('kidfast_last_email');
      
      if (!userId && !lastEmail) {
        console.warn('[AreaModelApp] No userId or email found');
        return;
      }

      let finalUserId = userId;
      
      if (!finalUserId && lastEmail) {
        const { data: registration } = await supabase
          .from('user_registrations')
          .select('id')
          .eq('parent_email', lastEmail)
          .single();
        
        if (registration) {
          finalUserId = registration.id;
          localStorage.setItem('kidfast_user_id', finalUserId);
        }
      }

      if (!finalUserId) {
        console.warn('[AreaModelApp] Unable to determine userId');
        return;
      }

      // Save practice session
      const { error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: finalUserId,
          skill_name: 'พื้นที่สี่เหลี่ยมคูณ',
          difficulty: difficulty,
          problems_attempted: totalCount,
          problems_correct: correctCount,
          accuracy: Math.round((correctCount / totalCount) * 100),
          time_spent: Math.round(durationMs / 1000),
          hints_used: 0,
          session_date: new Date().toISOString()
        });

      if (sessionError) {
        console.error('[AreaModelApp] Error saving practice session:', sessionError);
      }

      // Update skill assessments
      const avgTimePerProblem = Math.round(durationMs / totalCount);
      
      for (let i = 0; i < totalCount; i++) {
        const isCorrect = results[i];
        
        await supabase.rpc('update_skill_assessment', {
          p_user_id: finalUserId,
          p_skill_name: 'พื้นที่สี่เหลี่ยมคูณ',
          p_correct: isCorrect,
          p_time_spent: avgTimePerProblem
        });
      }

    } catch (error) {
      console.error('[AreaModelApp] Error in savePracticeSession:', error);
    }
  };

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center">
        <div className="text-white text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="bg-white/90 hover:bg-white"
          >
            <Home className="mr-2 h-4 w-4" />
            หน้าหลัก
          </Button>
          
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span className="font-semibold">
              {Math.floor(elapsedTime / 60000)}:{String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0')}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/90 hover:bg-white"
          >
            <Settings className="mr-2 h-4 w-4" />
            ตั้งค่า
          </Button>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
          📐 พื้นที่สี่เหลี่ยมคูณ (Area Model)
        </h1>
        <p className="text-white/90 text-center mb-4">
          เรียนรู้การคูณด้วยแนวคิดพื้นที่ แบบ Singapore Math
        </p>

        {/* Progress Bar */}
        <div className="bg-white/90 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">ข้อที่ {currentIndex + 1} / {problems.length}</span>
            <span className="text-sm font-semibold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-6xl mx-auto mb-6 bg-white rounded-xl p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-4">⚙️ ตั้งค่าเกม</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">ระดับความยาก:</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? 'default' : 'outline'}
                    onClick={() => setDifficulty(level)}
                  >
                    {level === 'easy' && '😊 ง่าย (1×1 หลัก)'}
                    {level === 'medium' && '😎 ปานกลาง (2×1 หลัก)'}
                    {level === 'hard' && '🔥 ยาก (2×2 หลัก)'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">จำนวนข้อ: {problemCount}</label>
              <input
                type="range"
                min="3"
                max="15"
                value={problemCount}
                onChange={(e) => setProblemCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <Button onClick={startNewGame} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              เริ่มเกมใหม่
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isFinished ? (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-xl">
            {/* Question */}
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">
              {currentProblem.question}
            </h2>

            {/* Visualizer */}
            <div className="mb-8">
              <AreaModelVisualizer 
                problem={currentProblem} 
                showBreakdown={showBreakdown}
                highlightPart={highlightPart}
              />
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && currentInput) {
                      handleSubmitAnswer();
                    }
                  }}
                  className="flex-1 p-4 text-3xl border-2 rounded-lg text-center font-bold"
                  placeholder="?"
                  autoFocus
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentInput}
                  size="lg"
                  className="px-8"
                >
                  ตอบ
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleToggleBreakdown}
                  className="flex-1"
                >
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  {showBreakdown ? 'ซ่อนการแยก' : 'แสดงการแยกตัวเลข'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowSteps(!showSteps)}
                  className="flex-1"
                >
                  {showSteps ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showSteps ? 'ซ่อนวิธีทำ' : 'ดูวิธีทำ'}
                </Button>
              </div>

              {showSteps && (
                <div className="p-4 bg-accent rounded-lg">
                  <h3 className="font-semibold mb-2">วิธีทำ:</h3>
                  <ol className="space-y-1 text-sm">
                    {getSolutionSteps(currentProblem).map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ResultsScreen
          problems={problems}
          userAnswers={userAnswers}
          results={results}
          elapsedTime={elapsedTime}
          onRestart={startNewGame}
          onHome={() => navigate('/profile')}
        />
      )}
    </div>
  );
};

// Results screen
const ResultsScreen = ({ problems, userAnswers, results, elapsedTime, onRestart, onHome }: any) => {
  const correctCount = results.filter((r: boolean) => r).length;
  const stars = calculateStars(correctCount, problems.length);
  const percentage = Math.round((correctCount / problems.length) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-xl text-center">
        <h2 className="text-3xl font-bold mb-4">🎉 เสร็จสิ้น!</h2>
        
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto mb-2 text-primary" />
            <div className="text-4xl mb-2">{'⭐'.repeat(stars)}</div>
            <p className="text-sm text-muted-foreground">{stars} ดาว</p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-primary">{percentage}%</div>
            <p className="text-sm text-muted-foreground">ความแม่นยำ</p>
          </div>
          
          <div className="text-center">
            <Clock className="h-16 w-16 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {Math.floor(elapsedTime / 60000)}:{String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0')}
            </div>
            <p className="text-sm text-muted-foreground">เวลาที่ใช้</p>
          </div>
        </div>

        <div className="text-lg mb-6">
          ทำถูก <span className="font-bold text-primary">{correctCount}</span> จาก {problems.length} ข้อ
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={onRestart} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            เล่นอีกครั้ง
          </Button>
          <Button onClick={onHome} variant="outline" size="lg">
            <Home className="mr-2 h-4 w-4" />
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AreaModelApp;
