import { useState, useEffect } from 'react';
import { generateCountingProblem, CountingProblem } from '@/utils/boardCountingUtils';

export const useBoardCounting = (difficulty: string, totalQuestions: number) => {
  const [currentProblem, setCurrentProblem] = useState<CountingProblem>(
    generateCountingProblem(difficulty)
  );
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const generateNextProblem = (correct: boolean) => {
    if (correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
      setCurrentProblem(generateCountingProblem(difficulty));
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const reset = () => {
    setCurrentProblem(generateCountingProblem(difficulty));
    setCurrentQuestion(1);
    setScore(0);
    setStreak(0);
  };

  return {
    currentProblem,
    currentQuestion,
    score,
    streak,
    generateNextProblem,
    reset,
  };
};
