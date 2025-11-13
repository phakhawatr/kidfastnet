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
  
  const questionTypes = [
    'count_by_1', 'count_by_10', 'thai_numeral', 'arabic_numeral', 
    'missing_number'
  ];
  
  for (let i = 0; i < config.count; i++) {
    const type = questionTypes[i % questionTypes.length];
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
    switch (type) {
      case 'count_by_1': {
        const start = randInt(min, max - 5);
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start + idx);
        question = `เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start + missing;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'count_by_10': {
        const start = randInt(1, 5) * 10;
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start + (idx * 10));
        question = `เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 10);
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'thai_numeral': {
        const num = randInt(min, Math.min(max, 50));
        const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
        const thaiNum = num.toString().split('').map(d => thaiNumerals[parseInt(d)]).join('');
        question = `เลขไทย "${thaiNum}" เขียนเป็นเลขอารบิกว่าอะไร?`;
        correctAnswer = num;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'arabic_numeral': {
        const num = randInt(min, Math.min(max, 50));
        const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
        const thaiNum = num.toString().split('').map(d => thaiNumerals[parseInt(d)]).join('');
        question = `เลขอารบิก "${num}" เขียนเป็นเลขไทยว่าอะไร?`;
        correctAnswer = thaiNum;
        choices = [thaiNum];
        // Generate wrong Thai numerals
        for (let j = 0; j < 3; j++) {
          const wrongNum = num + randInt(-5, 5);
          if (wrongNum >= 0 && wrongNum !== num) {
            const wrongThai = wrongNum.toString().split('').map(d => thaiNumerals[parseInt(d)]).join('');
            if (!choices.includes(wrongThai)) choices.push(wrongThai);
          }
        }
        choices = shuffleArray(choices).slice(0, 4);
        break;
      }
      case 'missing_number': {
        const num = randInt(min + 1, max - 1);
        question = `จำนวนใดอยู่ระหว่าง ${num - 1} และ ${num + 1}?`;
        correctAnswer = num;
        choices = generateChoices(correctAnswer);
        break;
      }
    }
    
    questions.push({
      id: `counting_${Date.now()}_${i}_${Math.random()}`,
      skill: 'counting',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
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
    
    switch (type) {
      case 'fill_symbol': {
        let correctSymbol = num1 > num2 ? '>' : num1 < num2 ? '<' : '=';
        question = `${num1} __ ${num2} (เติมเครื่องหมาย)`;
        correctAnswer = correctSymbol;
        choices = shuffleArray(['>', '<', '=', '≠']);
        break;
      }
      case 'compare_max': {
        const nums = [num1, num2, randInt(min, max), randInt(min, max)];
        correctAnswer = Math.max(...nums);
        question = `ข้อใดมีค่ามากที่สุด? ${nums.join(', ')}`;
        choices = shuffleArray(nums);
        break;
      }
      case 'compare_min': {
        const nums = [num1, num2, randInt(min, max), randInt(min, max)];
        correctAnswer = Math.min(...nums);
        question = `ข้อใดมีค่าน้อยที่สุด? ${nums.join(', ')}`;
        choices = shuffleArray(nums);
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
        break;
      }
    }
    
    questions.push({
      id: `comparing_${Date.now()}_${i}_${Math.random()}`,
      skill: 'comparing',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
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
    
    const nums = Array.from({ length: 4 }, () => randInt(min, max));
    
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
    const num = randInt(Math.max(min, 10), max);
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    
    const questionTypes = ['tens_place', 'ones_place', 'tens_value'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number = 0;
    
    switch (type) {
      case 'tens_place':
        question = `เลข ${num} มีหลักสิบเป็นเท่าไร?`;
        correctAnswer = tens;
        break;
      case 'ones_place':
        question = `เลข ${num} มีหลักหน่วยเป็นเท่าไร?`;
        correctAnswer = ones;
        break;
      case 'tens_value':
        question = `ค่าของหลักสิบในเลข ${num} คือเท่าไร?`;
        correctAnswer = tens * 10;
        break;
    }
    
    questions.push({
      id: `placeValue_${Date.now()}_${i}_${Math.random()}`,
      skill: 'placeValue',
      question,
      correctAnswer,
      choices: generateChoices(correctAnswer),
      difficulty: config.difficulty
    });
  }
  
  return questions;
};

const generatePatternsQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['add_1', 'add_10', 'subtract_1', 'repeating_pattern'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
    switch (type) {
      case 'add_1': {
        const start = randInt(1, 20);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === 2 ? '__' : start + idx);
        question = `เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start + 2;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'add_10': {
        const start = randInt(1, 5) * 10;
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === 2 ? '__' : start + (idx * 10));
        question = `เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start + 20;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'subtract_1': {
        const start = randInt(10, 25);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === 2 ? '__' : start - idx);
        question = `เติมจำนวนที่หายไป: ${sequence.join(', ')}`;
        correctAnswer = start - 2;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'repeating_pattern': {
        const patterns = [
          { seq: ['🔵', '🔴'], correct: '🔵' },
          { seq: ['⭐', '🌙'], correct: '⭐' },
          { seq: ['🟢', '🟡'], correct: '🟢' },
          { seq: ['❤️', '💙'], correct: '❤️' }
        ];
        const pattern = patterns[i % patterns.length];
        const fullSeq = [...pattern.seq, ...pattern.seq, '__'];
        question = `รูปใดมาต่อ? ${fullSeq.join(' ')}`;
        correctAnswer = pattern.correct;
        choices = shuffleArray([pattern.seq[0], pattern.seq[1], '🟣', '💚']).slice(0, 4);
        if (!choices.includes(correctAnswer)) {
          choices[0] = correctAnswer;
        }
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
  
  const shapes2D = [
    { name: 'สามเหลี่ยม', emoji: '🔺', sides: 3 },
    { name: 'สี่เหลี่ยม', emoji: '⬜', sides: 4 },
    { name: 'วงกลม', emoji: '⭕', sides: 0 },
    { name: 'วงรี', emoji: '⬭', sides: 0 }
  ];
  
  const shapes3D = [
    { name: 'ทรงกลม', emoji: '⚽' },
    { name: 'ทรงกระบอก', emoji: '🥫' },
    { name: 'กรวย', emoji: '🔺' },
    { name: 'ทรงสี่เหลี่ยม', emoji: '📦' }
  ];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['identify_2d', 'count_sides', 'identify_3d', 'classify_dimension'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: string | number = '';
    let choices: (string | number)[] = [];
    
    switch (type) {
      case 'identify_2d': {
        const shape = shapes2D[i % shapes2D.length];
        const others = shapes2D.filter(s => s.name !== shape.name);
        question = `รูปใดเป็น${shape.name}?`;
        correctAnswer = shape.emoji;
        choices = shuffleArray([shape.emoji, ...others.slice(0, 3).map(s => s.emoji)]);
        break;
      }
      case 'count_sides': {
        const shape = shapes2D[i % shapes2D.length];
        if (shape.sides > 0) {
          question = `${shape.emoji} ${shape.name}มีกี่ด้าน?`;
          correctAnswer = shape.sides;
          choices = shuffleArray([shape.sides, shape.sides + 1, shape.sides - 1, shape.sides + 2].filter(n => n > 0));
        } else {
          const altShape = shapes2D[1]; // สี่เหลี่ยม
          question = `${altShape.emoji} ${altShape.name}มีกี่ด้าน?`;
          correctAnswer = altShape.sides;
          choices = shuffleArray([3, 4, 5, 6]);
        }
        break;
      }
      case 'identify_3d': {
        const shape = shapes3D[i % shapes3D.length];
        const others = shapes3D.filter(s => s.name !== shape.name);
        question = `รูปทรงใดเป็น${shape.name}?`;
        correctAnswer = shape.emoji;
        choices = shuffleArray([shape.emoji, ...others.slice(0, 3).map(s => s.emoji)]);
        break;
      }
      case 'classify_dimension': {
        question = `รูปทรงใดเป็น 3 มิติ?`;
        correctAnswer = shapes3D[0].emoji;
        choices = shuffleArray([shapes3D[0].emoji, shapes2D[0].emoji, shapes2D[1].emoji, shapes2D[2].emoji]);
        break;
      }
    }
    
    questions.push({
      id: `shapes_${Date.now()}_${i}_${Math.random()}`,
      skill: 'shapes',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
    });
  }
  
  return questions;
};

const generateMeasurementQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['length_convert', 'weight_convert', 'compare_length'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
    switch (type) {
      case 'length_convert': {
        const cm = randInt(1, 5) * 100;
        question = `${cm} เซนติเมตร เท่ากับกี่เมตร?`;
        correctAnswer = cm / 100;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'weight_convert': {
        const kg = randInt(1, 5);
        question = `${kg} กิโลกรัม เท่ากับกี่ขีด? (1 กก. = 2 ขีด)`;
        correctAnswer = kg * 2;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'compare_length': {
        const len1 = randInt(5, 30);
        const len2 = randInt(5, 30);
        question = `ดินสอยาว ${len1} ซม. ปากกายาว ${len2} ซม. อันไหนยาวกว่า?`;
        correctAnswer = len1 > len2 ? 'ดินสอ' : len2 > len1 ? 'ปากกา' : 'เท่ากัน';
        choices = ['ดินสอ', 'ปากกา', 'เท่ากัน'];
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
  
  const fruits = [
    { name: 'แอปเปิล', emoji: '🍎', count: 3 },
    { name: 'กล้วย', emoji: '🍌', count: 5 },
    { name: 'ส้ม', emoji: '🍊', count: 2 }
  ];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['count_specific', 'find_max', 'count_total'];
    const type = questionTypes[i % questionTypes.length];
    
    const data = [
      { name: 'แอปเปิล', emoji: '🍎', count: randInt(2, 6) },
      { name: 'กล้วย', emoji: '🍌', count: randInt(2, 6) },
      { name: 'ส้ม', emoji: '🍊', count: randInt(2, 6) }
    ];
    
    const chart = data.map(d => `${d.name}: ${d.emoji.repeat(d.count)} (${d.count})`).join('\n');
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
    switch (type) {
      case 'count_specific': {
        const item = data[i % data.length];
        question = `แผนภูมิผลไม้:\n${chart}\n\nมี${item.name}กี่ผล?`;
        correctAnswer = item.count;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'find_max': {
        const maxItem = data.reduce((max, item) => item.count > max.count ? item : max);
        question = `แผนภูมิผลไม้:\n${chart}\n\nผลไม้ใดมีมากที่สุด?`;
        correctAnswer = maxItem.name;
        choices = data.map(d => d.name);
        break;
      }
      case 'count_total': {
        const total = data.reduce((sum, item) => sum + item.count, 0);
        question = `แผนภูมิผลไม้:\n${chart}\n\nรวมทั้งหมดกี่ผล?`;
        correctAnswer = total;
        choices = generateChoices(correctAnswer);
        break;
      }
    }
    
    questions.push({
      id: `pictograph_${Date.now()}_${i}_${Math.random()}`,
      skill: 'pictograph',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
    });
  }
  
  return questions;
};

// ===== Updated Addition Questions =====

const generateAdditionQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [0, 10];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['basic', 'word_problem', 'commutative', 'symbol'];
    const type = questionTypes[i % questionTypes.length];
    
    let a = randInt(min, max);
    let b = randInt(min, max - a); // Ensure a + b <= max
    const correctAnswer = a + b;
    
    let question = '';
    
    switch (type) {
      case 'basic':
        question = `${a} + ${b} = ?`;
        break;
      case 'word_problem':
        question = `น้องมีลูกอม ${a} เม็ด พี่ให้อีก ${b} เม็ด รวมกี่เม็ด?`;
        break;
      case 'commutative':
        question = `${a} + ${b} = ${b} + __`;
        break;
      case 'symbol':
        question = `เติมเครื่องหมาย: ${a} __ ${b} = ${correctAnswer}`;
        break;
    }
    
    questions.push({
      id: `add_${Date.now()}_${i}_${Math.random()}`,
      skill: 'addition',
      question,
      correctAnswer: type === 'commutative' ? a : type === 'symbol' ? '+' : correctAnswer,
      choices: type === 'symbol' ? ['+', '-', '×', '÷'] : generateChoices(type === 'commutative' ? a : correctAnswer),
      difficulty: config.difficulty,
      explanation: `${a} + ${b} = ${correctAnswer}`
    });
  }
  
  return questions;
};

const generateSubtractionQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [0, 10];
  
  for (let i = 0; i < config.count; i++) {
    const questionTypes = ['basic', 'word_problem', 'symbol'];
    const type = questionTypes[i % questionTypes.length];
    
    const b = randInt(min, max);
    const a = randInt(b, max); // Ensure a >= b and a <= max
    const correctAnswer = a - b;
    
    let question = '';
    
    switch (type) {
      case 'basic':
        question = `${a} - ${b} = ?`;
        break;
      case 'word_problem':
        question = `มีของเล่น ${a} ชิ้น เล่นหายไป ${b} ชิ้น เหลือกี่ชิ้น?`;
        break;
      case 'symbol':
        question = `เติมเครื่องหมาย: ${a} __ ${b} = ${correctAnswer}`;
        break;
    }
    
    questions.push({
      id: `sub_${Date.now()}_${i}_${Math.random()}`,
      skill: 'subtraction',
      question,
      correctAnswer: type === 'symbol' ? '-' : correctAnswer,
      choices: type === 'symbol' ? ['+', '-', '×', '÷'] : generateChoices(correctAnswer),
      difficulty: config.difficulty,
      explanation: `${a} - ${b} = ${correctAnswer}`
    });
  }
  
  return questions;
};

const generateMultiplicationQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const tables = config.tables || [2, 3, 4, 5];
  
  for (let i = 0; i < config.count; i++) {
    const table = tables[randInt(0, tables.length - 1)];
    const multiplier = randInt(1, 10);
    const correctAnswer = table * multiplier;
    
    questions.push({
      id: `mul_${Date.now()}_${i}_${Math.random()}`,
      skill: 'multiplication',
      question: `${table} × ${multiplier} = ?`,
      correctAnswer,
      choices: generateChoices(correctAnswer),
      difficulty: config.difficulty,
      explanation: `${table} × ${multiplier} = ${correctAnswer}`
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
    const divisor = randInt(2, 10);
    const quotient = randInt(Math.ceil(min / divisor), Math.floor(max / divisor));
    const dividend = divisor * quotient;
    const correctAnswer = quotient;
    
    questions.push({
      id: `div_${Date.now()}_${i}_${Math.random()}`,
      skill: 'division',
      question: `${dividend} ÷ ${divisor} = ?`,
      correctAnswer,
      choices: generateChoices(correctAnswer),
      difficulty: config.difficulty,
      explanation: `${dividend} ÷ ${divisor} = ${correctAnswer}`
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
      case 'division':
        questions = generateDivisionQuestions(skillConfig);
        break;
      default:
        console.warn(`Skill ${skillConfig.skill} not implemented yet, using placeholder`);
        questions = generatePlaceholderQuestions(skillConfig);
    }
    
    allQuestions.push(...questions);
  }
  
  return shuffleArray(allQuestions);
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
