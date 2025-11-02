// Place Value utility functions for Singapore Math approach

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'identify_place' | 'find_value' | 'decompose';

export interface PlaceValueProblem {
  number: number;
  questionType: QuestionType;
  question: string;
  answer: number | string;
  options?: (number | string)[];
  explanation?: string;
}

const PLACE_NAMES = ['หน่วย', 'สิบ', 'ร้อย', 'พัน'];

/**
 * Get digit at specific place (0 = ones, 1 = tens, 2 = hundreds, 3 = thousands)
 */
export function getDigitAtPlace(number: number, place: number): number {
  return Math.floor(number / Math.pow(10, place)) % 10;
}

/**
 * Get value of digit at specific place
 */
export function getValueAtPlace(number: number, place: number): number {
  return getDigitAtPlace(number, place) * Math.pow(10, place);
}

/**
 * Generate random number based on difficulty
 */
function generateNumber(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return Math.floor(Math.random() * 90) + 10; // 10-99 (2 digits)
    case 'medium':
      return Math.floor(Math.random() * 900) + 100; // 100-999 (3 digits)
    case 'hard':
      return Math.floor(Math.random() * 9000) + 1000; // 1000-9999 (4 digits)
    default:
      return 10;
  }
}

/**
 * Get number of digits
 */
function getDigitCount(number: number): number {
  return Math.floor(Math.log10(number)) + 1;
}

/**
 * Generate "Identify Place" question
 * Example: "เลข 3 ในตัวเลข 345 อยู่หลักอะไร?"
 */
function generateIdentifyPlaceQuestion(number: number): PlaceValueProblem {
  const digitCount = getDigitCount(number);
  const targetPlace = Math.floor(Math.random() * digitCount);
  const targetDigit = getDigitAtPlace(number, targetPlace);
  
  // Skip if digit is 0
  if (targetDigit === 0) {
    return generateIdentifyPlaceQuestion(number);
  }
  
  const placeName = PLACE_NAMES[targetPlace];
  
  // Generate options
  const options = PLACE_NAMES.slice(0, digitCount);
  
  return {
    number,
    questionType: 'identify_place',
    question: `เลข ${targetDigit} ในตัวเลข ${number} อยู่หลักอะไร?`,
    answer: placeName,
    options,
    explanation: `เลข ${targetDigit} อยู่ที่หลัก${placeName} มีค่าเท่ากับ ${getValueAtPlace(number, targetPlace)}`
  };
}

/**
 * Generate "Find Value" question
 * Example: "หลักร้อยของ 456 มีค่าเท่าไร?"
 */
function generateFindValueQuestion(number: number): PlaceValueProblem {
  const digitCount = getDigitCount(number);
  const targetPlace = Math.floor(Math.random() * digitCount);
  const value = getValueAtPlace(number, targetPlace);
  const placeName = PLACE_NAMES[targetPlace];
  
  // Generate options (nearby values)
  const options: number[] = [];
  const baseValue = Math.pow(10, targetPlace);
  for (let i = 0; i < 4; i++) {
    const option = baseValue * (Math.floor(Math.random() * 9) + 1);
    if (!options.includes(option)) {
      options.push(option);
    }
  }
  if (!options.includes(value)) {
    options[Math.floor(Math.random() * options.length)] = value;
  }
  
  return {
    number,
    questionType: 'find_value',
    question: `หลัก${placeName}ของ ${number} มีค่าเท่าไร?`,
    answer: value,
    options: options.sort((a, b) => a - b),
    explanation: `หลัก${placeName}ของ ${number} คือเลข ${getDigitAtPlace(number, targetPlace)} ซึ่งมีค่าเท่ากับ ${value}`
  };
}

/**
 * Generate "Decompose" question
 * Example: "567 = ? ร้อย + ? สิบ + ? หน่วย"
 */
function generateDecomposeQuestion(number: number): PlaceValueProblem {
  const digitCount = getDigitCount(number);
  const parts: string[] = [];
  
  for (let i = digitCount - 1; i >= 0; i--) {
    const digit = getDigitAtPlace(number, i);
    if (digit > 0) {
      parts.push(`${digit} ${PLACE_NAMES[i]}`);
    }
  }
  
  return {
    number,
    questionType: 'decompose',
    question: `แยก ${number} เป็นหลักหน่วย สิบ ร้อย`,
    answer: parts.join(' + '),
    explanation: `${number} = ${parts.join(' + ')}`
  };
}

/**
 * Generate a set of Place Value problems
 */
export function generatePlaceValueProblems(
  count: number,
  difficulty: Difficulty
): PlaceValueProblem[] {
  const problems: PlaceValueProblem[] = [];
  const questionTypes: QuestionType[] = ['identify_place', 'find_value', 'decompose'];
  
  for (let i = 0; i < count; i++) {
    const number = generateNumber(difficulty);
    const questionType = questionTypes[i % questionTypes.length];
    
    let problem: PlaceValueProblem;
    switch (questionType) {
      case 'identify_place':
        problem = generateIdentifyPlaceQuestion(number);
        break;
      case 'find_value':
        problem = generateFindValueQuestion(number);
        break;
      case 'decompose':
        problem = generateDecomposeQuestion(number);
        break;
      default:
        problem = generateIdentifyPlaceQuestion(number);
    }
    
    problems.push(problem);
  }
  
  return problems;
}

/**
 * Check if answer is correct
 */
export function checkAnswer(problem: PlaceValueProblem, userAnswer: string | number): boolean {
  return String(userAnswer).trim().toLowerCase() === String(problem.answer).trim().toLowerCase();
}

/**
 * Calculate stars based on score
 */
export function calculateStars(correct: number, total: number): number {
  const percentage = (correct / total) * 100;
  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
}
