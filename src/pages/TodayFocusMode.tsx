import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrainingCalendar, DailyMission } from '@/hooks/useTrainingCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, Brain, Target, Zap, Trophy, Star, Flame, Sparkles, 
  PartyPopper, CheckCircle2, Calendar, Loader2, Clock, History
} from 'lucide-react';
import { toast } from 'sonner';

const TodayFocusMode = () => {
  const { t } = useTranslation('trainingCalendar');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    missions, 
    streak, 
    isLoading, 
    isGenerating,
    userId, 
    startMission, 
    generateTodayMission,
    addSingleMission,
    regenerateMissions,
    fetchMissions,
    completeMission
  } = useTrainingCalendar();
  const [selectedMission, setSelectedMission] = useState<DailyMission | null>(null);
  const hasAttemptedGeneration = useRef(false);
  const lastGeneratedDate = useRef<string>('');
  const needsRefresh = searchParams.get('refresh') === 'true';
  const dateParam = searchParams.get('date'); // e.g., "2025-11-25"
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Helper function to check if mission is completed
  // Mission is completed if EITHER status is 'completed' OR completed_at has a value
  const isMissionCompleted = (mission: DailyMission): boolean => {
    return mission.status === 'completed' || mission.completed_at !== null;
  };

  // Helper function to get date string in local timezone (YYYY-MM-DD)
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayStr = getLocalDateString(today);
  
  // Determine target date (from parameter or today)
  const targetDate = dateParam ? new Date(dateParam) : today;
  const targetDateStr = getLocalDateString(targetDate);
  const isViewingPast = dateParam && dateParam !== todayStr;
  
  // Get all missions for the target date - use string comparison for timezone-safe filtering
  const todayMissions = missions.filter(m => {
    // mission_date is in format "2025-11-25" or "2025-11-25T00:00:00+07:00"
    const missionDateStr = m.mission_date.split('T')[0];
    return missionDateStr === targetDateStr;
  }).sort((a, b) => ((a as any).mission_option || 1) - ((b as any).mission_option || 1));

  const dayOfWeek = targetDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Reset generation tracking when date changes
  useEffect(() => {
    if (lastGeneratedDate.current !== todayStr) {
      hasAttemptedGeneration.current = false;
      lastGeneratedDate.current = todayStr;
      console.log('📅 Date changed, reset generation tracking');
    }
  }, [todayStr]);

  // Loading timeout detection (35 seconds)
  useEffect(() => {
    if (isGenerating) {
      setLoadingTimeout(false);
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        console.log('⏰ Loading timeout reached');
      }, 35000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (!userId && !isLoading) {
      toast.error(t('loginRequired'));
      navigate('/login');
    }
  }, [userId, isLoading, navigate, t]);

  // Auto-generate missions if not enough (less than 3) or none
  useEffect(() => {
    const autoGenerateMissions = async () => {
      // Don't auto-generate if viewing past date
      if (isViewingPast) {
        console.log('📅 Viewing past date, skip auto-generation');
        return;
      }
      
      // ถ้ามี refresh=true แสดงว่าเพิ่งกลับจากทำภารกิจ
      // รอให้ข้อมูล sync ก่อน และ fetch ใหม่
      if (needsRefresh) {
        console.log('🔄 Refresh mode: waiting for data sync...');
        await new Promise(resolve => setTimeout(resolve, 1500)); // รอ 1.5 วินาที
        await fetchMissions(targetDate.getMonth() + 1, targetDate.getFullYear());
        // ลบ refresh param จาก URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('refresh');
        navigate(`/today-mission?${newSearchParams.toString()}`, { replace: true });
        return; // ไม่ auto-generate
      }
      
      // Prevent multiple simultaneous generations
      if (hasAttemptedGeneration.current) return;
      if (isLoading || isGenerating || !userId) return;
      
      // If it's weekend, don't auto-generate
      if (isWeekend) return;
      
      // If we have 3+ missions for today, no need to generate
      if (todayMissions.length >= 3) return;
      
      // Mark that we've attempted generation
      hasAttemptedGeneration.current = true;
      
      // Auto-generate: either regenerate (if some exist) or generate fresh
      if (todayMissions.length > 0 && todayMissions.length < 3) {
        // Has some missions but not 3, regenerate all
        await regenerateMissions();
      } else if (todayMissions.length === 0) {
        // No missions, generate new
        await generateTodayMission();
      }
    };
    
    autoGenerateMissions();
  }, [userId, isLoading, isGenerating, todayMissions.length, isWeekend, needsRefresh, searchParams, navigate, isViewingPast]);

  // Retry if no missions after loading completes
  useEffect(() => {
    if (!isLoading && !isGenerating && userId && todayMissions.length === 0 && !isWeekend && !isViewingPast) {
      // Wait 2 seconds and try again if still no missions
      const timer = setTimeout(() => {
        if (todayMissions.length === 0 && !hasAttemptedGeneration.current) {
          console.log('🔄 Retry: No missions found after loading, attempting generation...');
          hasAttemptedGeneration.current = false; // Reset to allow retry
          generateTodayMission();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isGenerating, userId, todayMissions.length, isWeekend, isViewingPast, generateTodayMission]);

  // Retry pending mission results from localStorage
  useEffect(() => {
    const retryPendingResult = async () => {
      const pending = localStorage.getItem('pendingMissionResult');
      if (!pending) return;
      
      try {
        const { missionId, results, timestamp } = JSON.parse(pending);
        
        // Only retry if less than 1 hour old
        if (Date.now() - timestamp > 3600000) {
          console.log('⏰ Pending result expired, removing...');
          localStorage.removeItem('pendingMissionResult');
          return;
        }
        
        console.log('🔄 Retrying pending mission result...', { missionId, results });
        const result = await completeMission(missionId, results);
        
        if (result.success) {
          localStorage.removeItem('pendingMissionResult');
          toast.success('บันทึกผลสำเร็จ! ⭐', {
            description: `ได้ ${result.stars} ดาว`
          });
          
          // Refresh missions after successful retry
          fetchMissions(targetDate.getMonth() + 1, targetDate.getFullYear());
        } else {
          console.warn('⚠️ Retry failed, will try again later');
        }
      } catch (e) {
        console.error('❌ Retry failed:', e);
      }
    };
    
    if (userId) {
      retryPendingResult();
    }
  }, [userId, completeMission, fetchMissions]);

  // Auto-refresh missions on mount or when refresh=true query param
  useEffect(() => {
    if (userId && (needsRefresh || !missions.length)) {
      console.log('📥 TodayFocusMode: Fetching missions...', { needsRefresh, targetDateStr });
      // Use targetDate from dateParam (or today) instead of always using today
      fetchMissions(targetDate.getMonth() + 1, targetDate.getFullYear());
    }
  }, [userId, needsRefresh, targetDate, fetchMissions]);

  // Auto-refresh missions when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing missions...');
      if (userId) {
        // Use targetDate from dateParam instead of always using today
        fetchMissions(targetDate.getMonth() + 1, targetDate.getFullYear());
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId, fetchMissions, targetDate]);

  // Fetch correct month when dateParam changes
  useEffect(() => {
    if (userId && dateParam) {
      const paramDate = new Date(dateParam);
      console.log('📅 Date parameter detected, fetching missions for:', dateParam);
      fetchMissions(paramDate.getMonth() + 1, paramDate.getFullYear());
    }
  }, [userId, dateParam, fetchMissions]);

  const getSkillRoute = (skillName: string): string => {
    // Expanded skill routes mapping with variants
    const skillRoutes: Record<string, string> = {
      // Interactive Games
      'ดอกไม้คณิตศาสตร์': '/flower-math',
      'บอลลูนคณิตศาสตร์': '/balloon-math',
      'นับเลขท้าทาย': '/counting-challenge',
      'เปรียบเทียบดาว': '/compare-stars',
      'นับกระดาน': '/board-counting',
      'นับผลไม้': '/fruit-counting',
      'คิดเลขด่วน': '/quick-math',
      
      // Addition variants
      'บวกเลข': '/addition',
      'การบวกเลข': '/addition',
      'การบวกเลขไม่เกิน 10': '/addition',
      'การบวกเลขไม่เกิน 100': '/addition',
      'การบวกเลขไม่เกิน 1000': '/addition',
      
      // Subtraction variants  
      'ลบเลข': '/subtraction',
      'การลบเลข': '/subtraction',
      
      // Multiplication variants
      'คูณเลข': '/multiplication',
      'การคูณเลข': '/multiplication',
      
      // Division variants
      'หารเลข': '/division',
      'การหารเลข': '/division',
      
      // Fractions
      'เศษส่วน': '/fraction-shapes',
      'เศษส่วนรูปทรง': '/fraction-shapes',
      'เศษส่วนจับคู่': '/fraction-matching',
      
      // Decimals & Percentage
      'ทศนิยม': '/place-value',
      'ร้อยละ': '/percentage',
      
      // Money & Time
      'เงิน': '/money',
      'เงินและการเงิน': '/money',
      'การบอกเวลา': '/time',
      'เวลา': '/time',
      
      // Measurement
      'การวัด': '/measurement',
      'การวัดความยาว': '/length-comparison',
      'การชั่งน้ำหนัก': '/weighing',
      'น้ำหนัก': '/weighing',
      
      // Shapes & Patterns
      'รูปทรง': '/shape-matching',
      'รูปทรงจับคู่': '/shape-matching',
      'อนุกรมรูปทรง': '/shape-series',
      'อนุกรมตัวเลข': '/number-series',
      
      // Advanced
      'พันธะตัวเลข': '/number-bonds',
      'โมเดลบาร์': '/bar-model',
      'โมเดลพื้นที่': '/area-model',
      'คิดเลขเร็ว': '/mental-math',
      'สูตรคูณ': '/multiplication-table',
      'ปริศนาตารางผลบวก': '/sum-grid',
      'โจทย์ปัญหา': '/word-problems',
    };
    
    // Check exact match first
    if (skillRoutes[skillName]) return skillRoutes[skillName];
    
    // Flexible matching - check if skill contains keywords
    const skillLower = skillName.toLowerCase();
    
    // Interactive Games first
    if (skillLower.includes('ดอกไม้')) return '/flower-math';
    if (skillLower.includes('บอลลูน')) return '/balloon-math';
    if (skillLower.includes('นับเลข') || skillLower.includes('counting')) return '/counting-challenge';
    if (skillLower.includes('เปรียบเทียบดาว') || skillLower.includes('ดาว')) return '/compare-stars';
    if (skillLower.includes('นับกระดาน') || skillLower.includes('กระดาน')) return '/board-counting';
    if (skillLower.includes('นับผลไม้') || skillLower.includes('ผลไม้')) return '/fruit-counting';
    if (skillLower.includes('คิดเลขด่วน') || skillLower.includes('quick')) return '/quick-math';
    
    // Basic skills
    if (skillLower.includes('บวก')) return '/addition';
    if (skillLower.includes('ลบ')) return '/subtraction';
    if (skillLower.includes('คูณ')) return '/multiplication';
    if (skillLower.includes('หาร')) return '/division';
    if (skillLower.includes('เศษส่วน')) return '/fraction-shapes';
    if (skillLower.includes('ทศนิยม')) return '/place-value';
    if (skillLower.includes('ร้อยละ') || skillLower.includes('เปอร์เซ็นต์')) return '/percentage';
    if (skillLower.includes('เงิน')) return '/money';
    if (skillLower.includes('วัด')) return '/measurement';
    if (skillLower.includes('เวลา') || skillLower.includes('นาฬิกา')) return '/time';
    if (skillLower.includes('น้ำหนัก') || skillLower.includes('ชั่ง')) return '/weighing';
    if (skillLower.includes('รูปทรง')) return '/shape-matching';
    
    return '/quiz'; // fallback
  };

  const handleStartMission = async (mission: DailyMission | null) => {
    if (!mission) {
      toast.error('กรุณาเลือกภารกิจที่ต้องการทำ');
      return;
    }

    try {
      await startMission(mission.id);
      
      const route = getSkillRoute(mission.skill_name);
      
      // Map difficulty to app's level
      const levelMap: Record<string, string> = {
        'easy': 'easy',
        'medium': 'medium', 
        'hard': 'hard'
      };
      const appLevel = levelMap[mission.difficulty] || 'easy';
      
      // Build query params
      const params = new URLSearchParams({
        level: appLevel,
        count: String(mission.total_questions),
        autoStart: 'true',
        missionId: mission.id
      });
      
      navigate(`${route}?${params.toString()}`);
    } catch (error) {
      toast.error('ไม่สามารถเริ่มภารกิจได้');
    }
  };

  const handleGenerateMission = async () => {
    const result = await generateTodayMission();
    if (result.success) {
      toast.success('AI สร้างภารกิจประจำวันให้คุณแล้ว! 🎯');
    }
  };

  const handleAddSingleMission = async () => {
    console.log('🚀 handleAddSingleMission called');
    console.log('📊 Current missions count:', todayMissions.length);
    const result = await addSingleMission();
    console.log('📥 Result:', result);
    if (result.success) {
      toast.success('เพิ่มภารกิจใหม่สำเร็จ! 🎯');
    }
  };

  const handleRegenerateMissions = async () => {
    const result = await regenerateMissions();
    if (result.success) {
      toast.success('AI สร้างภารกิจใหม่ 3 รายการให้คุณแล้ว! 🎯');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'ง่าย';
      case 'medium':
        return 'ปานกลาง';
      case 'hard':
        return 'ยาก';
      default:
        return difficulty;
    }
  };

  // Loading or generating state
  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg mb-4">
            {isGenerating ? 'AI กำลังสร้างภารกิจให้คุณ...' : 'กำลังโหลด...'}
          </p>
          
          {loadingTimeout && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-md mx-auto">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-yellow-300 mb-3">
                AI ใช้เวลานานกว่าปกติ กรุณารอสักครู่หรือลองใหม่อีกครั้ง
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="bg-yellow-500/20 border-yellow-500 text-yellow-300 hover:bg-yellow-500/30"
              >
                ลองใหม่อีกครั้ง
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  // Weekend view
  if (isWeekend && todayMissions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/training-calendar')}
            variant="ghost"
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับสู่หน้าปฏิทินของฉัน
          </Button>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700 text-center p-8">
            <PartyPopper className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-3xl font-bold text-white mb-2">
              🎉 วันหยุดพักผ่อน!
            </h2>
            <p className="text-slate-300 mb-6">
              ผ่อนคลายและเตรียมพร้อมสำหรับสัปดาห์หน้า
            </p>
            <Button
              onClick={() => navigate('/training-calendar')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              ดูปฏิทินการฝึก
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Check if all completed - require exactly 3 missions AND all completed
  const allCompleted = todayMissions.length >= 3 && todayMissions.every(m => isMissionCompleted(m));

  // Show completed view only when ALL 3 missions are done
  if (allCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/training-calendar')}
            variant="ghost"
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับสู่หน้าปฏิทินของฉัน
          </Button>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700 text-center p-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 เยี่ยมมาก! คุณทำภารกิจวันนี้สำเร็จแล้ว
            </h2>
            {todayMissions.map((mission) => (
              <Card key={mission.id} className="bg-slate-900/50 border-slate-700 mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-center gap-1 mb-2">
                    {Array.from({ length: mission.stars_earned || 0 }).map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white font-semibold">{mission.skill_name}</p>
                  <p className="text-slate-400 text-sm">
                    {mission.correct_answers}/{mission.total_questions} ข้อ
                  </p>
                </CardContent>
              </Card>
            ))}
            <Button
              onClick={() => navigate('/training-calendar')}
              className="bg-green-500 hover:bg-green-600"
            >
              ดูปฏิทิน
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Get daily message from first mission (they all have the same message)
  const dailyMessage = todayMissions[0]?.daily_message;

  // Main mission selection UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => navigate('/training-calendar')}
          variant="ghost"
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับสู่หน้าปฏิทินของฉัน
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {isViewingPast ? (
              <History className="w-8 h-8 text-blue-400" />
            ) : (
              <Calendar className="w-8 h-8 text-yellow-400" />
            )}
            <h1 className="text-3xl font-bold text-white">
              {isViewingPast ? 'ประวัติภารกิจ' : 'Today Focus Mode'}
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            {targetDate.toLocaleDateString('th-TH', { 
              weekday: 'long', 
              year: 'numeric',
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          {/* AI Daily Message */}
          {dailyMessage && (
            <Card className="mt-4 bg-slate-900 backdrop-blur-sm border-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <p className="text-white text-lg font-semibold drop-shadow-md text-left">
                    {dailyMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-slate-800/90 backdrop-blur-sm border-orange-500/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-orange-500 rounded-full">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-orange-300 text-sm font-medium">สตรีคปัจจุบัน</p>
                <p className="text-3xl font-bold text-white">
                  {streak?.current_streak || 0} วัน
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 backdrop-blur-sm border-yellow-500/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-yellow-500 rounded-full">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-yellow-300 text-sm font-medium">ดาวที่เก็บได้</p>
                <p className="text-3xl font-bold text-white">
                  {streak?.total_stars_earned || 0} ดาว
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No missions prompt */}
        {todayMissions.length === 0 && !isGenerating && !isViewingPast && (
          <Card className="bg-slate-800/90 backdrop-blur-sm border-yellow-500/50 mb-8">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white mb-3">
                ยังไม่มีภารกิจวันนี้
              </h3>
              <p className="text-slate-300 mb-6">
                ให้ AI สร้างภารกิจเหมาะสมให้คุณ 3 รายการเลยไหม?
              </p>
              <Button
                onClick={handleGenerateMission}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                AI สร้าง 3 ภารกิจให้ฉัน
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mission Selection Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              เลือกภารกิจที่คุณต้องการทำวันนี้
            </h2>
            <p className="text-slate-300 mb-2">
              AI เลือกภารกิจที่เหมาะสมให้คุณ เลือกอันที่ชอบได้เลย!
            </p>
            {/* Mission Counter */}
            {!isViewingPast && (
              <div className="mt-2">
                <span className={cn(
                  "text-lg font-semibold px-4 py-1.5 rounded-full",
                  todayMissions.length >= 10 ? "bg-red-500/20 text-red-400" :
                  todayMissions.length >= 8 ? "bg-orange-500/20 text-orange-400" :
                  "bg-slate-700 text-slate-300"
                )}>
                  ภารกิจวันนี้: {todayMissions.length}/10
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todayMissions.map((mission) => (
              <Card
                key={mission.id}
                className={cn(
                  "transition-all duration-300 border-2 relative overflow-hidden",
                  isViewingPast 
                    ? "bg-slate-800 border-slate-600 cursor-default"
                    : "cursor-pointer hover:scale-105",
                  !isViewingPast && selectedMission?.id === mission.id
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 border-yellow-400 shadow-2xl shadow-blue-500/50 ring-4 ring-yellow-400/30"
                    : !isViewingPast && isMissionCompleted(mission)
                    ? "bg-slate-800 border-green-500"
                    : !isViewingPast
                    ? "bg-slate-800/90 border-slate-700 hover:bg-slate-800"
                    : ""
                )}
                onClick={() => {
                  if (!isViewingPast && (!isMissionCompleted(mission) || mission.can_retry)) {
                    setSelectedMission(mission);
                  }
                }}
              >
                {/* Selected overlay for better contrast */}
                {selectedMission?.id === mission.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-purple-500/40 pointer-events-none" />
                )}
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn(
                      getDifficultyColor(mission.difficulty),
                      "text-white font-semibold shadow-lg"
                    )}>
                      {getDifficultyLabel(mission.difficulty)}
                    </Badge>
                    {isMissionCompleted(mission) && (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    )}
                    {selectedMission?.id === mission.id && (
                      <Badge className="bg-yellow-400 text-slate-900 font-bold animate-pulse">
                        ✓ เลือกแล้ว
                      </Badge>
                    )}
                    {mission.mission_option && !selectedMission && (
                      <Badge variant="outline" className="text-slate-200 border-slate-500 bg-slate-900/50">
                        ตัวเลือกที่ {mission.mission_option}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className={cn(
                    "text-xl font-bold",
                    selectedMission?.id === mission.id ? "text-white drop-shadow-lg" : "text-white"
                  )}>
                    {mission.skill_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-2">
                    <div className={cn(
                      "flex items-center gap-2 font-medium",
                      selectedMission?.id === mission.id ? "text-white" : "text-slate-200"
                    )}>
                      <Target className="w-5 h-5" />
                      <span className="font-semibold">{mission.total_questions} ข้อ</span>
                    </div>
                    {mission.ai_reasoning && (
                      <p className={cn(
                        "text-sm mt-3 p-3 rounded-lg font-medium border",
                        selectedMission?.id === mission.id
                          ? "bg-slate-900/90 text-white border-slate-600 shadow-lg"
                          : "bg-slate-900/80 text-slate-100 border-slate-700"
                      )}>
                        💡 {mission.ai_reasoning}
                      </p>
                    )}

                    {/* Show status: not started or completed */}
                    {!isMissionCompleted(mission) && (
                      <div className="mt-3 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-300 font-medium">ยังไม่ได้เริ่มทำ</span>
                        </div>
                      </div>
                    )}

                    {isMissionCompleted(mission) && (
                      <div className="mt-3 p-3 bg-green-900/30 border-2 border-green-500 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          <span className="text-green-300 font-bold text-base">✅ ทำสำเร็จแล้ว!</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: mission.stars_earned || 0 }).map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          ))}
                          {mission.stars_earned === 0 && (
                            <span className="text-orange-300 font-semibold text-sm">❌ ยังไม่ผ่าน</span>
                          )}
                        </div>
                        <p className="text-white font-medium text-base">
                          คะแนน: {mission.correct_answers}/{mission.total_questions} ข้อ
                          ({Math.round((mission.correct_answers! / mission.total_questions) * 100)}%)
                        </p>
                        {mission.can_retry && (
                          <button
                            className="mt-3 w-full px-4 py-2 text-sm font-semibold bg-slate-800 text-yellow-300 border border-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMission(mission);
                            }}
                          >
                            🔄 ทำใหม่
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons - Different for View Mode vs Today Mode */}
          <div className="flex flex-col items-center gap-3">
            {!isViewingPast ? (
              <>
                {/* Today Mode: Show start and regenerate buttons */}
                <Button
                  onClick={() => handleStartMission(selectedMission)}
                  disabled={!selectedMission}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-12 disabled:opacity-50"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {selectedMission?.status === 'completed' ? 'ทำภารกิจอีกครั้ง' : 'เริ่มภารกิจที่เลือก'}
                </Button>

                {/* Add Single Mission Button with Quota Display */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleAddSingleMission}
                    disabled={isGenerating || todayMissions.length >= 10}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-white font-semibold border-slate-400 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-all duration-300",
                      isGenerating && "animate-pulse scale-105 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="animate-pulse">กำลังเพิ่มภารกิจ...</span>
                      </>
                    ) : todayMissions.length >= 10 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        ครบ 10 ภารกิจแล้ว
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        ➕ เพิ่มภารกิจใหม่
                      </>
                    )}
                  </Button>
                  
                  {/* Mission Quota Badge */}
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-base font-bold px-3 py-1.5 transition-all duration-300",
                      todayMissions.length >= 10 
                        ? "bg-red-500/20 text-red-300 border-red-400 animate-pulse" 
                        : todayMissions.length >= 7
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-400"
                        : "bg-green-500/20 text-green-300 border-green-400"
                    )}
                  >
                    {todayMissions.length}/10
                  </Badge>
                </div>
              </>
            ) : (
              <>
                {/* View Mode: Show navigation buttons */}
                <Button
                  size="lg"
                  onClick={() => navigate('/today-mission')}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-12 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  ไปยังภารกิจวันนี้
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/training-calendar')}
                  className="text-white font-semibold border-slate-400 bg-slate-800 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับสู่ปฏิทิน
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayFocusMode;