/**
 * Centralized utility functions for mission completion calculations
 */

/**
 * Calculate correct answer count for mission completion
 * @param problems - Array of problem objects
 * @param answers - Array of user answers
 * @param getCorrectAnswer - Function to get correct answer for a problem
 * @param parseAnswer - Function to parse user answer
 * @returns Number of correct answers
 */
export function calculateCorrectCount<T>(
  problems: T[],
  answers: any[],
  getCorrectAnswer: (prob: T) => number,
  parseAnswer: (ans: any) => number
): number {
  let correct = 0;
  
  problems.forEach((prob, idx) => {
    const userAns = parseAnswer(answers[idx]);
    const correctAns = getCorrectAnswer(prob);
    
    if (!isNaN(userAns) && userAns === correctAns) {
      correct++;
    }
  });
  
  return correct;
}

/**
 * Validate mission results before submission
 * @param correct - Number of correct answers
 * @param total - Total number of questions
 * @returns Validation result with error message if invalid
 */
export function validateMissionResults(correct: number, total: number): {
  isValid: boolean;
  error?: string;
} {
  if (total <= 0) {
    return { isValid: false, error: 'Total questions must be greater than 0' };
  }
  
  if (correct < 0) {
    return { isValid: false, error: 'Correct answers cannot be negative' };
  }
  
  if (correct > total) {
    return { isValid: false, error: 'Correct answers cannot exceed total questions' };
  }
  
  return { isValid: true };
}

/**
 * Format time in milliseconds to minutes:seconds
 * @param ms - Time in milliseconds
 * @returns Formatted time string
 */
export function formatTimeSpent(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

/**
 * Calculate accuracy percentage
 * @param correct - Number of correct answers
 * @param total - Total number of questions
 * @returns Accuracy as percentage (0-100)
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return (correct / total) * 100;
}
