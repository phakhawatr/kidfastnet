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

const generateAdditionQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [1, 20];
  
  for (let i = 0; i < config.count; i++) {
    const a = randInt(min, max);
    const b = randInt(min, max);
    const correctAnswer = a + b;
    
    questions.push({
      id: `add_${Date.now()}_${i}_${Math.random()}`,
      skill: 'addition',
      question: `${a} + ${b} = ?`,
      correctAnswer,
      choices: generateChoices(correctAnswer),
      difficulty: config.difficulty,
      explanation: `${a} + ${b} = ${correctAnswer}`
    });
  }
  
  return questions;
};

const generateSubtractionQuestions = (config: SkillConfig): AssessmentQuestion[] => {
  const questions: AssessmentQuestion[] = [];
  const [min, max] = config.range || [1, 20];
  const digits = max > 99 ? 3 : max > 9 ? 2 : 1;
  
  try {
    const problems = generateSubtractionProblems(
      config.count,
      config.difficulty,
      digits,
      true
    );
    
    problems.forEach((prob, i) => {
      const correctAnswer = prob.a - prob.b;
      questions.push({
        id: `sub_${Date.now()}_${i}_${Math.random()}`,
        skill: 'subtraction',
        question: `${prob.a} - ${prob.b} = ?`,
        correctAnswer,
        choices: generateChoices(correctAnswer),
        difficulty: config.difficulty,
        explanation: `${prob.a} - ${prob.b} = ${correctAnswer}`
      });
    });
  } catch (error) {
    console.warn('Error generating subtraction problems:', error);
    // Fallback to simple subtraction
    for (let i = 0; i < config.count; i++) {
      const b = randInt(min, Math.floor(max / 2));
      const a = randInt(b, max);
      const correctAnswer = a - b;
      
      questions.push({
        id: `sub_${Date.now()}_${i}_${Math.random()}`,
        skill: 'subtraction',
        question: `${a} - ${b} = ?`,
        correctAnswer,
        choices: generateChoices(correctAnswer),
        difficulty: config.difficulty,
        explanation: `${a} - ${b} = ${correctAnswer}`
      });
    }
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
      case 'addition':
        questions = generateAdditionQuestions(skillConfig);
        break;
      case 'subtraction':
        questions = generateSubtractionQuestions(skillConfig);
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
