import { useState, useCallback } from 'react';
import { generateFruitCountingProblem, FruitCountingProblem } from '@/utils/fruitCountingUtils';

export const useFruitCounting = (difficulty: string, totalProblems: number) => {
  const [currentProblem, setCurrentProblem] = useState<FruitCountingProblem>(
    generateFruitCountingProblem(difficulty)
  );
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const handleMatch = useCallback((fruitId: string, shadowId: string) => {
    const fruit = currentProblem.fruits.find(f => f.id === fruitId);
    const shadow = currentProblem.shadows.find(s => s.shadowId === shadowId);

    if (fruit && shadow && fruit.shadowId === shadowId) {
      setMatches(prev => ({ ...prev, [fruitId]: shadowId }));
      setScore(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentProblem]);

  const nextProblem = useCallback(() => {
    if (currentQuestion < totalProblems) {
      setCurrentQuestion(prev => prev + 1);
      setCurrentProblem(generateFruitCountingProblem(difficulty));
      setMatches({});
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  }, [currentQuestion, totalProblems, difficulty]);

  const reset = useCallback(() => {
    setCurrentProblem(generateFruitCountingProblem(difficulty));
    setCurrentQuestion(1);
    setScore(0);
    setMatches({});
  }, [difficulty]);

  const isCompleted = currentQuestion > totalProblems;
  const allMatched = currentProblem.fruits.length === Object.keys(matches).length;

  return {
    currentProblem,
    currentQuestion,
    score,
    matches,
    handleMatch,
    nextProblem,
    reset,
    isCompleted,
    allMatched,
  };
};
