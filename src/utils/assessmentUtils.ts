import { curriculumConfig, SkillConfig } from '@/config/curriculum';
import { generateSubtractionProblems } from './subtractionUtils';
import { generateMoneyProblems } from './moneyUtils';

export interface AssessmentQuestion {
  id: string;
  skill: string;
  question: string;
  correctAnswer: number | string;
  choices: (number | string)[];
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  clockDisplay?: { hour: number; minute: number };
}

const randInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const generateChoices = (
  correctAnswer: number | string,
  type: 'number' | 'text' = 'number'
): (number | string)[] => {
  const choices: (number | string)[] = [correctAnswer];
  
  if (type === 'number') {
    const num = Number(correctAnswer);
    const range = Math.max(5, Math.floor(num * 0.3));
    
    let attempts = 0;
    while (choices.length < 4 && attempts < 20) {
      const offset = randInt(-range, range);
      const wrong = num + offset;
      if (wrong !== num && wrong > 0 && !choices.includes(wrong)) {
        choices.push(wrong);
      }
      attempts++;
    }
    
    // If we couldn't generate enough unique choices, add some fixed offsets
    while (choices.length < 4) {
      const offsets = [1, 2, 5, 10];
      for (const offset of offsets) {
        if (choices.length >= 4) break;
        const wrong = num + offset;
        if (!choices.includes(wrong) && wrong > 0) {
          choices.push(wrong);
        }
      }
    }
  }
  
  return shuffleArray(choices);
};

// ===== New P1 Question Generators =====

const generateCountingQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [0, 100];
  
  // ตรวจสอบระดับ: ป.4 (≥100,000 ถึงล้าน-สิบล้าน)
  const isMillion = max >= 1000000;
  const isHundredThousand = max >= 100000;
  
  let questionTypes: string[];
  if (isMillion) {
    // ป.4: จำนวนถึงล้าน-สิบล้าน
    questionTypes = ['read_number', 'write_thai', 'write_text', 'place_value_identify', 'estimate', 'ordering'];
  } else if (isHundredThousand) {
    // ป.3: จำนวนถึงแสนหมื่น
    questionTypes = ['count_by_100', 'count_by_1000', 'thai_numeral', 'place_value_identify', 'ordering'];
  } else if (max > 100) {
    // ป.2: 0-1000
    questionTypes = ['count_by_2', 'count_by_5', 'count_by_10', 'count_by_100', 'thai_numeral', 'odd_even', 'place_value_identify'];
  } else {
    // ป.1: 0-100
    questionTypes = ['count_by_1', 'count_by_10', 'thai_numeral', 'hundred_chart', 'count_backward'];
  }
  
  for (let i = 0; i < config.count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'read_number': {
        // อ่านตัวเลข (ป.4)
        const num = randInt(min, max);
        const numStr = num.toLocaleString('th-TH');
        question = `เลข ${numStr} อ่านว่าอย่างไร?`;
        
        // แปลงเป็นตัวหนังสือ
        const thaiNumbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
        const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน', 'สิบล้าน'];
        
        let text = '';
        const digits = String(num).split('').reverse();
        for (let j = digits.length - 1; j >= 0; j--) {
          const digit = parseInt(digits[j]);
          if (digit > 0) {
            if (j === 1 && digit === 1) {
              text += 'สิบ';
            } else if (j === 1 && digit === 2) {
              text += 'ยี่สิบ';
            } else if (j === 0 && digit === 1 && digits.length > 1) {
              text += 'เอ็ด';
            } else {
              text += thaiNumbers[digit] + positions[j];
            }
          }
        }
        
        correctAnswer = text;
        
        // สร้างตัวเลือกผิด
        const wrongChoices = [];
        const numPlusOne = num + 1;
        const numMinusOne = num - 1;
        
        // ตัวเลือกผิดแบบง่าย (เปลี่ยนเลขหลักสุดท้าย)
        wrongChoices.push(`${text.slice(0, -3)}สอง`);
        wrongChoices.push(`${text.slice(0, -3)}สาม`);
        wrongChoices.push(`${text.slice(0, -4)}แปด`);
        
        choices = shuffleArray([correctAnswer, ...wrongChoices.slice(0, 3)]);
        explanation = `${numStr} อ่านว่า "${text}"`;
        break;
      }
      case 'write_thai': {
        // เขียนเลขไทย (ป.4)
        const num = randInt(min, max);
        const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
        const arabicStr = String(num);
        let thaiStr = '';
        for (const digit of arabicStr) {
          thaiStr += thaiDigits[parseInt(digit)];
        }
        
        question = `เลข ${num.toLocaleString('th-TH')} เขียนเป็นเลขไทยได้ว่าอย่างไร?`;
        correctAnswer = thaiStr;
        
        // สร้างตัวเลือกผิด
        choices = [thaiStr];
        const wrongNum1 = num + 1;
        const wrongNum2 = num - 1;
        const wrongNum3 = num + 10;
        
        for (const wrong of [wrongNum1, wrongNum2, wrongNum3]) {
          let wrongThai = '';
          for (const digit of String(wrong)) {
            wrongThai += thaiDigits[parseInt(digit)];
          }
          choices.push(wrongThai);
        }
        
        choices = shuffleArray(choices).slice(0, 4);
        explanation = `${num.toLocaleString('th-TH')} เขียนเป็นเลขไทยได้เป็น ${thaiStr}`;
        break;
      }
      case 'write_text': {
        // เขียนเป็นตัวหนังสือ (ป.4)
        const nums = [1000000, 2500000, 5000000, 7500000, 10000000];
        const num = nums[i % nums.length];
        const numStr = num.toLocaleString('th-TH');
        
        const textMap: Record<number, string> = {
          1000000: 'หนึ่งล้าน',
          2500000: 'สองล้านห้าแสน',
          5000000: 'ห้าล้าน',
          7500000: 'เจ็ดล้านห้าแสน',
          10000000: 'สิบล้าน'
        };
        
        question = `"${textMap[num]}" เขียนเป็นตัวเลขได้ว่าอย่างไร?`;
        correctAnswer = numStr;
        
        choices = shuffleArray([
          numStr,
          (num + 100000).toLocaleString('th-TH'),
          (num - 100000).toLocaleString('th-TH'),
          (num * 2).toLocaleString('th-TH')
        ]);
        explanation = `${textMap[num]} เท่ากับ ${numStr}`;
        break;
      }
      case 'estimate': {
        // การประมาณค่า (ป.4)
        const num = randInt(min, max);
        const roundToNearest = num >= 1000000 ? 1000000 : 100000;
        const estimated = Math.round(num / roundToNearest) * roundToNearest;
        
        question = `ประมาณค่า ${num.toLocaleString('th-TH')} ให้ใกล้เคียงที่สุด (ปัดเป็น${roundToNearest >= 1000000 ? 'ล้าน' : 'แสน'})`;
        correctAnswer = estimated.toLocaleString('th-TH');
        
        choices = shuffleArray([
          estimated.toLocaleString('th-TH'),
          (estimated + roundToNearest).toLocaleString('th-TH'),
          (estimated - roundToNearest).toLocaleString('th-TH'),
          (Math.round(num / (roundToNearest / 10)) * (roundToNearest / 10)).toLocaleString('th-TH')
        ]);
        explanation = `${num.toLocaleString('th-TH')} ประมาณเป็น ${estimated.toLocaleString('th-TH')}`;
        break;
      }
      case 'ordering': {
        // เรียงลำดับ (ป.4)
        const nums = Array.from({ length: 4 }, () => randInt(min, max));
        const sorted = [...nums].sort((a, b) => a - b);
        
        question = `เรียงจำนวนจากน้อยไปมาก: ${nums.map(n => n.toLocaleString('th-TH')).join(', ')}`;
        correctAnswer = sorted.map(n => n.toLocaleString('th-TH')).join(', ');
        
        choices = [
          sorted.map(n => n.toLocaleString('th-TH')).join(', '),
          [...nums].sort((a, b) => b - a).map(n => n.toLocaleString('th-TH')).join(', '),
          shuffleArray(nums).map(n => n.toLocaleString('th-TH')).join(', ')
        ];
        choices = [...new Set(choices)].slice(0, 4);
        if (choices.length < 4) {
          choices.push(shuffleArray(nums).map(n => n.toLocaleString('th-TH')).join(', '));
        }
        explanation = `เรียงจากน้อยไปมาก: ${correctAnswer}`;
        break;
      }
      case 'count_by_1': {
        const start = randInt(min, max - 5);
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start + idx);
        question = `เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start + missing;
        choices = generateChoices(correctAnswer);
        explanation = `เราเริ่มนับจาก ${start} และนับเพิ่มทีละ 1 ดังนั้นลำดับที่ถูกต้องคือ ${start}, ${start+1}, ${start+2}, ${start+3}, ${start+4} คำตอบคือ ${correctAnswer}`;
        break;
      }
      case 'count_by_2': {
        const start = randInt(Math.floor(min / 2), Math.floor((max - 10) / 2) - 3) * 2;
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start + (idx * 2));
        question = `นับทีละ 2 เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 2);
        choices = generateChoices(correctAnswer);
        explanation = `เมื่อนับทีละ 2 จาก ${start} จะได้ ${start}, ${start+2}, ${start+4}, ${start+6}, ${start+8} คำตอบคือ ${correctAnswer}`;
        break;
      }
      case 'count_by_5': {
        const start = randInt(Math.floor(min / 5), Math.floor((max - 25) / 5) - 3) * 5;
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start + (idx * 5));
        question = `นับทีละ 5 เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 5);
        choices = generateChoices(correctAnswer);
        explanation = `เมื่อนับทีละ 5 จาก ${start} จะได้ ${start}, ${start+5}, ${start+10}, ${start+15}, ${start+20} คำตอบคือ ${correctAnswer}`;
        break;
      }
      case 'count_by_10': {
        const start = randInt(Math.floor(min / 10), Math.floor(max / 10) - 3) * 10;
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start + (idx * 10));
        question = `บนตารางร้อย ถ้าเริ่มที่ ${start} แล้วนับทีละ 10 จะได้: ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 10);
        choices = generateChoices(correctAnswer);
        explanation = `เมื่อนับทีละ 10 จากตารางร้อย เริ่มจาก ${start} จะได้ ${start}, ${start+10}, ${start+20}, ${start+30}, ${start+40} คำตอบคือ ${correctAnswer}`;
        break;
      }
      case 'count_by_100': {
        const maxStart = Math.floor((max - 400) / 100);
        const start = randInt(Math.floor(min / 100), Math.max(0, maxStart)) * 100;
        const missing = randInt(1, 2);
        const sequence = Array.from({ length: 4 }, (_, idx) => idx === missing ? '__' : start + (idx * 100));
        question = `นับทีละ 100 เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 100);
        choices = generateChoices(correctAnswer);
        explanation = `เมื่อนับทีละ 100 จาก ${start} จะได้ ${start}, ${start+100}, ${start+200}, ${start+300} คำตอบคือ ${correctAnswer}`;
        break;
      }
      case 'thai_numeral': {
        const num = randInt(min, Math.min(max, max > 100 ? 999 : 100));
        const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
        const thaiNum = num.toString().split('').map(d => thaiNumerals[parseInt(d)]).join('');
        question = `เลขไทย "${thaiNum}" เขียนเป็นเลขอารบิกว่าอะไร?`;
        correctAnswer = num;
        choices = generateChoices(correctAnswer);
        explanation = `เลขไทย ${thaiNum} มีค่าเท่ากับเลขอารบิก ${num}`;
        break;
      }
      case 'odd_even': {
        const nums = Array.from({ length: 4 }, () => randInt(1, Math.min(max, 100)));
        const oddNums = nums.filter(n => n % 2 === 1);
        if (oddNums.length > 0) {
          correctAnswer = oddNums[0];
          question = `ข้อใดเป็นจำนวนคี่? ${nums.join(', ')}`;
          choices = shuffleArray(nums);
          explanation = `${correctAnswer} เป็นจำนวนคี่ เพราะหารด้วย 2 ไม่ลงตัว`;
        } else {
          correctAnswer = nums[0];
          question = `ข้อใดเป็นจำนวนคู่? ${nums.join(', ')}`;
          choices = shuffleArray(nums);
          explanation = `${correctAnswer} เป็นจำนวนคู่ เพราะหารด้วย 2 ลงตัว`;
        }
        break;
      }
      case 'place_value_identify': {
        const num = randInt(100, Math.min(max, 999));
        const hundreds = Math.floor(num / 100);
        const tens = Math.floor((num % 100) / 10);
        const ones = num % 10;
        const positions = ['หลักร้อย', 'หลักสิบ', 'หลักหน่วย'];
        const position = positions[i % 3];
        
        if (position === 'หลักร้อย') {
          correctAnswer = hundreds;
          question = `เลข ${num} มี${position}เป็นเท่าไร?`;
        } else if (position === 'หลักสิบ') {
          correctAnswer = tens;
          question = `เลข ${num} มี${position}เป็นเท่าไร?`;
        } else {
          correctAnswer = ones;
          question = `เลข ${num} มี${position}เป็นเท่าไร?`;
        }
        choices = generateChoices(correctAnswer);
        explanation = `${num} = ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        break;
      }
      case 'hundred_chart': {
        const start = randInt(min, max - 30);
        const missing = randInt(1, 2);
        const sequence = Array.from({ length: 4 }, (_, idx) => idx === missing ? '__' : start + (idx * 10));
        question = `เติมจำนวนที่หายไปบนตารางร้อย (นับทีละ 10): ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 10);
        choices = generateChoices(correctAnswer);
        explanation = `บนตารางร้อย เมื่อนับทีละ 10 จาก ${start} จะได้ ${start}, ${start+10}, ${start+20}, ${start+30} คำตอบคือ ${correctAnswer}`;
        break;
      }
      case 'count_backward': {
        const start = randInt(min + 5, max);
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start - idx);
        question = `เติมจำนวนที่หายไป (นับถอยหลัง): ${sequence.join(', ')}`;
        correctAnswer = start - missing;
        choices = generateChoices(correctAnswer);
        explanation = `เมื่อนับถอยหลังจาก ${start} ลดทีละ 1 จะได้ ${start}, ${start-1}, ${start-2}, ${start-3}, ${start-4} คำตอบคือ ${correctAnswer}`;
        break;
      }
    }
    
    questions.push({
      id: `counting_${Date.now()}_${i}_${Math.random()}`,
      skill: 'counting',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateComparingQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [0, 100];
  
  const symbols = ['=', '≠', '>', '<'];
  
  for (let i = 0; i < config.count; i++) {
    const num1 = randInt(min, max);
    const num2 = randInt(min, max);
    
    const questionTypes = ['fill_symbol', 'compare_max', 'compare_min', 'true_false'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: string | number = '';
    let choices: (string | number)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'fill_symbol': {
        let correctSymbol = num1 > num2 ? '>' : num1 < num2 ? '<' : '=';
        question = `${num1} __ ${num2} (เติมเครื่องหมาย)`;
        correctAnswer = correctSymbol;
        choices = shuffleArray(['>', '<', '=', '≠']);
        explanation = num1 > num2 
          ? `${num1} มากกว่า ${num2} ดังนั้นใช้เครื่องหมาย >` 
          : num1 < num2 
          ? `${num1} น้อยกว่า ${num2} ดังนั้นใช้เครื่องหมาย <`
          : `${num1} เท่ากับ ${num2} ดังนั้นใช้เครื่องหมาย =`;
        break;
      }
      case 'compare_max': {
        // สร้างตัวเลข 4 ตัวที่ไม่ซ้ำกัน
        const nums = new Set<number>();
        nums.add(num1);
        nums.add(num2);
        while (nums.size < 4) {
          nums.add(randInt(min, max));
        }
        const numsArray = Array.from(nums);
        correctAnswer = Math.max(...numsArray);
        question = `ข้อใดมีค่ามากที่สุด? ${numsArray.join(', ')}`;
        choices = shuffleArray(numsArray);
        explanation = `เมื่อเปรียบเทียบ ${numsArray.join(', ')} จะพบว่า ${correctAnswer} มีค่ามากที่สุด`;
        break;
      }
      case 'compare_min': {
        // สร้างตัวเลข 4 ตัวที่ไม่ซ้ำกัน
        const nums = new Set<number>();
        nums.add(num1);
        nums.add(num2);
        while (nums.size < 4) {
          nums.add(randInt(min, max));
        }
        const numsArray = Array.from(nums);
        correctAnswer = Math.min(...numsArray);
        question = `ข้อใดมีค่าน้อยที่สุด? ${numsArray.join(', ')}`;
        choices = shuffleArray(numsArray);
        explanation = `เมื่อเปรียบเทียบ ${numsArray.join(', ')} จะพบว่า ${correctAnswer} มีค่าน้อยที่สุด`;
        break;
      }
      case 'true_false': {
        const symbol = symbols[randInt(0, 3)];
        let isCorrect = false;
        if (symbol === '=' && num1 === num2) isCorrect = true;
        if (symbol === '≠' && num1 !== num2) isCorrect = true;
        if (symbol === '>' && num1 > num2) isCorrect = true;
        if (symbol === '<' && num1 < num2) isCorrect = true;
        
        question = `${num1} ${symbol} ${num2} ถูกหรือผิด?`;
        correctAnswer = isCorrect ? 'ถูก' : 'ผิด';
        choices = ['ถูก', 'ผิด'];
        
        if (isCorrect) {
          explanation = `ถูกต้อง เพราะ ${num1} ${symbol} ${num2} เป็นความจริง`;
        } else {
          const correctSym = num1 > num2 ? '>' : num1 < num2 ? '<' : '=';
          explanation = `ผิด เพราะ ${num1} ${symbol} ${num2} ไม่ถูกต้อง ควรใช้ ${correctSym} แทน`;
        }
        break;
      }
    }
    
    questions.push({
      id: `comparing_${Date.now()}_${i}_${Math.random()}`,
      skill: 'comparing',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateOrderingQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [0, 100];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['order_asc', 'order_desc', 'find_position'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
    // สร้างตัวเลข 4 ตัวที่ไม่ซ้ำกัน
    const numsSet = new Set<number>();
    while (numsSet.size < 4) {
      numsSet.add(randInt(min, max));
    }
    const nums = Array.from(numsSet);
    
    switch (type) {
      case 'order_asc': {
        const sorted = [...nums].sort((a, b) => a - b);
        question = `เรียงจากน้อยไปมาก: ${nums.join(', ')}`;
        correctAnswer = sorted.join(', ');
        choices = [
          sorted.join(', '),
          [...nums].sort((a, b) => b - a).join(', '),
          shuffleArray(nums).join(', '),
          shuffleArray(nums).join(', ')
        ];
        choices = [...new Set(choices)].slice(0, 4);
        break;
      }
      case 'order_desc': {
        const sorted = [...nums].sort((a, b) => b - a);
        question = `เรียงจากมากไปน้อย: ${nums.join(', ')}`;
        correctAnswer = sorted.join(', ');
        choices = [
          sorted.join(', '),
          [...nums].sort((a, b) => a - b).join(', '),
          shuffleArray(nums).join(', '),
          shuffleArray(nums).join(', ')
        ];
        choices = [...new Set(choices)].slice(0, 4);
        break;
      }
      case 'find_position': {
        const sorted = [...nums].sort((a, b) => a - b);
        const position = randInt(1, 4);
        question = `หาอันดับที่ ${position} จากน้อยไปมาก: ${nums.join(', ')}`;
        correctAnswer = sorted[position - 1];
        choices = generateChoices(correctAnswer);
        break;
      }
    }
    
    questions.push({
      id: `ordering_${Date.now()}_${i}_${Math.random()}`,
      skill: 'ordering',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
    });
  }
  
  return questions;
};

const generatePlaceValueQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [10, 99];
  
  for (let i = 0; i < config.count; i++) {
    // ตรวจสอบจำนวนหลัก
    const isFiveDigit = max >= 10000;
    const isFourDigit = max >= 1000 && max < 10000;
    const isThreeDigit = max >= 100 && max < 1000;
    
    const num = randInt(min, max);
    
    // แยกหลักแต่ละหลัก
    const tenThousands = isFiveDigit ? Math.floor(num / 10000) : 0;
    const thousands = (isFiveDigit || isFourDigit) ? Math.floor((num % 10000) / 1000) : 0;
    const hundreds = (isFiveDigit || isFourDigit || isThreeDigit) ? Math.floor((num % 1000) / 100) : 0;
    const tens = Math.floor((num % 100) / 10);
    const ones = num % 10;
    
    let questionTypes: string[];
    if (isFiveDigit) {
      questionTypes = ['ten_thousands_place', 'thousands_place', 'hundreds_place', 'tens_place', 'ones_place', 'decompose_5digit', 'value_of_digit'];
    } else if (isFourDigit) {
      questionTypes = ['thousands_place', 'hundreds_place', 'tens_place', 'ones_place', 'decompose_4digit', 'value_of_digit'];
    } else if (isThreeDigit) {
      questionTypes = ['hundreds_place', 'tens_place', 'ones_place', 'decompose_3digit'];
    } else {
      questionTypes = ['tens_place', 'ones_place', 'decompose'];
    }
    
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'ten_thousands_place':
        question = `เลข ${num.toLocaleString()} มีหลักหมื่นเป็นเท่าไร?`;
        correctAnswer = tenThousands;
        choices = generateChoices(correctAnswer);
        explanation = `${num.toLocaleString()} = ${tenThousands} หมื่น + ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'thousands_place':
        question = `เลข ${num.toLocaleString()} มีหลักพันเป็นเท่าไร?`;
        correctAnswer = thousands;
        choices = generateChoices(correctAnswer);
        explanation = isFiveDigit 
          ? `${num.toLocaleString()} = ${tenThousands} หมื่น + ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`
          : `${num.toLocaleString()} = ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'hundreds_place':
        question = `เลข ${num.toLocaleString()} มีหลักร้อยเป็นเท่าไร?`;
        correctAnswer = hundreds;
        choices = generateChoices(correctAnswer);
        explanation = isFiveDigit
          ? `${num.toLocaleString()} = ${tenThousands} หมื่น + ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`
          : isFourDigit
          ? `${num.toLocaleString()} = ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`
          : `${num} = ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'tens_place':
        question = `เลข ${num.toLocaleString()} มีหลักสิบเป็นเท่าไร?`;
        correctAnswer = tens;
        choices = generateChoices(correctAnswer);
        explanation = isFiveDigit
          ? `${num.toLocaleString()} = ${tenThousands} หมื่น + ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`
          : isFourDigit || isThreeDigit
          ? `${num.toLocaleString()} = ${thousands > 0 ? thousands + ' พัน + ' : ''}${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`
          : `${num} = ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'ones_place':
        question = `เลข ${num.toLocaleString()} มีหลักหน่วยเป็นเท่าไร?`;
        correctAnswer = ones;
        choices = generateChoices(correctAnswer);
        explanation = isFiveDigit
          ? `${num.toLocaleString()} = ${tenThousands} หมื่น + ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`
          : `หลักหน่วยคือตัวเลขสุดท้าย = ${ones}`;
        break;
      case 'decompose_5digit':
        question = `${num.toLocaleString()} = __ หมื่น + ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        correctAnswer = tenThousands;
        choices = generateChoices(correctAnswer);
        explanation = `${num.toLocaleString()} = ${tenThousands} หมื่น + ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'decompose_4digit':
        question = `${num.toLocaleString()} = __ พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        correctAnswer = thousands;
        choices = generateChoices(correctAnswer);
        explanation = `${num.toLocaleString()} = ${thousands} พัน + ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'decompose_3digit':
        question = `${num} = __ ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        correctAnswer = hundreds;
        choices = generateChoices(correctAnswer);
        explanation = `${num} = ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'decompose':
        question = `${num} = __ สิบ + ${ones} หน่วย`;
        correctAnswer = tens;
        choices = generateChoices(correctAnswer);
        explanation = `${num} = ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'value_of_digit': {
        // ค่าประจำหลัก เช่น เลข 4 ในตำแหน่งพันมีค่าเป็น 4,000
        const digitPosition = isFiveDigit ? randInt(0, 4) : randInt(0, 3);
        let digitValue = 0;
        let positionName = '';
        let actualValue = 0;
        
        if (digitPosition === 0) {
          digitValue = ones;
          positionName = 'หน่วย';
          actualValue = ones;
        } else if (digitPosition === 1) {
          digitValue = tens;
          positionName = 'สิบ';
          actualValue = tens * 10;
        } else if (digitPosition === 2) {
          digitValue = hundreds;
          positionName = 'ร้อย';
          actualValue = hundreds * 100;
        } else if (digitPosition === 3) {
          digitValue = thousands;
          positionName = 'พัน';
          actualValue = thousands * 1000;
        } else {
          digitValue = tenThousands;
          positionName = 'หมื่น';
          actualValue = tenThousands * 10000;
        }
        
        question = `เลข ${digitValue} ในหลัก${positionName}ของจำนวน ${num.toLocaleString()} มีค่าเท่าไร?`;
        correctAnswer = actualValue;
        choices = generateChoices(actualValue);
        explanation = `เลข ${digitValue} อยู่ในหลัก${positionName} มีค่าเป็น ${actualValue.toLocaleString()}`;
        break;
      }
    }
    
    questions.push({
      id: `placeValue_${Date.now()}_${i}_${Math.random()}`,
      skill: 'placeValue',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generatePatternsQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  // Use colored shapes for patterns
  const coloredShapes = [
    'triangle-red', 'triangle-blue', 'triangle-green',
    'square-red', 'square-blue', 'square-green',
    'circle-red', 'circle-blue', 'circle-green',
    'triangle-orange', 'square-yellow', 'circle-sky'
  ];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['hundred_chart_add_10', 'hundred_chart_subtract_10', 'geometric_pattern', 'shape_pattern'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
    switch (type) {
      case 'hundred_chart_add_10': {
        const start = randInt(21, 60);
        const missing = randInt(1, 2);
        const sequence = Array.from({ length: 4 }, (_, idx) => idx === missing ? '__' : start + (idx * 10));
        question = `เติมจำนวนที่หายไปบนตารางร้อย (เพิ่มทีละ 10): ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 10);
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'hundred_chart_subtract_10': {
        const start = randInt(50, 90);
        const missing = randInt(1, 2);
        const sequence = Array.from({ length: 4 }, (_, idx) => idx === missing ? '__' : start - (idx * 10));
        question = `เติมจำนวนที่หายไป (ลดทีละ 10): ${sequence.join(', ')}`;
        correctAnswer = start - (missing * 10);
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'geometric_pattern': {
        // Use vivid colored shapes
        const patterns = [
          { seq: ['triangle-red', 'square-blue', 'circle-green'], correct: 'triangle-red' },
          { seq: ['square-orange', 'triangle-blue', 'square-orange'], correct: 'triangle-blue' },
          { seq: ['circle-red', 'triangle-yellow', 'square-sky'], correct: 'circle-red' },
          { seq: ['triangle-green', 'triangle-green', 'square-red'], correct: 'triangle-green' }
        ];
        const pattern = patterns[i % patterns.length];
        const fullSeq = [...pattern.seq, ...pattern.seq, '__'];
        question = `รูปใดมาต่อในแบบรูปซ้ำ? [shapes:${fullSeq.slice(0, -1).join(',')}]`;
        correctAnswer = pattern.correct;
        
        // Create 4 different shape choices
        choices = shuffleArray([
          pattern.correct,
          ...coloredShapes.filter(s => s !== pattern.correct).slice(0, 3)
        ]);
        break;
      }
      case 'shape_pattern': {
        // Use vivid colored shapes
        const patterns = [
          { seq: ['triangle-red', 'square-blue'], correct: 'triangle-red' },
          { seq: ['circle-green', 'triangle-orange', 'circle-green'], correct: 'triangle-orange' },
          { seq: ['square-yellow', 'circle-red'], correct: 'square-yellow' }
        ];
        const pattern = patterns[i % patterns.length];
        const fullSeq = [...pattern.seq, ...pattern.seq, '__'];
        question = `สร้างแบบรูปซ้ำต่อไป: [shapes:${fullSeq.slice(0, -1).join(',')}]`;
        correctAnswer = pattern.correct;
        
        // Create 4 different shape choices
        choices = shuffleArray([
          pattern.correct,
          ...coloredShapes.filter(s => s !== pattern.correct).slice(0, 3)
        ]);
        break;
      }
    }
    
    questions.push({
      id: `patterns_${Date.now()}_${i}_${Math.random()}`,
      skill: 'patterns',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
    });
  }
  
  return questions;
};

const generateShapesQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  // ตรวจสอบว่าควรเน้นรูป 2 มิติหรือ 3 มิติจาก description
  const focus2D = config.description?.includes('สองมิติ') || config.description?.includes('2 มิติ');
  const focusSymmetry = config.description?.includes('สมมาตร');
  
  // Updated shapes with color variants for better visibility
  const coloredShapes = [
    'triangle-red', 'triangle-blue', 'triangle-green', 
    'square-red', 'square-blue', 'square-green',
    'circle-red', 'circle-blue', 'circle-green'
  ];
  
  // รูป 2 มิติ
  const shapes2D = [
    { name: 'สามเหลี่ยม', emoji: '🔺', sides: 3, symmetryLines: 1 },
    { name: 'สี่เหลี่ยมจัตุรัส', emoji: '🟦', sides: 4, symmetryLines: 4 },
    { name: 'สี่เหลี่ยมผืนผ้า', emoji: '▭', sides: 4, symmetryLines: 2 },
    { name: 'วงกลม', emoji: '⭕', sides: 0, symmetryLines: 'infinite' },
    { name: 'วงรี', emoji: '⬭', sides: 0, symmetryLines: 2 }
  ];
  
  const shapes3D = [
    { name: 'ทรงกลม', emoji: '⚽' },
    { name: 'ทรงกระบอก', emoji: '🥫' },
    { name: 'กรวย', emoji: '🚧' },
    { name: 'ทรงสี่เหลี่ยมมุมฉาก', emoji: '📦' }
  ];
  
  const realWorldObjects = [
    { name: 'ลูกฟุตบอล', emoji: '⚽', shape: 'ทรงกลม' },
    { name: 'กล่องนม', emoji: '📦', shape: 'ทรงสี่เหลี่ยมมุมฉาก' },
    { name: 'กรวยจราจร', emoji: '🚧', shape: 'กรวย' },
    { name: 'กระป๋อง', emoji: '🥫', shape: 'ทรงกระบอก' }
  ];
  
  for (let i = 0; i < config.count; i++) {
    let questionTypes: string[];
    
    if (focusSymmetry) {
      // ป.3 - ความสมมาตร
      questionTypes = ['identify_symmetry', 'count_symmetry_lines', 'has_symmetry', 'create_symmetric'];
    } else if (focus2D) {
      // ป.2 - รูป 2 มิติพื้นฐาน
      questionTypes = ['identify_2d', 'describe_2d', 'count_sides', 'draw_pattern_2d'];
    } else {
      // ป.1 - รูป 3 มิติและแบบรูป
      questionTypes = ['real_world_connection', 'count_shapes', 'pattern_creation', 'identify_3d'];
    }
    
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: string | number = '';
    let choices: (string | number)[] = [];
    let explanation = '';
    
    switch (type) {
      // ป.3 - ความสมมาตร
      case 'identify_symmetry': {
        const shapeMarkers: Record<string, string> = {
          'สามเหลี่ยม': 'triangle-red',
          'สี่เหลี่ยมจัตุรัส': 'square-blue',
          'สี่เหลี่ยมผืนผ้า': 'square-green',
          'วงกลม': 'circle-red',
          'วงรี': 'circle-orange'
        };
        
        const shape = shapes2D[i % (shapes2D.length - 1)]; // ไม่รวมวงรี
        const marker = shapeMarkers[shape.name] || 'square-blue';
        question = `[${marker}] รูปนี้มีแกนสมมาตรหรือไม่?`;
        correctAnswer = 'มี';
        choices = shuffleArray(['มี', 'ไม่มี']);
        explanation = `${shape.name}มีแกนสมมาตร สามารถพับครึ่งให้ทับกันพอดีได้`;
        break;
      }
      case 'count_symmetry_lines': {
        const shapesWithSymmetry = [
          { name: 'สามเหลี่ยมด้านเท่า', lines: 3 },
          { name: 'สี่เหลี่ยมจัตุรัส', lines: 4 },
          { name: 'สี่เหลี่ยมผืนผ้า', lines: 2 },
          { name: 'วงกลม', lines: 'มากมาย' }
        ];
        const shape = shapesWithSymmetry[i % shapesWithSymmetry.length];
        
        if (shape.lines === 'มากมาย') {
          question = `${shape.name}มีแกนสมมาตรกี่เส้น?`;
          correctAnswer = 'มากมาย';
          choices = shuffleArray(['มากมาย', '4', '2', '1']);
          explanation = `${shape.name}มีแกนสมมาตรมากมาย (ไม่จำกัด) เพราะสามารถพับผ่านจุดศูนย์กลางทุกทิศทางแล้วทับกันพอดี`;
        } else {
          question = `${shape.name}มีแกนสมมาตรกี่เส้น?`;
          correctAnswer = shape.lines;
          choices = generateChoices(shape.lines as number);
          explanation = `${shape.name}มีแกนสมมาตร ${shape.lines} เส้น`;
        }
        break;
      }
      case 'has_symmetry': {
        const items = [
          { name: 'หัวใจ', hasSym: true, lines: 1 },
          { name: 'ผีเสื้อ', hasSym: true, lines: 1 },
          { name: 'ใบไม้ทั่วไป', hasSym: true, lines: 1 },
          { name: 'ดาว 5 แฉก', hasSym: true, lines: 5 }
        ];
        const item = items[i % items.length];
        question = `รูป${item.name}มีแกนสมมาตรหรือไม่?`;
        correctAnswer = item.hasSym ? 'มี' : 'ไม่มี';
        choices = shuffleArray(['มี', 'ไม่มี']);
        explanation = item.hasSym 
          ? `รูป${item.name}มีแกนสมมาตร ${item.lines} เส้น` 
          : `รูป${item.name}ไม่มีแกนสมมาตร`;
        break;
      }
      case 'create_symmetric': {
        question = `ถ้าพับกระดาษตามแกนสมมาตร แล้วตัดรูปออก เมื่อกางออกจะได้รูปแบบใด?`;
        correctAnswer = 'รูปที่สมมาตรเหมือนกันทั้งสองข้าง';
        choices = shuffleArray([
          'รูปที่สมมาตรเหมือนกันทั้งสองข้าง',
          'รูปที่ไม่เท่ากัน',
          'รูปครึ่งเดียว',
          'รูปที่หงายกัน'
        ]);
        explanation = 'เมื่อพับตามแกนสมมาตรแล้วตัดรูป เมื่อกางออกจะได้รูปที่สมมาตรทั้งสองข้าง';
        break;
      }
      // ป.2 เทอม 2 - รูป 2 มิติ
      case 'identify_2d': {
        const shape = shapes2D[i % shapes2D.length];
        // แปลงชื่อรูปเป็น marker สำหรับแสดงรูปทรง
        const shapeMarkers: Record<string, string> = {
          'สามเหลี่ยม': 'triangle-red',
          'สี่เหลี่ยมจัตุรัส': 'square-blue',
          'สี่เหลี่ยมผืนผ้า': 'square-green',
          'วงกลม': 'circle-red',
          'วงรี': 'circle-orange' // ใช้สีส้มสำหรับวงรี
        };
        const marker = shapeMarkers[shape.name] || 'circle-blue';
        question = `[${marker}] เป็นรูปอะไร?`;
        correctAnswer = shape.name;
        choices = shuffleArray(shapes2D.map(s => s.name).slice(0, 4));
        explanation = `[${marker}] เป็น${shape.name}`;
        break;
      }
      case 'describe_2d': {
        const shape = shapes2D[i % 3]; // เน้น สามเหลี่ยม, สี่เหลี่ยม, วงกลม
        if (shape.sides > 0) {
          question = `${shape.name}มีกี่ด้าน?`;
          correctAnswer = shape.sides;
          choices = generateChoices(shape.sides);
          explanation = `${shape.name}มี ${shape.sides} ด้าน`;
        } else if (shape.name === 'วงกลม') {
          question = `${shape.name}มีมุมหรือไม่?`;
          correctAnswer = 'ไม่มี';
          choices = ['มี', 'ไม่มี'];
          explanation = `${shape.name}ไม่มีมุม เป็นเส้นโค้งรอบวง`;
        } else {
          question = `รูป${shape.name}มีลักษณะอย่างไร?`;
          correctAnswer = 'เป็นวงรีที่ยาวกว่ากลม';
          choices = shuffleArray([
            'เป็นวงรีที่ยาวกว่ากลม',
            'เป็นวงกลมสมบูรณ์',
            'มี 4 ด้าน',
            'มีมุมแหลม'
          ]);
          explanation = 'วงรีเป็นรูปที่คล้ายวงกลมแต่ยาวกว่า';
        }
        break;
      }
      case 'count_sides': {
        const shapes = [shapes2D[0], shapes2D[1]]; // สามเหลี่ยมและสี่เหลี่ยม
        const shape = shapes[i % 2];
        question = `นับด้านของรูป${shape.name}`;
        correctAnswer = shape.sides;
        choices = generateChoices(shape.sides);
        explanation = `${shape.name}มี ${shape.sides} ด้าน`;
        break;
      }
      case 'draw_pattern_2d': {
        question = `รูปใดเป็นรูปสี่เหลี่ยมจัตุรัส?`;
        correctAnswer = 'รูปที่มี 4 ด้านเท่ากัน';
        choices = shuffleArray([
          'รูปที่มี 4 ด้านเท่ากัน',
          'รูปที่มี 3 ด้าน',
          'รูปวงกลม',
          'รูปที่มี 4 ด้านไม่เท่ากัน'
        ]);
        explanation = 'สี่เหลี่ยมจัตุรัสมี 4 ด้านเท่ากันทุกด้าน';
        break;
      }
      // ป.1 - รูป 3 มิติและแบบรูป
      case 'real_world_connection': {
        const obj = realWorldObjects[i % realWorldObjects.length];
        question = `${obj.emoji} ${obj.name} เป็นรูปทรงอะไร?`;
        correctAnswer = obj.shape;
        choices = shuffleArray(shapes3D.map(s => s.name));
        explanation = `${obj.name}เป็น${obj.shape}`;
        break;
      }
      case 'count_shapes': {
        // Use colored shapes for counting
        const colors = ['red', 'blue', 'green', 'orange', 'yellow', 'sky'];
        const baseShapes = ['triangle', 'square', 'circle'];
        const shapeToCount = `${baseShapes[i % 3]}-${colors[i % colors.length]}`;
        const count = randInt(3, 6);
        
        // Create other shapes (different types and colors)
        const otherShapes = coloredShapes.filter(s => s !== shapeToCount);
        const sequence = Array.from({ length: count + 2 }, (_, idx) => 
          idx < count ? shapeToCount : otherShapes[randInt(0, otherShapes.length - 1)]
        );
        shuffleArray(sequence);
        question = `ในรูปนี้มี [${shapeToCount}] กี่รูป? [shapes:${sequence.join(',')}]`;
        correctAnswer = count;
        choices = generateChoices(count);
        explanation = `นับรูป [${shapeToCount}] ได้ ${count} รูป`;
        break;
      }
      case 'pattern_creation': {
        // Create patterns with vivid colored shapes - ensuring variety
        const patternOptions = [
          { seq: ['triangle-red', 'square-blue'], correct: 'triangle-red' },
          { seq: ['circle-green', 'triangle-orange'], correct: 'circle-green' },
          { seq: ['square-yellow', 'circle-sky'], correct: 'square-yellow' },
          { seq: ['triangle-blue', 'square-red', 'circle-green'], correct: 'triangle-blue' },
          { seq: ['circle-orange', 'square-yellow', 'triangle-sky'], correct: 'circle-orange' }
        ];
        const pattern = patternOptions[i % patternOptions.length];
        const display = [...pattern.seq, ...pattern.seq];
        question = `ถ้าใช้ [shapes:${display.join(',')}] มาต่อกัน รูปถัดไปคือ?`;
        correctAnswer = pattern.correct;
        
        // Create choices with different shapes
        choices = shuffleArray([
          pattern.correct,
          ...coloredShapes.filter(s => s !== pattern.correct).slice(0, 3)
        ]);
        explanation = `แบบรูปซ้ำคือ ${pattern.seq.join(', ')} ดังนั้นรูปถัดไปคือ ${pattern.correct}`;
        break;
      }
      case 'identify_3d': {
        const shape = shapes3D[i % shapes3D.length];
        question = `${shape.emoji} เป็นรูปทรงอะไร?`;
        correctAnswer = shape.name;
        choices = shuffleArray(shapes3D.map(s => s.name));
        explanation = `${shape.emoji} เป็น${shape.name}`;
        break;
      }
    }
    
    questions.push({
      id: `shapes_${Date.now()}_${i}_${Math.random()}`,
      skill: 'shapes',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateMeasurementQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  // ตรวจสอบว่าเป็น ป.3 (มม.-ซม.-ม.-กม.) หรือ ป.1-2 (ซม.-ม.)
  const isAdvanced = config.description?.includes('มม.') || config.description?.includes('กม.') || config.difficulty === 'medium';
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = isAdvanced 
      ? ['unit_conversion', 'choose_unit', 'choose_tool', 'add_length', 'subtract_length', 'multiply_divide_length', 'word_problem']
      : ['length_add_word_problem', 'length_subtract_word_problem', 'estimate_length'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'unit_conversion': {
        // แปลงหน่วยความยาว (ป.3)
        const conversionTypes = [
          { from: 'มม.', to: 'ซม.', factor: 10, type: 'divide' },
          { from: 'ซม.', to: 'มม.', factor: 10, type: 'multiply' },
          { from: 'ซม.', to: 'ม.', factor: 100, type: 'divide' },
          { from: 'ม.', to: 'ซม.', factor: 100, type: 'multiply' },
          { from: 'ม.', to: 'กม.', factor: 1000, type: 'divide' },
          { from: 'กม.', to: 'ม.', factor: 1000, type: 'multiply' }
        ];
        const conversion = conversionTypes[i % conversionTypes.length];
        
        if (conversion.type === 'multiply') {
          const value = randInt(2, 10);
          correctAnswer = value * conversion.factor;
          question = `${value} ${conversion.from} เท่ากับกี่${conversion.to}?`;
          choices = generateChoices(correctAnswer);
          explanation = `1 ${conversion.from} = ${conversion.factor} ${conversion.to} ดังนั้น ${value} ${conversion.from} = ${value} × ${conversion.factor} = ${correctAnswer} ${conversion.to}`;
        } else {
          const value = randInt(2, 10) * conversion.factor;
          correctAnswer = value / conversion.factor;
          question = `${value} ${conversion.from} เท่ากับกี่${conversion.to}?`;
          choices = generateChoices(correctAnswer);
          explanation = `${conversion.factor} ${conversion.from} = 1 ${conversion.to} ดังนั้น ${value} ${conversion.from} = ${value} ÷ ${conversion.factor} = ${correctAnswer} ${conversion.to}`;
        }
        break;
      }
      case 'choose_unit': {
        // เลือกหน่วยที่เหมาะสม (ป.3)
        const objects = [
          { name: 'หนอนตัวเล็ก', unit: 'มิลลิเมตร' },
          { name: 'ดินสอ', unit: 'เซนติเมตร' },
          { name: 'ห้องเรียน', unit: 'เมตร' },
          { name: 'ระยะทางจากกรุงเทพฯ ไปเชียงใหม่', unit: 'กิโลเมตร' }
        ];
        const obj = objects[i % objects.length];
        question = `ควรใช้หน่วยใดวัดความยาว${obj.name}?`;
        correctAnswer = obj.unit;
        choices = shuffleArray(['มิลลิเมตร', 'เซนติเมตร', 'เมตร', 'กิโลเมตร']);
        explanation = `${obj.name}เหมาะสมที่จะวัดด้วย${obj.unit}`;
        break;
      }
      case 'choose_tool': {
        // เลือกเครื่องมือที่เหมาะสม (ป.3)
        const tools = [
          { object: 'โต๊ะเรียน', tool: 'ไม้บรรทัด/เมตร', reason: 'วัดความยาวประมาณ 1-2 เมตร' },
          { object: 'สนามฟุตบอล', tool: 'เทปวัดระยะยาว', reason: 'วัดระยะทางไกล' },
          { object: 'ความหนาของหนังสือ', tool: 'ไม้บรรทัด', reason: 'วัดความยาวสั้น ๆ' }
        ];
        const tool = tools[i % tools.length];
        question = `ควรใช้เครื่องมือใดวัดความยาวของ${tool.object}?`;
        correctAnswer = tool.tool;
        choices = shuffleArray(['ไม้บรรทัด/เมตร', 'เทปวัดระยะยาว', 'ไม้บรรทัด']);
        explanation = `${tool.object}${tool.reason} จึงควรใช้${tool.tool}`;
        break;
      }
      case 'add_length': {
        // บวกความยาว (ป.3)
        const unit = ['ซม.', 'ม.'][i % 2];
        const a = randInt(10, 100);
        const b = randInt(10, 100);
        correctAnswer = a + b;
        question = `เชือกเส้นแรกยาว ${a} ${unit} เชือกเส้นที่สองยาว ${b} ${unit} เชือกทั้งสองเส้นยาวรวมกัน ${correctAnswer} ${unit}`;
        choices = generateChoices(correctAnswer);
        explanation = `${a} + ${b} = ${correctAnswer} ${unit}`;
        break;
      }
      case 'subtract_length': {
        // ลบความยาว (ป.3)
        const unit = ['ซม.', 'ม.'][i % 2];
        const a = randInt(50, 200);
        const b = randInt(10, a - 10);
        correctAnswer = a - b;
        question = `เชือกยาว ${a} ${unit} ตัดไป ${b} ${unit} เหลือยาวกี่${unit}?`;
        choices = generateChoices(correctAnswer);
        explanation = `${a} - ${b} = ${correctAnswer} ${unit}`;
        break;
      }
      case 'multiply_divide_length': {
        // คูณ-หารความยาว (ป.3)
        const operationType = i % 2;
        if (operationType === 0) {
          // คูณ
          const length = randInt(5, 20);
          const times = randInt(2, 5);
          correctAnswer = length * times;
          question = `ไม้เส้นหนึ่งยาว ${length} ซม. ถ้ามี ${times} เส้น ยาวรวมกัน ${correctAnswer} ซม.?`;
          choices = generateChoices(correctAnswer);
          explanation = `${length} × ${times} = ${correctAnswer} ซม.`;
        } else {
          // หาร
          const total = randInt(20, 100);
          const parts = randInt(2, 5);
          correctAnswer = Math.floor(total / parts);
          question = `เชือกยาว ${total} ซม. ตัดเป็น ${parts} ส่วนเท่า ๆ กัน ส่วนละกี่ซม.?`;
          choices = generateChoices(correctAnswer);
          explanation = `${total} ÷ ${parts} = ${correctAnswer} ซม.`;
        }
        break;
      }
      case 'word_problem': {
        // โจทย์ปัญหาความยาว (ป.3)
        const a = randInt(20, 100);
        const b = randInt(10, 50);
        const operation = i % 2;
        if (operation === 0) {
          correctAnswer = a + b;
          question = `แมวเดินไป ${a} ซม. แล้วเดินต่ออีก ${b} ซม. แมวเดินทั้งหมดกี่ซม.?`;
          explanation = `${a} + ${b} = ${correctAnswer} ซม.`;
        } else {
          correctAnswer = a - b;
          question = `เส้นเชือกยาว ${a} ซม. ใช้ไป ${b} ซม. เหลือกี่ซม.?`;
          explanation = `${a} - ${b} = ${correctAnswer} ซม.`;
        }
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'length_add_word_problem': {
        const len1 = randInt(20, 50);
        const len2 = randInt(15, 40);
        question = `เชือกเส้นแรกยาว ${len1} เซนติเมตร เส้นที่สองยาว ${len2} เซนติเมตร รวมกันยาวกี่เซนติเมตร?`;
        correctAnswer = len1 + len2;
        choices = generateChoices(correctAnswer);
        explanation = `${len1} + ${len2} = ${correctAnswer} เซนติเมตร`;
        break;
      }
      case 'length_subtract_word_problem': {
        const total = randInt(60, 100);
        const cut = randInt(20, 50);
        question = `เชือกยาว ${total} เซนติเมตร ตัดไป ${cut} เซนติเมตร เหลือกี่เซนติเมตร?`;
        correctAnswer = total - cut;
        choices = generateChoices(correctAnswer);
        explanation = `${total} - ${cut} = ${correctAnswer} เซนติเมตร`;
        break;
      }
      case 'estimate_length': {
        const objects = [
          { name: 'ปากกา', length: 15 },
          { name: 'ดินสอ', length: 18 },
          { name: 'ไม้บรรทัด', length: 30 }
        ];
        const obj = objects[i % objects.length];
        question = `ความยาวของ${obj.name}ประมาณเท่าไหร่?`;
        correctAnswer = `${obj.length} ซม.`;
        choices = [`${obj.length - 10} ซม.`, `${obj.length} ซม.`, `${obj.length + 20} ซม.`, `${obj.length + 50} ซม.`];
        explanation = `${obj.name}มีความยาวประมาณ ${obj.length} ซม.`;
        break;
      }
    }
    
    questions.push({
      id: `measurement_${Date.now()}_${i}_${Math.random()}`,
      skill: 'measurement',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generatePictographQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['count_scale_2', 'count_scale_5', 'count_scale_10', 'find_max', 'count_total'];
    const type = questionTypes[i % questionTypes.length];
    
    // กำหนดสเกล (1 รูปแทนกี่หน่วย)
    let scale = 1;
    if (type === 'count_scale_2') scale = 2;
    else if (type === 'count_scale_5') scale = 5;
    else if (type === 'count_scale_10') scale = 10;
    else scale = [2, 5, 10][i % 3]; // สำหรับ type อื่นๆ สุ่มสเกล
    
    const data = [
      { name: 'แอปเปิล', emoji: '🍎', pictures: randInt(2, 6) },
      { name: 'กล้วย', emoji: '🍌', pictures: randInt(2, 6) },
      { name: 'ส้ม', emoji: '🍊', pictures: randInt(2, 6) }
    ];
    
    // คำนวณจำนวนจริง (pictures × scale)
    const dataWithActual = data.map(d => ({
      ...d,
      actualCount: d.pictures * scale
    }));
    
    const chart = dataWithActual.map(d => 
      `${d.name}: ${d.emoji.repeat(d.pictures)} (${d.pictures} รูป)`
    ).join('\n');
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'count_scale_2':
      case 'count_scale_5':
      case 'count_scale_10': {
        const item = dataWithActual[i % dataWithActual.length];
        question = `แผนภูมิผลไม้ (1 รูป = ${scale} หน่วย):\n${chart}\n\nมี${item.name}กี่ผล?`;
        correctAnswer = item.actualCount;
        choices = generateChoices(correctAnswer);
        explanation = `${item.name} มี ${item.pictures} รูป × ${scale} = ${item.actualCount} ผล`;
        break;
      }
      case 'find_max': {
        const maxItem = dataWithActual.reduce((max, item) => 
          item.actualCount > max.actualCount ? item : max
        );
        question = `แผนภูมิผลไม้ (1 รูป = ${scale} หน่วย):\n${chart}\n\nผลไม้ใดมีมากที่สุด?`;
        correctAnswer = maxItem.name;
        choices = dataWithActual.map(d => d.name);
        explanation = `${maxItem.name} มี ${maxItem.pictures} รูป × ${scale} = ${maxItem.actualCount} ผล ซึ่งมากที่สุด`;
        break;
      }
      case 'count_total': {
        const total = dataWithActual.reduce((sum, item) => sum + item.actualCount, 0);
        question = `แผนภูมิผลไม้ (1 รูป = ${scale} หน่วย):\n${chart}\n\nรวมทั้งหมดกี่ผล?`;
        correctAnswer = total;
        choices = generateChoices(correctAnswer);
        const totalPictures = dataWithActual.reduce((sum, item) => sum + item.pictures, 0);
        explanation = `รวม ${totalPictures} รูป × ${scale} = ${total} ผล`;
        break;
      }
    }
    
    questions.push({
      id: `pictograph_${Date.now()}_${i}_${Math.random()}`,
      skill: 'pictograph',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

// ===== Updated Addition Questions =====

const generateAdditionQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [0, 10];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['two_digit_plus_one_digit', 'two_digit_plus_two_digit', 'find_unknown', 'relationship', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'two_digit_plus_one_digit': {
        const tens = randInt(Math.floor(min / 10), Math.floor((max - 10) / 10));
        const onesA = randInt(0, 9);
        const onesB = randInt(1, Math.min(9, 99 - (tens * 10 + onesA)));
        const a = tens * 10 + onesA;
        const b = onesB;
        correctAnswer = a + b;
        question = `${a} + ${b} = ?`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: ${a} + ${b} = ${correctAnswer}`;
        break;
      }
      case 'two_digit_plus_two_digit': {
        const a = randInt(Math.max(10, min), Math.floor((max - 10) / 2));
        const b = randInt(10, Math.min(max - a, 50));
        correctAnswer = a + b;
        question = `${a} + ${b} = ?`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: เมื่อนำ ${a} บวกกับ ${b} จะได้ ${correctAnswer}`;
        break;
      }
      case 'find_unknown': {
        const sum = randInt(Math.max(30, min), max);
        const b = randInt(10, sum - 10);
        const a = sum - b;
        correctAnswer = a;
        question = `__ + ${b} = ${sum}`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: ${sum} - ${b} = ${correctAnswer} ดังนั้น ${correctAnswer} + ${b} = ${sum}`;
        break;
      }
      case 'relationship': {
        const a = randInt(Math.max(20, min), Math.floor(max / 2));
        const b = randInt(10, Math.min(40, max - a));
        const sum = a + b;
        correctAnswer = a;
        question = `ถ้า ${a} + ${b} = ${sum} แล้ว ${sum} - ${b} = ?`;
        choices = generateChoices(correctAnswer);
        explanation = `จากความสัมพันธ์ของบวกลบ: เมื่อ ${a} + ${b} = ${sum} จะได้ว่า ${sum} - ${b} = ${correctAnswer}`;
        break;
      }
      case 'word_problem': {
        const a = randInt(Math.max(20, min), Math.floor(max / 2));
        const b = randInt(10, Math.min(max - a, 40));
        correctAnswer = a + b;
        question = `น้องมีลูกอม ${a} เม็ด พี่ให้อีก ${b} เม็ด รวมกี่เม็ด?`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: ${a} + ${b} = ${correctAnswer} เม็ด`;
        break;
      }
    }
    
    questions.push({
      id: `addition_${Date.now()}_${i}_${Math.random()}`,
      skill: 'addition',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateSubtractionQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [0, 10];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['two_digit_minus_one_digit', 'two_digit_minus_two_digit', 'find_unknown', 'relationship', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'two_digit_minus_one_digit': {
        const a = randInt(Math.max(21, min), max);
        const b = randInt(1, Math.min(9, a));
        correctAnswer = a - b;
        question = `${a} - ${b} = ?`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: ${a} - ${b} = ${correctAnswer}`;
        break;
      }
      case 'two_digit_minus_two_digit': {
        const a = randInt(Math.max(30, min), max);
        const b = randInt(10, a - 5);
        correctAnswer = a - b;
        question = `${a} - ${b} = ?`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: เมื่อนำ ${a} ลบด้วย ${b} จะได้ ${correctAnswer}`;
        break;
      }
      case 'find_unknown': {
        // แยก logic ตามช่วงเพื่อป้องกันคำตอบเป็นจำนวนลบ
        let a, result, b;
        
        if (max <= 10) {
          // สำหรับ ป.1 เทอม 1 (range เล็ก)
          a = randInt(Math.max(5, min), max);
          result = randInt(min, Math.max(min, a - 1)); // result ต้องน้อยกว่า a
          b = a - result;
        } else if (max <= 20) {
          // สำหรับช่วง 11-20
          a = randInt(Math.max(10, min), max);
          result = randInt(Math.max(min, 5), Math.max(min, a - 3)); // result ต้องน้อยกว่า a
          b = a - result;
        } else {
          // สำหรับ ป.1 เทอม 2 และสูงกว่า (range ใหญ่)
          a = randInt(Math.max(30, min), max);
          result = randInt(Math.max(10, min), Math.max(min, a - 10)); // result ต้องน้อยกว่า a
          b = a - result;
        }
        
        // ตรวจสอบความถูกต้อง
        if (b < 0 || a - b !== result) {
          // ถ้าเกิดข้อผิดพลาด ให้สร้างใหม่อย่างง่าย
          a = max;
          b = Math.floor(max / 2);
          result = a - b;
        }
        
        correctAnswer = b;
        question = `${a} - __ = ${result}`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: ${a} - ${correctAnswer} = ${result} ดังนั้นคำตอบคือ ${correctAnswer}`;
        break;
      }
      case 'relationship': {
        const sum = randInt(Math.max(40, min), max);
        const b = randInt(15, Math.floor(sum / 2));
        const a = sum - b;
        correctAnswer = b;
        question = `ถ้า ${a} + ${b} = ${sum} แล้ว ${sum} - ${a} = ?`;
        choices = generateChoices(correctAnswer);
        explanation = `จากความสัมพันธ์ของบวกลบ: เมื่อ ${a} + ${b} = ${sum} จะได้ว่า ${sum} - ${a} = ${correctAnswer}`;
        break;
      }
      case 'word_problem': {
        const a = randInt(Math.max(30, min), max);
        const b = randInt(10, a - 5);
        correctAnswer = a - b;
        question = `มีของเล่น ${a} ชิ้น เล่นหายไป ${b} ชิ้น เหลือกี่ชิ้น?`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: ${a} - ${b} = ${correctAnswer} ชิ้น`;
        break;
      }
    }
    
    questions.push({
      id: `subtraction_${Date.now()}_${i}_${Math.random()}`,
      skill: 'subtraction',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};


const generateMultiplicationQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const tables = config.tables || [2, 3, 4, 5];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['group_concept', 'symbol_creation', 'basic_multiply', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    const table = tables[randInt(0, tables.length - 1)];
    const multiplier = randInt(2, 5);  // เบื้องต้นใช้ 2-5 กลุ่ม
    const product = table * multiplier;
    
    let question = '';
    let correctAnswer: number | string = product;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'group_concept': {
        question = `ถ้ามี ${multiplier} กลุ่ม กลุ่มละ ${table} ตัว รวมทั้งหมดกี่ตัว?`;
        correctAnswer = product;
        choices = generateChoices(product);
        explanation = `${multiplier} กลุ่ม × ${table} ตัว/กลุ่ม = ${product} ตัว`;
        break;
      }
      case 'symbol_creation': {
        question = `${multiplier} กลุ่ม กลุ่มละ ${table} เขียนเป็นประโยคสัญลักษณ์การคูณได้ว่าอะไร?`;
        const symbolAnswers = [
          `${multiplier} × ${table}`,
          `${table} × ${multiplier}`,
          `${multiplier} + ${table}`,
          `${table} + ${multiplier}`
        ];
        choices = shuffleArray(symbolAnswers);
        correctAnswer = `${multiplier} × ${table}`;
        explanation = `จากกลุ่มเท่า ๆ กัน ${multiplier} กลุ่ม กลุ่มละ ${table} เขียนเป็น ${multiplier} × ${table} = ${product}`;
        break;
      }
      case 'basic_multiply': {
        question = `${table} × ${multiplier} = ?`;
        correctAnswer = product;
        choices = generateChoices(product);
        explanation = `${table} × ${multiplier} = ${product} หรือคิดว่า ${multiplier} กลุ่ม กลุ่มละ ${table}`;
        break;
      }
      case 'word_problem': {
        question = `มีจานอยู่ ${multiplier} จาน ในแต่ละจานมีขนม ${table} ชิ้น รวมขนมทั้งหมดกี่ชิ้น?`;
        correctAnswer = product;
        choices = generateChoices(product);
        explanation = `${multiplier} จาน × ${table} ชิ้น/จาน = ${product} ชิ้น`;
        break;
      }
    }
    
    questions.push({
      id: `mul_${Date.now()}_${i}_${Math.random()}`,
      skill: 'multiplication',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateMoneyQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  try {
    const problems = generateMoneyProblems(config.count, 'mixed', config.difficulty);
    
    problems.forEach((prob, i) => {
      questions.push({
        id: `money_${Date.now()}_${i}_${Math.random()}`,
        skill: 'money',
        question: `${prob.story}\n${prob.question}`,
        correctAnswer: prob.correctAnswer,
        choices: generateChoices(prob.correctAnswer),
        difficulty: config.difficulty,
        explanation: prob.hint
      });
    });
  } catch (error) {
    console.warn('Error generating money problems:', error);
  }
  
  return questions;
};

const generateDivisionQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [1, 50];
  
  // ตรวจสอบว่าเป็น ป.3 เทอม 2 (หารสั้น/หารยาว 2-4 หลัก)
  const isAdvanced = max >= 100;
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = isAdvanced 
      ? ['short_division_2digit', 'short_division_3digit', 'long_division_4digit', 'with_remainder_advanced', 'find_unknown', 'multiply_divide_relation', 'word_problem']
      : ['meaning', 'basic_division', 'with_remainder', 'multiply_divide_relation', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'short_division_2digit': {
        // หารสั้น ตัวตั้ง 2 หลัก หารด้วย 1 หลัก (ลงตัว)
        const divisor = randInt(2, 9);
        const quotient = randInt(10, 99);
        const dividend = divisor * quotient;
        question = `${dividend} ÷ ${divisor} = ?`;
        correctAnswer = quotient;
        choices = generateChoices(correctAnswer);
        explanation = `${dividend} ÷ ${divisor} = ${correctAnswer} (ตั้งหารสั้น)`;
        break;
      }
      case 'short_division_3digit': {
        // หารสั้น ตัวตั้ง 3 หลัก หารด้วย 1 หลัก (ลงตัว)
        const divisor = randInt(2, 9);
        const quotient = randInt(100, 999);
        const dividend = divisor * quotient;
        question = `${dividend} ÷ ${divisor} = ?`;
        correctAnswer = quotient;
        choices = generateChoices(correctAnswer);
        explanation = `${dividend} ÷ ${divisor} = ${correctAnswer} (ตั้งหารสั้น)`;
        break;
      }
      case 'long_division_4digit': {
        // หารยาว ตัวตั้ง 4 หลัก หารด้วย 1 หลัก (ลงตัว)
        const divisor = randInt(2, 9);
        const quotient = randInt(1000, 9999);
        const dividend = divisor * quotient;
        question = `${dividend.toLocaleString()} ÷ ${divisor} = ?`;
        correctAnswer = quotient;
        choices = [
          quotient,
          quotient + 1,
          quotient - 1,
          quotient + 10
        ];
        choices = shuffleArray(choices);
        explanation = `${dividend.toLocaleString()} ÷ ${divisor} = ${correctAnswer.toLocaleString()} (ตั้งหารยาว)`;
        break;
      }
      case 'with_remainder_advanced': {
        // หารไม่ลงตัว มีเศษ (ตัวตั้ง 2-3 หลัก)
        const divisor = randInt(2, 9);
        const quotient = randInt(10, 99);
        const remainder = randInt(1, divisor - 1);
        const dividend = (divisor * quotient) + remainder;
        question = `${dividend} ÷ ${divisor} = ? เศษเท่าไร?`;
        correctAnswer = `${quotient} เศษ ${remainder}`;
        choices = shuffleArray([
          `${quotient} เศษ ${remainder}`,
          `${quotient + 1} เศษ 0`,
          `${quotient} เศษ ${remainder + 1}`,
          `${quotient - 1} เศษ ${divisor - 1}`
        ]);
        explanation = `${dividend} ÷ ${divisor} = ${quotient} เศษ ${remainder} เพราะ ${divisor} × ${quotient} = ${divisor * quotient} บวกเศษ ${remainder} = ${dividend}`;
        break;
      }
      case 'find_unknown': {
        // หาค่าที่ไม่ทราบในประโยคสัญลักษณ์
        const divisor = randInt(2, 9);
        const quotient = randInt(10, 50);
        const dividend = divisor * quotient;
        
        const unknownTypes = ['dividend', 'divisor', 'quotient'];
        const unknownType = unknownTypes[i % 3];
        
        if (unknownType === 'dividend') {
          question = `__ ÷ ${divisor} = ${quotient} หาค่าที่ไม่ทราบ`;
          correctAnswer = dividend;
          choices = generateChoices(dividend);
          explanation = `เพราะ ${divisor} × ${quotient} = ${dividend} ดังนั้น ${dividend} ÷ ${divisor} = ${quotient}`;
        } else if (unknownType === 'divisor') {
          question = `${dividend} ÷ __ = ${quotient} หาค่าที่ไม่ทราบ`;
          correctAnswer = divisor;
          choices = generateChoices(divisor);
          explanation = `เพราะ ${dividend} ÷ ${quotient} = ${divisor} หรือ ${divisor} × ${quotient} = ${dividend}`;
        } else {
          question = `${dividend} ÷ ${divisor} = __ หาค่าที่ไม่ทราบ`;
          correctAnswer = quotient;
          choices = generateChoices(quotient);
          explanation = `${dividend} ÷ ${divisor} = ${quotient}`;
        }
        break;
      }
      case 'meaning': {
        const total = randInt(6, 20);
        const divisor = randInt(2, 5);
        const quotient = Math.floor(total / divisor);
        question = `แบ่งขนม ${total} ชิ้น ให้เด็ก ${divisor} คน เท่า ๆ กัน คนละกี่ชิ้น?`;
        correctAnswer = quotient;
        choices = generateChoices(correctAnswer);
        explanation = `${total} ÷ ${divisor} = ${quotient} คนละ ${quotient} ชิ้น`;
        break;
      }
      case 'basic_division': {
        const divisor = randInt(2, 9);
        const quotient = randInt(2, Math.min(20, Math.floor(max / divisor)));
        const dividend = divisor * quotient;
        correctAnswer = quotient;
        question = `${dividend} ÷ ${divisor} = ?`;
        choices = generateChoices(correctAnswer);
        explanation = `${dividend} ÷ ${divisor} = ${correctAnswer}`;
        break;
      }
      case 'with_remainder': {
        const divisor = randInt(2, 9);
        const quotient = randInt(2, 10);
        const remainder = randInt(1, divisor - 1);
        const dividend = (divisor * quotient) + remainder;
        question = `${dividend} ÷ ${divisor} = ? เศษเท่าไร?`;
        correctAnswer = `${quotient} เศษ ${remainder}`;
        choices = shuffleArray([
          `${quotient} เศษ ${remainder}`,
          `${quotient + 1} เศษ 0`,
          `${quotient} เศษ ${remainder + 1}`,
          `${quotient - 1} เศษ ${remainder}`
        ]);
        explanation = `${dividend} ÷ ${divisor} = ${quotient} เศษ ${remainder} เพราะ ${divisor} × ${quotient} = ${divisor * quotient} บวกเศษ ${remainder} = ${dividend}`;
        break;
      }
      case 'multiply_divide_relation': {
        const divisor = randInt(2, 9);
        const quotient = isAdvanced ? randInt(10, 99) : randInt(3, 10);
        const dividend = divisor * quotient;
        question = `ถ้า ${divisor} × ${quotient} = ${dividend} แล้ว ${dividend} ÷ ${divisor} = ?`;
        correctAnswer = quotient;
        choices = generateChoices(correctAnswer);
        explanation = `จากความสัมพันธ์ของคูณ-หาร: ${divisor} × ${quotient} = ${dividend} ดังนั้น ${dividend} ÷ ${divisor} = ${quotient}`;
        break;
      }
      case 'word_problem': {
        const total = isAdvanced ? randInt(100, 500) : randInt(12, 48);
        const groups = randInt(2, 9);
        const perGroup = Math.floor(total / groups);
        correctAnswer = perGroup;
        const items = ['ดอกไม้', 'ลูกอม', 'ดินสอ', 'หนังสือ', 'ผลไม้'];
        const item = items[randInt(0, items.length - 1)];
        question = `นำ${item} ${total} ${item === 'หนังสือ' ? 'เล่ม' : item === 'ดินสอ' ? 'แท่ง' : item === 'ดอกไม้' ? 'ดอก' : 'ชิ้น'} มาแบ่งเป็น ${groups} กลุ่ม เท่า ๆ กัน กลุ่มละกี่${item === 'หนังสือ' ? 'เล่ม' : item === 'ดินสอ' ? 'แท่ง' : item === 'ดอกไม้' ? 'ดอก' : 'ชิ้น'}?`;
        choices = generateChoices(correctAnswer);
        explanation = `${total} ÷ ${groups} = ${perGroup}`;
        break;
      }
    }
    
    questions.push({
      id: `div_${Date.now()}_${i}_${Math.random()}`,
      skill: 'division',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateTimeQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  // ตรวจสอบระดับความยาก - ป.3 จะมีการแปลงหน่วยและโจทย์คูณ-หาร
  const isAdvanced = config.difficulty === 'medium' || config.difficulty === 'hard';
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = isAdvanced 
      ? ['read_time', 'time_duration', 'convert_units', 'compare_time', 'multiply_divide_time', 'word_problem']
      : ['read_time', 'time_duration', 'calendar', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'read_time': {
        const hour = randInt(1, 12);
        const minute = randInt(0, 11) * 5; // ช่วง 5 นาที
        const timeStr = minute === 0 ? `${hour} นาฬิกา` : `${hour} นาฬิกา ${minute} นาที`;
        question = `นาฬิกาชี้เวลาอะไร?`;
        correctAnswer = timeStr;
        
        // สร้างตัวเลือกที่ใกล้เคียง
        const wrongChoices = [
          minute === 0 ? `${hour} นาฬิกา 5 นาที` : `${hour} นาฬิกา ${(minute + 5) % 60} นาที`,
          `${(hour % 12) + 1} นาฬิกา ${minute} นาที`,
          minute >= 5 ? `${hour} นาฬิกา ${minute - 5} นาที` : `${hour} นาฬิกา 55 นาที`
        ];
        choices = shuffleArray([timeStr, ...wrongChoices]);
        explanation = `นาฬิกาชี้ ${timeStr}`;
        
        questions.push({
          id: `time_${Date.now()}_${i}_${Math.random()}`,
          skill: 'time',
          question,
          correctAnswer,
          choices,
          difficulty: config.difficulty,
          explanation,
          clockDisplay: { hour, minute }
        });
        continue;
      }
      case 'convert_units': {
        // การแปลงหน่วย ชั่วโมง⇄นาที (ป.3)
        const conversionType = i % 2;
        if (conversionType === 0) {
          // ชั่วโมง → นาที
          const hours = randInt(1, 5);
          question = `${hours} ชั่วโมง เท่ากับกี่นาที?`;
          correctAnswer = hours * 60;
          choices = generateChoices(correctAnswer);
          explanation = `1 ชั่วโมง = 60 นาที ดังนั้น ${hours} ชั่วโมง = ${hours} × 60 = ${correctAnswer} นาที`;
        } else {
          // นาที → ชั่วโมง
          const hours = randInt(2, 5);
          const minutes = hours * 60;
          question = `${minutes} นาที เท่ากับกี่ชั่วโมง?`;
          correctAnswer = hours;
          choices = generateChoices(hours);
          explanation = `60 นาที = 1 ชั่วโมง ดังนั้น ${minutes} นาที = ${minutes} ÷ 60 = ${hours} ชั่วโมง`;
        }
        break;
      }
      case 'compare_time': {
        // เปรียบเทียบระยะเวลา (ป.3)
        const time1_h = randInt(1, 3);
        const time1_m = randInt(0, 5) * 10;
        const time2_h = randInt(1, 3);
        const time2_m = randInt(0, 5) * 10;
        
        const total1 = time1_h * 60 + time1_m;
        const total2 = time2_h * 60 + time2_m;
        
        if (total1 === total2) {
          // สร้างใหม่ให้ไม่เท่ากัน
          const time2_h_new = time1_h + 1;
          const total2_new = time2_h_new * 60 + time2_m;
          question = `${time1_h} ชั่วโมง ${time1_m} นาที กับ ${time2_h_new} ชั่วโมง ${time2_m} นาที อันไหนนานกว่า?`;
          correctAnswer = `${time2_h_new} ชั่วโมง ${time2_m} นาที`;
          choices = shuffleArray([
            `${time1_h} ชั่วโมง ${time1_m} นาที`,
            `${time2_h_new} ชั่วโมง ${time2_m} นาที`,
            'เท่ากัน'
          ]);
          explanation = `${time1_h} ชม. ${time1_m} นาที = ${total1} นาที, ${time2_h_new} ชม. ${time2_m} นาที = ${total2_new} นาที ดังนั้น ${time2_h_new} ชั่วโมง ${time2_m} นาที นานกว่า`;
        } else {
          question = `${time1_h} ชั่วโมง ${time1_m} นาที กับ ${time2_h} ชั่วโมง ${time2_m} นาที อันไหนนานกว่า?`;
          correctAnswer = total1 > total2 ? `${time1_h} ชั่วโมง ${time1_m} นาที` : `${time2_h} ชั่วโมง ${time2_m} นาที`;
          choices = shuffleArray([
            `${time1_h} ชั่วโมง ${time1_m} นาที`,
            `${time2_h} ชั่วโมง ${time2_m} นาที`,
            'เท่ากัน'
          ]);
          explanation = `${time1_h} ชม. ${time1_m} นาที = ${total1} นาที, ${time2_h} ชม. ${time2_m} นาที = ${total2} นาที ดังนั้น ${correctAnswer} นานกว่า`;
        }
        break;
      }
      case 'multiply_divide_time': {
        // โจทย์คูณ-หารเวลา (ป.3)
        const operationType = i % 2;
        if (operationType === 0) {
          // คูณ
          const minutes = randInt(5, 15);
          const times = randInt(2, 4);
          correctAnswer = minutes * times;
          question = `ถ้าใช้เวลาทำงาน ${minutes} นาที ถ้าทำ ${times} ครั้ง ใช้เวลาทั้งหมดกี่นาที?`;
          choices = generateChoices(correctAnswer);
          explanation = `${minutes} × ${times} = ${correctAnswer} นาที`;
        } else {
          // หาร
          const totalMinutes = randInt(30, 120);
          const people = randInt(2, 5);
          correctAnswer = Math.floor(totalMinutes / people);
          question = `ใช้เวลาทำงานทั้งหมด ${totalMinutes} นาที แบ่งให้ ${people} คน เท่า ๆ กัน คนละกี่นาที?`;
          choices = generateChoices(correctAnswer);
          explanation = `${totalMinutes} ÷ ${people} = ${correctAnswer} นาที`;
        }
        break;
      }
      case 'time_duration': {
        const hours = randInt(1, 3);
        const minutes = randInt(0, 11) * 5;
        
        if (hours > 0 && minutes === 0) {
          question = `ใช้เวลา ${hours} ชั่วโมง เท่ากับกี่นาที?`;
          correctAnswer = hours * 60;
          choices = generateChoices(correctAnswer);
          explanation = `1 ชั่วโมง = 60 นาที ดังนั้น ${hours} ชั่วโมง = ${hours * 60} นาที`;
        } else if (hours === 0) {
          question = `ใช้เวลา ${minutes} นาที เท่ากับกี่ชั่วโมงกี่นาที?`;
          correctAnswer = `0 ชั่วโมง ${minutes} นาที`;
          choices = shuffleArray([
            `0 ชั่วโมง ${minutes} นาที`,
            `1 ชั่วโมง ${minutes} นาที`,
            `0 ชั่วโมง ${minutes + 5} นาที`,
            `0 ชั่วโมง ${minutes - 5 < 0 ? 0 : minutes - 5} นาที`
          ]);
          explanation = `${minutes} นาที ยังไม่ถึง 1 ชั่วโมง`;
        } else {
          // กรณีมีทั้งชั่วโมงและนาที
          const startHour = randInt(8, 11);
          const startMinute = randInt(0, 11) * 5;
          
          // คำนวณเวลาสิ้นสุด
          let endHour = startHour + hours;
          let endMinute = startMinute + minutes;
          
          // ปรับชั่วโมงถ้านาทีเกิน 60
          if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60);
            endMinute = endMinute % 60;
          }
          
          question = `จากเวลา ${startHour}:${startMinute.toString().padStart(2, '0')} น. ถึง ${endHour}:${endMinute.toString().padStart(2, '0')} น. ใช้เวลาทั้งหมดกี่ชั่วโมงกี่นาที?`;
          correctAnswer = `${hours} ชั่วโมง ${minutes} นาที`;
          
          // สร้างตัวเลือกคำตอบที่ใกล้เคียง
          choices = shuffleArray([
            `${hours} ชั่วโมง ${minutes} นาที`,
            `${hours + 1} ชั่วโมง ${minutes} นาที`,
            `${hours} ชั่วโมง ${minutes + 10} นาที`,
            `${hours} ชั่วโมง ${minutes > 10 ? minutes - 10 : minutes + 10} นาที`
          ]);
          
          explanation = `จาก ${startHour}:${startMinute.toString().padStart(2, '0')} น. ถึง ${endHour}:${endMinute.toString().padStart(2, '0')} น. ใช้เวลา ${hours} ชั่วโมง ${minutes} นาที`;
          
          questions.push({
            id: `time_${Date.now()}_${i}_${Math.random()}`,
            skill: 'time',
            question,
            correctAnswer,
            choices,
            difficulty: config.difficulty,
            explanation,
            clockDisplay: { hour: startHour, minute: startMinute }
          });
          continue;
        }
        break;
      }
      case 'calendar': {
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const month = months[randInt(0, 11)];
        const day = randInt(1, 28);
        
        question = `วันที่ ${day} ${month} อยู่ในเดือนอะไร?`;
        correctAnswer = month;
        choices = shuffleArray([
          month,
          ...months.filter(m => m !== month).slice(0, 3)
        ]);
        explanation = `วันที่ ${day} ${month} อยู่ในเดือน${month}`;
        break;
      }
      case 'word_problem': {
        const startHour = randInt(8, 11);
        const duration = randInt(1, 3);
        const endHour = startHour + duration;
        const startMinute = randInt(0, 1) * 30; // 0 or 30
        
        question = `เริ่มทำการบ้านเวลา ${startHour}:${startMinute.toString().padStart(2, '0')} น. เสร็จเวลา ${endHour}:${startMinute.toString().padStart(2, '0')} น. ใช้เวลากี่ชั่วโมง?`;
        correctAnswer = duration;
        choices = generateChoices(duration);
        explanation = `จาก ${startHour}:${startMinute.toString().padStart(2, '0')} น. ถึง ${endHour}:${startMinute.toString().padStart(2, '0')} น. ใช้เวลา ${duration} ชั่วโมง`;
        
        questions.push({
          id: `time_${Date.now()}_${i}_${Math.random()}`,
          skill: 'time',
          question,
          correctAnswer,
          choices,
          difficulty: config.difficulty,
          explanation,
          clockDisplay: { hour: startHour, minute: startMinute }
        });
        continue;
      }
    }
    
    questions.push({
      id: `time_${Date.now()}_${i}_${Math.random()}`,
      skill: 'time',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateVolumeQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  // ตรวจสอบว่าเป็น ป.3 (มล.-ลิตร) หรือ ป.2 (ลิตร)
  const isAdvanced = config.description?.includes('มล.') || config.difficulty === 'medium';
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = isAdvanced
      ? ['ml_to_l', 'l_to_ml', 'choose_container', 'calculate_volume', 'word_problem']
      : ['non_standard', 'liter_comparison', 'estimate', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'ml_to_l': {
        // แปลง มล. เป็น ลิตร (ป.3)
        const liters = randInt(2, 5);
        const ml = liters * 1000;
        question = `${ml} มิลลิลิตร เท่ากับกี่ลิตร?`;
        correctAnswer = liters;
        choices = generateChoices(liters);
        explanation = `1,000 มิลลิลิตร = 1 ลิตร ดังนั้น ${ml} มล. = ${liters} ลิตร`;
        break;
      }
      case 'l_to_ml': {
        // แปลงลิตรเป็น มล. (ป.3)
        const liters = randInt(2, 5);
        correctAnswer = liters * 1000;
        question = `${liters} ลิตร เท่ากับกี่มิลลิลิตร?`;
        choices = generateChoices(correctAnswer);
        explanation = `1 ลิตร = 1,000 มิลลิลิตร ดังนั้น ${liters} ลิตร = ${correctAnswer} มล.`;
        break;
      }
      case 'choose_container': {
        // เลือกเครื่องตวง/หน่วยที่เหมาะสม (ป.3)
        const containers = [
          { liquid: 'ยาน้ำ', unit: 'มิลลิลิตร', tool: 'ช้อนตวง' },
          { liquid: 'น้ำดื่ม', unit: 'ลิตร', tool: 'ขวด' },
          { liquid: 'น้ำมันทำอาหาร', unit: 'ลิตร', tool: 'ขวด' },
          { liquid: 'น้ำในสระว่ายน้ำ', unit: 'ลิตร', tool: 'ถัง' }
        ];
        const container = containers[i % containers.length];
        question = `ควรใช้หน่วยใดวัดปริมาตร${container.liquid}?`;
        correctAnswer = container.unit;
        choices = shuffleArray(['มิลลิลิตร', 'ลิตร']);
        if (choices.length < 4) {
          choices.push('กรัม', 'เซนติเมตร');
        }
        explanation = `${container.liquid}เหมาะสมที่จะใช้หน่วย${container.unit}`;
        break;
      }
      case 'calculate_volume': {
        // คำนวณปริมาตร (ป.3): บวก-ลบ-คูณ-หาร
        const operationType = i % 4;
        if (operationType === 0) {
          // บวก
          const a = randInt(100, 500);
          const b = randInt(100, 500);
          correctAnswer = a + b;
          question = `น้ำส้ม ${a} มล. น้ำแอปเปิล ${b} มล. รวมกี่มล.?`;
          choices = generateChoices(correctAnswer);
          explanation = `${a} + ${b} = ${correctAnswer} มล.`;
        } else if (operationType === 1) {
          // ลบ
          const a = randInt(500, 1000);
          const b = randInt(100, 400);
          correctAnswer = a - b;
          question = `มีน้ำ ${a} มล. ดื่มไป ${b} มล. เหลือกี่มล.?`;
          choices = generateChoices(correctAnswer);
          explanation = `${a} - ${b} = ${correctAnswer} มล.`;
        } else if (operationType === 2) {
          // คูณ
          const perBottle = randInt(250, 1000);
          const bottles = randInt(2, 5);
          correctAnswer = perBottle * bottles;
          question = `ขวดละ ${perBottle} มล. มี ${bottles} ขวด รวมกี่มล.?`;
          choices = generateChoices(correctAnswer);
          explanation = `${perBottle} × ${bottles} = ${correctAnswer} มล.`;
        } else {
          // หาร
          const total = randInt(1000, 3000);
          const containers = randInt(2, 5);
          correctAnswer = Math.floor(total / containers);
          question = `แบ่งน้ำ ${total} มล. ใส่ ${containers} แก้วเท่า ๆ กัน แก้วละกี่มล.?`;
          choices = generateChoices(correctAnswer);
          explanation = `${total} ÷ ${containers} = ${correctAnswer} มล.`;
        }
        break;
      }
      case 'non_standard': {
        const cups = randInt(2, 5);
        question = `ถ้าใช้แก้วตวงน้ำ ${cups} แก้ว เต็มถังหนึ่งถัง ถังนี้จุน้ำกี่แก้ว?`;
        correctAnswer = cups;
        choices = generateChoices(cups);
        explanation = `ถังจุน้ำได้ ${cups} แก้ว`;
        break;
      }
      case 'liter_comparison': {
        const containers = [
          { name: 'ถ้วย', volume: 0.25 },
          { name: 'ขวด', volume: 1 },
          { name: 'ถัง', volume: 5 },
          { name: 'แก้ว', volume: 0.5 }
        ];
        const selected = shuffleArray(containers).slice(0, 3);
        const maxIndex = selected.reduce((max, item, idx, arr) => 
          item.volume > arr[max].volume ? idx : max, 0);
        correctAnswer = selected[maxIndex].name;
        
        question = `ข้อใดจุได้มากที่สุด?\n${selected.map(c => c.name).join(', ')}`;
        choices = shuffleArray(selected.map(c => c.name));
        explanation = `${correctAnswer}จุได้มากที่สุด`;
        break;
      }
      case 'estimate': {
        const objects = [
          { name: 'ถ้วยน้ำ', volume: '250 มิลลิลิตร' },
          { name: 'ขวดน้ำ', volume: '1 ลิตร' },
          { name: 'แก้วน้ำ', volume: '500 มิลลิลิตร' }
        ];
        const obj = objects[i % objects.length];
        question = `${obj.name}จุน้ำได้ประมาณเท่าไร?`;
        correctAnswer = obj.volume;
        choices = shuffleArray([
          obj.volume,
          ...objects.filter(o => o.volume !== obj.volume).map(o => o.volume)
        ]);
        explanation = `${obj.name}จุได้ประมาณ ${obj.volume}`;
        break;
      }
      case 'word_problem': {
        const bottle = randInt(2, 5);
        const perBottle = 1;
        correctAnswer = bottle * perBottle;
        question = `มีขวดน้ำ ${bottle} ขวด ขวดละ ${perBottle} ลิตร รวมกี่ลิตร?`;
        choices = generateChoices(correctAnswer);
        explanation = `${bottle} × ${perBottle} = ${correctAnswer} ลิตร`;
        break;
      }
    }
    
    questions.push({
      id: `volume_${Date.now()}_${i}_${Math.random()}`,
      skill: 'volume',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateMixedOperationsQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  // ตรวจสอบว่าเป็น ป.3 (มีวงเล็บ)
  const isAdvanced = config.description?.includes('วงเล็บ') || config.difficulty === 'medium';
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = isAdvanced
      ? ['with_parentheses', 'write_expression', 'check_reasonableness', 'multi_step_with_parentheses']
      : ['add_subtract', 'add_multiply', 'subtract_divide', 'multi_step'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'with_parentheses': {
        // ข้อละมีวงเล็บ (ป.3)
        const a = randInt(10, 30);
        const b = randInt(5, 15);
        const c = randInt(2, 5);
        const resultInside = a + b;
        const finalResult = resultInside * c;
        
        question = `(${a} + ${b}) × ${c} = ?`;
        correctAnswer = finalResult;
        choices = [
          finalResult,
          a + b * c, // ผิด: คูณก่อน
          (a + b) + c, // ผิด: บวกแทนคูณ
          a * c + b // ผิด: ลำดับผิด
        ];
        choices = shuffleArray(choices);
        explanation = `ทำในวงเล็บก่อน: (${a} + ${b}) = ${resultInside}, แล้วคูณ: ${resultInside} × ${c} = ${finalResult}`;
        break;
      }
      case 'write_expression': {
        // เขียนประโยคสัญลักษณ์จากสถานการณ์ (ป.3)
        const boxPrice = randInt(20, 50);
        const boxes = randInt(3, 5);
        const discount = randInt(10, 20);
        const result = (boxPrice * boxes) - discount;
        
        question = `กล่องดินสอราคา ${boxPrice} บาท ซื้อ ${boxes} กล่อง ลดราคา ${discount} บาท\nเขียนประโยคสัญลักษณ์ได้ว่าอย่างไร?`;
        correctAnswer = `(${boxPrice} × ${boxes}) - ${discount}`;
        
        choices = shuffleArray([
          `(${boxPrice} × ${boxes}) - ${discount}`,
          `${boxPrice} × ${boxes} - ${discount}`, // ถูกแต่ไม่มีวงเล็บ
          `${boxPrice} × (${boxes} - ${discount})`, // ผิด
          `(${boxPrice} + ${boxes}) × ${discount}` // ผิด
        ]);
        explanation = `ต้องคูณก่อน (${boxPrice} × ${boxes}) = ${boxPrice * boxes} แล้วลบ ${discount} = ${result} บาท`;
        break;
      }
      case 'check_reasonableness': {
        // ตรวจสอบความสมเหตุสมผลของคำตอบ (ป.3)
        const a = randInt(15, 25);
        const b = randInt(8, 12);
        const c = randInt(3, 6);
        const correctResult = (a + b) * c;
        const wrongResult = randInt(50, 80);
        
        question = `นักเรียนคำนวณ (${a} + ${b}) × ${c} = ${wrongResult}\nการคำนวณนี้สมเหตุสมผลหรือไม่? (ใช้การประมาณค่า)`;
        correctAnswer = 'ไม่สมเหตุสมผล';
        choices = shuffleArray(['สมเหตุสมผล', 'ไม่สมเหตุสมผล']);
        
        const approxA = Math.round(a / 10) * 10;
        const approxB = Math.round(b / 10) * 10;
        const approxC = Math.round(c / 5) * 5;
        const approxResult = (approxA + approxB) * approxC;
        
        explanation = `ประมาณค่า: (${approxA} + ${approxB}) × ${approxC} ≈ ${approxResult}\nคำตอบจริง: (${a} + ${b}) × ${c} = ${correctResult}\nดังนั้น ${wrongResult} ไม่สมเหตุสมผล`;
        break;
      }
      case 'multi_step_with_parentheses': {
        // โจทย์หลายขั้นตอนมีวงเล็บ (ป.3)
        const pricePerItem = randInt(15, 30);
        const quantity = randInt(4, 8);
        const extraCost = randInt(10, 20);
        const total = (pricePerItem * quantity) + extraCost;
        
        question = `ซื้อของชิ้นละ ${pricePerItem} บาท จำนวน ${quantity} ชิ้น และค่าส่ง ${extraCost} บาท\nราคาทั้งหมดเท่าไร? (เขียนประโยคสัญลักษณ์)`;
        correctAnswer = `(${pricePerItem} × ${quantity}) + ${extraCost}`;
        
        choices = shuffleArray([
          `(${pricePerItem} × ${quantity}) + ${extraCost}`,
          `${pricePerItem} × ${quantity} + ${extraCost}`, // ถูกแต่ไม่มีวงเล็บ
          `${pricePerItem} × (${quantity} + ${extraCost})`, // ผิด
          `(${pricePerItem} + ${quantity}) × ${extraCost}` // ผิด
        ]);
        explanation = `คูณก่อน (${pricePerItem} × ${quantity}) = ${pricePerItem * quantity} แล้วบวกค่าส่ง ${extraCost} = ${total} บาท`;
        break;
      }
      case 'add_subtract': {
        const a = randInt(20, 50);
        const b = randInt(10, 30);
        const c = randInt(5, 15);
        const result = a + b - c;
        correctAnswer = result;
        question = `มีลูกบอล ${a} ลูก ซื้อมาเพิ่ม ${b} ลูก แล้วเอาไปแจก ${c} ลูก เหลือกี่ลูก?\nเขียนประโยคสัญลักษณ์ได้ว่า?`;
        
        choices = shuffleArray([
          `${a} + ${b} - ${c}`,
          `${a} - ${b} + ${c}`,
          `${a} + ${b} + ${c}`,
          `${a} - ${b} - ${c}`
        ]);
        correctAnswer = `${a} + ${b} - ${c}`;
        explanation = `มี ${a} ซื้อเพิ่ม ${b} (+) แจกไป ${c} (-) = ${a} + ${b} - ${c} = ${result}`;
        break;
      }
      case 'add_multiply': {
        const groups = randInt(3, 5);
        const perGroup = randInt(4, 8);
        const extra = randInt(2, 5);
        const result = (groups * perGroup) + extra;
        correctAnswer = `${groups} × ${perGroup} + ${extra}`;
        
        question = `มีกล่องดินสอ ${groups} กล่อง กล่องละ ${perGroup} แท่ง และมีดินสออีก ${extra} แท่ง รวมกี่แท่ง?\nเขียนประโยคสัญลักษณ์ได้ว่า?`;
        
        choices = shuffleArray([
          `${groups} × ${perGroup} + ${extra}`,
          `${groups} + ${perGroup} × ${extra}`,
          `${groups} × ${perGroup} - ${extra}`,
          `(${groups} + ${perGroup}) × ${extra}`
        ]);
        explanation = `${groups} กล่อง × ${perGroup} แท่ง/กล่อง + ${extra} = ${result} แท่ง`;
        break;
      }
      case 'subtract_divide': {
        const total = randInt(24, 48);
        const give = randInt(4, 12);
        const remaining = total - give;
        const groups = randInt(2, 4);
        const perGroup = Math.floor(remaining / groups);
        correctAnswer = `${total} - ${give}`;
        
        question = `มีลูกอม ${total} เม็ด เอาไปแจก ${give} เม็ด จะแบ่งที่เหลือให้เพื่อน ${groups} คน เท่า ๆ กัน\nต้องหาจำนวนที่เหลือก่อนโดยใช้ประโยคสัญลักษณ์ใด?`;
        
        choices = shuffleArray([
          `${total} - ${give}`,
          `${total} + ${give}`,
          `${total} ÷ ${groups}`,
          `${give} ÷ ${groups}`
        ]);
        explanation = `ต้องหาที่เหลือก่อน: ${total} - ${give} = ${remaining} เม็ด`;
        break;
      }
      case 'multi_step': {
        const price = randInt(5, 15);
        const quantity = randInt(3, 6);
        const paid = randInt(50, 100);
        const cost = price * quantity;
        const change = paid - cost;
        correctAnswer = `${price} × ${quantity}`;
        
        question = `ซื้อขนม ${quantity} ชิ้น ชิ้นละ ${price} บาท จ่ายไป ${paid} บาท\nต้องหาราคาขนมทั้งหมดก่อนโดยใช้ประโยคสัญลักษณ์ใด?`;
        
        choices = shuffleArray([
          `${price} × ${quantity}`,
          `${paid} - ${price}`,
          `${paid} ÷ ${quantity}`,
          `${price} + ${quantity}`
        ]);
        explanation = `หาราคาขนมทั้งหมดก่อน: ${price} × ${quantity} = ${cost} บาท จากนั้นจึงหาเงินทอน ${paid} - ${cost} = ${change} บาท`;
        break;
      }
    }
    
    questions.push({
      id: `mixed_${Date.now()}_${i}_${Math.random()}`,
      skill: 'mixedOperations',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateWeighingQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  // ตรวจสอบว่าเป็น ป.3 (กรัม-ขีด-กก.-ตัน) หรือ ป.1-2 (กก.-กรัม)
  const isAdvanced = config.description?.includes('ตัน') || config.difficulty === 'medium';
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = isAdvanced
      ? ['unit_conversion', 'choose_unit', 'read_scale', 'calculate_weight', 'word_problem']
      : ['kg_to_g', 'g_to_kg', 'khit_to_g', 'compare_weight', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'unit_conversion': {
        // แปลงหน่วยน้ำหนัก (ป.3): กรัม-ขีด-กก.-ตัน
        const conversionTypes = [
          { from: 'กรัม', to: 'ขีด', factor: 100, type: 'divide' },
          { from: 'ขีด', to: 'กรัม', factor: 100, type: 'multiply' },
          { from: 'กรัม', to: 'กก.', factor: 1000, type: 'divide' },
          { from: 'กก.', to: 'กรัม', factor: 1000, type: 'multiply' },
          { from: 'กก.', to: 'ตัน', factor: 1000, type: 'divide' },
          { from: 'ตัน', to: 'กก.', factor: 1000, type: 'multiply' }
        ];
        const conversion = conversionTypes[i % conversionTypes.length];
        
        if (conversion.type === 'multiply') {
          const value = randInt(2, 10);
          correctAnswer = value * conversion.factor;
          question = `${value} ${conversion.from} เท่ากับกี่${conversion.to}?`;
          choices = generateChoices(correctAnswer);
          explanation = `1 ${conversion.from} = ${conversion.factor} ${conversion.to} ดังนั้น ${value} ${conversion.from} = ${value} × ${conversion.factor} = ${correctAnswer} ${conversion.to}`;
        } else {
          const value = randInt(2, 10) * conversion.factor;
          correctAnswer = value / conversion.factor;
          question = `${value} ${conversion.from} เท่ากับกี่${conversion.to}?`;
          choices = generateChoices(correctAnswer);
          explanation = `${conversion.factor} ${conversion.from} = 1 ${conversion.to} ดังนั้น ${value} ${conversion.from} = ${value} ÷ ${conversion.factor} = ${correctAnswer} ${conversion.to}`;
        }
        break;
      }
      case 'choose_unit': {
        // เลือกหน่วยที่เหมาะสม (ป.3)
        const objects = [
          { name: 'เหรียญ 1 บาท', unit: 'กรัม' },
          { name: 'ถุงน้ำตาล', unit: 'กิโลกรัม' },
          { name: 'รถยนต์', unit: 'ตัน' },
          { name: 'ปากกา', unit: 'กรัม' }
        ];
        const obj = objects[i % objects.length];
        question = `ควรใช้หน่วยใดวัดน้ำหนักของ${obj.name}?`;
        correctAnswer = obj.unit;
        choices = shuffleArray(['กรัม', 'ขีด', 'กิโลกรัม', 'ตัน']);
        explanation = `${obj.name}เหมาะสมที่จะชั่งด้วยหน่วย${obj.unit}`;
        break;
      }
      case 'read_scale': {
        // อ่านเครื่องชั่ง (ป.3)
        const weight = randInt(1, 10) * 100;
        question = `เครื่องชั่งบอก ${weight} กรัม ถ้าแสดงเป็นกิโลกรัมจะเป็นเท่าไร?`;
        correctAnswer = weight / 1000;
        choices = generateChoices(correctAnswer);
        explanation = `${weight} กรัม = ${weight} ÷ 1000 = ${correctAnswer} กก.`;
        break;
      }
      case 'calculate_weight': {
        // คำนวณน้ำหนัก (ป.3): บวก-ลบ-คูณ-หาร
        const operationType = i % 4;
        if (operationType === 0) {
          // บวก
          const a = randInt(100, 500);
          const b = randInt(100, 500);
          correctAnswer = a + b;
          question = `ส้มหนัก ${a} กรัม แอปเปิลหนัก ${b} กรัม รวมหนักกี่กรัม?`;
          choices = generateChoices(correctAnswer);
          explanation = `${a} + ${b} = ${correctAnswer} กรัม`;
        } else if (operationType === 1) {
          // ลบ
          const a = randInt(500, 1000);
          const b = randInt(100, 400);
          correctAnswer = a - b;
          question = `เนื้อหนัก ${a} กรัม ตัดไป ${b} กรัม เหลือหนักกี่กรัม?`;
          choices = generateChoices(correctAnswer);
          explanation = `${a} - ${b} = ${correctAnswer} กรัม`;
        } else if (operationType === 2) {
          // คูณ
          const weight = randInt(10, 50);
          const quantity = randInt(2, 5);
          correctAnswer = weight * quantity;
          question = `แอปเปิล 1 ผลหนัก ${weight} กรัม ถ้ามี ${quantity} ผล หนักรวมกี่กรัม?`;
          choices = generateChoices(correctAnswer);
          explanation = `${weight} × ${quantity} = ${correctAnswer} กรัม`;
        } else {
          // หาร
          const total = randInt(100, 500);
          const parts = randInt(2, 5);
          correctAnswer = Math.floor(total / parts);
          question = `แบ่งน้ำตาล ${total} กรัม เป็น ${parts} ส่วนเท่า ๆ กัน ส่วนละกี่กรัม?`;
          choices = generateChoices(correctAnswer);
          explanation = `${total} ÷ ${parts} = ${correctAnswer} กรัม`;
        }
        break;
      }
      case 'kg_to_g': {
        const kg = randInt(1, 5);
        correctAnswer = kg * 1000;
        question = `${kg} กิโลกรัม เท่ากับกี่กรัม?`;
        choices = generateChoices(correctAnswer);
        explanation = `1 กิโลกรัม = 1,000 กรัม ดังนั้น ${kg} กิโลกรัม = ${correctAnswer} กรัม`;
        break;
      }
      case 'g_to_kg': {
        const kg = randInt(2, 5);
        const grams = kg * 1000;
        correctAnswer = kg;
        question = `${grams} กรัม เท่ากับกี่กิโลกรัม?`;
        choices = generateChoices(correctAnswer);
        explanation = `1,000 กรัม = 1 กิโลกรัม ดังนั้น ${grams} กรัม = ${kg} กิโลกรัม`;
        break;
      }
      case 'khit_to_g': {
        const khit = randInt(2, 8);
        correctAnswer = khit * 100;
        question = `${khit} ขีด เท่ากับกี่กรัม? (1 ขีด = 100 กรัม)`;
        choices = generateChoices(correctAnswer);
        explanation = `1 ขีด = 100 กรัม ดังนั้น ${khit} ขีด = ${correctAnswer} กรัม`;
        break;
      }
      case 'compare_weight': {
        const objects = [
          { name: 'กล้วย', weight: '100 กรัม' },
          { name: 'แตงโม', weight: '2 กิโลกรัม' },
          { name: 'แอปเปิล', weight: '150 กรัม' },
          { name: 'มะม่วง', weight: '300 กรัม' }
        ];
        const selected = shuffleArray(objects).slice(0, 3);
        const weights = selected.map(o => {
          const match = o.weight.match(/(\d+)\s*(กรัม|กิโลกรัม)/);
          if (!match) return 0;
          const value = parseInt(match[1]);
          return match[2] === 'กิโลกรัม' ? value * 1000 : value;
        });
        const maxIndex = weights.indexOf(Math.max(...weights));
        correctAnswer = selected[maxIndex].name;
        question = `ข้อใดหนักที่สุด?\n${selected.map(o => `${o.name} ${o.weight}`).join('\n')}`;
        choices = shuffleArray(selected.map(o => o.name));
        explanation = `${correctAnswer} หนักที่สุดเพราะมีน้ำหนัก ${selected[maxIndex].weight}`;
        break;
      }
      case 'word_problem': {
        const fruit1 = randInt(200, 500);
        const fruit2 = randInt(200, 500);
        correctAnswer = fruit1 + fruit2;
        question = `มะม่วงหนัก ${fruit1} กรัม กล้วยหนัก ${fruit2} กรัม รวมหนักกี่กรัม?`;
        choices = generateChoices(correctAnswer);
        explanation = `วิธีคิด: ${fruit1} + ${fruit2} = ${correctAnswer} กรัม`;
        break;
      }
    }
    
    questions.push({
      id: `weighing_${Date.now()}_${i}_${Math.random()}`,
      skill: 'weighing',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateFractionsQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  // Determine if this is Grade 4 level based on description
  const isGrade4 = config.description?.includes('แท้-เศษเกิน-จำนวนคละ');
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = isGrade4 
      ? ['proper_improper_mixed', 'equivalent_fractions', 'simplest_form', 'compare_unlike', 'order_fractions', 'add_fractions', 'subtract_fractions', 'mixed_operations']
      : ['whole_half_unit', 'read_write_fraction', 'fraction_equals_one', 'one_unit_of_fraction', 'compare_same_denominator'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'whole_half_unit': {
        // ปริมาณเต็มหน่วย/ครึ่งหน่วย
        const items = ['แอปเปิ้ล', 'ส้ม', 'กล้วย', 'แตงโม', 'ขนมปัง'];
        const item = items[randInt(0, items.length - 1)];
        const isWhole = i % 2 === 0;
        
        if (isWhole) {
          question = `มี${item} 1 ลูกเต็ม จะเขียนเป็นเศษส่วนได้ว่าอย่างไร?`;
          correctAnswer = '1 หรือ 2/2';
          choices = shuffleArray(['1 หรือ 2/2', '1/2', '2/1', '0']);
          explanation = `${item} 1 ลูกเต็ม เขียนเป็นเศษส่วนได้เป็น 1 หรือ 2/2`;
        } else {
          question = `มี${item}ครึ่งลูก จะเขียนเป็นเศษส่วนได้ว่าอย่างไร?`;
          correctAnswer = '1/2';
          choices = shuffleArray(['1/2', '2/1', '1', '2/2']);
          explanation = `${item}ครึ่งลูก เขียนเป็นเศษส่วนได้เป็น 1/2`;
        }
        break;
      }
      case 'read_write_fraction': {
        // เขียนและอ่านค่าเป็นเศษส่วน
        const numerators = [1, 2, 3];
        const denominators = [2, 3, 4, 5];
        const num = numerators[randInt(0, numerators.length - 1)];
        const den = denominators[randInt(0, denominators.length - 1)];
        
        const readingTypes = ['write', 'read'];
        const readType = readingTypes[i % 2];
        
        if (readType === 'write') {
          const thaiNumbers: Record<number, string> = {
            1: 'หนึ่ง', 2: 'สอง', 3: 'สาม', 4: 'สี่', 5: 'ห้า'
          };
          question = `"${thaiNumbers[num]}ส่วน${thaiNumbers[den]}" เขียนเป็นตัวเลขได้ว่าอย่างไร?`;
          correctAnswer = `${num}/${den}`;
          choices = shuffleArray([
            `${num}/${den}`,
            `${den}/${num}`,
            `${num}/${den + 1}`,
            `${num + 1}/${den}`
          ]);
          explanation = `${thaiNumbers[num]}ส่วน${thaiNumbers[den]} เขียนเป็นตัวเลข ${num}/${den}`;
        } else {
          question = `เศษส่วน ${num}/${den} อ่านว่าอย่างไร?`;
          const thaiNumbers: Record<number, string> = {
            1: 'หนึ่ง', 2: 'สอง', 3: 'สาม', 4: 'สี่', 5: 'ห้า'
          };
          correctAnswer = `${thaiNumbers[num]}ส่วน${thaiNumbers[den]}`;
          choices = shuffleArray([
            `${thaiNumbers[num]}ส่วน${thaiNumbers[den]}`,
            `${thaiNumbers[den]}ส่วน${thaiNumbers[num]}`,
            `${thaiNumbers[num]}ใน${thaiNumbers[den]}`,
            `${thaiNumbers[den]}ใน${thaiNumbers[num]}`
          ]);
          explanation = `เศษส่วน ${num}/${den} อ่านว่า ${thaiNumbers[num]}ส่วน${thaiNumbers[den]}`;
        }
        break;
      }
      case 'fraction_equals_one': {
        // เศษส่วนที่เท่ากับ 1
        const denominators = [2, 3, 4, 5, 6];
        const den = denominators[randInt(0, denominators.length - 1)];
        
        question = `เศษส่วนใดเท่ากับ 1?`;
        correctAnswer = `${den}/${den}`;
        choices = shuffleArray([
          `${den}/${den}`,
          `1/${den}`,
          `${den}/1`,
          `${den - 1}/${den}`
        ]);
        explanation = `เศษส่วนที่ตัวเศษและตัวส่วนเท่ากันจะมีค่าเท่ากับ 1 ดังนั้น ${den}/${den} = 1`;
        break;
      }
      case 'one_unit_of_fraction': {
        // หา 1 หน่วยของเศษส่วน
        const wholes = [2, 3, 4];
        const whole = wholes[randInt(0, wholes.length - 1)];
        const denominators = [2, 3, 4];
        const den = denominators[randInt(0, denominators.length - 1)];
        const total = whole * den;
        
        question = `ถ้า ${den}/${den} เท่ากับ ${whole} แล้ว 1/${den} เท่ากับเท่าไร?`;
        correctAnswer = whole / den;
        choices = generateChoices(whole / den);
        explanation = `${den}/${den} = ${whole} ดังนั้น 1/${den} = ${whole} ÷ ${den} = ${whole / den}`;
        break;
      }
      case 'compare_same_denominator': {
        // เปรียบเทียบเศษส่วนเมื่อตัวส่วนเท่ากัน
        const den = randInt(3, 6);
        const num1 = randInt(1, den - 1);
        let num2 = randInt(1, den - 1);
        while (num2 === num1) {
          num2 = randInt(1, den - 1);
        }
        
        const compareType = i % 3;
        if (compareType === 0) {
          // หาเศษส่วนที่มากกว่า
          question = `เศษส่วนใดมากกว่า?`;
          correctAnswer = num1 > num2 ? `${num1}/${den}` : `${num2}/${den}`;
          choices = shuffleArray([`${num1}/${den}`, `${num2}/${den}`]);
          if (choices.length < 4) {
            const num3 = num1 > num2 ? num1 - 1 : num2 - 1;
            if (num3 > 0) choices.push(`${num3}/${den}`);
            const num4 = Math.min(num1, num2) + 1;
            if (num4 < den) choices.push(`${num4}/${den}`);
          }
          explanation = `เมื่อตัวส่วนเท่ากัน เศษส่วนที่มีตัวเศษมากกว่าจะมีค่ามากกว่า ดังนั้น ${correctAnswer} มากกว่า`;
        } else if (compareType === 1) {
          // หาเศษส่วนที่น้อยกว่า
          question = `เศษส่วนใดน้อยกว่า?`;
          correctAnswer = num1 < num2 ? `${num1}/${den}` : `${num2}/${den}`;
          choices = shuffleArray([`${num1}/${den}`, `${num2}/${den}`]);
          if (choices.length < 4) {
            const num3 = num1 < num2 ? num1 + 1 : num2 + 1;
            if (num3 < den) choices.push(`${num3}/${den}`);
            const num4 = Math.max(num1, num2) - 1;
            if (num4 > 0) choices.push(`${num4}/${den}`);
          }
          explanation = `เมื่อตัวส่วนเท่ากัน เศษส่วนที่มีตัวเศษน้อยกว่าจะมีค่าน้อยกว่า ดังนั้น ${correctAnswer} น้อยกว่า`;
        } else {
          // เรียงลำดับ
          const nums = [num1, num2].sort((a, b) => a - b);
          question = `เรียงเศษส่วนจากน้อยไปมาก: ${num1}/${den}, ${num2}/${den}`;
          correctAnswer = `${nums[0]}/${den}, ${nums[1]}/${den}`;
          const wrongOrder = `${nums[1]}/${den}, ${nums[0]}/${den}`;
          choices = shuffleArray([correctAnswer, wrongOrder]);
          if (choices.length < 4) {
            choices.push(`${nums[0]}/${den + 1}, ${nums[1]}/${den + 1}`);
            choices.push(`${nums[0]}/${den}, ${nums[1]}/${den + 1}`);
          }
          explanation = `เมื่อตัวส่วนเท่ากัน เรียงตามตัวเศษจากน้อยไปมาก: ${correctAnswer}`;
        }
        break;
      }
    }
    
    questions.push({
      id: `fractions_${Date.now()}_${i}_${Math.random()}`,
      skill: 'fractions',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateAverageQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['simple_average', 'find_total_from_average', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'simple_average': {
        // หาค่าเฉลี่ยอย่างง่าย (ป.4)
        const count = randInt(3, 5);
        const numbers = Array.from({ length: count }, () => randInt(10, 50));
        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / count;
        
        question = `หาค่าเฉลี่ยของจำนวน: ${numbers.join(', ')}`;
        correctAnswer = avg;
        choices = generateChoices(avg);
        explanation = `ค่าเฉลี่ย = (${numbers.join(' + ')}) ÷ ${count} = ${sum} ÷ ${count} = ${avg}`;
        break;
      }
      case 'find_total_from_average': {
        // หาผลรวมจากค่าเฉลี่ย (ป.4)
        const count = randInt(3, 5);
        const avg = randInt(15, 40);
        const total = avg * count;
        
        question = `ถ้าค่าเฉลี่ยของจำนวน ${count} ตัวเลข เท่ากับ ${avg} ผลรวมของจำนวนทั้งหมดเท่าไร?`;
        correctAnswer = total;
        choices = generateChoices(total);
        explanation = `ผลรวม = ค่าเฉลี่ย × จำนวนตัวเลข = ${avg} × ${count} = ${total}`;
        break;
      }
      case 'word_problem': {
        // โจทย์ปัญหาค่าเฉลี่ย (ป.4)
        const days = randInt(3, 5);
        const scores = Array.from({ length: days }, () => randInt(60, 100));
        const sum = scores.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / days);
        
        const subjects = ['คณิตศาสตร์', 'วิทยาศาสตร์', 'ภาษาไทย', 'สังคมศึกษา'];
        const subject = subjects[i % subjects.length];
        
        question = `คะแนนสอบวิชา${subject} ${days} ครั้ง ได้ ${scores.join(', ')} คะแนน หาคะแนนเฉลี่ย`;
        correctAnswer = avg;
        choices = generateChoices(avg);
        explanation = `คะแนนเฉลี่ย = (${scores.join(' + ')}) ÷ ${days} = ${sum} ÷ ${days} = ${avg}`;
        break;
      }
    }
    
    questions.push({
      id: `average_${Date.now()}_${i}_${Math.random()}`,
      skill: 'average',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generatePlaceholderQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const a = randInt(1, 20);
    const b = randInt(1, 20);
    const correctAnswer = a + b;
    
    questions.push({
      id: `${config.skill}_${Date.now()}_${i}_${Math.random()}`,
      skill: config.skill,
      question: `${a} + ${b} = ? (${config.skill})`,
      correctAnswer,
      choices: generateChoices(correctAnswer),
      difficulty: config.difficulty,
      explanation: `คำถามจำลองสำหรับ ${config.skill}`
    });
  }
  
  return questions;
};

const generateDecimalsQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['read_write', 'place_value', 'compare', 'order', 'add_decimals', 'subtract_decimals', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'read_write': {
        const whole = randInt(0, 99);
        const decimal = randInt(0, 999);
        const decimalStr = String(decimal).padStart(3, '0');
        question = `${whole}.${decimalStr} อ่านว่าอย่างไร`;
        correctAnswer = `${whole} จุด ${decimalStr.split('').join(' ')}`;
        choices = shuffleArray([
          `${whole} จุด ${decimalStr.split('').join(' ')}`,
          `${whole} จุด ${decimal}`,
          `${whole} และ ${decimal}`,
          `${whole}${decimal}`
        ]);
        explanation = `ทศนิยม ${whole}.${decimalStr} อ่านว่า ${whole} จุด ${decimalStr.split('').join(' ')}`;
        break;
      }
      case 'place_value': {
        const num = (Math.random() * 100).toFixed(2);
        const parts = num.split('.');
        const tenths = parts[1][0];
        question = `ในทศนิยม ${num} ตัวเลข ${tenths} อยู่ในหลักใด`;
        correctAnswer = 'หลักเสี้ยว';
        choices = shuffleArray(['หลักสิบ', 'หลักหน่วย', 'หลักเสี้ยว', 'หลักสตางค์']);
        explanation = `ตำแหน่งแรกหลังจุดทศนิยมคือหลักเสี้ยว`;
        break;
      }
      case 'compare': {
        const dec1 = (Math.random() * 10).toFixed(2);
        const dec2 = (Math.random() * 10).toFixed(2);
        const comp = parseFloat(dec1) > parseFloat(dec2) ? '>' : parseFloat(dec1) < parseFloat(dec2) ? '<' : '=';
        question = `เปรียบเทียบ ${dec1} กับ ${dec2}`;
        correctAnswer = comp;
        choices = shuffleArray(['>', '<', '=']);
        explanation = `${dec1} ${comp} ${dec2}`;
        break;
      }
      case 'order': {
        const decs = [
          (Math.random() * 5).toFixed(1),
          (Math.random() * 5 + 5).toFixed(1),
          (Math.random() * 5 + 10).toFixed(1)
        ];
        const sorted = [...decs].sort((a, b) => parseFloat(a) - parseFloat(b));
        question = `เรียงลำดับจากน้อยไปมาก: ${decs.join(', ')}`;
        correctAnswer = sorted.join(', ');
        choices = shuffleArray([
          sorted.join(', '),
          decs.join(', '),
          [...decs].reverse().join(', '),
          [...sorted].reverse().join(', ')
        ]);
        explanation = `เรียงจากน้อยไปมาก: ${sorted.join(', ')}`;
        break;
      }
      case 'add_decimals': {
        const add1 = (Math.random() * 50).toFixed(2);
        const add2 = (Math.random() * 50).toFixed(2);
        const sumDec = (parseFloat(add1) + parseFloat(add2)).toFixed(2);
        question = `${add1} + ${add2} = เท่าใด`;
        correctAnswer = sumDec;
        choices = generateChoices(parseFloat(sumDec));
        explanation = `${add1} + ${add2} = ${sumDec}`;
        break;
      }
      case 'subtract_decimals': {
        const sub1 = (Math.random() * 50 + 50).toFixed(2);
        const sub2 = (Math.random() * 50).toFixed(2);
        const diffDec = (parseFloat(sub1) - parseFloat(sub2)).toFixed(2);
        question = `${sub1} - ${sub2} = เท่าใด`;
        correctAnswer = diffDec;
        choices = generateChoices(parseFloat(diffDec));
        explanation = `${sub1} - ${sub2} = ${diffDec}`;
        break;
      }
      case 'word_problem': {
        const price1 = (Math.random() * 100 + 50).toFixed(2);
        const price2 = (Math.random() * 50 + 20).toFixed(2);
        const totalPrice = (parseFloat(price1) + parseFloat(price2)).toFixed(2);
        question = `ซื้อของชิ้นที่ 1 ราคา ${price1} บาท และชิ้นที่ 2 ราคา ${price2} บาท รวมเป็นเงินเท่าใด`;
        correctAnswer = totalPrice;
        choices = generateChoices(parseFloat(totalPrice));
        explanation = `${price1} + ${price2} = ${totalPrice} บาท`;
        break;
      }
      default:
        question = 'ทศนิยม';
        correctAnswer = '0';
        choices = ['0', '1', '2', '3'];
        explanation = '';
    }
    
    questions.push({
      id: `decimals_${Date.now()}_${i}_${Math.random()}`,
      skill: 'decimals',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateAnglesQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['identify_elements', 'angle_naming', 'angle_types', 'measure_angle', 'compare_angles', 'construct_angle'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'identify_elements': {
        const elements = ['จุด', 'เส้นตรง', 'รังสี', 'ส่วนของเส้นตรง'];
        const element = elements[i % elements.length];
        question = `${element} มีลักษณะอย่างไร`;
        const answers = {
          'จุด': { correct: 'ไม่มีความยาว', exp: 'จุดเป็นตำแหน่งไม่มีขนาด' },
          'เส้นตรง': { correct: 'ยาวไม่สิ้นสุดทั้งสองข้าง', exp: 'เส้นตรงทอดยาวไม่สิ้นสุดทั้งสองทิศทาง' },
          'รังสี': { correct: 'ยาวไม่สิ้นสุดข้างเดียว', exp: 'รังสีมีจุดเริ่มต้นและทอดยาวไปทางเดียว' },
          'ส่วนของเส้นตรง': { correct: 'มีความยาวจำกัด', exp: 'ส่วนของเส้นตรงมีจุดเริ่มต้นและจุดสิ้นสุด' }
        };
        correctAnswer = answers[element as keyof typeof answers].correct;
        choices = shuffleArray(['ไม่มีความยาว', 'มีความยาวจำกัด', 'ยาวไม่สิ้นสุดทั้งสองข้าง', 'ยาวไม่สิ้นสุดข้างเดียว']);
        explanation = answers[element as keyof typeof answers].exp;
        break;
      }
      case 'angle_types': {
        const angles = [
          { name: 'มุมแหลม', min: 5, max: 85 },
          { name: 'มุมฉาก', min: 90, max: 90 },
          { name: 'มุมป้าน', min: 95, max: 175 },
          { name: 'มุมเฉียง', min: 180, max: 180 }
        ];
        const angle = angles[i % angles.length];
        const degree = randInt(angle.min, angle.max);
        question = `มุม ${degree} องศา เป็นมุมประเภทใด`;
        correctAnswer = angle.name;
        choices = shuffleArray(['มุมแหลม', 'มุมฉาก', 'มุมป้าน', 'มุมเฉียง']);
        explanation = degree < 90 ? 'มุมน้อยกว่า 90 องศา เป็นมุมแหลม'
          : degree === 90 ? 'มุมเท่ากับ 90 องศา เป็นมุมฉาก'
          : degree < 180 ? 'มุมมากกว่า 90 แต่น้อยกว่า 180 องศา เป็นมุมป้าน'
          : 'มุมเท่ากับ 180 องศา เป็นมุมเฉียง';
        break;
      }
      case 'measure_angle': {
        const measuredAngle = [30, 45, 60, 90, 120, 135, 150][randInt(0, 6)];
        const angleB = measuredAngle + 30;
        question = `ถ้ามุม A มีขนาด ${measuredAngle} องศา และมุม B มีขนาด ${angleB} องศา มุมใดใหญ่กว่า`;
        correctAnswer = 'มุม B';
        choices = shuffleArray(['มุม A', 'มุม B', 'เท่ากัน', 'ไม่สามารถบอกได้']);
        explanation = `${angleB} > ${measuredAngle} จึง มุม B ใหญ่กว่า`;
        break;
      }
      case 'compare_angles': {
        const angleA = randInt(10, 170);
        const angleB = randInt(10, 170);
        const angleComp = angleA > angleB ? 'มุม A ใหญ่กว่า' : angleA < angleB ? 'มุม B ใหญ่กว่า' : 'เท่ากัน';
        question = `มุม A = ${angleA}° และมุม B = ${angleB}° เปรียบเทียบขนาดมุม`;
        correctAnswer = angleComp;
        choices = shuffleArray(['มุม A ใหญ่กว่า', 'มุม B ใหญ่กว่า', 'เท่ากัน', 'ไม่สามารถเปรียบเทียบได้']);
        explanation = `${angleA}° ${angleA > angleB ? '>' : angleA < angleB ? '<' : '='} ${angleB}°`;
        break;
      }
      case 'construct_angle': {
        const constructAngle = [30, 45, 60, 90, 120, 135][randInt(0, 5)];
        question = `ถ้าต้องการสร้างมุม ${constructAngle} องศา ควรใช้เครื่องมืออะไร`;
        correctAnswer = 'โปรแทรกเตอร์';
        choices = shuffleArray(['โปรแทรกเตอร์', 'ไม้บรรทัด', 'วงเวียน', 'ดินสอ']);
        explanation = 'โปรแทรกเตอร์ใช้วัดและสร้างมุมในขนาดที่ต้องการ';
        break;
      }
      case 'angle_naming': {
        question = `มุมที่มีจุดยอด B และแขนมุมเป็นรังสี BA และ BC เรียกว่ามุมอะไร`;
        correctAnswer = 'มุม ABC';
        choices = shuffleArray(['มุม ABC', 'มุม BAC', 'มุม B', 'มุม CBA']);
        explanation = 'เรียกชื่อมุมโดยใช้อักษร 3 ตัว โดยจุดยอดอยู่ตรงกลาง';
        break;
      }
      default:
        question = 'มุม';
        correctAnswer = '1';
        choices = ['1', '2', '3', '4'];
        explanation = '';
    }
    
    questions.push({
      id: `angles_${Date.now()}_${i}_${Math.random()}`,
      skill: 'angles',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateRectanglesQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['identify_type', 'properties', 'perimeter', 'area', 'word_problem_perimeter', 'word_problem_area'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'identify_type': {
        const shapes = ['สี่เหลี่ยมจัตุรัส', 'สี่เหลี่ยมผืนผ้า'];
        const shape = shapes[i % 2];
        question = `${shape} มีสมบัติอย่างไร`;
        if (shape === 'สี่เหลี่ยมจัตุรัส') {
          correctAnswer = 'ทุกด้านเท่ากัน ทุกมุมเป็นมุมฉาก';
          choices = shuffleArray([
            'ทุกด้านเท่ากัน ทุกมุมเป็นมุมฉาก',
            'ด้านตรงข้ามเท่ากัน',
            'มีด้านคู่หนึ่งขนาน',
            'ไม่มีมุมฉาก'
          ]);
          explanation = 'สี่เหลี่ยมจัตุรัสมี 4 ด้านเท่ากัน และทุกมุมเป็นมุมฉาก';
        } else {
          correctAnswer = 'ด้านตรงข้ามเท่ากัน ทุกมุมเป็นมุมฉาก';
          choices = shuffleArray([
            'ด้านตรงข้ามเท่ากัน ทุกมุมเป็นมุมฉาก',
            'ทุกด้านเท่ากัน',
            'มีด้านคู่หนึ่งขนาน',
            'ไม่มีมุมฉาก'
          ]);
          explanation = 'สี่เหลี่ยมผืนผ้ามีด้านตรงข้ามเท่ากัน และทุกมุมเป็นมุมฉาก';
        }
        break;
      }
      case 'properties': {
        question = `สี่เหลี่ยมจัตุรัสมีมุมฉากกี่มุม`;
        correctAnswer = '4';
        choices = shuffleArray(['2', '3', '4', '1']);
        explanation = 'สี่เหลี่ยมจัตุรัสมี 4 มุม และทุกมุมเป็นมุมฉาก';
        break;
      }
      case 'perimeter': {
        const length = randInt(5, 15);
        const width = randInt(3, 12);
        const perimeter = 2 * (length + width);
        question = `สี่เหลี่ยมผืนผ้ามีความยาว ${length} ซม. และความกว้าง ${width} ซม. ความยาวรอบรูปเท่าใด`;
        correctAnswer = perimeter;
        choices = generateChoices(perimeter);
        explanation = `ความยาวรอบรูป = 2 × (${length} + ${width}) = ${perimeter} ซม.`;
        break;
      }
      case 'area': {
        const areaLength = randInt(4, 16);
        const areaWidth = randInt(3, 13);
        const area = areaLength * areaWidth;
        question = `สี่เหลี่ยมผืนผ้ามีความยาว ${areaLength} ม. และความกว้าง ${areaWidth} ม. พื้นที่เท่าใด`;
        correctAnswer = area;
        choices = generateChoices(area);
        explanation = `พื้นที่ = ${areaLength} × ${areaWidth} = ${area} ตร.ม.`;
        break;
      }
      case 'word_problem_perimeter': {
        const gardenLength = randInt(10, 25);
        const gardenWidth = randInt(5, 15);
        const gardenPerimeter = 2 * (gardenLength + gardenWidth);
        question = `สวนสี่เหลี่ยมผืนผ้ามีความยาว ${gardenLength} ม. และความกว้าง ${gardenWidth} ม. ต้องการทำรั้วรอบสวน ต้องใช้รั้วยาวกี่เมตร`;
        correctAnswer = gardenPerimeter;
        choices = generateChoices(gardenPerimeter);
        explanation = `รั้วรอบสวน = 2 × (${gardenLength} + ${gardenWidth}) = ${gardenPerimeter} ม.`;
        break;
      }
      case 'word_problem_area': {
        const roomLength = randInt(4, 12);
        const roomWidth = randInt(3, 9);
        const roomArea = roomLength * roomWidth;
        question = `ห้องสี่เหลี่ยมผืนผ้ามีความยาว ${roomLength} ม. และความกว้าง ${roomWidth} ม. ต้องการปูกระเบื้อง ต้องใช้กระเบื้องกี่ตารางเมตร`;
        correctAnswer = roomArea;
        choices = generateChoices(roomArea);
        explanation = `พื้นที่ห้อง = ${roomLength} × ${roomWidth} = ${roomArea} ตร.ม.`;
        break;
      }
      default:
        question = 'สี่เหลี่ยมมุมฉาก';
        correctAnswer = '0';
        choices = ['0', '1', '2', '3'];
        explanation = '';
    }
    
    questions.push({
      id: `rectangles_${Date.now()}_${i}_${Math.random()}`,
      skill: 'rectangles',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

const generateDataPresentationQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['read_table', 'read_chart', 'interpret_data', 'compare_data', 'find_total', 'find_difference'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'read_table': {
        const fruits = ['แอปเปิล', 'กล้วย', 'ส้ม'];
        const quantities = [15, 20, 12];
        const fruitIndex = i % fruits.length;
        question = `จากตารางแสดงจำนวนผลไม้: ${fruits[0]} ${quantities[0]} ผล, ${fruits[1]} ${quantities[1]} ผล, ${fruits[2]} ${quantities[2]} ผล มี${fruits[fruitIndex]}กี่ผล`;
        correctAnswer = quantities[fruitIndex];
        choices = generateChoices(quantities[fruitIndex]);
        explanation = `จากตารางแสดงว่า ${fruits[fruitIndex]} มี ${quantities[fruitIndex]} ผล`;
        break;
      }
      case 'read_chart': {
        const students = [25, 30, 28, 32];
        const grade = i % 4;
        question = `จากแผนภูมิแท่งแสดงจำนวนนักเรียน: ป.1 = 25 คน, ป.2 = 30 คน, ป.3 = 28 คน, ป.4 = 32 คน ป.${grade + 1} มีนักเรียนกี่คน`;
        correctAnswer = students[grade];
        choices = generateChoices(students[grade]);
        explanation = `จากแผนภูมิแสดงว่า ป.${grade + 1} มี ${students[grade]} คน`;
        break;
      }
      case 'interpret_data': {
        const sales = [100, 150, 120, 180];
        const maxSales = Math.max(...sales);
        const maxDay = sales.indexOf(maxSales) + 1;
        question = `ร้านค้าขายของได้ วันที่ 1 = 100 บาท, วันที่ 2 = 150 บาท, วันที่ 3 = 120 บาท, วันที่ 4 = 180 บาท วันไหนขายได้มากที่สุด`;
        correctAnswer = `วันที่ ${maxDay}`;
        choices = shuffleArray(['วันที่ 1', 'วันที่ 2', 'วันที่ 3', 'วันที่ 4']);
        explanation = `วันที่ ${maxDay} ขายได้ ${maxSales} บาท ซึ่งมากที่สุด`;
        break;
      }
      case 'compare_data': {
        const classA = 28;
        const classB = 32;
        const diff = classB - classA;
        question = `ห้อง A มีนักเรียน ${classA} คน ห้อง B มีนักเรียน ${classB} คน ห้อง B มีนักเรียนมากกว่าห้อง A กี่คน`;
        correctAnswer = diff;
        choices = generateChoices(diff);
        explanation = `${classB} - ${classA} = ${diff} คน`;
        break;
      }
      case 'find_total': {
        const week = [50, 60, 55, 70, 65];
        const total = week.reduce((a, b) => a + b, 0);
        question = `ร้านขายของได้ จันทร์ 50 บาท, อังคาร 60 บาท, พุธ 55 บาท, พฤหัส 70 บาท, ศุกร์ 65 บาท รวมทั้งสัปดาห์ขายได้กี่บาท`;
        correctAnswer = total;
        choices = generateChoices(total);
        explanation = `50 + 60 + 55 + 70 + 65 = ${total} บาท`;
        break;
      }
      case 'find_difference': {
        const month1 = 120;
        const month2 = 150;
        const monthDiff = month2 - month1;
        question = `เดือนแรกขายได้ ${month1} ชิ้น เดือนที่สองขายได้ ${month2} ชิ้น เดือนที่สองขายได้เพิ่มขึ้นกี่ชิ้น`;
        correctAnswer = monthDiff;
        choices = generateChoices(monthDiff);
        explanation = `${month2} - ${month1} = ${monthDiff} ชิ้น`;
        break;
      }
      default:
        question = 'การนำเสนอข้อมูล';
        correctAnswer = '0';
        choices = ['0', '1', '2', '3'];
        explanation = '';
    }
    
    questions.push({
      id: `dataPresentaton_${Date.now()}_${i}_${Math.random()}`,
      skill: 'dataPresentaton',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty,
      explanation
    });
  }
  
  return questions;
};

export const generateAssessmentQuestions = (
  grade: number,
  semester: number
): AssessmentQuestion[] => {
  const config = curriculumConfig[`grade${grade}`]?.[`semester${semester}`];
  
  if (!config) {
    console.warn(`No curriculum found for grade ${grade} semester ${semester}`);
    return [];
  }
  
  const allQuestions: AssessmentQuestion[] = [];
  
  for (const skillConfig of config) {
    let questions: AssessmentQuestion[] = [];
    
    switch (skillConfig.skill) {
      case 'counting':
        questions = generateCountingQuestions(skillConfig);
        break;
      case 'comparing':
        questions = generateComparingQuestions(skillConfig);
        break;
      case 'ordering':
        questions = generateOrderingQuestions(skillConfig);
        break;
      case 'placeValue':
        questions = generatePlaceValueQuestions(skillConfig);
        break;
      case 'addition':
        questions = generateAdditionQuestions(skillConfig);
        break;
      case 'subtraction':
        questions = generateSubtractionQuestions(skillConfig);
        break;
      case 'patterns':
        questions = generatePatternsQuestions(skillConfig);
        break;
      case 'shapes':
        questions = generateShapesQuestions(skillConfig);
        break;
      case 'measurement':
        questions = generateMeasurementQuestions(skillConfig);
        break;
      case 'pictograph':
        questions = generatePictographQuestions(skillConfig);
        break;
      case 'multiplication':
        questions = generateMultiplicationQuestions(skillConfig);
        break;
      case 'money':
        questions = generateMoneyQuestions(skillConfig);
        break;
      case 'weighing':
        questions = generateWeighingQuestions(skillConfig);
        break;
      case 'time':
        questions = generateTimeQuestions(skillConfig);
        break;
      case 'volume':
        questions = generateVolumeQuestions(skillConfig);
        break;
      case 'mixedOperations':
        questions = generateMixedOperationsQuestions(skillConfig);
        break;
      case 'division':
        questions = generateDivisionQuestions(skillConfig);
        break;
      case 'fractions':
        questions = generateFractionsQuestions(skillConfig);
        break;
      case 'average':
        questions = generateAverageQuestions(skillConfig);
        break;
      case 'decimals':
        questions = generateDecimalsQuestions(skillConfig);
        break;
      case 'angles':
        questions = generateAnglesQuestions(skillConfig);
        break;
      case 'rectangles':
        questions = generateRectanglesQuestions(skillConfig);
        break;
      case 'dataPresentaton':
        questions = generateDataPresentationQuestions(skillConfig);
        break;
      default:
        console.warn(`Skill ${skillConfig.skill} not implemented yet, using placeholder`);
        questions = generatePlaceholderQuestions(skillConfig);
    }
    
    // Shuffle only within each skill group to maintain skill grouping
    allQuestions.push(...shuffleArray(questions));
  }
  
  // Return questions grouped by skill (no shuffling between skills)
  return allQuestions;
};

export const evaluateAssessment = (score: number): {
  level: string;
  message: string;
  stars: number;
} => {
  if (score >= 90) {
    return { level: 'excellent', message: 'ยอดเยี่ยม! คุณมีความรู้เกินระดับชั้น', stars: 3 };
  }
  if (score >= 75) {
    return { level: 'good', message: 'ดีมาก! คุณพร้อมสำหรับระดับนี้', stars: 3 };
  }
  if (score >= 60) {
    return { level: 'pass', message: 'ผ่าน! แต่ควรฝึกฝนเพิ่มเติม', stars: 2 };
  }
  return { level: 'needImprovement', message: 'ควรทบทวนและฝึกเพิ่มเติม', stars: 1 };
};
