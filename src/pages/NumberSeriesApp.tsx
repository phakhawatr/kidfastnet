import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../hooks/use-toast';

interface Task {
  seq: number[];
  ans: number;
  hint?: string;
}

interface GameState {
  tasks: Task[];
  correct: number;
  sound: boolean;
}

const NumberSeriesApp: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [state, setState] = useState<GameState>({
    tasks: [],
    correct: 0,
    sound: true
  });
  
  const [level, setLevel] = useState<string>('medium');
  const [count, setCount] = useState<number>(10);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  // Preset problems matching the original HTML
  const PRESET: Task[] = [
    { seq: [1, 1, 2, 4, 7], ans: 11, hint: 'บวกเพิ่มทีละ 0,1,2,3,...' },
    { seq: [32, 28, 24, 20, 16], ans: 12, hint: 'ลบ 4 ต่อเนื่อง' },
    { seq: [1, 2, 6, 24, 120], ans: 720, hint: 'คูณเพิ่มทีละ 2,3,4,5 (แฟกทอเรียล)' },
    { seq: [9, 14, 14, 10, 19, 6], ans: 24, hint: 'สลับ 2 ลำดับ: (9→14→19…)+5 และ (14→10→6…)-4' },
    { seq: [1, 4, 9, 16, 25], ans: 36, hint: 'กำลังสอง 1²,2²,3²,...' },
    { seq: [2, 3, 5, 8, 13], ans: 21, hint: 'แต่ละตัว = ผลบวกสองตัวก่อนหน้า (ฟีโบนักชี)' },
    { seq: [0, 1, 5, 14, 30], ans: 55, hint: 'ผลต่างเป็นกำลังสอง 1,4,9,16,...' },
    { seq: [99, 98, 94, 85, 69], ans: 44, hint: 'ลบกำลังสอง 1,4,9,16,25,...' },
    { seq: [3, 3, 6, 18, 72], ans: 360, hint: 'คูณด้วย 1,2,3,4,5,...' },
    { seq: [3, 4, 7, 5, 6, 11, 7, 8], ans: 15, hint: 'ทำซ้ำรูปแบบ +1,+คี่เพิ่มทีละ 2,−คู่เพิ่มทีละ 2' }
  ];

  // Sound effects
  const beep = useCallback((freq: number = 900, dur: number = 0.08, type: OscillatorType = 'triangle') => {
    if (!state.sound) return;
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
      }, (dur * 1000) + 30);
    } catch (e) {
      // Audio not supported
    }
  }, [state.sound]);

  // Random task generators
  const randInt = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1));

  const makeAP = (): Task => {
    const start = randInt(0, 20);
    const d = randInt(1, 10);
    const n = randInt(4, 6);
    const seq = Array.from({ length: n }, (_, i) => start + i * d);
    return { seq, ans: start + n * d, hint: `อนุกรมเลขคณิต เพิ่มทีละ ${d}` };
  };

  const makeGP = (): Task => {
    const start = randInt(1, 5);
    const r = randInt(2, 3);
    const n = randInt(4, 6);
    const seq = [start];
    for (let i = 1; i < n; i++) seq.push(seq[i - 1] * r);
    return { seq, ans: seq[seq.length - 1] * r, hint: `คูณด้วย ${r} ทุกครั้ง` };
  };

  const makeFib = (): Task => {
    let a = randInt(0, 2), b = 1;
    const n = randInt(5, 6);
    const seq = [a, b];
    for (let i = 2; i < n; i++) {
      const c = a + b;
      seq.push(c);
      a = b;
      b = c;
    }
    return { seq: seq.slice(1), ans: a + b, hint: 'แต่ละตัว = ผลบวกสองตัวก่อนหน้า' };
  };

  const makeSquares = (): Task => {
    const n = randInt(4, 6);
    const start = 1;
    const seq = Array.from({ length: n }, (_, i) => (i + start) ** 2);
    return { seq, ans: (n + start) ** 2, hint: 'กำลังสองของจำนวนเต็มต่อเนื่อง' };
  };

  const generateRandomTasks = (difficulty: string, taskCount: number): Task[] => {
    const makersEasy = [makeAP, makeSquares, makeFib];
    const makersMedium = [makeAP, makeGP, makeFib, makeSquares];
    const makersHard = [makeAP, makeGP, makeFib, makeSquares];

    const pool = difficulty === 'easy' ? makersEasy : 
                 difficulty === 'hard' ? makersHard : makersMedium;
    
    const tasks: Task[] = [];
    for (let i = 0; i < taskCount; i++) {
      const maker = pool[i % pool.length];
      tasks.push(maker());
    }
    return tasks;
  };

  // Initialize with preset tasks
  useEffect(() => {
    setState(prev => ({ ...prev, tasks: PRESET.slice(0, count) }));
  }, [count]);

  const handleInputChange = useCallback((taskIndex: number, value: string) => {
    const numValue = Number(value.trim());
    if (!Number.isFinite(numValue)) return;

    const task = state.tasks[taskIndex];
    const isCorrect = numValue === task.ans;

    if (isCorrect) {
      setState(prev => ({
        ...prev,
        correct: prev.correct + 1
      }));
      
      beep(1040, 0.08, 'triangle');
      setTimeout(() => beep(1320, 0.09, 'triangle'), 90);

      if (state.correct + 1 === state.tasks.length) {
        setTimeout(() => {
          setShowCompleted(true);
          toast({
            title: "เยี่ยมมาก! 🎉",
            description: "ทำครบทุกข้อแล้ว",
          });
        }, 100);
      }
    } else {
      beep(220, 0.07, 'sawtooth');
    }
  }, [state.tasks, state.correct, beep, toast]);

  const handlePreset = () => {
    setState(prev => ({ ...prev, tasks: PRESET.slice(0, count), correct: 0 }));
    setShowCompleted(false);
  };

  const handleRandom = () => {
    const tasks = generateRandomTasks(level, count);
    setState(prev => ({ ...prev, tasks, correct: 0 }));
    setShowCompleted(false);
  };

  const handleReveal = () => {
    setState(prev => ({ ...prev, correct: prev.tasks.length }));
    setShowCompleted(true);
  };

  const toggleSound = () => {
    setState(prev => ({ ...prev, sound: !prev.sound }));
  };

  const handlePlayAgain = () => {
    const tasks = generateRandomTasks(level, count);
    setState(prev => ({ ...prev, tasks, correct: 0 }));
    setShowCompleted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      
      {/* Header Controls */}
      <header className="sticky top-0 z-20 bg-gradient-to-b from-background/90 to-background/60 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            อนุกรม – เติมเลขที่หายไป
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-4">
            สังเกตรูปแบบของลำดับตัวเลข แล้วเติมคำตอบให้ถูกต้อง • ทั้งหมด <b>{state.tasks.length}</b> ข้อ
          </p>
          
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-2">
              <button 
                onClick={handlePreset}
                className="btn-primary text-sm"
              >
                ตามภาพ
              </button>
              <button 
                onClick={handleRandom}
                className="btn-secondary text-sm"
              >
                สุ่มโจทย์ใหม่
              </button>
              <button 
                onClick={handleReveal}
                className="btn-outline text-sm"
              >
                เฉลย
              </button>
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex gap-2 items-center">
                <label htmlFor="level" className="text-sm font-semibold">ระดับ</label>
                <select 
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                >
                  <option value="easy">ง่าย</option>
                  <option value="medium">ปานกลาง</option>
                  <option value="hard">ท้าทาย</option>
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <label htmlFor="count" className="text-sm font-semibold">จำนวนข้อ</label>
                <input 
                  id="count"
                  type="number"
                  min="6"
                  max="12"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-16 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm text-center"
                />
              </div>

              <button 
                onClick={toggleSound}
                className={`btn-outline text-sm ${state.sound ? 'bg-primary text-primary-foreground' : ''}`}
              >
                เสียง: {state.sound ? 'เปิด' : 'ปิด'}
              </button>
            </div>

            <div className="text-sm text-muted-foreground">
              สำเร็จ: <b>{state.correct}</b>/<span>{state.tasks.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {state.tasks.map((task, index) => (
              <ProblemCard
                key={`task-${index}`}
                task={task}
                index={index}
                onInputChange={handleInputChange}
                isCompleted={state.correct > index}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Completion Modal */}
      {showCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-2">เยี่ยมมาก! 🎉</h2>
            <p className="text-muted-foreground mb-6">ทำครบทุกข้อแล้ว</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handlePlayAgain}
                className="btn-primary"
              >
                เล่นรอบใหม่
              </button>
              <button 
                onClick={() => setShowCompleted(false)}
                className="btn-outline"
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

// Problem Card Component
const ProblemCard = React.memo<{
  task: Task;
  index: number;
  onInputChange: (index: number, value: string) => void;
  isCompleted: boolean;
}>(({ task, index, onInputChange, isCompleted }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = Number(value.trim());
    if (Number.isFinite(numValue) && numValue === task.ans) {
      setIsCorrect(true);
      onInputChange(index, value);
    }
  }, [task.ans, index, onInputChange]);

  return (
    <div className={`card-glass p-4 relative ${isCorrect ? 'ring-2 ring-primary/50' : ''}`}>
      {/* Star indicator */}
      <div className={`absolute top-3 right-3 text-xl transition-opacity ${isCorrect ? 'opacity-100' : 'opacity-20'}`}>
        ⭐
      </div>

      {/* Problem number */}
      <div className="font-bold text-lg mb-3 text-foreground">
        {index + 1}.
      </div>

      {/* Sequence display */}
      <div className="text-xl font-mono mb-4 text-foreground">
        {task.seq.join(', ')}, <span className="inline-flex items-center justify-center w-8 h-8 border-2 border-dashed border-border rounded-full align-baseline mx-1 text-red-500 font-bold">?</span>
      </div>

      {/* Input and controls */}
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="?"
          disabled={isCorrect}
          className={`w-32 h-11 px-3 border-2 rounded-xl text-center text-lg font-bold bg-background text-foreground
            ${isCorrect ? 'border-primary bg-primary/10' : 'border-border'} 
            focus:outline-none focus:ring-2 focus:ring-primary/50`}
        />
        
        <button 
          onClick={() => setShowHint(!showHint)}
          className="btn-outline text-sm"
        >
          คำใบ้
        </button>

        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full font-bold">
          รูปแบบ
        </span>
      </div>

      {/* Hint display */}
      <div className="min-h-[20px] text-sm text-muted-foreground">
        {showHint && task.hint && `ใบ้: ${task.hint}`}
        {!isCorrect && inputValue && !showHint && 'ยังไม่ใช่ ลองดูแพทเทิร์นอีกครั้งนะ'}
      </div>
    </div>
  );
});

ProblemCard.displayName = 'ProblemCard';

export default NumberSeriesApp;