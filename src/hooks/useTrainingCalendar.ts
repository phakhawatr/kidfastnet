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

  // Complete a mission with results
  const completeMission = async (missionId: string, results: MissionResults) => {
    try {
      const accuracy = (results.correct_answers / results.total_questions) * 100;
      const timeMinutes = results.time_spent / 60;

      // Calculate stars
      let stars = 0;
      if (accuracy >= 90 && timeMinutes <= 10) {
        stars = 3;
      } else if (accuracy >= 70) {
        stars = 2;
      } else if (accuracy >= 50) {
        stars = 1;
      }

      // Update mission
      const { error } = await supabase
        .from('daily_missions')
        .update({
          status: 'completed',
          completed_questions: results.total_questions,
          correct_answers: results.correct_answers,
          time_spent: results.time_spent,
          stars_earned: stars,
          completed_at: new Date().toISOString(),
        })
        .eq('id', missionId);

      if (error) throw error;

      // Trigger will update streak automatically
      await fetchStreak();

      toast({
        title: `สำเร็จ! ได้ ${stars} ดาว ⭐`,
        description: `ความแม่น: ${accuracy.toFixed(0)}%`,
      });

      // Generate next day's mission
      await generateTodayMission();

      return { success: true, stars };
    } catch (error) {
      console.error('Error completing mission:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกผลได้',
        variant: 'destructive',
      });
      return { success: false, stars: 0 };
    }
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

    try {
      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke('generate-daily-mission', {
        body: { userId },
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
  };
};
