import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  description_th: string;
  description_en: string;
  icon: string;
  color: string;
  criteria: any;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_code: string;
  earned_at: string;
  metadata: any;
  achievement?: Achievement;
}

export const useAchievements = (userId: string | null) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all achievement definitions
        const { data: allAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at');

        if (achievementsError) throw achievementsError;

        // Fetch user's earned achievements
        const { data: earnedAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false });

        if (userAchievementsError) throw userAchievementsError;

        // Combine data
        const combined = earnedAchievements?.map(ua => ({
          ...ua,
          achievement: allAchievements?.find(a => a.code === ua.achievement_code)
        })) || [];

        setAchievements(allAchievements || []);
        setUserAchievements(combined);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  const hasAchievement = (code: string): boolean => {
    return userAchievements.some(ua => ua.achievement_code === code);
  };

  const getAchievementProgress = () => {
    return {
      earned: userAchievements.length,
      total: achievements.length,
      percentage: achievements.length > 0 
        ? Math.round((userAchievements.length / achievements.length) * 100)
        : 0
    };
  };

  return {
    achievements,
    userAchievements,
    isLoading,
    hasAchievement,
    getAchievementProgress
  };
};
