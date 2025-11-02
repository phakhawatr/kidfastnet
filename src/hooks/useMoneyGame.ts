import { useState, useEffect } from 'react';
import {
  MoneyProblem,
  ProblemType,
  Difficulty,
  generateMoneyProblems,
  checkAnswer,
  calculateStars,
  getEncouragement,
  formatTime
} from '../utils/moneyUtils';
import { supabase } from '@/integrations/supabase/client';

export const useMoneyGame = () => {
  // Game settings
  const [problemCount, setProblemCount] = useState(5);
  const [problemType, setProblemType] = useState<ProblemType>('mixed');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  
  // Game state
  const [problems, setProblems] = useState<MoneyProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Initialize problems when settings change
  useEffect(() => {
    const newProblems = generateMoneyProblems(problemCount, problemType, difficulty);
    setProblems(newProblems);
    setCurrentProblemIndex(0);
    setShowResults(false);
    setStartTime(null);
    setEndTime(null);
  }, [problemCount, problemType, difficulty]);
  
  // Start timer on first interaction
  const startTimer = () => {
    if (startTime === null) {
      setStartTime(Date.now());
    }
  };
  
  // Handle answer input
  const handleAnswer = (answer: string) => {
    startTimer();
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].userAnswer = answer;
    setProblems(updatedProblems);
  };
  
  // Submit current answer
  const submitAnswer = () => {
    const currentProblem = problems[currentProblemIndex];
    const isCorrect = checkAnswer(currentProblem, currentProblem.userAnswer);
    
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex].isCorrect = isCorrect;
    setProblems(updatedProblems);
  };
  
  // Navigate to next problem
  const nextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };
  
  // Navigate to previous problem
  const previousProblem = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };
  
  // Submit all answers and show results
  const submitAllAnswers = () => {
    const end = Date.now();
    setEndTime(end);
    
    // Check all unanswered problems
    const updatedProblems = problems.map(problem => {
      if (problem.isCorrect === null) {
        return {
          ...problem,
          isCorrect: checkAnswer(problem, problem.userAnswer)
        };
      }
      return problem;
    });
    
    setProblems(updatedProblems);
    setShowResults(true);
    setShowCelebration(true);
    
    // Save to database
    savePracticeSession(updatedProblems, end);
    
    // Hide celebration after 3 seconds
    setTimeout(() => setShowCelebration(false), 3000);
  };
  
  // Save practice session to Supabase
  const savePracticeSession = async (finalProblems: MoneyProblem[], endTime: number) => {
    try {
      const stored = localStorage.getItem('kidfast_auth');
      if (!stored) return;
      
      const authState = JSON.parse(stored);
      if (authState.isDemo) return;
      
      const memberId = authState.memberId;
      if (!memberId) return;
      
      // Get user_id from profiles table - cast to any to avoid TS type issues
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('user_id')
        .eq('member_id', memberId)
        .limit(1);
      
      if (profileError || !profileData || profileData.length === 0) {
        console.warn('Could not find user profile:', profileError);
        return;
      }
      
      const userId = profileData[0].user_id;
      
      const correctCount = finalProblems.filter(p => p.isCorrect === true).length;
      const totalCount = finalProblems.length;
      const durationMs = startTime ? (endTime - startTime) : 0;
      
      // Save practice session
      await supabase.from('practice_sessions').insert({
        user_id: userId,
        skill_name: 'เงินตรา',
        difficulty: difficulty,
        problems_attempted: totalCount,
        problems_correct: correctCount,
        accuracy: Math.round((correctCount / totalCount) * 100),
        time_spent: Math.round(durationMs / 1000),
        hints_used: 0
      });
      
      // Update skill assessments
      const avgTimePerProblem = Math.round(durationMs / totalCount);
      
      for (let i = 0; i < totalCount; i++) {
        const isCorrect = finalProblems[i].isCorrect === true;
        
        await supabase.rpc('update_skill_assessment', {
          p_user_id: userId,
          p_skill_name: 'เงินตรา',
          p_correct: isCorrect,
          p_time_spent: avgTimePerProblem
        });
      }
      
    } catch (error) {
      console.error('Error saving practice session:', error);
    }
  };
  
  // Reset a specific problem
  const resetProblem = (index: number) => {
    const updatedProblems = [...problems];
    updatedProblems[index].userAnswer = '';
    updatedProblems[index].isCorrect = null;
    setProblems(updatedProblems);
  };
  
  // Regenerate all problems
  const regenerateProblems = () => {
    const newProblems = generateMoneyProblems(problemCount, problemType, difficulty);
    setProblems(newProblems);
    setCurrentProblemIndex(0);
    setShowResults(false);
    setStartTime(null);
    setEndTime(null);
    setShowHints(false);
  };
  
  // Change settings and regenerate
  const changeSettings = (
    newCount?: number,
    newType?: ProblemType,
    newDifficulty?: Difficulty
  ) => {
    if (newCount !== undefined) setProblemCount(newCount);
    if (newType !== undefined) setProblemType(newType);
    if (newDifficulty !== undefined) setDifficulty(newDifficulty);
  };
  
  // Toggle hints
  const toggleHint = () => {
    setShowHints(!showHints);
  };
  
  // Getters
  const getCorrectCount = () => problems.filter(p => p.isCorrect === true).length;
  const getCurrentProblem = () => problems[currentProblemIndex];
  const getStars = () => {
    if (!startTime || !endTime) return 0;
    const timeMs = endTime - startTime;
    return calculateStars(getCorrectCount(), problems.length, timeMs);
  };
  const getEncouragementText = () => getEncouragement(getStars());
  const getFormattedTime = () => {
    if (!startTime || !endTime) return '0:00';
    return formatTime(endTime - startTime);
  };
  
  return {
    // Settings
    problemCount,
    problemType,
    difficulty,
    changeSettings,
    
    // State
    problems,
    currentProblemIndex,
    showResults,
    showHints,
    showCelebration,
    
    // Actions
    handleAnswer,
    submitAnswer,
    nextProblem,
    previousProblem,
    submitAllAnswers,
    resetProblem,
    regenerateProblems,
    toggleHint,
    startTimer,
    
    // Getters
    getCorrectCount,
    getCurrentProblem,
    getStars,
    getEncouragementText,
    getFormattedTime
  };
};
