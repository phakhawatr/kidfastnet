// Bar Model Method Utility Functions
// Singapore Math visual approach to problem solving

export type ProblemType = 'part-whole' | 'comparison' | 'before-after' | 'change';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface BarModelProblem {
  id: number;
  type: ProblemType;
  story: string;
  question: string;
  hint: string;
  bars: Bar[];
  correctAnswer: number;
  userAnswer: string;
  isCorrect: boolean | null;
}

export interface Bar {
  id: string;
  label: string;
  value: number | null; // null means unknown/to be found
  color: string;
  isTotal?: boolean; // for part-whole total bar
  parts?: BarPart[]; // for subdivided bars
}

export interface BarPart {
  id: string;
  value: number | null;
  label: string;
  color: string;
}

// Generate random integer
const randInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Color palette for bars
const colors = [
  'bg-gradient-to-r from-blue-400 to-blue-500',
  'bg-gradient-to-r from-green-400 to-green-500',
  'bg-gradient-to-r from-purple-400 to-purple-500',
  'bg-gradient-to-r from-orange-400 to-orange-500',
  'bg-gradient-to-r from-pink-400 to-pink-500',
  'bg-gradient-to-r from-teal-400 to-teal-500',
  'bg-gradient-to-r from-yellow-400 to-yellow-500',
  'bg-gradient-to-r from-red-400 to-red-500',
];

/**
 * Generate Part-Whole problems
 */
export const generatePartWholeProblem = (difficulty: Difficulty): BarModelProblem => {
  const id = Date.now() + Math.random();
  
  // Define ranges based on difficulty
  let totalRange: [number, number];
  let numParts: number;
  
  if (difficulty === 'easy') {
    totalRange = [10, 20];
    numParts = 2;
  } else if (difficulty === 'medium') {
    totalRange = [20, 50];
    numParts = Math.random() < 0.5 ? 2 : 3;
  } else {
    totalRange = [50, 100];
    numParts = randInt(2, 3);
  }
  
  const total = randInt(...totalRange);
  
  // Generate parts
  const parts: number[] = [];
  let remaining = total;
  
  for (let i = 0; i < numParts - 1; i++) {
    const part = randInt(1, remaining - (numParts - i - 1));
    parts.push(part);
    remaining -= part;
  }
  parts.push(remaining);
  
  // Randomly decide which part is missing
  const missingIndex = randInt(0, numParts - 1);
  const correctAnswer = parts[missingIndex];
  
  // Create story contexts
  const contexts = [
    {
      story: (t: number, p: number[]) => `มีลูกบอลทั้งหมด ${t} ลูก แบ่งเป็น ${numParts} กอง`,
      question: (idx: number) => `กอง${idx === 0 ? 'แรก' : idx === 1 ? 'ที่สอง' : 'ที่สาม'}มีกี่ลูก?`,
      labels: (idx: number) => `กอง ${idx + 1}`
    },
    {
      story: (t: number, p: number[]) => `น้องมีดินสอทั้งหมด ${t} แท่ง`,
      question: (idx: number) => `${idx === 0 ? 'ดินสอสีแดง' : idx === 1 ? 'ดินสอสีน้ำเงิน' : 'ดินสอสีเขียว'}มีกี่แท่ง?`,
      labels: (idx: number) => idx === 0 ? 'สีแดง' : idx === 1 ? 'สีน้ำเงิน' : 'สีเขียว'
    },
    {
      story: (t: number, p: number[]) => `พ่อซื้อผลไม้ทั้งหมด ${t} ลูก`,
      question: (idx: number) => `${idx === 0 ? 'แอปเปิ้ล' : idx === 1 ? 'ส้ม' : 'กล้วย'}มีกี่ลูก?`,
      labels: (idx: number) => idx === 0 ? 'แอปเปิ้ล' : idx === 1 ? 'ส้ม' : 'กล้วย'
    }
  ];
  
  const context = contexts[randInt(0, contexts.length - 1)];
  
  // Build story with known parts
  let storyText = context.story(total, parts);
  parts.forEach((p, i) => {
    if (i !== missingIndex) {
      storyText += ` ${context.labels(i)}มี ${p} ${i === numParts - 1 ? '' : ','}`;
    }
  });
  
  // Create bars
  const barParts: BarPart[] = parts.map((p, i) => ({
    id: `part-${i}`,
    value: i === missingIndex ? null : p,
    label: context.labels(i),
    color: colors[i % colors.length]
  }));
  
  const bars: Bar[] = [{
    id: 'total',
    label: 'รวม',
    value: total,
    color: 'bg-gradient-to-r from-indigo-400 to-indigo-500',
    isTotal: true,
    parts: barParts
  }];
  
  return {
    id,
    type: 'part-whole',
    story: storyText,
    question: context.question(missingIndex),
    hint: `ลองดูที่แท่งรวม ${total} แล้วลบส่วนที่รู้แล้วออก`,
    bars,
    correctAnswer,
    userAnswer: '',
    isCorrect: null
  };
};

/**
 * Generate Comparison problems
 */
export const generateComparisonProblem = (difficulty: Difficulty): BarModelProblem => {
  const id = Date.now() + Math.random();
  
  let baseRange: [number, number];
  let diffRange: [number, number];
  
  if (difficulty === 'easy') {
    baseRange = [5, 15];
    diffRange = [2, 5];
  } else if (difficulty === 'medium') {
    baseRange = [10, 30];
    diffRange = [3, 10];
  } else {
    baseRange = [20, 50];
    diffRange = [5, 15];
  }
  
  const base = randInt(...baseRange);
  const difference = randInt(...diffRange);
  
  // Randomly choose more or less
  const isMore = Math.random() < 0.5;
  const value1 = base;
  const value2 = isMore ? base + difference : base - difference;
  
  // Randomly decide which is given and which to find
  const findFirst = Math.random() < 0.5;
  const correctAnswer = findFirst ? value1 : value2;
  
  // Create story contexts
  const contexts = [
    {
      name1: 'แดง', name2: 'เขียว', item: 'ดินสอ', unit: 'แท่ง'
    },
    {
      name1: 'อ้อม', name2: 'แอน', item: 'สติกเกอร์', unit: 'ดวง'
    },
    {
      name1: 'ต้นไม้ A', name2: 'ต้นไม้ B', item: 'ความสูง', unit: 'เซนติเมตร'
    }
  ];
  
  const context = contexts[randInt(0, contexts.length - 1)];
  
  let story = '';
  let question = '';
  
  if (findFirst) {
    story = `${context.name2}มี${context.item} ${value2} ${context.unit} ซึ่ง${isMore ? 'น้อยกว่า' : 'มากกว่า'}${context.name1} ${difference} ${context.unit}`;
    question = `${context.name1}มี${context.item}กี่${context.unit}?`;
  } else {
    story = `${context.name1}มี${context.item} ${value1} ${context.unit} ซึ่ง${isMore ? 'มากกว่า' : 'น้อยกว่า'}${context.name2} ${difference} ${context.unit}`;
    question = `${context.name2}มี${context.item}กี่${context.unit}?`;
  }
  
  const bars: Bar[] = [
    {
      id: 'bar1',
      label: context.name1,
      value: findFirst ? null : value1,
      color: colors[0]
    },
    {
      id: 'bar2',
      label: context.name2,
      value: findFirst ? value2 : null,
      color: colors[1]
    }
  ];
  
  const hint = isMore 
    ? `ลองดู${findFirst ? context.name2 : context.name1}แล้ว${isMore ? 'บวก' : 'ลบ'}ความต่าง ${difference}`
    : `ลองดู${findFirst ? context.name2 : context.name1}แล้ว${isMore ? 'บวก' : 'ลบ'}ความต่าง ${difference}`;
  
  return {
    id,
    type: 'comparison',
    story,
    question,
    hint,
    bars,
    correctAnswer,
    userAnswer: '',
    isCorrect: null
  };
};

/**
 * Generate Before-After problems (Change over time)
 */
export const generateBeforeAfterProblem = (difficulty: Difficulty): BarModelProblem => {
  const id = Date.now() + Math.random();
  
  let beforeRange: [number, number];
  let changeRange: [number, number];
  
  if (difficulty === 'easy') {
    beforeRange = [10, 20];
    changeRange = [3, 8];
  } else if (difficulty === 'medium') {
    beforeRange = [20, 50];
    changeRange = [5, 15];
  } else {
    beforeRange = [30, 80];
    changeRange = [10, 25];
  }
  
  const before = randInt(...beforeRange);
  const change = randInt(...changeRange);
  
  // Randomly choose increase or decrease
  const isIncrease = Math.random() < 0.5;
  const after = isIncrease ? before + change : before - change;
  
  // Randomly decide what to find
  const findWhat = randInt(0, 2); // 0=before, 1=change, 2=after
  let correctAnswer: number;
  let knownBefore: number | null = null;
  let knownChange: number | null = null;
  let knownAfter: number | null = null;
  
  if (findWhat === 0) {
    correctAnswer = before;
    knownChange = change;
    knownAfter = after;
  } else if (findWhat === 1) {
    correctAnswer = change;
    knownBefore = before;
    knownAfter = after;
  } else {
    correctAnswer = after;
    knownBefore = before;
    knownChange = change;
  }
  
  // Story contexts
  const contexts = [
    {
      item: 'เงิน',
      unit: 'บาท',
      increaseAction: 'ได้รับเพิ่ม',
      decreaseAction: 'ใช้ไป',
      before: 'ตอนแรก',
      after: 'ตอนนี้',
    },
    {
      item: 'ลูกกวาด',
      unit: 'ลูก',
      increaseAction: 'ได้รับเพิ่ม',
      decreaseAction: 'กินไป',
      before: 'เมื่อเช้า',
      after: 'เย็นนี้',
    },
    {
      item: 'สติกเกอร์',
      unit: 'ดวง',
      increaseAction: 'ซื้อเพิ่ม',
      decreaseAction: 'แจกเพื่อนไป',
      before: 'เดิม',
      after: 'หลังจากนั้น',
    },
    {
      item: 'ดินสอ',
      unit: 'แท่ง',
      increaseAction: 'ซื้อเพิ่ม',
      decreaseAction: 'หายไป',
      before: 'ตอนเริ่มเทอม',
      after: 'ตอนนี้',
    },
  ];
  
  const context = contexts[randInt(0, contexts.length - 1)];
  const action = isIncrease ? context.increaseAction : context.decreaseAction;
  
  let story = '';
  let question = '';
  
  if (findWhat === 0) {
    // Find before
    story = `น้องมี${context.item} ${action} ${change} ${context.unit} ${context.after}มี ${after} ${context.unit}`;
    question = `${context.before}น้องมี${context.item}กี่${context.unit}?`;
  } else if (findWhat === 1) {
    // Find change
    story = `น้อง${context.before}มี${context.item} ${before} ${context.unit} ${context.after}มี ${after} ${context.unit}`;
    question = `น้อง${isIncrease ? 'ได้' : 'สูญเสีย'}${context.item}ไปกี่${context.unit}?`;
  } else {
    // Find after
    story = `น้อง${context.before}มี${context.item} ${before} ${context.unit} แล้ว${action} ${change} ${context.unit}`;
    question = `${context.after}น้องมี${context.item}กี่${context.unit}?`;
  }
  
  const bars: Bar[] = [
    {
      id: 'before',
      label: context.before,
      value: knownBefore,
      color: colors[0],
    },
    {
      id: 'change',
      label: isIncrease ? 'เพิ่ม' : 'ลด',
      value: knownChange,
      color: isIncrease ? colors[2] : colors[3],
    },
    {
      id: 'after',
      label: context.after,
      value: knownAfter,
      color: colors[1],
    },
  ];
  
  let hint = '';
  if (findWhat === 0) {
    hint = `${context.after} ${after} ${isIncrease ? 'ลบ' : 'บวก'} ${change} = ${context.before}`;
  } else if (findWhat === 1) {
    hint = `ลองเทียบ ${context.before} ${before} กับ ${context.after} ${after}`;
  } else {
    hint = `${context.before} ${before} ${isIncrease ? 'บวก' : 'ลบ'} ${change} = ${context.after}`;
  }
  
  return {
    id,
    type: 'before-after',
    story,
    question,
    hint,
    bars,
    correctAnswer,
    userAnswer: '',
    isCorrect: null,
  };
};

/**
 * Generate Word Problems with real-life contexts
 */
export const generateWordProblem = (difficulty: Difficulty): BarModelProblem => {
  const id = Date.now() + Math.random();
  
  let range: [number, number];
  
  if (difficulty === 'easy') {
    range = [10, 30];
  } else if (difficulty === 'medium') {
    range = [20, 60];
  } else {
    range = [40, 100];
  }
  
  // Real-life scenarios
  const scenarios = [
    {
      context: 'ซื้อของที่ร้านค้า',
      generate: () => {
        const price1 = randInt(...range);
        const price2 = randInt(...range);
        const total = price1 + price2;
        const findWhat = randInt(0, 2);
        
        if (findWhat === 0) {
          return {
            story: `แม่ซื้อผลไม้ราคา ${price1} บาท และซื้อขนมราคา ${price2} บาท`,
            question: 'ต้องจ่ายเงินทั้งหมดกี่บาท?',
            answer: total,
            bars: [
              { id: 'fruit', label: 'ผลไม้', value: price1, color: colors[0] },
              { id: 'snack', label: 'ขนม', value: price2, color: colors[1] },
            ],
            hint: `บวกราคาทั้งสอง: ${price1} + ${price2}`,
          };
        } else if (findWhat === 1) {
          return {
            story: `แม่ซื้อของทั้งหมด ${total} บาท ซื้อขนมราคา ${price2} บาท`,
            question: 'ผลไม้ราคากี่บาท?',
            answer: price1,
            bars: [
              { id: 'fruit', label: 'ผลไม้', value: null, color: colors[0] },
              { id: 'snack', label: 'ขนม', value: price2, color: colors[1] },
            ],
            hint: `ลบราคารวม ${total} ด้วยราคาขนม ${price2}`,
          };
        } else {
          return {
            story: `แม่ซื้อของทั้งหมด ${total} บาท ซื้อผลไม้ราคา ${price1} บาท`,
            question: 'ขนมราคากี่บาท?',
            answer: price2,
            bars: [
              { id: 'fruit', label: 'ผลไม้', value: price1, color: colors[0] },
              { id: 'snack', label: 'ขนม', value: null, color: colors[1] },
            ],
            hint: `ลบราคารวม ${total} ด้วยราคาผลไม้ ${price1}`,
          };
        }
      },
    },
    {
      context: 'แบ่งขนม',
      generate: () => {
        const total = randInt(...range);
        const part1 = randInt(Math.floor(total * 0.3), Math.floor(total * 0.7));
        const part2 = total - part1;
        const findWhat = randInt(0, 2);
        
        if (findWhat === 0) {
          return {
            story: `มีคุกกี้ทั้งหมด ${total} ชิ้น แบ่งให้น้องชาย ${part1} ชิ้น`,
            question: 'เหลือกี่ชิ้น?',
            answer: part2,
            bars: [
              { id: 'brother', label: 'น้องชาย', value: part1, color: colors[0] },
              { id: 'remaining', label: 'เหลือ', value: null, color: colors[1] },
            ],
            hint: `${total} - ${part1} = ?`,
          };
        } else {
          return {
            story: `แบ่งคุกกี้ให้น้องชาย ${part1} ชิ้น เหลืออีก ${part2} ชิ้น`,
            question: 'ตอนแรกมีทั้งหมดกี่ชิ้น?',
            answer: total,
            bars: [
              { id: 'brother', label: 'น้องชาย', value: part1, color: colors[0] },
              { id: 'remaining', label: 'เหลือ', value: part2, color: colors[1] },
            ],
            hint: `บวกทั้งสองส่วน: ${part1} + ${part2}`,
          };
        }
      },
    },
    {
      context: 'การเดินทาง',
      generate: () => {
        const distance1 = randInt(...range);
        const distance2 = randInt(...range);
        const total = distance1 + distance2;
        
        return {
          story: `น้องขี่จักรยานจากบ้านไปโรงเรียน ${distance1} กิโลเมตร จากโรงเรียนไปสวน ${distance2} กิโลเมตร`,
          question: 'รวมระยะทางทั้งหมดกี่กิโลเมตร?',
          answer: total,
          bars: [
            { id: 'home-school', label: 'บ้าน→โรงเรียน', value: distance1, color: colors[0] },
            { id: 'school-park', label: 'โรงเรียน→สวน', value: distance2, color: colors[1] },
          ],
          hint: `บวกระยะทาง: ${distance1} + ${distance2}`,
        };
      },
    },
  ];
  
  const scenario = scenarios[randInt(0, scenarios.length - 1)];
  const problem = scenario.generate();
  
  return {
    id,
    type: 'change',
    story: problem.story,
    question: problem.question,
    hint: problem.hint,
    bars: problem.bars as Bar[],
    correctAnswer: problem.answer,
    userAnswer: '',
    isCorrect: null,
  };
};

/**
 * Generate problems based on type and difficulty
 */
export const generateBarModelProblems = (
  count: number,
  type: ProblemType | 'mixed',
  difficulty: Difficulty
): BarModelProblem[] => {
  const problems: BarModelProblem[] = [];
  
  for (let i = 0; i < count; i++) {
    let problemType: ProblemType;
    
    if (type === 'mixed') {
      // Mix all types
      const rand = Math.random();
      if (rand < 0.25) problemType = 'part-whole';
      else if (rand < 0.5) problemType = 'comparison';
      else if (rand < 0.75) problemType = 'before-after';
      else problemType = 'change';
    } else {
      problemType = type;
    }
    
    let problem: BarModelProblem;
    
    switch (problemType) {
      case 'part-whole':
        problem = generatePartWholeProblem(difficulty);
        break;
      case 'comparison':
        problem = generateComparisonProblem(difficulty);
        break;
      case 'before-after':
        problem = generateBeforeAfterProblem(difficulty);
        break;
      case 'change':
        problem = generateWordProblem(difficulty);
        break;
      default:
        problem = generatePartWholeProblem(difficulty);
    }
    
    problems.push(problem);
  }
  
  return problems;
};

/**
 * Check if answer is correct
 */
export const checkAnswer = (problem: BarModelProblem, answer: string): boolean => {
  const answerNum = parseInt(answer);
  if (isNaN(answerNum)) return false;
  return answerNum === problem.correctAnswer;
};

/**
 * Calculate stars based on performance
 */
export const calculateStars = (correct: number, total: number, timeMs: number): number => {
  const percentage = (correct / total) * 100;
  const avgTimePerProblem = timeMs / total / 1000; // seconds
  
  if (percentage === 100 && avgTimePerProblem < 30) return 3;
  if (percentage === 100 || (percentage >= 90 && avgTimePerProblem < 45)) return 3;
  if (percentage >= 80) return 2;
  if (percentage >= 60) return 1;
  return 0;
};

/**
 * Get encouragement message
 */
export const getEncouragement = (stars: number): string => {
  switch (stars) {
    case 3: return 'สุดยอด! คุณเก่งมาก! 🌟✨';
    case 2: return 'เยี่ยมมาก! เก่งจัง! 🎉';
    case 1: return 'ดีแล้ว! พยายามต่อนะ! 💪';
    default: return 'ไม่เป็นไร! ลองใหม่นะ! 🌈';
  }
};

/**
 * Format time
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};