/**
 * Money App Utilities
 * ฟังก์ชันสำหรับการสร้างและจัดการโจทย์เกี่ยวกับเงินตรา
 */

export type ProblemType = 'counting' | 'change' | 'shopping' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Coin {
  value: number;
  count: number;
  unit: 'บาท' | 'สตางค์';
}

export interface MoneyProblem {
  id: number;
  type: ProblemType;
  story: string;
  question: string;
  hint: string;
  coins: Coin[];
  correctAnswer: number;
  userAnswer: string;
  isCorrect: boolean | null;
}

// Thai currency denominations
export const COINS = {
  baht: [1, 2, 5, 10],
  satang: [25, 50]
};

export const BILLS = [20, 50, 100, 500, 1000];

// Helper to generate random integer
const randInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * สร้างโจทย์นับเงิน
 */
export const generateCountingProblem = (difficulty: Difficulty): MoneyProblem => {
  const id = Date.now() + Math.random();
  let maxAmount: number;
  let usesBills = false;
  
  if (difficulty === 'easy') {
    maxAmount = 20;
  } else if (difficulty === 'medium') {
    maxAmount = 100;
    usesBills = Math.random() > 0.5;
  } else {
    maxAmount = 500;
    usesBills = true;
  }
  
  const coins: Coin[] = [];
  let totalAmount = 0;
  
  if (usesBills) {
    // ใช้ธนบัตร
    const availableBills = BILLS.filter(b => b <= maxAmount);
    const numTypes = randInt(1, Math.min(2, availableBills.length));
    
    for (let i = 0; i < numTypes; i++) {
      const bill = availableBills[randInt(0, availableBills.length - 1)];
      const count = randInt(1, Math.floor(maxAmount / bill));
      coins.push({ value: bill, count, unit: 'บาท' });
      totalAmount += bill * count;
    }
  } else {
    // ใช้เหรียญ
    const availableCoins = COINS.baht.filter(c => c <= maxAmount);
    const numTypes = randInt(2, Math.min(3, availableCoins.length));
    
    for (let i = 0; i < numTypes; i++) {
      const coin = availableCoins[randInt(0, availableCoins.length - 1)];
      const maxCount = Math.floor((maxAmount - totalAmount) / coin);
      if (maxCount > 0) {
        const count = randInt(1, Math.min(5, maxCount));
        coins.push({ value: coin, count, unit: 'บาท' });
        totalAmount += coin * count;
      }
    }
  }
  
  const coinsDescription = coins
    .map(c => `${c.unit === 'บาท' ? (c.value >= 20 ? 'ธนบัตร' : 'เหรียญ') : 'เหรียญ'} ${c.value} ${c.unit} จำนวน ${c.count} ${c.unit === 'บาท' && c.value >= 20 ? 'ใบ' : 'เหรียญ'}`)
    .join(', ');
  
  return {
    id,
    type: 'counting',
    story: `น้องมีเงินดังนี้: ${coinsDescription}`,
    question: 'น้องมีเงินทั้งหมดกี่บาท?',
    hint: `ลองบวกทีละอย่าง: ${coins.map(c => `${c.value} × ${c.count}`).join(' + ')}`,
    coins,
    correctAnswer: totalAmount,
    userAnswer: '',
    isCorrect: null
  };
};

/**
 * สร้างโจทย์การทอนเงิน
 */
export const generateChangeProblem = (difficulty: Difficulty): MoneyProblem => {
  const id = Date.now() + Math.random();
  let priceRange: [number, number];
  let paymentRange: [number, number];
  
  if (difficulty === 'easy') {
    priceRange = [5, 15];
    paymentRange = [20, 20];
  } else if (difficulty === 'medium') {
    priceRange = [15, 45];
    paymentRange = [50, 50];
  } else {
    priceRange = [50, 450];
    paymentRange = [100, 500];
  }
  
  const price = randInt(...priceRange);
  const payment = paymentRange[0] === paymentRange[1] 
    ? paymentRange[0] 
    : randInt(...paymentRange);
  
  // ปรับ payment ให้มากกว่า price
  const adjustedPayment = payment < price ? price + randInt(20, 100) : payment;
  const change = adjustedPayment - price;
  
  const items = [
    'ของเล่น', 'ขนม', 'นม', 'ปากกา', 'สมุด', 'ดินสอ', 
    'ยางลบ', 'ไอศกรีม', 'ลูกอม', 'น้ำหวาน'
  ];
  const item = items[randInt(0, items.length - 1)];
  
  return {
    id,
    type: 'change',
    story: `น้องซื้อ${item}ราคา ${price} บาท โดยจ่ายด้วยเงิน ${adjustedPayment} บาท`,
    question: 'น้องจะได้เงินทอนกลับมากี่บาท?',
    hint: `ลองเอาเงินที่จ่ายลบด้วยราคาสินค้า: ${adjustedPayment} - ${price} = ?`,
    coins: [],
    correctAnswer: change,
    userAnswer: '',
    isCorrect: null
  };
};

/**
 * สร้างโจทย์การซื้อขาย
 */
export const generateShoppingProblem = (difficulty: Difficulty): MoneyProblem => {
  const id = Date.now() + Math.random();
  let priceRange: [number, number];
  
  if (difficulty === 'easy') {
    priceRange = [3, 10];
  } else if (difficulty === 'medium') {
    priceRange = [10, 30];
  } else {
    priceRange = [30, 100];
  }
  
  const items = [
    { name: 'ขนม', unit: 'ห่อ' },
    { name: 'ดินสอ', unit: 'แท่ง' },
    { name: 'สมุด', unit: 'เล่ม' },
    { name: 'ยางลบ', unit: 'ก้อน' },
    { name: 'ปากกา', unit: 'ด้าม' },
    { name: 'ลูกอม', unit: 'ลูก' },
    { name: 'นม', unit: 'กล่อง' },
    { name: 'น้ำหวาน', unit: 'ขวด' }
  ];
  
  const item = items[randInt(0, items.length - 1)];
  const pricePerUnit = randInt(...priceRange);
  const quantity = randInt(2, difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15);
  const totalPrice = pricePerUnit * quantity;
  
  return {
    id,
    type: 'shopping',
    story: `${item.name}ราคา ${pricePerUnit} บาทต่อ${item.unit} น้องซื้อมา ${quantity} ${item.unit}`,
    question: 'น้องต้องจ่ายเงินทั้งหมดกี่บาท?',
    hint: `ลองคูณราคาต่อหน่วยกับจำนวน: ${pricePerUnit} × ${quantity} = ?`,
    coins: [],
    correctAnswer: totalPrice,
    userAnswer: '',
    isCorrect: null
  };
};

/**
 * สร้างโจทย์แบบผสม
 */
export const generateMoneyProblems = (
  count: number,
  type: ProblemType,
  difficulty: Difficulty
): MoneyProblem[] => {
  const problems: MoneyProblem[] = [];
  
  for (let i = 0; i < count; i++) {
    let problem: MoneyProblem;
    
    if (type === 'mixed') {
      const types: Array<'counting' | 'change' | 'shopping'> = ['counting', 'change', 'shopping'];
      const randomType = types[randInt(0, types.length - 1)];
      
      switch (randomType) {
        case 'counting':
          problem = generateCountingProblem(difficulty);
          break;
        case 'change':
          problem = generateChangeProblem(difficulty);
          break;
        case 'shopping':
          problem = generateShoppingProblem(difficulty);
          break;
      }
    } else {
      switch (type) {
        case 'counting':
          problem = generateCountingProblem(difficulty);
          break;
        case 'change':
          problem = generateChangeProblem(difficulty);
          break;
        case 'shopping':
          problem = generateShoppingProblem(difficulty);
          break;
        default:
          problem = generateCountingProblem(difficulty);
      }
    }
    
    problems.push(problem);
  }
  
  return problems;
};

/**
 * ตรวจคำตอบ
 */
export const checkAnswer = (problem: MoneyProblem, answer: string): boolean => {
  const numAnswer = parseFloat(answer);
  if (isNaN(numAnswer)) return false;
  return Math.abs(numAnswer - problem.correctAnswer) < 0.01;
};

/**
 * คำนวณดาว (1-3 ดาว)
 */
export const calculateStars = (correct: number, total: number, timeMs: number): number => {
  const accuracy = correct / total;
  const timeInSeconds = timeMs / 1000;
  const avgTimePerProblem = timeInSeconds / total;
  
  if (accuracy === 1 && avgTimePerProblem < 15) return 3;
  if (accuracy >= 0.8 && avgTimePerProblem < 30) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
};

/**
 * ข้อความให้กำลังใจ
 */
export const getEncouragement = (stars: number): string => {
  if (stars === 3) return 'เก่งมาก! คุณเป็นนักคิดเลขที่ยอดเยี่ยม! 🌟';
  if (stars === 2) return 'ดีมาก! พยายามอีกนิดจะได้ 3 ดาวแน่นอน! 💫';
  if (stars === 1) return 'ดีแล้ว! ฝึกไปเรื่อยๆ จะเก่งขึ้นแน่นอน! ⭐';
  return 'ไม่เป็นไร ลองใหม่อีกครั้งนะ! 💪';
};

/**
 * แปลงเวลาเป็นรูปแบบ MM:SS
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * รับ emoji ของเหรียญ/ธนบัตร
 */
export const getCoinEmoji = (value: number, unit: string): string => {
  if (unit === 'สตางค์') return '🪙';
  if (value >= 20) return '💵';
  return '🪙';
};

/**
 * รับสีของเงิน
 */
export const getMoneyColor = (value: number, unit: string): string => {
  if (unit === 'สตางค์') return 'bg-orange-200';
  if (value >= 500) return 'bg-purple-200';
  if (value >= 100) return 'bg-red-200';
  if (value >= 50) return 'bg-blue-200';
  if (value >= 20) return 'bg-green-200';
  if (value >= 10) return 'bg-yellow-200';
  return 'bg-gray-200';
};
