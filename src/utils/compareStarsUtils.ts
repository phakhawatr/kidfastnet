export interface ComparisonProblem {
  left: number;
  right: number;
  correctAnswer: '>' | '=' | '<';
}

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_RANGES = {
  easy: { min: 1, max: 5 },
  medium: { min: 1, max: 10 },
  hard: { min: 1, max: 20 }
};

/**
 * Generates a random number within the difficulty range
 */
function getRandomNumber(difficulty: Difficulty): number {
  const { min, max } = DIFFICULTY_RANGES[difficulty];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a comparison problem based on difficulty
 * Ensures variety: sometimes equal, sometimes different
 */
export function generateComparison(difficulty: Difficulty): ComparisonProblem {
  const forceEqual = Math.random() < 0.2; // 20% chance of equal numbers
  
  let left = getRandomNumber(difficulty);
  let right: number;
  
  if (forceEqual) {
    right = left;
  } else {
    right = getRandomNumber(difficulty);
    // Ensure they're different
    while (right === left) {
      right = getRandomNumber(difficulty);
    }
  }
  
  // Determine correct answer
  let correctAnswer: '>' | '=' | '<';
  if (left > right) {
    correctAnswer = '>';
  } else if (left === right) {
    correctAnswer = '=';
  } else {
    correctAnswer = '<';
  }
  
  return {
    left,
    right,
    correctAnswer
  };
}

/**
 * Validates if the user's answer is correct
 */
export function checkComparison(
  left: number,
  right: number,
  userAnswer: '>' | '=' | '<'
): boolean {
  let correctAnswer: '>' | '=' | '<';
  
  if (left > right) {
    correctAnswer = '>';
  } else if (left === right) {
    correctAnswer = '=';
  } else {
    correctAnswer = '<';
  }
  
  return userAnswer === correctAnswer;
}
