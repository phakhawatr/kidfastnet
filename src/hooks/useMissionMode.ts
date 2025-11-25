import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTrainingCalendar } from './useTrainingCalendar';

interface MissionResult {
  stars: number;
  correct: number;
  total: number;
  timeSpent: number;
  isPassed: boolean;
}

/**
 * Custom hook to handle mission mode integration for exercise apps
 * Pass threshold: >80%
 * Star calculation: 3⭐ = 90-100% + ≤10min, 2⭐ = 80-89%, 1⭐ = 70-79%, 0⭐ = <70%
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
   */
  const handleCompleteMission = async (correct: number, total: number, timeMs: number) => {
    if (!missionId) return;
    
    const accuracy = (correct / total) * 100;
    const timeSeconds = Math.floor(timeMs / 1000);
    
    // Pass threshold: >80%
    const isPassed = accuracy > 80;
    
    // Calculate stars (only if passed)
    let stars = 0;
    if (isPassed) {
      const timeMinutes = timeSeconds / 60;
      if (accuracy >= 90 && timeMinutes <= 10) {
        stars = 3;
      } else if (accuracy >= 80) {
        stars = 2;
      } else if (accuracy >= 70) {
        stars = 1;
      }
    }
    
    // Save to database
    try {
      await completeMission(missionId, {
        total_questions: total,
        correct_answers: correct,
        time_spent: timeSeconds
      });
    } catch (error) {
      console.error('Error completing mission:', error);
    }
    
    // Show mission complete modal
    setMissionResult({
      stars,
      correct,
      total,
      timeSpent: timeSeconds,
      isPassed
    });
    setShowMissionComplete(true);
    
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
