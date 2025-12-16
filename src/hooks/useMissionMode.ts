import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrainingCalendar, type QuestionAttempt } from './useTrainingCalendar';
import { calculateMissionStars, validateMissionResults } from '@/utils/missionUtils';

interface MissionResult {
  stars: number;
  correct: number;
  total: number;
  timeSpent: number;
  isPassed: boolean;
}

/**
 * Custom hook to handle mission mode integration for exercise apps
 * 
 * STANDARDIZED THRESHOLDS (from missionUtils):
 * - Pass threshold: >80%
 * - 3 stars: ≥90% accuracy AND ≤10 minutes
 * - 2 stars: ≥80% accuracy
 * - 1 star: ≥70% accuracy
 * - 0 stars: <70% accuracy
 */
export function useMissionMode() {
  const [searchParams] = useSearchParams();
  const { completeMission } = useTrainingCalendar();
  
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [missionResult, setMissionResult] = useState<MissionResult | null>(null);
  
  const missionId = searchParams.get('missionId');
  const isMissionMode = !!missionId;
  
  /**
   * Complete mission with results
   * @param correct - Number of correct answers
   * @param total - Total number of questions
   * @param timeMs - Time spent in milliseconds
   * @param questionAttempts - Optional array of individual question attempts
   */
  const handleCompleteMission = async (
    correct: number, 
    total: number, 
    timeMs: number,
    questionAttempts?: QuestionAttempt[]
  ) => {
    console.log('🟢 useMissionMode.handleCompleteMission called:', {
      missionId,
      correct,
      total,
      timeMs,
      isMissionMode
    });
    
    if (!missionId) {
      console.warn('⚠️ No missionId, skipping mission completion');
      return;
    }
    
    // Validate inputs using centralized validation
    const validation = validateMissionResults(correct, total);
    if (!validation.isValid) {
      console.error('❌ Invalid mission results:', validation.error, { correct, total });
      return { stars: 0, isPassed: false };
    }
    
    // Clamp correct to total if somehow it exceeds (safety net)
    const validCorrect = Math.min(correct, total);
    if (validCorrect !== correct) {
      console.warn(`⚠️ Clamped correct from ${correct} to ${validCorrect}`);
    }
    
    if (timeMs < 0) {
      console.error('❌ Invalid time:', timeMs);
      return { stars: 0, isPassed: false };
    }
    
    const timeSeconds = Math.floor(timeMs / 1000);
    
    // Use CENTRALIZED star calculation
    const { stars, isPassed, accuracy } = calculateMissionStars(validCorrect, total, timeSeconds);
    
    console.log('📊 Mission results (using centralized calculation):', {
      accuracy: accuracy.toFixed(2) + '%',
      timeSeconds,
      timeMinutes: (timeSeconds / 60).toFixed(2),
      stars,
      isPassed,
      passThreshold: '80%'
    });
    
    // Save to database
    try {
      console.log('💾 Calling completeMission in useTrainingCalendar...');
      await completeMission(missionId, {
        total_questions: total,
        correct_answers: validCorrect,
        time_spent: timeSeconds,
        question_attempts: questionAttempts
      });
      console.log('✅ completeMission succeeded');
    } catch (error) {
      console.error('❌ Error completing mission:', error);
    }
    
    // Show mission complete modal
    setMissionResult({
      stars,
      correct: validCorrect,
      total,
      timeSpent: timeSeconds,
      isPassed
    });
    setShowMissionComplete(true);
    
    console.log('🎉 Mission complete modal shown');
    
    return { stars, isPassed };
  };
  
  return {
    isMissionMode,
    missionId,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  };
}
