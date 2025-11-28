import { useState, useCallback } from 'react';
import { 
  generateProblem, 
  generateChoices, 
  type Problem, 
  type Operation, 
  type Difficulty 
} from '@/utils/balloonMathUtils';

export const useBalloonMath = (operation: Operation, difficulty: Difficulty) => {
  const [problem, setProblem] = useState<Problem>(() => generateProblem(operation, difficulty));
  const [choices, setChoices] = useState<number[]>(() => generateChoices(problem.answer));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const generateNewProblem = useCallback(() => {
    const newProblem = generateProblem(operation, difficulty);
    const newChoices = generateChoices(newProblem.answer);
    setProblem(newProblem);
    setChoices(newChoices);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowConfetti(false);
  }, [operation, difficulty]);

  const checkAnswer = useCallback((answer: number) => {
    setSelectedAnswer(answer);
    const correct = answer === problem.answer;
    setIsCorrect(correct);
    setTotalProblems(prev => prev + 1);

    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setShowConfetti(true);
      
      // Auto-load next problem after 2 seconds
      setTimeout(() => {
        generateNewProblem();
      }, 2000);
    } else {
      setStreak(0);
    }
  }, [problem.answer, generateNewProblem]);

  const reset = useCallback(() => {
    setScore(0);
    setTotalProblems(0);
    setStreak(0);
    generateNewProblem();
  }, [generateNewProblem]);

  return {
    problem,
    choices,
    selectedAnswer,
    isCorrect,
    score,
    totalProblems,
    streak,
    showConfetti,
    checkAnswer,
    generateNewProblem,
    reset
  };
};
