import { useState, useCallback } from 'react';
import { CountingChallenge, generateChallenge, getTwoRandomThemes } from '@/utils/countingChallengeUtils';

export const useCountingChallenge = () => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [challenge1, setChallenge1] = useState<CountingChallenge | null>(null);
  const [challenge2, setChallenge2] = useState<CountingChallenge | null>(null);
  const [card1Correct, setCard1Correct] = useState(false);
  const [card2Correct, setCard2Correct] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const initializeChallenges = useCallback(() => {
    const [theme1, theme2] = getTwoRandomThemes();
    setChallenge1(generateChallenge(theme1));
    setChallenge2(generateChallenge(theme2));
    setCard1Correct(false);
    setCard2Correct(false);
  }, []);

  const handleAnswer = useCallback((cardNumber: 1 | 2, answer: number) => {
    const challenge = cardNumber === 1 ? challenge1 : challenge2;
    if (!challenge) return { isCorrect: false };

    const isCorrect = answer === challenge.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      if (cardNumber === 1) {
        setCard1Correct(true);
      } else {
        setCard2Correct(true);
      }

      // Check if both cards are now correct
      const bothCorrect = cardNumber === 1 ? card2Correct : card1Correct;
      if (bothCorrect) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          initializeChallenges();
        }, 2000);
      }
    } else {
      setStreak(0);
    }

    return { isCorrect };
  }, [challenge1, challenge2, card1Correct, card2Correct, initializeChallenges]);

  return {
    score,
    streak,
    challenge1,
    challenge2,
    card1Correct,
    card2Correct,
    showConfetti,
    initializeChallenges,
    handleAnswer,
  };
};
