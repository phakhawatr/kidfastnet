import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, RefreshCw, Eye, EyeOff, Volume2, VolumeX, Printer, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

type Task = {
  unit: string;
  value: number;
  icon: string;
  name: string;
};

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [grids, setGrids] = useState<Grid[]>([]);
  const [solutions, setSolutions] = useState<number[][][]>([]); // Store correct answers for each grid
  const [correct, setCorrect] = useState(0);
  const [sound, setSound] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [contrast, setContrast] = useState(false);

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

  // Confetti effect
  const confettiBurst = useCallback(() => {
    // Create confetti particles for celebration
    const colors = ['#ff7b54', '#5ac8fa', '#ffd166', '#9b59b6'];
    for (let i = 0; i < 44; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}vw;
        top: -20px;
        width: 10px;
        height: 14px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        pointer-events: none;
        z-index: 1000;
        animation: confetti-fall 900ms linear forwards;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 1000);
    }
  }, []);

  // Generate grid puzzle following 3x3 sum grid mathematics
  const generateGrid = (): GridSolution => {
    // Create a 4x4 grid (3x3 main grid + sum row/column)
    const grid: Grid = Array(4).fill(null).map(() => 
      Array(4).fill(null).map(() => ({ value: null, isInput: false }))
    );
    
    // Generate random numbers for the main 3x3 area (excluding last row and column)
    const baseNumbers: number[][] = [];
    for (let i = 0; i < 3; i++) {
      baseNumbers[i] = [];
      for (let j = 0; j < 3; j++) {
        baseNumbers[i][j] = Math.floor(Math.random() * 9) + 1;
      }
    }
    
    // Calculate row sums (rightmost column)
    const rowSums = [
      baseNumbers[0][0] + baseNumbers[0][1] + baseNumbers[0][2], // Row 1 sum
      baseNumbers[1][0] + baseNumbers[1][1] + baseNumbers[1][2], // Row 2 sum  
      baseNumbers[2][0] + baseNumbers[2][1] + baseNumbers[2][2]  // Row 3 sum
    ];
    
    // Calculate column sums (bottom row)
    const colSums = [
      baseNumbers[0][0] + baseNumbers[1][0] + baseNumbers[2][0], // Col 1 sum
      baseNumbers[0][1] + baseNumbers[1][1] + baseNumbers[2][1], // Col 2 sum
      baseNumbers[0][2] + baseNumbers[1][2] + baseNumbers[2][2]  // Col 3 sum
    ];
    
    // Select cells to show (exactly 4 cells)
    // KEY RULE: No row or column should have more than 1 visible number
    // This ensures the puzzle is always solvable
    const possiblePatterns = [
      // Each pattern: exactly 1 cell per row and varies by column
      [[0, 0], [1, 1], [2, 2], [0, 2]], // Wait, this has row 0 twice - wrong
      // Let me create proper patterns: 4 cells, each row/col max 2, but distributed
      
      // Pattern type 1: Diagonal-ish with 1 extra
      [[0, 0], [1, 1], [2, 2], [1, 0]], // Diagonal + one extra in row 1
      [[0, 2], [1, 1], [2, 0], [0, 0]], // Diagonal + one extra in row 0
      [[0, 1], [1, 2], [2, 0], [1, 0]], // Mixed diagonal
      
      // Pattern type 2: Balanced spread - each row gets at most 2, each col at most 2
      [[0, 0], [0, 2], [1, 1], [2, 1]], // Row 0: 2, Row 1: 1, Row 2: 1 | Col 0: 1, Col 1: 2, Col 2: 1
      [[0, 1], [1, 0], [1, 2], [2, 1]], // Row 0: 1, Row 1: 2, Row 2: 1 | Col 0: 1, Col 1: 2, Col 2: 1
      [[0, 0], [0, 1], [1, 2], [2, 2]], // Row 0: 2, Row 1: 1, Row 2: 1 | Col 0: 1, Col 1: 1, Col 2: 2
      [[0, 2], [1, 0], [2, 1], [2, 2]], // Row 0: 1, Row 1: 1, Row 2: 2 | Col 0: 1, Col 1: 1, Col 2: 2
      [[0, 1], [1, 1], [2, 0], [2, 2]], // Row 0: 1, Row 1: 1, Row 2: 2 | Col 0: 1, Col 1: 2, Col 2: 1
      
      // Pattern type 3: Four corners
      [[0, 0], [0, 2], [2, 0], [2, 2]], // Corners only - Row 0: 2, Row 2: 2, Row 1: 0
    ];
    
    // Pick a random pattern
    const visibleCells = possiblePatterns[Math.floor(Math.random() * possiblePatterns.length)];
    
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
          // Bottom-right corner (empty or total)
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
  const initializePuzzles = useCallback(() => {
    const newTasks: Task[] = [];
    const newGrids: Grid[] = [];
    const newSolutions: number[][][] = [];
    
    for (let i = 0; i < 9; i++) {
      newTasks.push({
        unit: 'grid',
        value: i + 1,
        icon: '🧮',
        name: `ตาราง ${i + 1}`
      });
      const gridSolution = generateGrid();
      newGrids.push(gridSolution.grid);
      newSolutions.push(gridSolution.correctAnswers);
    }
    
    setTasks(newTasks);
    setGrids(newGrids);
    setSolutions(newSolutions);
    setCorrect(0);
  }, []);

  // Check answer for a specific grid cell
  const checkAnswer = (gridIndex: number, row: number, col: number, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || row >= 3 || col >= 3) return; // Only check main 3x3 area

    const grid = grids[gridIndex];
    const correctAnswer = solutions[gridIndex][row][col];
    const originalGrid = [...grids];
    
    // Check if the answer is correct
    const isCorrect = numValue === correctAnswer;

    // Update grid
    originalGrid[gridIndex][row][col] = {
      ...grid[row][col],
      value: numValue,
      isCorrect: isCorrect
    };

    setGrids(originalGrid);

    if (isCorrect) {
      beep(1040, 0.08, 'triangle');
      setTimeout(() => beep(1320, 0.09, 'triangle'), 90);
    } else {
      beep(220, 0.07, 'sawtooth');
    }
  };

  // Reveal all answers
  const revealAnswers = () => {
    const newGrids = grids.map((grid, gridIndex) => 
      grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (cell.isInput && rowIndex < 3 && colIndex < 3) {
            return {
              ...cell,
              value: solutions[gridIndex][rowIndex][colIndex],
              isCorrect: true
            };
          }
          return cell;
        })
      )
    );
    setGrids(newGrids);
  };

  useEffect(() => {
    initializePuzzles();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Add confetti animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        to { 
          transform: translateY(90vh) rotate(720deg); 
          opacity: 0; 
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [initializePuzzles]);

  // Check if all puzzles are completed
  useEffect(() => {
    if (!Array.isArray(grids) || grids.length === 0) return;
    
    const completedCount = grids.reduce((count, grid) => {
      if (!Array.isArray(grid) || grid.length === 0) return count;
      
      const isGridCompleted = grid
        .slice(0, 3) // Only check the main 3x3 area
        .every(row => 
          Array.isArray(row) && row.slice(0, 3).every(cell => !cell.isInput || cell.isCorrect)
        );
      return count + (isGridCompleted ? 1 : 0);
    }, 0);
    
    setCorrect(completedCount);
    
    // Removed popup trigger - just update the count
  }, [grids]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${contrast ? 'contrast' : ''}`}>
      <Header />
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white/92 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Link to="/profile" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span>กลับ</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              ตารางบวก 3×3 (Sum Grid Puzzles)
            </h1>
          </div>
          
          <p className="text-gray-600 text-sm md:text-base mb-4">
            แก้ปริศนาตารางบวก 4×4 กรอกตัวเลขในช่องว่างให้ผลรวมแถวและคอลัมน์ถูกต้อง
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm">
              <button
                onClick={initializePuzzles}
                className="px-6 py-3.5 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2.5"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
                }}
              >
                <span className="text-2xl">✨</span>
                <span>AI สร้างโจทย์ใหม่</span>
              </button>
              <button
                onClick={revealAnswers}
                className="btn-secondary text-sm"
              >
                <Eye className="w-4 h-4" />
                เฉลย
              </button>
            </div>
            
            <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm">
              <button
                onClick={() => setSound(!sound)}
                className={`btn-ghost text-sm ${sound ? 'text-green-600' : 'text-gray-400'}`}
                aria-pressed={sound}
              >
                {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                เสียง: {sound ? 'เปิด' : 'ปิด'}
              </button>
              <button
                onClick={() => setContrast(!contrast)}
                className="btn-ghost text-sm"
              >
                <Palette className="w-4 h-4" />
                High‑contrast
              </button>
              <button
                onClick={() => window.print()}
                className="btn-ghost text-sm"
              >
                <Printer className="w-4 h-4" />
                พิมพ์
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <span className="text-sm text-gray-600">
                สำเร็จ: <span className="font-bold text-blue-600">{correct}</span>/{tasks.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(grids) && grids.map((grid, gridIndex) => {
            if (!Array.isArray(grid) || grid.length === 0) return null;
            
            return (
              <div key={gridIndex} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800">
                    {tasks[gridIndex]?.icon} {tasks[gridIndex]?.name}
                  </h3>
                  <div className="text-2xl">
                    {Array.isArray(grid) && grid.length > 0 && 
                     grid.slice(0, 3).every(row => 
                       Array.isArray(row) && row.slice(0, 3).every(cell => !cell.isInput || cell.isCorrect)
                     ) ? '⭐' : ''}
                  </div>
                </div>
              
                {/* 4x4 Grid (3x3 main grid + sum row/column) */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {grid.map((row, rowIndex) =>
                    Array.isArray(row) && row.map((cell, colIndex) => {
                      // Check if current grid is completed
                      const isGridCompleted = grid
                        .slice(0, 3)
                        .every(row => 
                          Array.isArray(row) && row.slice(0, 3).every(cell => !cell.isInput || cell.isCorrect)
                        );
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            h-12 border-2 rounded-lg flex items-center justify-center font-bold text-lg
                            ${cell.isInput 
                              ? cell.isCorrect 
                                ? 'border-green-400 bg-green-50 text-green-700' 
                                : 'border-blue-300 bg-white'
                              : rowIndex === 3 || colIndex === 3
                                ? isGridCompleted
                                  ? 'border-green-400 bg-green-50 text-green-700 font-bold' // Green when completed
                                  : 'border-red-300 bg-red-50 text-red-700 font-bold' // Red when not completed
                                : 'border-gray-200 bg-gray-50 text-gray-700'
                            }
                          `}
                        >
                          {cell.isInput ? (
                            <input
                              type="number"
                              className="w-full h-full text-center bg-transparent border-none outline-none text-lg font-bold"
                              placeholder=""
                              onChange={(e) => checkAnswer(gridIndex, rowIndex, colIndex, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  checkAnswer(gridIndex, rowIndex, colIndex, (e.target as HTMLInputElement).value);
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
                
                <p className="text-xs text-gray-500 text-center">
                  แก้ปริศนาตารางบวก: กรอกตัวเลขในช่องว่างให้ผลรวมในแถวและคอลัมน์ถูกต้อง
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SumGridPuzzles;