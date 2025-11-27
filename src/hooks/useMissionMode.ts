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
    
    const accuracy = (correct / total) * 100;
    const timeSeconds = Math.floor(timeMs / 1000);
    
    console.log('📊 Calculated metrics:', {
      accuracy: accuracy.toFixed(2) + '%',
      timeSeconds,
      timeMinutes: (timeSeconds / 60).toFixed(2)
    });
    
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
    
    console.log('⭐ Mission results:', {
      isPassed,
      stars,
      passThreshold: '80%'
    });
    
    // Save to database
    try {
      console.log('💾 Calling completeMission in useTrainingCalendar...');
      await completeMission(missionId, {
        total_questions: total,
        correct_answers: correct,
        time_spent: timeSeconds
      });
      console.log('✅ completeMission succeeded');
    } catch (error) {
      console.error('❌ Error completing mission:', error);
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
