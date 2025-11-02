import { useState, useEffect } from 'react';
import {
  BondProblem,
  generateNumberBondProblems,
  checkBondAnswer,
  getCorrectAnswer,
} from '@/utils/numberBondsUtils';

export const useNumberBondsGame = () => {
  // Game settings
  const [count, setCount] = useState(10);
  const [maxNumber, setMaxNumber] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  // Game state
  const [problems, setProblems] = useState<BondProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  
  // Timer
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize problems
  useEffect(() => {
    regenerateProblems();
  }, []);

  // Timer effect
  useEffect(() => {
    if (startTime && !isFinished) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, isFinished]);

  const regenerateProblems = () => {
    const newProblems = generateNumberBondProblems(count, maxNumber, difficulty);
    setProblems(newProblems);
    setCurrentIndex(0);
    setShowResults(false);
    setCelebrate(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
  };

  const startTimer = () => {
    if (!startTime) {
      setStartTime(Date.now());
    }
  };

  const handleAnswer = (answer: string) => {
    startTimer();
    
    const updatedProblems = [...problems];
    const currentProblem = updatedProblems[currentIndex];
    
    currentProblem.userAnswer = answer;
    currentProblem.isCorrect = checkBondAnswer(currentProblem.bond, answer);
    
    setProblems(updatedProblems);
  };

  const nextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousProblem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const submitAnswers = () => {
    setIsFinished(true);
    setShowResults(true);
    
    const correctCount = problems.filter(p => p.isCorrect).length;
    if (correctCount === problems.length) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 3000);
    }
  };

  const resetProblem = (index: number) => {
    const updatedProblems = [...problems];
    updatedProblems[index].userAnswer = '';
    updatedProblems[index].isCorrect = null;
    setProblems(updatedProblems);
  };

  const changeSettings = (newCount: number, newMaxNumber: number, newDifficulty: 'easy' | 'medium' | 'hard') => {
    setCount(newCount);
    setMaxNumber(newMaxNumber);
    setDifficulty(newDifficulty);
    
    const newProblems = generateNumberBondProblems(newCount, newMaxNumber, newDifficulty);
    setProblems(newProblems);
    setCurrentIndex(0);
    setShowResults(false);
    setCelebrate(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
  };

  const getCorrectCount = () => {
    return problems.filter(p => p.isCorrect).length;
  };

  const getCurrentProblem = () => {
    return problems[currentIndex];
  };

  return {
    // Settings
    count,
    maxNumber,
    difficulty,
    
    // State
    problems,
    currentIndex,
    showResults,
    celebrate,
    elapsedTime,
    isFinished,
    
    // Actions
    regenerateProblems,
    handleAnswer,
    nextProblem,
    previousProblem,
    submitAnswers,
    resetProblem,
    changeSettings,
    
    // Helpers
    getCorrectCount,
    getCurrentProblem,
    getCorrectAnswer: (index: number) => getCorrectAnswer(problems[index].bond),
  };
};
