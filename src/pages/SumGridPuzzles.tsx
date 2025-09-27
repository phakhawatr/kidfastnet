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

const SumGridPuzzles: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [grids, setGrids] = useState<Grid[]>([]);
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

  // Generate grid puzzle
  const generateGrid = (): Grid => {
    const grid: Grid = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => ({ value: null, isInput: false }))
    );
    
    // Fill some cells with numbers (sum puzzle logic)
    const values = [
      [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1, 0],
      [Math.floor(Math.random() * 9) + 1, Math.floor(Math.random() * 9) + 1, 0],
      [0, 0, 0]
    ];
    
    // Calculate sums
    values[0][2] = values[0][0] + values[0][1]; // Row 1 sum
    values[1][2] = values[1][0] + values[1][1]; // Row 2 sum
    values[2][0] = values[0][0] + values[1][0]; // Col 1 sum
    values[2][1] = values[0][1] + values[1][1]; // Col 2 sum
    values[2][2] = values[0][2] + values[1][2]; // Total sum
    
    // Randomly hide some cells for input
    const hiddenCells = [
      [0, 1], [1, 0], [2, 0], [2, 1] // Hide some strategic cells
    ];
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const shouldHide = hiddenCells.some(([r, c]) => r === i && c === j) && Math.random() > 0.3;
        grid[i][j] = {
          value: shouldHide ? null : values[i][j],
          isInput: shouldHide,
          isCorrect: false
        };
      }
    }
    
    return grid;
  };

  // Initialize puzzles
  const initializePuzzles = useCallback(() => {
    const newTasks: Task[] = [];
    const newGrids: Grid[] = [];
    
    for (let i = 0; i < 9; i++) {
      newTasks.push({
        unit: 'grid',
        value: i + 1,
        icon: '🧮',
        name: `ตาราง ${i + 1}`
      });
      newGrids.push(generateGrid());
    }
    
    setTasks(newTasks);
    setGrids(newGrids);
    setCorrect(0);
  }, []);

  // Check answer for a specific grid cell
  const checkAnswer = (gridIndex: number, row: number, col: number, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    const grid = grids[gridIndex];
    const originalGrid = [...grids];
    
    // Calculate what the correct value should be
    let correctValue = 0;
    
    // Logic to calculate correct answer based on position
    if (row < 2 && col < 2) {
      // Basic cell - could be any number, we'll validate based on sums
      correctValue = numValue; // For now, accept any reasonable input
    } else if (row < 2 && col === 2) {
      // Row sum
      const row1 = grid[row][0]?.value || 0;
      const row2 = grid[row][1]?.value || 0;
      correctValue = row1 + row2;
    } else if (row === 2 && col < 2) {
      // Column sum
      const col1 = grid[0][col]?.value || 0;
      const col2 = grid[1][col]?.value || 0;
      correctValue = col1 + col2;
    } else {
      // Total sum (bottom right)
      const totalSum = (grid[0][2]?.value || 0) + (grid[1][2]?.value || 0);
      correctValue = totalSum;
    }

    // Update grid
    originalGrid[gridIndex][row][col] = {
      ...grid[row][col],
      value: numValue,
      isCorrect: Math.abs(numValue - correctValue) < 0.1
    };

    setGrids(originalGrid);

    if (originalGrid[gridIndex][row][col].isCorrect) {
      beep(1040, 0.08, 'triangle');
      setTimeout(() => beep(1320, 0.09, 'triangle'), 90);
    } else {
      beep(220, 0.07, 'sawtooth');
    }
  };

  // Reveal all answers
  const revealAnswers = () => {
    // Implementation for revealing answers
    const newGrids = grids.map(grid => 
      grid.map(row =>
        row.map(cell => ({ ...cell, isCorrect: true }))
      )
    );
    setGrids(newGrids);
  };

  useEffect(() => {
    initializePuzzles();
    
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
    const allCompleted = grids.every(grid => 
      grid.every(row => 
        row.every(cell => !cell.isInput || cell.isCorrect)
      )
    );
    
    if (allCompleted && grids.length > 0) {
      setShowCompleted(true);
      confettiBurst();
    }
  }, [grids, confettiBurst]);

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
            แก้ปริศนาตารางบวก กรอกตัวเลขให้ถูกต้องตามผลรวม
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm">
              <button
                onClick={initializePuzzles}
                className="btn-primary text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                สุ่มโจทย์ใหม่
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
          {grids.map((grid, gridIndex) => (
            <div key={gridIndex} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  {tasks[gridIndex]?.icon} {tasks[gridIndex]?.name}
                </h3>
                <div className="text-2xl">
                  {grid.every(row => row.every(cell => !cell.isInput || cell.isCorrect)) ? '⭐' : ''}
                </div>
              </div>
              
              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        h-12 border-2 rounded-lg flex items-center justify-center font-bold text-lg
                        ${cell.isInput 
                          ? cell.isCorrect 
                            ? 'border-green-400 bg-green-50 text-green-700' 
                            : 'border-blue-300 bg-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700'
                        }
                        ${rowIndex === 2 || colIndex === 2 ? 'bg-blue-50 border-blue-200' : ''}
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
                  ))
                )}
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                กรอกตัวเลขในช่องว่างให้ผลรวมถูกต้อง
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Completion Dialog */}
      {showCompleted && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">ยอดเยี่ยม! 🎉</h2>
            <p className="text-gray-600 mb-6">แก้ปริศนาตารางบวกได้ครบแล้ว</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowCompleted(false);
                  initializePuzzles();
                }}
                className="btn-primary"
              >
                เล่นรอบใหม่
              </button>
              <button
                onClick={() => setShowCompleted(false)}
                className="btn-secondary"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SumGridPuzzles;