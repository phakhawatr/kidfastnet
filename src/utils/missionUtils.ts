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

/**
 * CENTRALIZED Star Calculation for Mission System
 * This is the SINGLE SOURCE OF TRUTH for star calculations
 * 
 * Thresholds:
 * - 3 stars: ≥90% accuracy AND ≤10 minutes
 * - 2 stars: ≥80% accuracy (passed)
 * - 1 star: ≥70% accuracy (nearly passed)
 * - 0 stars: <70% accuracy (failed)
 * 
 * Pass threshold: >80% accuracy
 * 
 * @param correct - Number of correct answers
 * @param total - Total number of questions
 * @param timeSeconds - Time spent in seconds
 * @returns { stars: number, isPassed: boolean, accuracy: number }
 */
export function calculateMissionStars(
  correct: number,
  total: number,
  timeSeconds: number
): { stars: number; isPassed: boolean; accuracy: number } {
  // Validate inputs
  if (total <= 0) {
    console.warn('⚠️ calculateMissionStars: total is 0 or negative');
    return { stars: 0, isPassed: false, accuracy: 0 };
  }
  
  // Clamp correct to valid range
  const validCorrect = Math.max(0, Math.min(correct, total));
  if (validCorrect !== correct) {
    console.warn(`⚠️ calculateMissionStars: correct (${correct}) clamped to ${validCorrect}`);
  }
  
  const accuracy = (validCorrect / total) * 100;
  const timeMinutes = timeSeconds / 60;
  
  // Pass threshold: >80%
  const isPassed = accuracy > 80;
  
  let stars = 0;
  if (accuracy >= 90 && timeMinutes <= 10) {
    stars = 3; // Excellent: high accuracy + fast time
  } else if (accuracy >= 80) {
    stars = 2; // Good: passed threshold
  } else if (accuracy >= 70) {
    stars = 1; // Nearly there
  }
  // < 70% = 0 stars
  
  console.log(`📊 calculateMissionStars: ${validCorrect}/${total} = ${accuracy.toFixed(1)}%, time=${timeMinutes.toFixed(1)}min → ${stars}⭐ (passed: ${isPassed})`);
  
  return { stars, isPassed, accuracy };
}
