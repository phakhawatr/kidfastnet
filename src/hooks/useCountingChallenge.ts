import { useState, useCallback, useEffect } from 'react';
import { CountingChallenge, generateChallenge, getRandomTheme } from '@/utils/countingChallengeUtils';

export const useCountingChallenge = () => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [challenge, setChallenge] = useState<CountingChallenge | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const initializeChallenge = useCallback(() => {
    const theme = getRandomTheme();
    setChallenge(generateChallenge(theme));
    setIsCorrect(false);
  }, []);

  const handleAnswer = useCallback((answer: number) => {
    if (!challenge) return { isCorrect: false };
    
    const correct = answer === challenge.correctAnswer;
    
    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setIsCorrect(true);
      setShowConfetti(true);
      
      // Generate new challenge after 1.5 seconds
      setTimeout(() => {
        setShowConfetti(false);
        initializeChallenge();
      }, 1500);
    } else {
      setStreak(0);
    }
    
    return { isCorrect: correct };
  }, [challenge, initializeChallenge]);

  return {
    score,
    streak,
    challenge,
    isCorrect,
    showConfetti,
    initializeChallenge,
    handleAnswer,
  };
};
