// Number Bonds Utility Functions
// Singapore Math approach to understanding number relationships

export interface NumberBond {
  whole: number;
  part1: number;
  part2: number | null; // null means student needs to find this
  missingPart: 'part1' | 'part2' | 'whole'; // which part is missing
}

export interface BondProblem {
  id: number;
  bond: NumberBond;
  userAnswer: string;
  isCorrect: boolean | null;
}

// Generate random integer
const randInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a single number bond problem
 * @param maxNumber - Maximum number for the whole (e.g., 10, 20)
 * @param difficulty - 'easy' | 'medium' | 'hard'
 */
export const generateNumberBond = (
  maxNumber: number,
  difficulty: 'easy' | 'medium' | 'hard'
): NumberBond => {
  const whole = randInt(Math.ceil(maxNumber / 2), maxNumber);
  const part1 = randInt(1, whole - 1);
  const part2 = whole - part1;

  // Determine which part is missing based on difficulty
  let missingPart: 'part1' | 'part2' | 'whole';
  
  if (difficulty === 'easy') {
    // Easy: always find part2 (given whole and part1)
    missingPart = 'part2';
  } else if (difficulty === 'medium') {
    // Medium: find part1 or part2 randomly
    missingPart = Math.random() < 0.5 ? 'part1' : 'part2';
  } else {
    // Hard: can find any part including the whole
    const rand = Math.random();
    if (rand < 0.4) missingPart = 'part1';
    else if (rand < 0.8) missingPart = 'part2';
    else missingPart = 'whole';
  }

  return {
    whole: missingPart === 'whole' ? 0 : whole,
    part1: missingPart === 'part1' ? 0 : part1,
    part2: missingPart === 'part2' ? null : part2,
    missingPart,
  };
};

/**
 * Generate multiple number bond problems
 */
export const generateNumberBondProblems = (
  count: number,
  maxNumber: number,
  difficulty: 'easy' | 'medium' | 'hard'
): BondProblem[] => {
  const problems: BondProblem[] = [];
  
  for (let i = 0; i < count; i++) {
    problems.push({
      id: i,
      bond: generateNumberBond(maxNumber, difficulty),
      userAnswer: '',
      isCorrect: null,
    });
  }
  
  return problems;
};

/**
 * Check if the answer is correct
 */
export const checkBondAnswer = (bond: NumberBond, answer: string): boolean => {
  const answerNum = parseInt(answer);
  if (isNaN(answerNum)) return false;

  if (bond.missingPart === 'whole') {
    return answerNum === (bond.part1 + (bond.part2 || 0));
  } else if (bond.missingPart === 'part1') {
    return answerNum === (bond.whole - (bond.part2 || 0));
  } else {
    return answerNum === (bond.whole - bond.part1);
  }
};

/**
 * Get the correct answer for a bond
 */
export const getCorrectAnswer = (bond: NumberBond): number => {
  if (bond.missingPart === 'whole') {
    return bond.part1 + (bond.part2 || 0);
  } else if (bond.missingPart === 'part1') {
    return bond.whole - (bond.part2 || 0);
  } else {
    return bond.whole - bond.part1;
  }
};

/**
 * Format time in MM:SS
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate star rating based on score
 */
export const calculateStars = (correct: number, total: number): number => {
  const percentage = (correct / total) * 100;
  if (percentage === 100) return 3;
  if (percentage >= 80) return 2;
  if (percentage >= 60) return 1;
  return 0;
};

/**
 * Get encouragement text based on score
 */
export const getEncouragement = (correct: number, total: number): string => {
  const percentage = (correct / total) * 100;
  
  if (percentage === 100) return 'สุดยอดเลย! เก่งมาก! 🌟';
  if (percentage >= 90) return 'เยี่ยมมาก! เก่งจัง! 🎉';
  if (percentage >= 80) return 'ดีมาก! พยายามต่อไปนะ! 👍';
  if (percentage >= 70) return 'ดีแล้ว! ฝึกอีกนิดนะ! 💪';
  if (percentage >= 60) return 'ใช้ได้! ค่อยๆ ฝึกนะ! 📚';
  return 'ไม่เป็นไร! ลองใหม่อีกครั้งนะ! 🌈';
};
