import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DailyMission {
  id: string;
  mission_date: string;
  skill_name: string;
  difficulty: string;
  status: 'pending' | 'completed' | 'skipped' | 'catchup';
  stars_earned: number | null;
  total_questions: number;
  completed_questions: number | null;
  correct_answers: number | null;
  time_spent: number | null;
  ai_reasoning: string | null;
  can_retry: boolean;
  user_id: string;
  created_at: string;
  mission_option?: number;
  daily_message?: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_missions_completed: number;
  total_stars_earned: number;
  perfect_days: number;
  last_completed_date: string | null;
  updated_at: string;
}

interface MissionResults {
  total_questions: number;
  correct_answers: number;
  time_spent: number;
}

export const useTrainingCalendar = () => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user ID from auth or localStorage
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
      } else {
        // Try to get userId from kidfast_auth in localStorage
        const authData = localStorage.getItem('kidfast_auth');
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            if (parsed.registrationId) {
              setUserId(parsed.registrationId);
            } else {
              setIsLoading(false);
            }
          } catch (e) {
            console.error('Error parsing auth data:', e);
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      }
    };

    initializeUser();
  }, []);

  // Fetch missions for a specific month
  const fetchMissions = async (month: number, year: number) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', userId)
        .gte('mission_date', startDate)
        .lte('mission_date', endDate)
        .order('mission_date', { ascending: true });

      if (error) throw error;

      setMissions((data || []) as DailyMission[]);
    } catch (error) {
      console.error('Error fetching missions:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดภารกิจได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user streak data
  const fetchStreak = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStreak(data);
      } else {
        // Create initial streak record
        const { data: newStreak, error: createError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            total_missions_completed: 0,
            total_stars_earned: 0,
            perfect_days: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        setStreak(newStreak);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  // Start a mission (mark as in progress)
  const startMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from('daily_missions')
        .update({ status: 'pending' })
        .eq('id', missionId);

      if (error) throw error;

      toast({
        title: 'เริ่มภารกิจ!',
        description: 'ขอให้โชคดี! 🎯',
      });

      return true;
    } catch (error) {
      console.error('Error starting mission:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเริ่มภารกิจได้',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Complete a mission with results - WITH RETRY LOGIC
  const completeMission = async (missionId: string, results: MissionResults) => {
    console.log('🔵 useTrainingCalendar.completeMission called:', { missionId, results });
    
    // Calculate accuracy and stars first
    const accuracy = (results.correct_answers / results.total_questions) * 100;
    console.log('📊 Accuracy:', accuracy);

    let stars = 0;
    if (accuracy > 80) {
      const timeMinutes = results.time_spent / 60;
      if (accuracy >= 90 && timeMinutes <= 10) {
        stars = 3;
      } else if (accuracy >= 80) {
        stars = 2;
      } else if (accuracy >= 70) {
        stars = 1;
      }
    }
    console.log('⭐ Calculated stars:', stars);

    // Retry logic: up to 3 attempts
    let lastError = null;
    // Sanitize and validate missionId
    const cleanMissionId = missionId?.trim();
    console.log('🔍 Original missionId:', missionId);
    console.log('🔍 Cleaned missionId:', cleanMissionId);
    console.log('🔍 missionId length:', cleanMissionId?.length);
    
    if (!cleanMissionId) {
      throw new Error('missionId is empty or undefined');
    }
    
    if (cleanMissionId.length !== 36) {
      console.error(`❌ Invalid missionId length: ${cleanMissionId.length} (expected 36)`);
      throw new Error(`Invalid missionId format: ${cleanMissionId}`);
    }
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`💾 Attempt ${attempt}/3: Updating mission ${cleanMissionId}...`);
        
        // Perform UPDATE with explicit count check
        const { data: updateData, error: updateError, count } = await supabase
          .from('daily_missions')
          .update({
            status: 'completed',
            completed_questions: results.total_questions,
            correct_answers: results.correct_answers,
            time_spent: results.time_spent,
            stars_earned: stars,
            completed_at: new Date().toISOString(),
          })
          .eq('id', cleanMissionId)
          .select('*');

        console.log(`📊 Update result - Data length: ${updateData?.length}, Data:`, updateData);
        console.log(`📊 Error:`, updateError);

        if (updateError) {
          console.error(`❌ Attempt ${attempt} UPDATE error:`, updateError);
          throw updateError;
        }

        // Check if any rows were affected
        const rowCount = updateData?.length || 0;
        if (rowCount === 0) {
          console.error(`❌ Attempt ${attempt}: No rows affected! Mission not found with id: ${cleanMissionId}`);
          throw new Error(`No mission found with id: ${cleanMissionId}`);
        }

        // Verify data was returned
        if (!updateData || updateData.length === 0) {
          console.error(`❌ Attempt ${attempt}: No data returned despite count=${count}`);
          throw new Error('No data returned from update');
        }

        // Verify status is 'completed'
        const updatedMission = updateData[0];
        if (updatedMission.status !== 'completed') {
          console.error(`❌ Attempt ${attempt}: Status not 'completed'! Current: ${updatedMission.status}`);
          throw new Error(`Status was not updated correctly: ${updatedMission.status}`);
        }

        console.log(`✅ Attempt ${attempt} SUCCESS! Mission verified:`, updatedMission);

        // Clear any pending saves
        localStorage.removeItem('pendingMissionResult');

        // Success! Update streak and refresh
        await Promise.all([
          fetchStreak(),
          fetchMissions(new Date().getMonth() + 1, new Date().getFullYear())
        ]);

        toast({
          title: `สำเร็จ! ได้ ${stars} ดาว ⭐`,
          description: `ความแม่น: ${accuracy.toFixed(0)}%`,
        });

        return { success: true, stars };
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error);
        
        if (attempt === 3) {
          // Save to localStorage for retry
          const pendingResult = { missionId, results, timestamp: Date.now() };
          localStorage.setItem('pendingMissionResult', JSON.stringify(pendingResult));
          console.log('💾 Saved to localStorage for retry');
        } else {
          // Wait before retry (exponential backoff: 500ms, 1000ms, 1500ms)
          const delayMs = 500 * attempt;
          console.log(`⏳ Waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // All attempts failed
    console.error('❌ All 3 attempts failed. Last error:', lastError);
    toast({
      title: 'เกิดข้อผิดพลาด',
      description: 'ไม่สามารถบันทึกผลได้ กรุณาลองใหม่อีกครั้ง',
      variant: 'destructive',
    });
    return { success: false, stars: 0 };
  };

  // Catch up a skipped mission
  const catchUpMission = async (missionId: string, results: MissionResults) => {
    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) throw new Error('Mission not found');

      const today = new Date().toISOString().split('T')[0];
      const missionDate = new Date(mission.mission_date);
      const daysDiff = Math.floor((new Date(today).getTime() - missionDate.getTime()) / (1000 * 60 * 60 * 24));

      let starMultiplier = 0;
      if (daysDiff <= 3) {
        starMultiplier = 0.5; // 50% stars within 3 days
      } else if (daysDiff <= 7) {
        starMultiplier = 0.25; // 25% stars within 7 days
      } else {
        toast({
          title: 'ไม่สามารถทำได้',
          description: 'ภารกิจถูกล็อกแล้ว (เกิน 7 วัน)',
          variant: 'destructive',
        });
        return { success: false, stars: 0 };
      }

      const accuracy = (results.correct_answers / results.total_questions) * 100;
      const timeMinutes = results.time_spent / 60;

      let baseStars = 0;
      if (accuracy >= 90 && timeMinutes <= 10) {
        baseStars = 3;
      } else if (accuracy >= 70) {
        baseStars = 2;
      } else if (accuracy >= 50) {
        baseStars = 1;
      }

      const stars = Math.floor(baseStars * starMultiplier);

      const { error } = await supabase
        .from('daily_missions')
        .update({
          status: 'catchup',
          completed_questions: results.total_questions,
          correct_answers: results.correct_answers,
          time_spent: results.time_spent,
          stars_earned: stars,
          completed_at: new Date().toISOString(),
        })
        .eq('id', missionId);

      if (error) throw error;

      await fetchStreak();

      toast({
        title: `ทำย้อนหลังสำเร็จ! ได้ ${stars} ดาว ⭐`,
        description: `(${starMultiplier * 100}% จากคะแนนเต็ม)`,
      });

      return { success: true, stars };
    } catch (error) {
      console.error('Error catching up mission:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถทำย้อนหลังได้',
        variant: 'destructive',
      });
      return { success: false, stars: 0 };
    }
  };

  // Helper function to get local date string
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate today's mission using AI
  const generateTodayMission = async () => {
    if (!userId) {
      toast({
        title: 'ไม่พบข้อมูลผู้ใช้',
        description: 'กรุณาเข้าสู่ระบบใหม่',
        variant: 'destructive',
      });
      return { success: false };
    }

    // Prevent multiple simultaneous calls
    if (isGenerating) {
      console.log('⚠️ Mission generation already in progress, skipping...');
      return { success: false };
    }

    try {
      setIsGenerating(true);

      // Send local date to avoid timezone issues
      const localDate = getLocalDateString(new Date());

      const { data, error } = await supabase.functions.invoke('generate-daily-mission', {
        body: { userId, localDate },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: 'ใช้งานบ่อยเกินไป',
            description: 'กรุณารอสักครู่แล้วลองใหม่',
            variant: 'destructive',
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: 'โควต้า AI หมด',
            description: 'กรุณาติดต่อผู้ดูแลระบบ',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return { success: false };
      }

      if (data?.success) {
        toast({
          title: 'สร้างภารกิจใหม่สำเร็จ! 🎯',
          description: `${data.mission.skill_name} (${data.mission.difficulty})`,
        });

        // Refresh missions
        const today = new Date();
        await fetchMissions(today.getMonth() + 1, today.getFullYear());

        return { success: true, mission: data.mission };
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error generating mission:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างภารกิจได้',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate missions (delete old incomplete ones and create new)
  const regenerateMissions = async () => {
    if (!userId) {
      toast({
        title: 'ไม่พบข้อมูลผู้ใช้',
        description: 'กรุณาเข้าสู่ระบบใหม่',
        variant: 'destructive',
      });
      return { success: false };
    }

    // Prevent multiple simultaneous calls
    if (isGenerating) {
      console.log('⚠️ Mission regeneration already in progress, skipping...');
      return { success: false };
    }

    try {
      setIsGenerating(true);

      // Delete only NON-COMPLETED missions to preserve completed work
      const localDate = getLocalDateString(new Date());
      const { error: deleteError } = await supabase
        .from('daily_missions')
        .delete()
        .eq('user_id', userId)
        .eq('mission_date', localDate)
        .neq('status', 'completed'); // Keep completed missions

      if (deleteError) throw deleteError;

      // Wait a moment to ensure deletions are processed
      await new Promise(resolve => setTimeout(resolve, 200));

      // Call edge function to generate new missions
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'generate-daily-mission',
        { body: { userId, localDate } }
      );

      if (functionError) throw functionError;

      if (functionData?.missions) {
        await fetchMissions(new Date().getMonth() + 1, new Date().getFullYear());
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Error regenerating missions:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างภารกิจใหม่ได้',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch all missions for history/analytics
  const fetchAllMissions = async (userId: string): Promise<DailyMission[]> => {
    const { data, error } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', userId)
      .order('mission_date', { ascending: false });

    if (error) {
      console.error('Error fetching all missions:', error);
      return [];
    }

    return (data || []) as DailyMission[];
  };

  // Calculate skill statistics
  const getSkillStats = (missions: DailyMission[]) => {
    const skillMap = new Map<string, { count: number; totalAccuracy: number; totalStars: number }>();

    missions.forEach(mission => {
      if (mission.status === 'completed' || mission.status === 'catchup') {
        const existing = skillMap.get(mission.skill_name) || { count: 0, totalAccuracy: 0, totalStars: 0 };
        const accuracy = mission.total_questions > 0 
          ? (mission.correct_answers! / mission.total_questions) * 100 
          : 0;
        
        skillMap.set(mission.skill_name, {
          count: existing.count + 1,
          totalAccuracy: existing.totalAccuracy + accuracy,
          totalStars: existing.totalStars + (mission.stars_earned || 0),
        });
      }
    });

    return Array.from(skillMap.entries())
      .map(([skill, stats]) => ({
        skill,
        count: stats.count,
        avgAccuracy: stats.totalAccuracy / stats.count,
        totalStars: stats.totalStars,
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Calculate weekly trends (last 8 weeks)
  const getWeeklyTrends = (missions: DailyMission[]) => {
    const weeks: { week: string; avgAccuracy: number; missions: number; stars: number }[] = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 6));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);

      const weekMissions = missions.filter(m => {
        const missionDate = new Date(m.mission_date);
        return missionDate >= weekStart && missionDate <= weekEnd && 
               (m.status === 'completed' || m.status === 'catchup');
      });

      const totalAccuracy = weekMissions.reduce((sum, m) => {
        return sum + (m.total_questions > 0 ? (m.correct_answers! / m.total_questions) * 100 : 0);
      }, 0);

      const totalStars = weekMissions.reduce((sum, m) => sum + (m.stars_earned || 0), 0);

      weeks.push({
        week: `สัปดาห์ ${8 - i}`,
        avgAccuracy: weekMissions.length > 0 ? totalAccuracy / weekMissions.length : 0,
        missions: weekMissions.length,
        stars: totalStars,
      });
    }

    return weeks;
  };

  // Initialize data on mount
  useEffect(() => {
    if (userId) {
      const today = new Date();
      fetchMissions(today.getMonth() + 1, today.getFullYear());
      fetchStreak();
    }
  }, [userId]);

  return {
    missions,
    streak,
    isLoading,
    isGenerating,
    userId,
    fetchMissions,
    fetchStreak,
    startMission,
    completeMission,
    catchUpMission,
    generateTodayMission,
    regenerateMissions,
    fetchAllMissions,
    getSkillStats,
    getWeeklyTrends,
  };
};
