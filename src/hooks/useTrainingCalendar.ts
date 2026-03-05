import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  getCachedMissions, 
  cacheMissions, 
  getCachedStreak, 
  cacheStreak,
  invalidateMissionCache,
  addToPendingQueue,
  removePendingFromQueue
} from '@/utils/missionCache';
import { 
  isFreeTier, 
  checkFreeTierRateLimit, 
  recordFreeTierApiCall,
  markWarningShown 
} from '@/utils/freeTierRateLimiter';
import { checkOnlineStatus } from '@/hooks/useOnlineStatus';

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
  completed_at: string | null;
  ai_reasoning: string | null;
  can_retry: boolean;
  user_id: string;
  created_at: string;
  mission_option?: number;
  daily_message?: string;
  question_attempts?: QuestionAttempt[];
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

export interface QuestionAttempt {
  index: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface MissionResults {
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  question_attempts?: QuestionAttempt[];
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

  // Fetch missions for a specific month (with caching for free tier)
  const fetchMissions = useCallback(async (month: number, year: number) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Check cache first for free tier users
      if (isFreeTier()) {
        const cachedData = getCachedMissions(userId, month, year);
        if (cachedData) {
          const mappedMissions = cachedData.map(mission => ({
            ...mission,
            question_attempts: mission.question_attempts as unknown as QuestionAttempt[] | undefined
          })) as DailyMission[];
          setMissions(mappedMissions);
          setIsLoading(false);
          return;
        }
        
        // Check rate limit before making API call
        const rateCheck = checkFreeTierRateLimit();
        if (!rateCheck.allowed) {
          console.warn('⚠️ Free tier rate limit reached');
          toast({
            title: 'กรุณารอสักครู่',
            description: 'ระบบกำลังประมวลผล กรุณารอ 5 นาที',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        
        if (rateCheck.shouldWarn) {
          markWarningShown();
          toast({
            title: 'คำแนะนำ',
            description: `คุณใช้งานค่อนข้างบ่อย (${rateCheck.callsInWindow}/60 ครั้ง/ชม.)`,
          });
        }
        
        recordFreeTierApiCall();
      }
      
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

      // Map data and properly type question_attempts from Json to QuestionAttempt[]
      const mappedMissions = (data || []).map(mission => ({
        ...mission,
        question_attempts: mission.question_attempts as unknown as QuestionAttempt[] | undefined
      })) as DailyMission[];
      
      // Cache for free tier users
      if (isFreeTier() && data) {
        cacheMissions(userId, month, year, data);
      }
      
      setMissions(mappedMissions);
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
  }, [userId, toast]);

  // Fetch user streak data (with caching for free tier)
  const fetchStreak = async () => {
    if (!userId) return;

    try {
      // Check cache first for free tier users
      if (isFreeTier()) {
        const cachedData = getCachedStreak(userId);
        if (cachedData) {
          setStreak(cachedData);
          return;
        }
        
        // Check rate limit before making API call
        const rateCheck = checkFreeTierRateLimit();
        if (!rateCheck.allowed) {
          console.warn('⚠️ Free tier rate limit reached for streak');
          return;
        }
        recordFreeTierApiCall();
      }
      
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // Cache for free tier users
        if (isFreeTier()) {
          cacheStreak(userId, data);
        }
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
        
        // Cache the new streak
        if (isFreeTier() && newStreak) {
          cacheStreak(userId, newStreak);
        }
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

  // Complete a mission with results - WITH RETRY LOGIC and CENTRALIZED VALIDATION
  const completeMission = async (missionId: string, results: MissionResults) => {
    console.log('🔵 useTrainingCalendar.completeMission called:', { missionId, results });
    
    // ===== VALIDATION SECTION =====
    // Validate total_questions
    if (!results.total_questions || results.total_questions <= 0) {
      console.error('❌ Invalid total_questions:', results.total_questions);
      toast({
        title: 'ข้อมูลไม่ถูกต้อง',
        description: 'จำนวนโจทย์ไม่ถูกต้อง',
        variant: 'destructive',
      });
      return { success: false, stars: 0 };
    }
    
    // Validate and clamp correct_answers
    let validCorrect = results.correct_answers;
    if (validCorrect < 0) {
      console.warn('⚠️ Negative correct_answers, clamping to 0');
      validCorrect = 0;
    }
    if (validCorrect > results.total_questions) {
      console.warn(`⚠️ correct_answers (${validCorrect}) > total_questions (${results.total_questions}), clamping`);
      validCorrect = results.total_questions;
    }
    
    // Calculate accuracy and stars using CENTRALIZED logic
    const accuracy = (validCorrect / results.total_questions) * 100;
    const timeMinutes = results.time_spent / 60;
    
    console.log('📊 Validation passed:', {
      original_correct: results.correct_answers,
      validated_correct: validCorrect,
      total: results.total_questions,
      accuracy: accuracy.toFixed(2) + '%',
      timeMinutes: timeMinutes.toFixed(2)
    });

    // STANDARDIZED Star Calculation (matching missionUtils.ts)
    // 3 stars: ≥90% AND ≤10 min
    // 2 stars: ≥80%
    // 1 star: ≥70%
    // 0 stars: <70%
    let stars = 0;
    if (accuracy >= 90 && timeMinutes <= 10) {
      stars = 3;
    } else if (accuracy >= 80) {
      stars = 2;
    } else if (accuracy >= 70) {
      stars = 1;
    }
    console.log('⭐ Calculated stars:', stars, `(accuracy: ${accuracy.toFixed(1)}%, time: ${timeMinutes.toFixed(1)}min)`);

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
        
        // Perform UPDATE with validated values
        const { error: updateError } = await supabase
          .from('daily_missions')
          .update({
            status: 'completed',
            completed_questions: results.total_questions,
            correct_answers: validCorrect, // Use validated value
            time_spent: results.time_spent,
            stars_earned: stars,
            completed_at: new Date().toISOString(),
            question_attempts: results.question_attempts ? JSON.parse(JSON.stringify(results.question_attempts)) : null,
          })
          .eq('id', cleanMissionId);

        if (updateError) {
          console.error(`❌ Attempt ${attempt} UPDATE error:`, updateError);
          throw updateError;
        }

        console.log(`✅ Attempt ${attempt}: UPDATE succeeded, now verifying...`);

        // Separate SELECT to verify data
        const { data: verifyData, error: verifyError } = await supabase
          .from('daily_missions')
          .select('*')
          .eq('id', cleanMissionId)
          .single();

        if (verifyError) {
          console.error(`❌ Attempt ${attempt} VERIFY error:`, verifyError);
          throw verifyError;
        }

        if (!verifyData) {
          console.error(`❌ Attempt ${attempt}: No data in verification!`);
          throw new Error('Mission not found during verification');
        }

        console.log(`📊 Verification data:`, verifyData);

        // Verify all fields are correct (use validated values)
        const verificationChecks = {
          status: verifyData.status === 'completed',
          correct_answers: verifyData.correct_answers === validCorrect,
          total_questions: verifyData.completed_questions === results.total_questions,
          time_spent: verifyData.time_spent === results.time_spent,
          stars_earned: verifyData.stars_earned === stars,
          completed_at: verifyData.completed_at !== null
        };

        console.log('🔍 Verification checks:', verificationChecks);

        const allChecksPass = Object.values(verificationChecks).every(v => v === true);

        if (!allChecksPass) {
          console.error(`❌ Attempt ${attempt}: Verification failed!`, {
            expected: {
              status: 'completed',
              correct_answers: validCorrect,
              total_questions: results.total_questions,
              time_spent: results.time_spent,
              stars_earned: stars
            },
            actual: {
              status: verifyData.status,
              correct_answers: verifyData.correct_answers,
              total_questions: verifyData.completed_questions,
              time_spent: verifyData.time_spent,
              stars_earned: verifyData.stars_earned
            }
          });
          throw new Error('Data verification failed - values do not match');
        }

        console.log(`✅ Attempt ${attempt} VERIFIED! All data matches expected values`);

        // Clear from pending queue if it was there
        removePendingFromQueue(cleanMissionId);
        
        // Invalidate cache after mission completion
        invalidateMissionCache();

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
          // Save to pending queue for retry (use validated values)
          addToPendingQueue({
            missionId, 
            results: {
              ...results,
              correct_answers: validCorrect // Save validated value
            }, 
            timestamp: Date.now() 
          });
          console.log('💾 Added to pending queue for retry');
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

  // Add a single mission (for incremental addition)
  const addSingleMission = async () => {
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

      const { data, error } = await Promise.race([
        supabase.functions.invoke('generate-daily-mission', {
          body: { userId, localDate, addSingleMission: true },
        }),
        new Promise<{ data: null; error: Error }>((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        )
      ]).catch((err) => {
        if (err.message === 'TIMEOUT') {
          return { data: null, error: new Error('Request timeout - AI took too long to respond') };
        }
        throw err;
      });

      if (error) {
        if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
          toast({
            title: 'หมดเวลา',
            description: 'AI ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
            variant: 'destructive',
          });
          return { success: false };
        } else if (error.message?.includes('429')) {
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
        } else if (error.message?.includes('max_missions_reached')) {
          toast({
            title: 'ถึงขีดจำกัดแล้ว',
            description: 'ไม่สามารถสร้างภารกิจเกิน 10 รายการต่อวันได้',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return { success: false };
      }

      if (data?.success) {
        // Get the newly added mission (last one in the array, with highest mission_option)
        const newMission = data.missions?.sort((a, b) => 
          (b.mission_option || 0) - (a.mission_option || 0)
        )?.[0];
        
        toast({
          title: 'เพิ่มภารกิจใหม่สำเร็จ! 🎯',
          description: newMission?.skill_name || 'ภารกิจใหม่',
        });

        // Invalidate cache then refresh missions
        invalidateMissionCache();
        const today = new Date();
        await fetchMissions(today.getMonth() + 1, today.getFullYear());

        return { success: true };
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error adding mission:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเพิ่มภารกิจได้',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsGenerating(false);
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

    // Prevent multiple simultaneous calls
    if (isGenerating) {
      console.log('⚠️ Mission generation already in progress, skipping...');
      return { success: false };
    }

    try {
      setIsGenerating(true);

      // Send local date to avoid timezone issues
      const localDate = getLocalDateString(new Date());

      const { data, error } = await Promise.race([
        supabase.functions.invoke('generate-daily-mission', {
          body: { userId, localDate },
        }),
        new Promise<{ data: null; error: Error }>((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        )
      ]).catch((err) => {
        if (err.message === 'TIMEOUT') {
          return { data: null, error: new Error('Request timeout - AI took too long to respond') };
        }
        throw err;
      });

      if (error) {
        if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
          toast({
            title: 'หมดเวลา',
            description: 'AI ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
            variant: 'destructive',
            duration: 5000,
          });
          return { success: false };
        } else if (error.message?.includes('429')) {
          toast({
            title: 'ใช้งานบ่อยเกินไป',
            description: 'กรุณารอสักครู่แล้วลองใหม่',
            variant: 'destructive',
            duration: 5000,
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: 'โควต้า AI หมด',
            description: 'กรุณาติดต่อผู้ดูแลระบบ',
            variant: 'destructive',
            duration: 5000,
          });
        } else {
          throw error;
        }
        return { success: false };
      }

      if (data?.success) {
        const mission = data.mission ?? data.missions?.[0];
        const skillName = mission?.skill_name ?? 'ภารกิจใหม่';
        const difficulty = mission?.difficulty ?? '';
        toast({
          title: 'สร้างภารกิจใหม่สำเร็จ! 🎯',
          description: `${skillName}${difficulty ? ` (${difficulty})` : ''}`,
        });

        // Invalidate cache then refresh missions
        invalidateMissionCache();
        const today = new Date();
        await fetchMissions(today.getMonth() + 1, today.getFullYear());

        return { success: true, mission };
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error generating mission:', error);
      
      // แสดง toast warning แทน error (เพราะ mission อาจถูกสร้างแล้ว)
      toast({
        title: 'กำลังตรวจสอบ...',
        description: 'รอสักครู่ ระบบกำลังตรวจสอบภารกิจ',
        duration: 3000, // 3 วินาที
      });
      
      // รอ 2 วินาทีแล้ว fetch missions ใหม่เพื่อตรวจสอบ
      await new Promise(resolve => setTimeout(resolve, 2000));
      invalidateMissionCache();
      const today = new Date();
      await fetchMissions(today.getMonth() + 1, today.getFullYear());
      
      return { success: false };
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate missions (generate new first, edge function handles deletion)
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

      // Edge function now handles create-before-delete internally
      const localDate = getLocalDateString(new Date());

      const { data: functionData, error: functionError } = await Promise.race([
        supabase.functions.invoke(
          'generate-daily-mission',
          { body: { userId, localDate } }
        ),
        new Promise<{ data: null; error: Error }>((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        )
      ]).catch((err) => {
        if (err.message === 'TIMEOUT') {
          return { data: null, error: new Error('Request timeout') };
        }
        throw err;
      });

      if (functionError) throw functionError;

      if (functionData?.success) {
        invalidateMissionCache();
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

    // Map data and properly type question_attempts from Json to QuestionAttempt[]
    const mappedMissions = (data || []).map(mission => ({
      ...mission,
      question_attempts: mission.question_attempts as unknown as QuestionAttempt[] | undefined
    })) as DailyMission[];
    
    return mappedMissions;
  };

  // Helper to check if mission is completed
  const isMissionCompleted = (mission: DailyMission) => 
    mission.status === 'completed' || mission.status === 'catchup' || mission.completed_at !== null;

  // Calculate skill statistics
  const getSkillStats = (missions: DailyMission[]) => {
    const skillMap = new Map<string, { count: number; totalAccuracy: number; totalStars: number }>();

    missions.forEach(mission => {
      if (isMissionCompleted(mission)) {
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
        return missionDate >= weekStart && missionDate <= weekEnd && isMissionCompleted(m);
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
    addSingleMission,
    regenerateMissions,
    fetchAllMissions,
    getSkillStats,
    getWeeklyTrends,
  };
};
