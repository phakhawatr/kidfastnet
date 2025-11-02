import { useState, useEffect } from 'react';
import {
  BarModelProblem,
  ProblemType,
  Difficulty,
  generateBarModelProblems,
  checkAnswer,
  calculateStars,
  getEncouragement,
} from '@/utils/barModelUtils';

export const useBarModelGame = () => {
  // Settings
  const [count, setCount] = useState(5);
  const [type, setType] = useState<ProblemType | 'mixed'>('part-whole');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  
  // Game state
  const [problems, setProblems] = useState<BarModelProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
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
    const newProblems = generateBarModelProblems(count, type, difficulty);
    setProblems(newProblems);
    setCurrentIndex(0);
    setShowResults(false);
    setShowHint(false);
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
    updatedProblems[currentIndex].userAnswer = answer;
    setProblems(updatedProblems);
  };
  
  const submitAnswer = () => {
    const currentProblem = problems[currentIndex];
    const isCorrect = checkAnswer(currentProblem, currentProblem.userAnswer);
    
    const updatedProblems = [...problems];
    updatedProblems[currentIndex].isCorrect = isCorrect;
    setProblems(updatedProblems);
  };
  
  const nextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowHint(false);
    }
  };
  
  const previousProblem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowHint(false);
    }
  };
  
  const submitAllAnswers = () => {
    const updatedProblems = problems.map(p => ({
      ...p,
      isCorrect: checkAnswer(p, p.userAnswer)
    }));
    
    setProblems(updatedProblems);
    setShowResults(true);
    setIsFinished(true);
    
    const correctCount = updatedProblems.filter(p => p.isCorrect).length;
    if (correctCount === problems.length) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 5000);
    }
  };
  
  const resetProblem = (index: number) => {
    const updatedProblems = [...problems];
    updatedProblems[index].userAnswer = '';
    updatedProblems[index].isCorrect = null;
    setProblems(updatedProblems);
  };
  
  const changeSettings = (
    newCount?: number,
    newType?: ProblemType | 'mixed',
    newDifficulty?: Difficulty
  ) => {
    if (newCount !== undefined) setCount(newCount);
    if (newType !== undefined) setType(newType);
    if (newDifficulty !== undefined) setDifficulty(newDifficulty);
    
    // Regenerate with new settings
    setTimeout(() => {
      const problems = generateBarModelProblems(
        newCount ?? count,
        newType ?? type,
        newDifficulty ?? difficulty
      );
      setProblems(problems);
      setCurrentIndex(0);
      setShowResults(false);
      setShowHint(false);
      setCelebrate(false);
      setStartTime(null);
      setElapsedTime(0);
      setIsFinished(false);
    }, 0);
  };
  
  const toggleHint = () => {
    setShowHint(!showHint);
  };
  
  // Helper getters
  const getCorrectCount = () => problems.filter(p => p.isCorrect === true).length;
  const getCurrentProblem = () => problems[currentIndex];
  const getStars = () => calculateStars(getCorrectCount(), problems.length, elapsedTime);
  const getEncouragementText = () => getEncouragement(getStars());
  
  return {
    // Settings
    count,
    type,
    difficulty,
    
    // State
    problems,
    currentIndex,
    showResults,
    showHint,
    celebrate,
    
    // Timer
    startTime,
    elapsedTime,
    isFinished,
    
    // Actions
    regenerateProblems,
    handleAnswer,
    submitAnswer,
    nextProblem,
    previousProblem,
    submitAllAnswers,
    resetProblem,
    changeSettings,
    toggleHint,
    
    // Helpers
    getCorrectCount,
    getCurrentProblem,
    getStars,
    getEncouragementText,
  };
};