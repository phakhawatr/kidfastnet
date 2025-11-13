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
  
  // สำหรับ ป.2 เทอม 1 (0-1000) จะมีคำถามประเภทเพิ่มเติม
  const questionTypes = max > 100 
    ? ['count_by_2', 'count_by_5', 'count_by_10', 'count_by_100', 'thai_numeral', 'odd_even', 'place_value_identify']
    : ['count_by_1', 'count_by_10', 'thai_numeral', 'hundred_chart', 'count_backward'];
  
  for (let i = 0; i < config.count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
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
    // ถ้า max > 99 แสดงว่าเป็น 3 หลัก (ร้อย สิบ หน่วย)
    const isThreeDigit = max > 99;
    const num = randInt(Math.max(min, isThreeDigit ? 100 : 21), max);
    
    const hundreds = isThreeDigit ? Math.floor(num / 100) : 0;
    const tens = Math.floor((num % 100) / 10);
    const ones = num % 10;
    
    const questionTypes = isThreeDigit 
      ? ['hundreds_place', 'tens_place', 'ones_place', 'decompose_3digit']
      : ['tens_place', 'ones_place', 'decompose'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
      case 'hundreds_place':
        question = `เลข ${num} มีหลักร้อยเป็นเท่าไร?`;
        correctAnswer = hundreds;
        choices = generateChoices(correctAnswer);
        explanation = `${num} = ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'tens_place':
        question = `เลข ${num} มีหลักสิบเป็นเท่าไร?`;
        correctAnswer = tens;
        choices = generateChoices(correctAnswer);
        explanation = isThreeDigit 
          ? `${num} = ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`
          : `${num} = ${tens} สิบ + ${ones} หน่วย`;
        break;
      case 'ones_place':
        question = `เลข ${num} มีหลักหน่วยเป็นเท่าไร?`;
        correctAnswer = ones;
        choices = generateChoices(correctAnswer);
        explanation = isThreeDigit 
          ? `${num} = ${hundreds} ร้อย + ${tens} สิบ + ${ones} หน่วย`
          : `${num} = ${tens} สิบ + ${ones} หน่วย`;
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
  
  // Updated shapes with color variants for better visibility
  const coloredShapes = [
    'triangle-red', 'triangle-blue', 'triangle-green', 
    'square-red', 'square-blue', 'square-green',
    'circle-red', 'circle-blue', 'circle-green'
  ];
  
  // รูป 2 มิติสำหรับ ป.2
  const shapes2D = [
    { name: 'สามเหลี่ยม', emoji: '🔺', sides: 3 },
    { name: 'สี่เหลี่ยมจัตุรัส', emoji: '🟦', sides: 4 },
    { name: 'สี่เหลี่ยมผืนผ้า', emoji: '▭', sides: 4 },
    { name: 'วงกลม', emoji: '⭕', sides: 0 },
    { name: 'วงรี', emoji: '⬭', sides: 0 }
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
    const questionTypes = focus2D 
      ? ['identify_2d', 'describe_2d', 'count_sides', 'draw_pattern_2d']
      : ['real_world_connection', 'count_shapes', 'pattern_creation', 'identify_3d'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: string | number = '';
    let choices: (string | number)[] = [];
    let explanation = '';
    
    switch (type) {
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
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['length_add_word_problem', 'length_subtract_word_problem', 'estimate_length'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
    switch (type) {
      case 'length_add_word_problem': {
        const len1 = randInt(20, 50);
        const len2 = randInt(15, 40);
        question = `เชือกเส้นแรกยาว ${len1} เซนติเมตร เส้นที่สองยาว ${len2} เซนติเมตร รวมกันยาวกี่เซนติเมตร?`;
        correctAnswer = len1 + len2;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'length_subtract_word_problem': {
        const total = randInt(60, 100);
        const cut = randInt(20, 50);
        question = `เชือกยาว ${total} เซนติเมตร ตัดไป ${cut} เซนติเมตร เหลือกี่เซนติเมตร?`;
        correctAnswer = total - cut;
        choices = generateChoices(correctAnswer);
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
        break;
      }
    }
    
    questions.push({
      id: `measurement_${Date.now()}_${i}_${Math.random()}`,
      skill: 'measurement',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
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
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['meaning', 'basic_division', 'with_remainder', 'multiply_divide_relation', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
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
        const quotient = randInt(2, Math.floor(max / divisor));
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
        const quotient = randInt(3, 10);
        const dividend = divisor * quotient;
        question = `ถ้า ${divisor} × ${quotient} = ${dividend} แล้ว ${dividend} ÷ ${divisor} = ?`;
        correctAnswer = quotient;
        choices = generateChoices(correctAnswer);
        explanation = `จากความสัมพันธ์ของคูณ-หาร: ${divisor} × ${quotient} = ${dividend} ดังนั้น ${dividend} ÷ ${divisor} = ${quotient}`;
        break;
      }
      case 'word_problem': {
        const total = randInt(12, 48);
        const groups = randInt(2, 6);
        const perGroup = Math.floor(total / groups);
        correctAnswer = perGroup;
        question = `นำดอกไม้ ${total} ดอก มาจัดเป็น ${groups} แจกัน เท่า ๆ กัน แจกันละกี่ดอก?`;
        choices = generateChoices(correctAnswer);
        explanation = `${total} ÷ ${groups} = ${perGroup} แจกันละ ${perGroup} ดอก`;
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
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['read_time', 'time_duration', 'calendar', 'word_problem'];
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
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['non_standard', 'liter_comparison', 'estimate', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
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
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['add_subtract', 'add_multiply', 'subtract_divide', 'multi_step'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
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
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['kg_to_g', 'g_to_kg', 'khit_to_g', 'compare_weight', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    let explanation = '';
    
    switch (type) {
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
