import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Play, Eye, Settings, Volume2, VolumeX, Printer, Sun, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface WeighingTask {
  unit: 'kg' | 'g';
  value: number;
  icon: string;
  name: string;
  userAnswer: string;
  isCorrect: boolean | null;
}

// SVG Scale component
const ScaleSVG: React.FC<{ unit: 'kg' | 'g'; value: number }> = ({ unit, value }) => {
  const max = unit === 'kg' ? 10 : 1000;
  const minor = unit === 'kg' ? 0.5 : 50;
  const major = unit === 'kg' ? 1 : 100;
  
  const size = 220;
  const cx = 110;
  const cy = 120;
  const rOuter = 90;
  const rMinor = 82;
  const rMajor = 74;
  const rText = 64;

  const pointAt = (angleDeg: number, r: number) => {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const createTicks = () => {
    const ticks = [];
    for (let t = 0; t <= max + 1e-9; t += minor) {
      const ratio = t / max;
      const angle = ratio * 360;
      const [x1, y1] = pointAt(angle, rOuter);
      const inner = Math.abs((t / major) - Math.round(t / major)) < 1e-9 ? rMajor : rMinor;
      const [x2, y2] = pointAt(angle, inner);
      
      ticks.push(
        <line
          key={`tick-${t}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#1b1b1b"
          strokeWidth={inner === rMajor ? 3 : 2}
          strokeLinecap="round"
        />
      );
    }
    return ticks;
  };

  const createNumbers = () => {
    const numbers = [];
    for (let t = 0; t <= max; t += major) {
      const ratio = t / max;
      const angle = ratio * 360;
      const [tx, ty] = pointAt(angle, rText);
      
      numbers.push(
        <text
          key={`num-${t}`}
          x={tx}
          y={ty + 8}
          textAnchor="middle"
          fontWeight="900"
          fontSize={unit === 'kg' ? 14 : 12}
          fill="#20333b"
        >
          {t}
        </text>
      );
    }
    return numbers;
  };

  const angleNeedle = (value / max) * 360;

  return (
    <svg viewBox="0 0 240 240" width="100%" height="220" className="mx-auto">
      {/* Plate */}
      <ellipse
        cx={cx}
        cy={30}
        rx={90}
        ry={16}
        fill="#e6f0f7"
        stroke="#9fb3c8"
        strokeWidth={2}
      />
      
      {/* Body */}
      <rect
        x={cx - 74}
        y={52}
        width={148}
        height={150}
        rx={14}
        fill="#e2f0fb"
        stroke="#9fb3c8"
        strokeWidth={3}
      />
      
      {/* Dial face */}
      <circle
        cx={cx}
        cy={cy}
        r={92}
        fill="#ffffff"
        stroke="#1b1b1b"
        strokeWidth={3}
      />
      
      {/* Ticks */}
      {createTicks()}
      
      {/* Numbers */}
      {createNumbers()}
      
      {/* Unit label */}
      <text
        x={cx}
        y={cy + 28}
        textAnchor="middle"
        fontWeight="700"
        fontSize="16"
        fill="#5d6b73"
      >
        {unit}
      </text>
      
      {/* Needle */}
      <g transform={`rotate(${angleNeedle}, ${cx}, ${cy})`}>
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - 78}
          stroke="#e74c3c"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#1b1b1b"
        />
      </g>
    </svg>
  );
};

const PRESET_TASKS: WeighingTask[] = [
  { unit: 'kg', value: 7.5, icon: '🎃', name: 'ฟักทอง', userAnswer: '', isCorrect: null },
  { unit: 'g', value: 300, icon: '🥣', name: 'โยเกิร์ต', userAnswer: '', isCorrect: null },
  { unit: 'kg', value: 4.0, icon: '📦', name: 'กล่องของ', userAnswer: '', isCorrect: null },
  { unit: 'g', value: 700, icon: '🍞', name: 'ขนมปัง', userAnswer: '', isCorrect: null },
  { unit: 'kg', value: 8.0, icon: '🍬', name: 'ลูกกวาด', userAnswer: '', isCorrect: null },
  { unit: 'g', value: 500, icon: '🍯', name: 'น้ำผึ้ง', userAnswer: '', isCorrect: null },
  { unit: 'kg', value: 2.5, icon: '🥛', name: 'นม', userAnswer: '', isCorrect: null },
  { unit: 'g', value: 900, icon: '🍎', name: 'แอปเปิล', userAnswer: '', isCorrect: null },
  { unit: 'kg', value: 6.0, icon: '🎂', name: 'เค้ก', userAnswer: '', isCorrect: null },
];

const ICONS = ['🎃', '🥣', '📦', '🍞', '🍬', '🍯', '🥛', '🍎', '🎂', '🧀', '🍗', '🥕', '🍪', '🍌', '🍊', '🍇', '🍓', '🍍'];

const WeighingApp: React.FC = () => {
  const [tasks, setTasks] = useState<WeighingTask[]>(PRESET_TASKS);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [stepKg, setStepKg] = useState(0.5);
  const [stepG, setStepG] = useState(100);
  const audioContextRef = useRef<AudioContext | null>(null);

  const beep = useCallback((freq = 900, dur = 0.08, type: OscillatorType = 'triangle') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, dur * 1000 + 30);
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, [soundEnabled]);

  const generateRandomTasks = useCallback((): WeighingTask[] => {
    const randomTasks: WeighingTask[] = [];
    const order = [0, 1, 0, 1, 0, 1, 0, 1, 0]; // kg/g alternating
    
    for (let i = 0; i < 9; i++) {
      const unit = order[i] === 0 ? 'kg' : 'g';
      let value: number;
      
      if (unit === 'kg') {
        const steps = Math.floor(10 / stepKg) - 1;
        const idx = 1 + Math.floor(Math.random() * steps);
        value = idx * stepKg;
      } else {
        const steps = Math.floor(1000 / stepG) - 1;
        const idx = 1 + Math.floor(Math.random() * steps);
        value = idx * stepG;
      }
      
      const icon = ICONS[i % ICONS.length];
      randomTasks.push({
        unit,
        value,
        icon,
        name: '',
        userAnswer: '',
        isCorrect: null
      });
    }
    
    return randomTasks;
  }, [stepKg, stepG]);

  const resetToPreset = useCallback(() => {
    setTasks(PRESET_TASKS.map(task => ({ ...task, userAnswer: '', isCorrect: null })));
    setCorrectCount(0);
    setShowResults(false);
  }, []);

  const resetToRandom = useCallback(() => {
    setTasks(generateRandomTasks());
    setCorrectCount(0);
    setShowResults(false);
  }, [generateRandomTasks]);

  const handleAnswerChange = useCallback((index: number, answer: string) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, userAnswer: answer } : task
    ));
  }, []);

  const checkAnswer = useCallback((index: number, playSound = false) => {
    const task = tasks[index];
    if (!task.userAnswer) return;

    const userValue = parseFloat(task.userAnswer.replace(',', '.'));
    if (isNaN(userValue)) return;

    let isCorrect = false;
    if (task.unit === 'kg') {
      isCorrect = Math.abs(userValue - task.value) < 0.05;
    } else {
      isCorrect = Math.abs(userValue - task.value) < stepG / 2 - 1e-9;
    }

    setTasks(prev => prev.map((t, i) => 
      i === index ? { ...t, isCorrect } : t
    ));

    if (isCorrect && task.isCorrect !== true) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      
      if (playSound) {
        beep(1040, 0.08, 'triangle');
        setTimeout(() => beep(1320, 0.09, 'triangle'), 90);
      }
      
      if (newCorrectCount === tasks.length) {
        setTimeout(() => setShowResults(true), 100);
      }
    } else if (!isCorrect && playSound) {
      beep(220, 0.07, 'sawtooth');
    }
  }, [tasks, correctCount, stepG, beep]);

  const revealAnswers = useCallback(() => {
    setTasks(prev => prev.map(task => ({
      ...task,
      userAnswer: task.unit === 'kg' 
        ? (Math.round(task.value * 10) / 10).toFixed(task.value % 1 === 0 ? 0 : 1)
        : String(Math.round(task.value)),
      isCorrect: true
    })));
    setCorrectCount(tasks.length);
  }, [tasks.length]);

  const applySettings = useCallback(() => {
    resetToRandom();
  }, [resetToRandom]);

  const TaskCard: React.FC<{ task: WeighingTask; index: number }> = React.memo(({ task, index }) => {
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      handleAnswerChange(index, e.target.value);
    }, [index]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        checkAnswer(index, true);
      }
    }, [index]);

    useEffect(() => {
      if (task.userAnswer) {
        checkAnswer(index, false);
      }
    }, [task.userAnswer, index]);

    return (
      <Card className={`transition-all duration-200 ${
        task.isCorrect === true ? 'border-green-500 bg-green-50' :
        task.isCorrect === false ? 'border-red-500 bg-red-50 animate-pulse' :
        'border-gray-200 hover:border-primary/50'
      }`}>
        <CardContent className="p-4 relative">
          {task.isCorrect === true && (
            <div className="absolute top-2 right-2 text-yellow-500 text-xl">⭐</div>
          )}
          
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{task.icon} {task.name}</div>
          </div>
          
          <div className="mb-4">
            <ScaleSVG unit={task.unit} value={task.value} />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Input
              type="number"
              step={task.unit === 'kg' ? '0.1' : '1'}
              value={task.userAnswer}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={`w-24 text-center font-bold text-lg ${
                task.isCorrect === true ? 'bg-green-50 border-green-500' :
                task.isCorrect === false ? 'bg-red-50 border-red-500' :
                ''
              }`}
              placeholder={task.unit === 'kg' ? '0.0' : '0'}
              disabled={showResults || task.isCorrect === true}
            />
            <Badge variant="outline" className="font-bold">
              {task.unit}
            </Badge>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {task.unit === 'kg' 
              ? 'อ่านเป็นกิโลกรัม (ทศนิยม 0.5 ขั้น)'
              : `อ่านเป็นกรัม (ขั้นละ ${stepG} กรัม)`
            }
          </div>
        </CardContent>
      </Card>
    );
  });

  TaskCard.displayName = 'TaskCard';

  return (
    <div className={`min-h-screen p-4 ${highContrast ? 'bg-white text-black' : 'bg-gradient-to-br from-blue-50 to-cyan-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-4 mb-6 sticky top-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">
                ⚖️ อ่านค่าน้ำหนักจากตาชั่ง
              </h1>
              <p className="text-muted-foreground">
                ดูเข็มบนหน้าปัดแล้วกรอกน้ำหนักให้ถูกต้อง – หน่วย <strong>kg</strong> หรือ <strong>g</strong> ตามกำหนด
              </p>
            </div>
            
            <Badge variant="secondary" className="text-lg px-3 py-1">
              สำเร็จ: {correctCount}/{tasks.length}
            </Badge>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex gap-2">
              <Button onClick={resetToPreset} className="bg-orange-500 hover:bg-orange-600">
                <Play className="w-4 h-4 mr-2" />
                ตามภาพ
              </Button>
              <Button onClick={resetToRandom} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                สุ่มโจทย์ใหม่
              </Button>
              <Button onClick={revealAnswers} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                เฉลย
              </Button>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <label className="text-sm font-medium">ขั้น kg:</label>
              <Input
                type="number"
                min="0.5"
                max="2"
                step="0.5"
                value={stepKg}
                onChange={(e) => setStepKg(Number(e.target.value))}
                className="w-16 h-8"
              />
              <label className="text-sm font-medium">ขั้น g:</label>
              <Input
                type="number"
                min="50"
                max="200"
                step="50"
                value={stepG}
                onChange={(e) => setStepG(Number(e.target.value))}
                className="w-16 h-8"
              />
              <Button size="sm" onClick={applySettings} variant="outline">
                <Settings className="w-4 h-4 mr-1" />
                ตั้งค่า
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-2" />
                พิมพ์
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighContrast(!highContrast)}
              >
                <Sun className="w-4 h-4 mr-2" />
                Contrast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
                เสียง: {soundEnabled ? 'เปิด' : 'ปิด'}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Modal */}
        {showResults && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">ยอดเยี่ยม!</h2>
                <p className="text-muted-foreground mb-4">อ่านค่าน้ำหนักได้ครบแล้ว</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => { setShowResults(false); resetToRandom(); }} className="bg-orange-500 hover:bg-orange-600">
                    <Trophy className="w-4 h-4 mr-2" />
                    เล่นรอบใหม่
                  </Button>
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    ปิด
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, index) => (
            <TaskCard key={index} task={task} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeighingApp;