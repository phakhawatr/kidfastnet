import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Volume2, VolumeX, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import Header from '../components/Header';
import Footer from '../components/Footer';

type GridCell = {
  value: number | null;
  isInput: boolean;
  isCorrect?: boolean;
};

type Grid = GridCell[][];

type GridSolution = {
  grid: Grid;
  correctAnswers: number[][];
};

const SumGridPuzzles: React.FC = () => {
  const { t } = useTranslation('exercises');
  const [searchParams] = useSearchParams();
  
  // Mission mode
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  // Game states
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [grids, setGrids] = useState<Grid[]>([]);
  const [solutions, setSolutions] = useState<number[][][]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [sound, setSound] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // เสียง beep
  const beep = useCallback((freq = 900, dur = 0.08, type: OscillatorType = 'triangle') => {
    if (!sound) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, dur * 1000 + 30);
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [sound]);

  // Generate valid pattern ensuring 1-2 numbers per row/column, total 4 visible
  const generateValidPattern = (): number[][] => {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      // Generate all possible cells
      const allCells: number[][] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          allCells.push([r, c]);
        }
      }
      
      // Randomly select 4 cells
      const shuffled = allCells.sort(() => Math.random() - 0.5);
      const pattern = shuffled.slice(0, 4);
      
      // Count numbers per row and column
      const rowCounts = [0, 0, 0];
      const colCounts = [0, 0, 0];
      
      pattern.forEach(([r, c]) => {
        rowCounts[r]++;
        colCounts[c]++;
      });
      
      // Validate: each row and column must have 1-2 visible numbers
      const validRows = rowCounts.every(count => count >= 1 && count <= 2);
      const validCols = colCounts.every(count => count >= 1 && count <= 2);
      
      if (validRows && validCols) {
        return pattern;
      }
      
      attempts++;
    }
    
    // Fallback to a known valid pattern if random generation fails
    return [[0, 0], [0, 1], [1, 0], [2, 2]];
  };

  // Generate grid puzzle following 3x3 sum grid mathematics
  const generateGrid = (): GridSolution => {
    // Create a 4x4 grid (3x3 main grid + sum row/column)
    const grid: Grid = Array(4).fill(null).map(() => 
      Array(4).fill(null).map(() => ({ value: null, isInput: false }))
    );
    
    // Generate random numbers for the main 3x3 area
    const baseNumbers: number[][] = [];
    for (let i = 0; i < 3; i++) {
      baseNumbers[i] = [];
      for (let j = 0; j < 3; j++) {
        baseNumbers[i][j] = Math.floor(Math.random() * 9) + 1;
      }
    }
    
    // Calculate row sums (rightmost column)
    const rowSums = [
      baseNumbers[0][0] + baseNumbers[0][1] + baseNumbers[0][2],
      baseNumbers[1][0] + baseNumbers[1][1] + baseNumbers[1][2],
      baseNumbers[2][0] + baseNumbers[2][1] + baseNumbers[2][2]
    ];
    
    // Calculate column sums (bottom row)
    const colSums = [
      baseNumbers[0][0] + baseNumbers[1][0] + baseNumbers[2][0],
      baseNumbers[0][1] + baseNumbers[1][1] + baseNumbers[2][1],
      baseNumbers[0][2] + baseNumbers[1][2] + baseNumbers[2][2]
    ];
    
    // Get valid pattern with exactly 4 visible cells
    const visibleCells = generateValidPattern();
    
    // Fill the grid
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i < 3 && j < 3) {
          // Main 3x3 area
          const isVisible = visibleCells.some(([r, c]) => r === i && c === j);
          grid[i][j] = {
            value: isVisible ? baseNumbers[i][j] : null,
            isInput: !isVisible,
            isCorrect: false
          };
        } else if (i < 3 && j === 3) {
          // Row sums (rightmost column)
          grid[i][j] = {
            value: rowSums[i],
            isInput: false,
            isCorrect: true
          };
        } else if (i === 3 && j < 3) {
          // Column sums (bottom row)
          grid[i][j] = {
            value: colSums[j],
            isInput: false,
            isCorrect: true
          };
        } else {
          // Bottom-right corner (empty)
          grid[i][j] = {
            value: null,
            isInput: false,
            isCorrect: true
          };
        }
      }
    }
    
    return { grid, correctAnswers: baseNumbers };
  };

  // Initialize puzzles
  const initializePuzzles = useCallback((count: number) => {
    const newGrids: Grid[] = [];
    const newSolutions: number[][][] = [];
    
    for (let i = 0; i < count; i++) {
      const gridSolution = generateGrid();
      newGrids.push(gridSolution.grid);
      newSolutions.push(gridSolution.correctAnswers);
    }
    
    setGrids(newGrids);
    setSolutions(newSolutions);
    setCorrectCount(0);
    setCurrentQuestion(0);
    setStartTime(Date.now());
  }, []);

  // Start game
  const startGame = () => {
    initializePuzzles(totalQuestions);
    setGameStarted(true);
    setShowSummary(false);
  };

  // Check answer for a specific grid cell
  const checkAnswer = (row: number, col: number, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || row >= 3 || col >= 3) return;

    const grid = grids[currentQuestion];
    const correctAnswer = solutions[currentQuestion][row][col];
    const newGrids = [...grids];
    
    // Check if the answer is correct
    const isCorrect = numValue === correctAnswer;

    // Update grid
    newGrids[currentQuestion][row][col] = {
      ...grid[row][col],
      value: numValue,
      isCorrect: isCorrect
    };

    setGrids(newGrids);

    if (isCorrect) {
      beep(1040, 0.08, 'triangle');
      setTimeout(() => beep(1320, 0.09, 'triangle'), 90);
    } else {
      beep(220, 0.07, 'sawtooth');
    }
  };

  // Check if current grid is completed
  const isCurrentGridComplete = () => {
    if (!grids[currentQuestion]) return false;
    const grid = grids[currentQuestion];
    return grid.slice(0, 3).every(row => 
      row.slice(0, 3).every(cell => !cell.isInput || cell.isCorrect)
    );
  };

  // Next question
  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Show summary
      const completed = grids.filter((grid) =>
        grid.slice(0, 3).every(row => 
          row.slice(0, 3).every(cell => !cell.isInput || cell.isCorrect)
        )
      ).length;
      setCorrectCount(completed);
      setShowSummary(true);
      
      // Mission mode completion
      if (isMissionMode) {
        const elapsedMs = Date.now() - startTime;
        handleCompleteMission(completed, totalQuestions, elapsedMs);
      }
    }
  };

  // Previous question
  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setShowSummary(false);
    setCurrentQuestion(0);
    setCorrectCount(0);
  };

  const currentGrid = grids[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/profile" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-white">กลับ</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {t('sumGridPuzzles.title')}
            </h1>
          </div>
          
          <p className="text-slate-300 text-sm md:text-base">
            {t('sumGridPuzzles.description')}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!gameStarted ? (
          // Start Screen
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-700">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🧩</div>
              <h2 className="text-3xl font-bold text-white mb-2">ตารางบวก 3x3</h2>
              <p className="text-slate-300">เลือกจำนวนข้อที่ต้องการฝึกฝน</p>
            </div>
            
            {/* Question count selection */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[5, 10, 20, 30].map((count) => (
                <button
                  key={count}
                  onClick={() => setTotalQuestions(count)}
                  className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${
                    totalQuestions === count
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {count} ข้อ
                </button>
              ))}
            </div>
            
            {/* Sound toggle */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setSound(!sound)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  sound ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span>เสียง: {sound ? 'เปิด' : 'ปิด'}</span>
              </button>
            </div>
            
            {/* Start button */}
            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl text-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
              }}
            >
              <span className="text-2xl mr-2">🚀</span>
              เริ่มเกม
            </button>
          </div>
        ) : showSummary ? (
          // Summary Screen
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-700">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-2">ยอดเยี่ยม!</h2>
              <p className="text-2xl text-slate-300 mb-6">
                ทำถูก <span className="text-cyan-400 font-bold">{correctCount}</span> / {totalQuestions} ข้อ
              </p>
              <p className="text-xl text-slate-300 mb-8">
                คะแนน: <span className="text-green-400 font-bold">{Math.round((correctCount / totalQuestions) * 100)}%</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  🔄 เล่นใหม่
                </button>
                <Link
                  to="/profile"
                  className="px-8 py-4 rounded-2xl font-bold text-lg bg-slate-700 text-white hover:bg-slate-600 shadow-lg transform hover:scale-105 transition-all text-center"
                >
                  🏠 กลับหน้าหลัก
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Game Screen - Single Question Display
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-700">
            {/* Question Header */}
            <div className="text-center mb-6">
              <span className="text-lg text-slate-400">ข้อที่</span>
              <span className="text-4xl font-bold text-cyan-400 mx-2">
                {currentQuestion + 1}
              </span>
              <span className="text-lg text-slate-400">/ {totalQuestions}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-700 rounded-full mb-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
              />
            </div>
            
            {/* Grid Display */}
            {currentGrid && (
              <div className="mb-8">
                <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-[400px] md:max-w-[500px] mx-auto">
                  {currentGrid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isGridCompleted = isCurrentGridComplete();
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            aspect-square border-2 rounded-xl flex items-center justify-center font-bold text-xl md:text-2xl
                            transition-all duration-200
                            ${cell.isInput 
                              ? cell.isCorrect 
                                ? 'border-green-400 bg-green-500/20 text-green-400' 
                                : 'border-cyan-400 bg-slate-700/50'
                              : rowIndex === 3 || colIndex === 3
                                ? isGridCompleted
                                  ? 'border-green-400 bg-green-500/20 text-green-400'
                                  : 'border-red-400 bg-red-500/20 text-red-400'
                                : 'border-slate-600 bg-slate-700/30 text-slate-300'
                            }
                          `}
                        >
                          {cell.isInput ? (
                            <input
                              type="number"
                              className="w-full h-full text-center bg-transparent border-none outline-none text-xl md:text-2xl font-bold text-white"
                              placeholder=""
                              value={cell.value || ''}
                              onChange={(e) => checkAnswer(rowIndex, colIndex, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  checkAnswer(rowIndex, colIndex, (e.target as HTMLInputElement).value);
                                }
                              }}
                            />
                          ) : (
                            <span>{cell.value}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                
                <p className="text-sm text-slate-400 text-center mt-6">
                  กรอกตัวเลขในช่องว่างให้ผลรวมในแถวและคอลัมน์ถูกต้อง
                </p>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  currentQuestion === 0
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">ข้อก่อนหน้า</span>
              </button>
              
              <div className="text-center">
                {isCurrentGridComplete() && (
                  <div className="text-2xl text-green-400">⭐</div>
                )}
              </div>
              
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg transition-all"
              >
                <span className="hidden sm:inline">
                  {currentQuestion === totalQuestions - 1 ? 'เสร็จสิ้น' : 'ข้อถัดไป'}
                </span>
                <span className="sm:hidden">
                  {currentQuestion === totalQuestions - 1 ? '✓' : '→'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      
      {/* Mission Complete Modal */}
      {isMissionMode && missionResult && (
        <MissionCompleteModal
          open={showMissionComplete}
          onOpenChange={setShowMissionComplete}
          stars={missionResult.stars}
          correct={missionResult.correct}
          total={missionResult.total}
          timeSpent={missionResult.timeSpent}
          isPassed={missionResult.isPassed}
          onRetry={resetGame}
        />
      )}
    </div>
  );
};

export default SumGridPuzzles;
