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
    'count_by_1', 'count_by_10', 'thai_numeral', 'hundred_chart', 
    'count_backward'
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
        const start = randInt(Math.floor(min / 10), Math.floor(max / 10) - 3) * 10;
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start + (idx * 10));
        question = `บนตารางร้อย ถ้าเริ่มที่ ${start} แล้วนับทีละ 10 จะได้: ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 10);
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'thai_numeral': {
        const num = randInt(min, Math.min(max, 100));
        const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
        const thaiNum = num.toString().split('').map(d => thaiNumerals[parseInt(d)]).join('');
        question = `เลขไทย "${thaiNum}" เขียนเป็นเลขอารบิกว่าอะไร?`;
        correctAnswer = num;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'hundred_chart': {
        const start = randInt(min, max - 30);
        const missing = randInt(1, 2);
        const sequence = Array.from({ length: 4 }, (_, idx) => idx === missing ? '__' : start + (idx * 10));
        question = `เติมจำนวนที่หายไปบนตารางร้อย (นับทีละ 10): ${sequence.join(', ')}`;
        correctAnswer = start + (missing * 10);
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'count_backward': {
        const start = randInt(min + 5, max);
        const missing = randInt(1, 3);
        const sequence = Array.from({ length: 5 }, (_, idx) => idx === missing ? '__' : start - idx);
        question = `เติมจำนวนที่หายไป (นับถอยหลัง): ${sequence.join(', ')}`;
        correctAnswer = start - missing;
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
    const num = randInt(Math.max(min, 21), max);
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    
    const questionTypes = ['tens_place', 'ones_place', 'decompose'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
    switch (type) {
      case 'tens_place':
        question = `เลข ${num} มีหลักสิบเป็นเท่าไร?`;
        correctAnswer = tens;
        choices = generateChoices(correctAnswer);
        break;
      case 'ones_place':
        question = `เลข ${num} มีหลักหน่วยเป็นเท่าไร?`;
        correctAnswer = ones;
        choices = generateChoices(correctAnswer);
        break;
      case 'decompose':
        question = `${num} = __ สิบ + ${ones} หน่วย`;
        correctAnswer = tens;
        choices = generateChoices(correctAnswer);
        break;
    }
    
    questions.push({
      id: `placeValue_${Date.now()}_${i}_${Math.random()}`,
      skill: 'placeValue',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
    });
  }
  
  return questions;
};

const generatePatternsQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  
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
        const patterns = [
          { seq: ['🔺', '⬜', '⭕'], correct: '🔺' },
          { seq: ['⬜', '🔺', '⬜'], correct: '🔺' },
          { seq: ['⭕', '🔺', '⬜'], correct: '⭕' },
          { seq: ['🔺', '🔺', '⬜'], correct: '🔺' }
        ];
        const pattern = patterns[i % patterns.length];
        const fullSeq = [...pattern.seq, ...pattern.seq, '__'];
        question = `รูปใดมาต่อในแบบรูปซ้ำ? ${fullSeq.join(' ')}`;
        correctAnswer = pattern.correct;
        choices = shuffleArray(['🔺', '⬜', '⭕', '🔴']).slice(0, 4);
        if (!choices.includes(correctAnswer)) {
          choices[0] = correctAnswer;
        }
        break;
      }
      case 'shape_pattern': {
        const patterns = [
          { seq: ['△', '□'], correct: '△' },
          { seq: ['○', '△', '○'], correct: '△' }
        ];
        const pattern = patterns[i % patterns.length];
        const fullSeq = [...pattern.seq, ...pattern.seq, '__'];
        question = `สร้างแบบรูปซ้ำต่อไป: ${fullSeq.join(' ')}`;
        correctAnswer = pattern.correct;
        choices = shuffleArray(['△', '□', '○', '◇']).slice(0, 4);
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
    const questionTypes = ['real_world_connection', 'count_shapes', 'pattern_creation', 'identify_3d'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: string | number = '';
    let choices: (string | number)[] = [];
    
    switch (type) {
      case 'real_world_connection': {
        const obj = realWorldObjects[i % realWorldObjects.length];
        question = `${obj.emoji} ${obj.name} เป็นรูปทรงอะไร?`;
        correctAnswer = obj.shape;
        choices = shuffleArray(shapes3D.map(s => s.name));
        break;
      }
      case 'count_shapes': {
        const shapeToCount = ['🔺', '⬜', '⭕'][i % 3];
        const count = randInt(3, 6);
        const otherShapes = ['🔺', '⬜', '⭕', '🔴'];
        const sequence = Array.from({ length: count + 2 }, (_, idx) => 
          idx < count ? shapeToCount : otherShapes[randInt(0, 3)]
        );
        shuffleArray(sequence);
        question = `ในรูปนี้มี ${shapeToCount} กี่รูป? ${sequence.join('')}`;
        correctAnswer = count;
        choices = generateChoices(count);
        break;
      }
      case 'pattern_creation': {
        const patterns = [
          { seq: ['🔺', '⬜'], correct: '🔺' },
          { seq: ['⭕', '🔺'], correct: '⭕' }
        ];
        const pattern = patterns[i % patterns.length];
        const display = [...pattern.seq, ...pattern.seq];
        question = `ถ้าใช้ ${display.join('')} มาต่อกัน รูปถัดไปคือ?`;
        correctAnswer = pattern.correct;
        choices = shuffleArray(['🔺', '⬜', '⭕', '🔴']).slice(0, 4);
        if (!choices.includes(correctAnswer)) {
          choices[0] = correctAnswer;
        }
        break;
      }
      case 'identify_3d': {
        const shape = shapes3D[i % shapes3D.length];
        question = `${shape.emoji} เป็นรูปทรงอะไร?`;
        correctAnswer = shape.name;
        choices = shuffleArray(shapes3D.map(s => s.name));
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
    const questionTypes = ['two_digit_plus_one_digit', 'two_digit_plus_two_digit', 'find_unknown', 'relationship', 'word_problem'];
    const type = questionTypes[i % questionTypes.length];
    
    let question = '';
    let correctAnswer: number | string = 0;
    let choices: (number | string)[] = [];
    
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
        break;
      }
      case 'two_digit_plus_two_digit': {
        const a = randInt(Math.max(10, min), Math.floor((max - 10) / 2));
        const b = randInt(10, Math.min(max - a, 50));
        correctAnswer = a + b;
        question = `${a} + ${b} = ?`;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'find_unknown': {
        const sum = randInt(Math.max(30, min), max);
        const b = randInt(10, sum - 10);
        const a = sum - b;
        correctAnswer = a;
        question = `__ + ${b} = ${sum}`;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'relationship': {
        const a = randInt(Math.max(20, min), Math.floor(max / 2));
        const b = randInt(10, Math.min(40, max - a));
        const sum = a + b;
        correctAnswer = a;
        question = `ถ้า ${a} + ${b} = ${sum} แล้ว ${sum} - ${b} = ?`;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'word_problem': {
        const a = randInt(Math.max(20, min), Math.floor(max / 2));
        const b = randInt(10, Math.min(max - a, 40));
        correctAnswer = a + b;
        question = `น้องมีลูกอม ${a} เม็ด พี่ให้อีก ${b} เม็ด รวมกี่เม็ด?`;
        choices = generateChoices(correctAnswer);
        break;
      }
    }
    
    questions.push({
      id: `addition_${Date.now()}_${i}_${Math.random()}`,
      skill: 'addition',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
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
    
    switch (type) {
      case 'two_digit_minus_one_digit': {
        const a = randInt(Math.max(21, min), max);
        const b = randInt(1, Math.min(9, a));
        correctAnswer = a - b;
        question = `${a} - ${b} = ?`;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'two_digit_minus_two_digit': {
        const a = randInt(Math.max(30, min), max);
        const b = randInt(10, a - 5);
        correctAnswer = a - b;
        question = `${a} - ${b} = ?`;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'find_unknown': {
        const a = randInt(Math.max(50, min), max);
        const result = randInt(20, a - 20);
        const b = a - result;
        correctAnswer = b;
        question = `${a} - __ = ${result}`;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'relationship': {
        const sum = randInt(Math.max(40, min), max);
        const b = randInt(15, Math.floor(sum / 2));
        const a = sum - b;
        correctAnswer = b;
        question = `ถ้า ${a} + ${b} = ${sum} แล้ว ${sum} - ${a} = ?`;
        choices = generateChoices(correctAnswer);
        break;
      }
      case 'word_problem': {
        const a = randInt(Math.max(30, min), max);
        const b = randInt(10, a - 5);
        correctAnswer = a - b;
        question = `มีของเล่น ${a} ชิ้น เล่นหายไป ${b} ชิ้น เหลือกี่ชิ้น?`;
        choices = generateChoices(correctAnswer);
        break;
      }
    }
    
    questions.push({
      id: `subtraction_${Date.now()}_${i}_${Math.random()}`,
      skill: 'subtraction',
      question,
      correctAnswer,
      choices,
      difficulty: config.difficulty
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
