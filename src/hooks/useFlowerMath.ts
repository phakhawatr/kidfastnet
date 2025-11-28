import { useState, useEffect, useCallback } from 'react';
import {
  generateFlowerProblem,
  shuffleChoices,
  getTimeLimit,
  getQuestionCount,
  type Operation,
  type Difficulty,
  type FlowerProblem,
} from '@/utils/flowerMathUtils';

export const useFlowerMath = (
  operation: Operation,
  table: number,
  difficulty: Difficulty
) => {
  const [currentProblem, setCurrentProblem] = useState<FlowerProblem | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [problemNumber, setProblemNumber] = useState(1);
  const [totalProblems] = useState(getQuestionCount(difficulty));
  const [timeRemaining, setTimeRemaining] = useState<number | null>(getTimeLimit(difficulty));
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Generate new problem
  const generateNewProblem = useCallback(() => {
    const problem = generateFlowerProblem(operation, table, difficulty);
    setCurrentProblem(problem);
    setChoices(shuffleChoices(problem.correctAnswer, problem.wrongAnswers));
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, [operation, table, difficulty]);

  // Initialize first problem
  useEffect(() => {
    generateNewProblem();
    setStartTime(Date.now());
  }, [generateNewProblem]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || isGameOver) return;

    if (timeRemaining <= 0) {
      setIsGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isGameOver]);

  // Handle answer selection
  const handleAnswerSelect = (answer: number) => {
    if (selectedAnswer !== null || !currentProblem) return;

    setSelectedAnswer(answer);
    const correct = answer === currentProblem.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    // Auto advance after 1 second
    setTimeout(() => {
      if (problemNumber < totalProblems) {
        setProblemNumber(problemNumber + 1);
        generateNewProblem();
      } else {
        setIsGameOver(true);
      }
    }, 1000);
  };

  // Reset game
  const resetGame = () => {
    setScore(0);
    setStreak(0);
    setProblemNumber(1);
    setTimeRemaining(getTimeLimit(difficulty));
    setIsGameOver(false);
    setStartTime(Date.now());
    generateNewProblem();
  };

  // Calculate elapsed time
  const getElapsedTime = () => {
    return Math.floor((Date.now() - startTime) / 1000);
  };

  return {
    currentProblem,
    choices,
    selectedAnswer,
    isCorrect,
    score,
    streak,
    problemNumber,
    totalProblems,
    timeRemaining,
    isGameOver,
    handleAnswerSelect,
    resetGame,
    getElapsedTime,
  };
};
