export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface FlowerProblem {
  multiplier: number; // The center number (e.g., 4 in "4x")
  innerNumbers: number[]; // 1-10
  results: number[]; // The calculated results (petal values)
  questionIndex: number; // Which petal is the question
  correctAnswer: number; // For division: inner number, for others: petal value
  wrongAnswers: number[];
  operation: Operation;
  questionValue: number; // The value shown on the "?" petal
  answerType: 'petal' | 'inner'; // Whether answer is petal or inner number
}

/**
 * Generate a flower math problem
 */
export const generateFlowerProblem = (
  operation: Operation,
  table: number = 4,
  difficulty: Difficulty
): FlowerProblem => {
  const innerNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
  const multiplier = table;

  // Calculate results based on operation
  const results = innerNumbers.map(num => {
    switch (operation) {
      case 'addition':
        return multiplier + num;
      case 'subtraction':
        return multiplier - num;
      case 'multiplication':
        return multiplier * num;
      case 'division':
        // For division: petal shows the product (multiplier * num)
        // Question: petal ÷ center = ?
        // Answer: inner number
        return multiplier * num;
      default:
        return 0;
    }
  });

  // Select question index randomly
  const questionIndex = Math.floor(Math.random() * 10);
  
  // For division, answer is the inner number, not the petal value
  let correctAnswer: number;
  let wrongAnswers: number[];
  let questionValue: number;
  let answerType: 'petal' | 'inner';

  if (operation === 'division') {
    correctAnswer = innerNumbers[questionIndex]; // Answer is inner number (1-10)
    wrongAnswers = generateWrongAnswersForDivision(correctAnswer);
    questionValue = results[questionIndex]; // Petal shows the product
    answerType = 'inner';
  } else {
    correctAnswer = results[questionIndex]; // Answer is petal value
    wrongAnswers = generateWrongAnswers(correctAnswer, operation, multiplier);
    questionValue = correctAnswer;
    answerType = 'petal';
  }

  return {
    multiplier,
    innerNumbers,
    results,
    questionIndex,
    correctAnswer,
    wrongAnswers,
    operation,
    questionValue,
    answerType,
  };
};

/**
 * Generate 3 plausible wrong answers for division (inner numbers 1-10)
 */
const generateWrongAnswersForDivision = (correctAnswer: number): number[] => {
  const wrongAnswers = new Set<number>();
  const offsets = [-2, -1, 1, 2, 3, -3];
  
  while (wrongAnswers.size < 3) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    const wrongAnswer = correctAnswer + offset;
    
    // Must be in range 1-10 and different from correct answer
    if (wrongAnswer >= 1 && wrongAnswer <= 10 && wrongAnswer !== correctAnswer) {
      wrongAnswers.add(wrongAnswer);
    }
  }
  
  return Array.from(wrongAnswers);
};

/**
 * Generate 3 plausible wrong answers
 */
const generateWrongAnswers = (
  correctAnswer: number,
  operation: Operation,
  multiplier: number
): number[] => {
  const wrongAnswers = new Set<number>();
  
  // Generate plausible wrong answers
  const offsets = [-2, -1, 1, 2, 3, -3];
  
  while (wrongAnswers.size < 3) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    let wrongAnswer: number;
    
    if (operation === 'multiplication') {
      // For multiplication, use adjacent table results
      wrongAnswer = correctAnswer + (multiplier * offset);
    } else {
      wrongAnswer = correctAnswer + offset;
    }
    
    // Ensure wrong answer is positive and different from correct
    if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
      wrongAnswers.add(wrongAnswer);
    }
  }
  
  return Array.from(wrongAnswers);
};

/**
 * Shuffle choices (1 correct + 3 wrong)
 */
export const shuffleChoices = (correctAnswer: number, wrongAnswers: number[]): number[] => {
  const choices = [correctAnswer, ...wrongAnswers];
  return choices.sort(() => Math.random() - 0.5);
};

/**
 * Get operation symbol
 */
export const getOperationSymbol = (operation: Operation): string => {
  switch (operation) {
    case 'addition':
      return '+';
    case 'subtraction':
      return '-';
    case 'multiplication':
      return '×';
    case 'division':
      return '÷';
    default:
      return '';
  }
};

/**
 * Get time limit based on difficulty
 */
export const getTimeLimit = (difficulty: Difficulty): number | null => {
  switch (difficulty) {
    case 'easy':
      return null; // No time limit
    case 'medium':
      return 120; // 2 minutes
    case 'hard':
      return 60; // 1 minute
    default:
      return null;
  }
};

/**
 * Get number of questions based on difficulty
 */
export const getQuestionCount = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy':
      return 5;
    case 'medium':
      return 10;
    case 'hard':
      return 15;
    default:
      return 10;
  }
};
