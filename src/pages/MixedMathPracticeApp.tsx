import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock, Brain, Calculator, BookOpen, Lightbulb, FunctionSquare, Plus, Minus, X, Divide, RotateCcw, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface MathConfig {
  questionCount: number;
  ops: {
    add: boolean;
    sub: boolean;
    mul: boolean;
    div: boolean;
  };
  digits: number;
  operandCount: number;
  allowCarry: boolean;
}

interface Question {
  id: string;
  question: string;
  answer: number;
  symbolic: string;
  symbolicAlt?: string; // alternative form (with/without parentheses)
  hint: string;
}

const items = {
  fruit: ['ส้ม', 'แอปเปิ้ล', 'มังคุด', 'เงาะ', 'มะม่วง'],
  food: ['ขนม', 'ลูกอม', 'คุ้กกี้', 'โดนัท', 'ซาลาเปา'],
  animal: ['นก', 'ปลา', 'แมว', 'สุนัข', 'ไก่'],
  currency: 'บาท',
  people: ['เพื่อน', 'น้อง', 'พี่', 'นักเรียน'],
  container: ['ถุง', 'กล่อง', 'ตะกร้า', 'จาน']
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandItem = (category: keyof typeof items) => {
  const arr = items[category];
  if (typeof arr === 'string') return arr;
  return arr[Math.floor(Math.random() * arr.length)];
};

const hasCarry = (a: number, b: number): boolean => {
  const strA = a.toString().split('').reverse();
  const strB = b.toString().split('').reverse();
  const len = Math.max(strA.length, strB.length);
  for (let i = 0; i < len; i++) {
    const digitA = parseInt(strA[i] || '0');
    const digitB = parseInt(strB[i] || '0');
    if (digitA + digitB >= 10) return true;
  }
  return false;
};

const hasBorrow = (a: number, b: number): boolean => {
  const strA = a.toString().split('').reverse();
  const strB = b.toString().split('').reverse();
  for (let i = 0; i < strB.length; i++) {
    const digitA = parseInt(strA[i] || '0');
    const digitB = parseInt(strB[i] || '0');
    if (digitA < digitB) return true;
  }
  return false;
};

const generate2OpStory = (inputNums: number[], allowedOps: string[], allowCarry: boolean): Omit<Question, 'id'> => {
  const validOps = [...allowedOps];
  let attempts = 0;
  let selectedOp = '';
  let a = 0, b = 0, ans = 0;
  const item = getRandItem('food');

  while (attempts < 50) {
    attempts++;
    selectedOp = validOps[getRandomInt(0, validOps.length - 1)];
    a = inputNums[getRandomInt(0, inputNums.length - 1)];
    b = inputNums[getRandomInt(0, inputNums.length - 1)];

    if (selectedOp === '*') {
      a = getRandomInt(2, 12);
      b = inputNums[0];
    } else if (selectedOp === '/') {
      b = getRandomInt(2, 9);
      a = b * getRandomInt(2, 12);
    }

    if (selectedOp === '+') {
      if (!allowCarry && hasCarry(a, b)) continue;
      ans = a + b;
      break;
    } else if (selectedOp === '-') {
      if (a < b) [a, b] = [b, a];
      if (!allowCarry && hasBorrow(a, b)) continue;
      ans = a - b;
      break;
    } else if (selectedOp === '*') {
      ans = a * b;
      break;
    } else if (selectedOp === '/') {
      ans = a / b;
      break;
    }
  }

  let question = '', symbolic = '', hint = '';

  if (selectedOp === '+') {
    question = `มี${item}อยู่ ${a} ชิ้น ซื้อมาเพิ่มอีก ${b} ชิ้น รวมมี${item}ทั้งหมดกี่ชิ้น?`;
    symbolic = `${a} + ${b} = ?`;
    hint = "เพิ่มขึ้น นำมารวมกัน ใช้การ 'บวก'";
  } else if (selectedOp === '-') {
    question = `มีเงิน ${a} บาท ซื้อของไป ${b} บาท จะเหลือเงินกี่บาท?`;
    symbolic = `${a} - ${b} = ?`;
    hint = "ลดลง หรือหาของที่เหลือ ใช้การ 'ลบ'";
  } else if (selectedOp === '*') {
    const fruit = getRandItem('fruit');
    question = `จัด${fruit}ใส่ถุง ${a} ถุง ถุงละ ${b} ผล มี${fruit}ทั้งหมดกี่ผล?`;
    symbolic = `${a} × ${b} = ?`;
    hint = "เพิ่มขึ้นทีละเท่าๆ กัน ใช้การ 'คูณ'";
  } else if (selectedOp === '/') {
    question = `มีลูกอม ${a} เม็ด แบ่งให้เด็ก ${b} คน คนละเท่าๆ กัน จะได้คนละกี่เม็ด?`;
    symbolic = `${a} ÷ ${b} = ?`;
    hint = "แบ่งเท่าๆ กัน ใช้การ 'หาร'";
  }

  return { question, answer: ans, symbolic, hint };
};

const generate3OpStory = (inputNums: number[], allowedOps: string[], allowCarry: boolean): Omit<Question, 'id'> => {
  interface Template {
    ops: string[];
    gen: () => { q: string; sym: string; symAlt?: string; h: string; a: number };
  }

  const templates: Template[] = [
    // +- templates
    {
      ops: ['+', '-'],
      gen: () => {
        const a = inputNums[0], b = inputNums[1];
        let c = inputNums[2];
        const sum = a + b;
        if (c > sum) c = Math.floor(sum * 0.7);
        return {
          q: `พ่อมีเงิน ${a.toLocaleString()} บาท แม่ให้มาอีก ${b.toLocaleString()} บาท จ่ายค่าซ่อมรถไป ${c.toLocaleString()} บาท พ่อจะเหลือเงินกี่บาท?`,
          sym: `${a.toLocaleString()} + ${b.toLocaleString()} - ${c.toLocaleString()} = ?`,
          symAlt: `(${a.toLocaleString()} + ${b.toLocaleString()}) - ${c.toLocaleString()} = ?`,
          h: "นำเงินพ่อกับแม่มารวมกันก่อน แล้วลบด้วยค่าใช้จ่าย",
          a: (a + b) - c
        };
      }
    },
    {
      ops: ['+'],
      gen: () => {
        const a = inputNums[0], b = inputNums[1], c = inputNums[2];
        const item = getRandItem('fruit');
        return {
          q: `${item}อยู่ในตะกร้า 3 ใบ ใบแรกมี ${a.toLocaleString()} ผล ใบที่สองมี ${b.toLocaleString()} ผล ใบที่สามมี ${c.toLocaleString()} ผล รวม${item}ทั้งหมดกี่ผล?`,
          sym: `${a.toLocaleString()} + ${b.toLocaleString()} + ${c.toLocaleString()} = ?`,
          h: "นำทั้ง 3 จำนวนมาบวกรวมกัน",
          a: a + b + c
        };
      }
    },
    // - only
    {
      ops: ['-'],
      gen: () => {
        const a = inputNums[0] + inputNums[1] + inputNums[2];
        const b = inputNums[1], c = inputNums[2];
        return {
          q: `มีน้ำในถัง ${a.toLocaleString()} ลิตร วันแรกใช้ไป ${b.toLocaleString()} ลิตร วันที่สองใช้ไป ${c.toLocaleString()} ลิตร เหลือน้ำในถังกี่ลิตร?`,
          sym: `${a.toLocaleString()} - ${b.toLocaleString()} - ${c.toLocaleString()} = ?`,
          symAlt: `${a.toLocaleString()} - (${b.toLocaleString()} + ${c.toLocaleString()}) = ?`,
          h: "ลบปริมาณที่ใช้วันแรกออก แล้วลบวันที่สองออกอีกที",
          a: a - b - c
        };
      }
    },
    // +* templates
    {
      ops: ['+', '*'],
      gen: () => {
        const qty = getRandomInt(2, 9);
        const price = getRandomInt(10, 100);
        const baseMoney = inputNums[0];
        return {
          q: `หนูดีมีเงินเก็บ ${baseMoney.toLocaleString()} บาท ทำงานพิเศษได้เงินเพิ่ม ${qty} วัน วันละ ${price} บาท รวมหนูดีมีเงินกี่บาท?`,
          sym: `${baseMoney.toLocaleString()} + ${qty} × ${price} = ?`,
          symAlt: `${baseMoney.toLocaleString()} + (${qty} × ${price}) = ?`,
          h: "หาเงินที่หาได้เพิ่มก่อน (คูณ) แล้วนำมารวมกับเงินเก็บเดิม (บวก)",
          a: baseMoney + (qty * price)
        };
      }
    },
    // -* templates
    {
      ops: ['-', '*'],
      gen: () => {
        const qty = getRandomInt(2, 9);
        const price = getRandomInt(10, 50);
        const total = inputNums[0] + qty * price;
        return {
          q: `แม่ค้ามีเงิน ${total.toLocaleString()} บาท ซื้อของ ${qty} ชิ้น ชิ้นละ ${price} บาท แม่ค้าจะเหลือเงินกี่บาท?`,
          sym: `${total.toLocaleString()} - ${qty} × ${price} = ?`,
          symAlt: `${total.toLocaleString()} - (${qty} × ${price}) = ?`,
          h: "หาค่าของที่ซื้อก่อน (คูณ) แล้วนำไปลบออก",
          a: total - (qty * price)
        };
      }
    },
    // +/ templates
    {
      ops: ['+', '/'],
      gen: () => {
        const divisor = getRandomInt(2, 9);
        const perPerson = getRandomInt(5, 20);
        const total = divisor * perPerson;
        const extra = inputNums[0];
        return {
          q: `มีดินสอ ${total} แท่ง แบ่งให้เด็ก ${divisor} คนเท่าๆ กัน แล้วซื้อมาเพิ่มอีก ${extra.toLocaleString()} แท่ง แต่ละคนจะมีดินสอทั้งหมดกี่แท่ง?`,
          sym: `${total} ÷ ${divisor} + ${extra.toLocaleString()} = ?`,
          symAlt: `(${total} ÷ ${divisor}) + ${extra.toLocaleString()} = ?`,
          h: "แบ่งดินสอก่อน (หาร) แล้วบวกที่ซื้อเพิ่ม",
          a: (total / divisor) + extra
        };
      }
    },
    // -/ templates
    {
      ops: ['-', '/'],
      gen: () => {
        const divisor = getRandomInt(2, 9);
        const result = getRandomInt(5, 20);
        const total = divisor * result;
        const give = getRandomInt(1, result - 1);
        return {
          q: `มีคุ้กกี้ ${total} ชิ้น แบ่งให้เพื่อน ${divisor} คนเท่าๆ กัน แล้วให้น้องไปอีก ${give} ชิ้น แต่ละคนจะเหลือคุ้กกี้กี่ชิ้น?`,
          sym: `${total} ÷ ${divisor} - ${give} = ?`,
          symAlt: `(${total} ÷ ${divisor}) - ${give} = ?`,
          h: "แบ่งคุ้กกี้ก่อน (หาร) แล้วลบที่ให้น้อง",
          a: (total / divisor) - give
        };
      }
    },
    // */ templates - A × B ÷ C
    {
      ops: ['*', '/'],
      gen: () => {
        const a = getRandomInt(2, 9);
        const b = getRandomInt(2, 9);
        const c = getRandomInt(2, 5);
        const product = a * b;
        // ensure divisible
        const total = product * c;
        const fruit = getRandItem('fruit');
        return {
          q: `ซื้อ${fruit} ${a} ถุง ถุงละ ${b * c} ผล แบ่งให้เพื่อน ${c} คนเท่าๆ กัน แต่ละคนจะได้${fruit}กี่ผล?`,
          sym: `${a} × ${b * c} ÷ ${c} = ?`,
          symAlt: `(${a} × ${b * c}) ÷ ${c} = ?`,
          h: "หาจำนวนทั้งหมดก่อน (คูณ) แล้วแบ่งให้เพื่อน (หาร)",
          a: (a * b * c) / c
        };
      }
    },
    // */ templates - A ÷ B × C
    {
      ops: ['*', '/'],
      gen: () => {
        const b = getRandomInt(2, 9);
        const perPerson = getRandomInt(2, 12);
        const a = b * perPerson;
        const c = getRandomInt(2, 5);
        return {
          q: `มีลูกอม ${a} เม็ด แบ่งใส่ถุง ${b} ถุงเท่าๆ กัน แล้วนำไปขาย ${c} วัน วันละ 1 ถุง ขายลูกอมไปทั้งหมดกี่เม็ด?`,
          sym: `${a} ÷ ${b} × ${c} = ?`,
          symAlt: `(${a} ÷ ${b}) × ${c} = ?`,
          h: "หาจำนวนต่อถุงก่อน (หาร) แล้วคูณจำนวนวัน",
          a: (a / b) * c
        };
      }
    },
    // */ templates - A × B × C (pure multiply)
    {
      ops: ['*'],
      gen: () => {
        const a = getRandomInt(2, 9), b = getRandomInt(2, 9), c = getRandomInt(2, 5);
        return {
          q: `โรงเรียนมี ${a} ชั้นเรียน แต่ละชั้นมี ${b} แถว แถวละ ${c} คน มีนักเรียนทั้งหมดกี่คน?`,
          sym: `${a} × ${b} × ${c} = ?`,
          h: "คูณจำนวนชั้น จำนวนแถว และจำนวนคนต่อแถว เข้าด้วยกัน",
          a: a * b * c
        };
      }
    },
    // */ templates - A ÷ B ÷ C (pure divide)
    {
      ops: ['/'],
      gen: () => {
        const c = getRandomInt(2, 5), b = getRandomInt(2, 9);
        const a = b * c * getRandomInt(2, 9);
        return {
          q: `มีขนม ${a} ชิ้น แบ่งเป็น ${b} กลุ่ม แต่ละกลุ่มแบ่งให้เด็กอีก ${c} คน แต่ละคนจะได้ขนมกี่ชิ้น?`,
          sym: `${a} ÷ ${b} ÷ ${c} = ?`,
          h: "แบ่งเป็นกลุ่มก่อน แล้วแบ่งให้เด็กในแต่ละกลุ่มอีกที",
          a: a / b / c
        };
      }
    }
  ];

  // Filter: at least one op from template must be in allowedOps
  const available = templates.filter(t => t.ops.every(op => allowedOps.includes(op)));
  
  if (available.length === 0) {
    // Fallback: generate a simple 3-number addition/subtraction story
    const a = inputNums[0], b = inputNums[1], c = inputNums[2];
    const item = getRandItem('food');
    return {
      question: `มี${item} ${a.toLocaleString()} ชิ้น ซื้อเพิ่ม ${b.toLocaleString()} ชิ้น แล้วกินไป ${c.toLocaleString()} ชิ้น เหลือ${item}กี่ชิ้น?`,
      answer: a + b - c,
      symbolic: `${a.toLocaleString()} + ${b.toLocaleString()} - ${c.toLocaleString()} = ?`,
      symbolicAlt: `(${a.toLocaleString()} + ${b.toLocaleString()}) - ${c.toLocaleString()} = ?`,
      hint: "บวกที่ซื้อเพิ่มก่อน แล้วลบที่กินไป"
    };
  }
  
  const selected = available[Math.floor(Math.random() * available.length)];
  const res = selected.gen();
  return { question: res.q, answer: res.a, symbolic: res.sym, symbolicAlt: res.symAlt, hint: res.h };
};

const MixedMathPracticeApp = () => {
  const navigate = useNavigate();
  
  const [config, setConfig] = useState<MathConfig>({
    questionCount: 10,
    ops: { add: true, sub: true, mul: false, div: false },
    digits: 2,
    operandCount: 2,
    allowCarry: true
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedEqs, setRevealedEqs] = useState<Record<string, boolean>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateSingleQuestion = useCallback((): Question => {
    let minVal = 1, maxVal = 9;
    if (config.digits === 2) { minVal = 10; maxVal = 99; }
    else if (config.digits === 3) { minVal = 100; maxVal = 999; }
    else if (config.digits === 4) { minVal = 1000; maxVal = 30000; }

    const nums = Array.from({ length: 3 }, () => getRandomInt(minVal, maxVal));

    const allowedOps: string[] = [];
    if (config.ops.add) allowedOps.push('+');
    if (config.ops.sub) allowedOps.push('-');
    if (config.ops.mul) allowedOps.push('*');
    if (config.ops.div) allowedOps.push('/');
    if (allowedOps.length === 0) allowedOps.push('+');

    const problem = config.operandCount === 3
      ? generate3OpStory(nums, allowedOps, config.allowCarry)
      : generate2OpStory(nums, allowedOps, config.allowCarry);

    return { id: Math.random().toString(36).substr(2, 9), ...problem };
  }, [config]);

  const generateQuestions = () => {
    const newQs = Array.from({ length: config.questionCount }, () => generateSingleQuestion());
    setQuestions(newQs);
    setUserAnswers({});
    setIsChecked(false);
    setTimeElapsed(0);
    setIsPlaying(true);
    setRevealedHints({});
    setRevealedEqs({});
  };

  const toggleOp = (op: keyof MathConfig['ops']) => {
    setConfig(prev => ({ ...prev, ops: { ...prev.ops, [op]: !prev.ops[op] } }));
  };

  // Ensure at least one op active
  useEffect(() => {
    if (!Object.values(config.ops).some(v => v)) {
      setConfig(prev => ({ ...prev, ops: { ...prev.ops, add: true } }));
    }
  }, [config.ops]);

  // Timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => setTimeElapsed(p => p + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const correctCount = questions.filter(q => parseInt(userAnswers[q.id]) === q.answer).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">กลับหน้าหลัก</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 text-primary pb-2 border-b border-border">
          <BookOpen size={32} />
          <h1 className="text-2xl md:text-3xl font-bold">ฝึกฝนโจทย์ปัญหาคณิตศาสตร์</h1>
        </div>

        {/* Settings Panel */}
        <div className="bg-card rounded-3xl shadow-sm border border-border p-6 space-y-6">
          {/* Row 1: Basic Configs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">จำนวนโจทย์</label>
              <div className="flex gap-2">
                {[10, 15, 30, 40].map(n => (
                  <button key={n} onClick={() => setConfig({ ...config, questionCount: n })}
                    className={`h-10 w-14 rounded-xl font-bold transition-all border-2 
                    ${config.questionCount === n ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">จำนวนหลัก (ความยาก)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(d => (
                  <button key={d} onClick={() => setConfig({ ...config, digits: d })}
                    className={`h-10 px-4 rounded-xl font-bold transition-all border-2 
                    ${config.digits === d ? 'border-accent bg-accent text-accent-foreground' : 'border-border text-muted-foreground hover:border-accent/50'}`}>
                    {d === 4 ? '4-5 หลัก' : `${d} หลัก`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Operations & Carry */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">เครื่องหมาย</label>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => toggleOp('add')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${config.ops.add ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'border-border text-muted-foreground'}`}>
                  <Plus size={18} /> บวก
                </button>
                <button onClick={() => toggleOp('sub')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${config.ops.sub ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400' : 'border-border text-muted-foreground'}`}>
                  <Minus size={18} /> ลบ
                </button>
                <button onClick={() => toggleOp('mul')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${config.ops.mul ? 'border-purple-500 bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' : 'border-border text-muted-foreground'}`}>
                  <X size={18} /> คูณ
                </button>
                <button onClick={() => toggleOp('div')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${config.ops.div ? 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400' : 'border-border text-muted-foreground'}`}>
                  <Divide size={18} /> หาร
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">การทด / การยืม</label>
              <div className="flex bg-muted p-1 rounded-xl w-fit">
                <button onClick={() => setConfig({ ...config, allowCarry: true })}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${config.allowCarry ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}>มีทด</button>
                <button onClick={() => setConfig({ ...config, allowCarry: false })}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!config.allowCarry ? 'bg-card shadow-sm text-destructive' : 'text-muted-foreground'}`}>ไม่มีทด</button>
              </div>
            </div>
          </div>

          {/* Row 3: Operand Count & Actions */}
          <div className="border-t border-border pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">จำนวนตัวเลข:</label>
              <div className="flex gap-2">
                <button onClick={() => setConfig({ ...config, operandCount: 2 })}
                  className={`px-5 py-2 rounded-full font-bold border-2 transition-all ${config.operandCount === 2 ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border text-muted-foreground hover:border-emerald-300'}`}>
                  2 จำนวน (ปกติ)
                </button>
                <button onClick={() => setConfig({ ...config, operandCount: 3 })}
                  className={`px-5 py-2 rounded-full font-bold border-2 transition-all ${config.operandCount === 3 ? 'border-pink-500 bg-pink-500 text-white' : 'border-border text-muted-foreground hover:border-pink-300'}`}>
                  3 จำนวน (ระคน)
                </button>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={generateQuestions}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-lg font-bold text-lg transition-transform active:scale-95">
                <Brain size={24} /> สร้างโจทย์ใหม่
              </button>
              {questions.length > 0 && (
                <div className="flex gap-2">
                  <button onClick={() => { setIsChecked(true); setIsPlaying(false); }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg font-bold text-lg transition-transform active:scale-95">
                    <Check size={24} /> ตรวจคำตอบ
                  </button>
                  {isChecked && (
                    <button onClick={() => { setQuestions([]); setIsChecked(false); setTimeElapsed(0); }}
                      className="flex items-center justify-center p-3 rounded-2xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
                      <RotateCcw size={24} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timer & Score */}
        {questions.length > 0 && (
          <div className="flex justify-between items-center">
            {isChecked && (
              <div className="bg-card px-4 py-2 rounded-full border border-border font-bold text-lg shadow-sm">
                ✅ {correctCount}/{questions.length} ข้อ
              </div>
            )}
            <div className="ml-auto bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 text-primary font-mono font-bold text-xl shadow-sm">
              <Clock size={20} /> {formatTime(timeElapsed)}
            </div>
          </div>
        )}

        {/* Questions Grid */}
        {questions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
            {questions.map((q, idx) => {
              const isCorrect = parseInt(userAnswers[q.id]) === q.answer;
              const showHint = revealedHints[q.id];
              const showEq = revealedEqs[q.id];
              return (
                <div key={q.id} className="bg-card p-5 rounded-2xl border border-border shadow-sm relative group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-md">ข้อที่ {idx + 1}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setRevealedHints({ ...revealedHints, [q.id]: !showHint })} className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg"><Lightbulb size={18} /></button>
                      <button onClick={() => setRevealedEqs({ ...revealedEqs, [q.id]: !showEq })} className="p-1.5 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg"><FunctionSquare size={18} /></button>
                    </div>
                  </div>
                  <p className="text-lg text-foreground font-medium leading-relaxed mb-4">{q.question}</p>
                  {(showHint || showEq) && (
                    <div className="bg-muted rounded-lg p-3 mb-4 text-sm space-y-1">
                      {showHint && <div className="flex gap-2 text-amber-600 dark:text-amber-400"><Lightbulb size={16} className="mt-0.5 shrink-0" /> <span>{q.hint}</span></div>}
                      {showEq && <div className="flex gap-2 text-indigo-600 dark:text-indigo-400"><FunctionSquare size={16} className="mt-0.5 shrink-0" /> <span>{q.symbolic}</span></div>}
                      {showEq && q.symbolicAlt && <div className="flex gap-2 text-purple-600 dark:text-purple-400"><FunctionSquare size={16} className="mt-0.5 shrink-0" /> <span>{q.symbolicAlt}</span></div>}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-3 bg-muted p-2 rounded-xl border border-border">
                    <span className="text-sm font-bold text-muted-foreground">คำตอบ:</span>
                    <input
                      type="number"
                      disabled={isChecked}
                      value={userAnswers[q.id] || ''}
                      onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                      className={`w-32 text-center font-bold text-lg bg-card border-2 rounded-lg py-1 px-2 outline-none transition-all
                        ${isChecked
                          ? (isCorrect ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950')
                          : 'border-border focus:border-primary text-foreground'
                        }`}
                    />
                  </div>
                  {isChecked && !isCorrect && (
                    <div className="mt-2 text-right text-destructive text-sm font-bold">
                      เฉลย: {q.answer.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border text-muted-foreground">
            <Calculator size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">เลือกการตั้งค่าแล้วกด "สร้างโจทย์ใหม่" ได้เลยครับ</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MixedMathPracticeApp;
