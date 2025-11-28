import { useState, useCallback } from 'react';
import { generateComparison, ComparisonProblem } from '@/utils/compareStarsUtils';

export type Difficulty = 'easy' | 'medium' | 'hard';

export function useCompareStars(difficulty: Difficulty) {
  const [currentProblem, setCurrentProblem] = useState<ComparisonProblem>(
    () => generateComparison(difficulty)
  );
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);

  const checkAnswer = useCallback((answer: '>' | '=' | '<') => {
    const isCorrect = answer === currentProblem.correctAnswer;
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
    
    setTotalAttempts((prev) => prev + 1);
    
    return isCorrect;
  }, [currentProblem]);

  const nextProblem = useCallback(() => {
    setCurrentProblem(generateComparison(difficulty));
  }, [difficulty]);

  const reset = useCallback(() => {
    setScore(0);
    setTotalAttempts(0);
    setStreak(0);
    setCurrentProblem(generateComparison(difficulty));
  }, [difficulty]);

  return {
    currentProblem,
    score,
    totalAttempts,
    streak,
    checkAnswer,
    nextProblem,
    reset
  };
}
