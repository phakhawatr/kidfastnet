import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrainingCalendar, DailyMission } from '@/hooks/useTrainingCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, Brain, Target, Zap, Trophy, Star, Flame, Sparkles, 
  PartyPopper, CheckCircle2, Calendar, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

const TodayFocusMode = () => {
  const { t } = useTranslation('trainingCalendar');
  const navigate = useNavigate();
  const { 
    missions, 
    streak, 
    isLoading, 
    isGenerating,
    userId, 
    startMission, 
    generateTodayMission,
    regenerateMissions 
  } = useTrainingCalendar();
  const [selectedMission, setSelectedMission] = useState<DailyMission | null>(null);
  const hasAttemptedGeneration = useRef(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all missions for today (now we have 3 options)
  const todayMissions = missions.filter(m => {
    const missionDate = new Date(m.mission_date);
    missionDate.setHours(0, 0, 0, 0);
    return missionDate.getTime() === today.getTime();
  }).sort((a, b) => ((a as any).mission_option || 1) - ((b as any).mission_option || 1));

  const dayOfWeek = today.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  useEffect(() => {
    if (!userId && !isLoading) {
      toast.error(t('loginRequired'));
      navigate('/login');
    }
  }, [userId, isLoading, navigate, t]);

  // Auto-generate missions if not enough (less than 3) or none - only once per mount
  useEffect(() => {
    const autoGenerateMissions = async () => {
      // Prevent infinite loops - only attempt once
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
  }, [userId, isLoading, isGenerating, todayMissions.length, isWeekend]);

  const getSkillRoute = (skillName: string): string => {
    // Expanded skill routes mapping with variants
    const skillRoutes: Record<string, string> = {
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
          <p className="text-white text-lg">
            {isGenerating ? 'AI กำลังสร้างภารกิจให้คุณ...' : 'กำลังโหลด...'}
          </p>
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

  // Check if all completed
  const allCompleted = todayMissions.every(m => m.status === 'completed');

  // Show completed view
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
            <Calendar className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">
              Today Focus Mode
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            {new Date().toLocaleDateString('th-TH', { 
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

        {/* Mission Selection Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              เลือกภารกิจที่คุณต้องการทำวันนี้
            </h2>
            <p className="text-slate-300">
              AI เลือกภารกิจที่เหมาะสมให้คุณ 3 รายการ เลือกอันที่ชอบได้เลย!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todayMissions.map((mission) => (
              <Card
                key={mission.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105",
                  selectedMission?.id === mission.id
                    ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-blue-500 shadow-lg shadow-blue-500/50"
                    : mission.status === 'completed'
                    ? "bg-green-500/20 border-green-500/30"
                    : "bg-slate-800/90 border-slate-700 hover:bg-slate-800",
                  mission.status === 'completed' && "opacity-75"
                )}
                onClick={() => mission.status !== 'completed' && setSelectedMission(mission)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {getDifficultyLabel(mission.difficulty)}
                    </Badge>
                    {mission.status === 'completed' && (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                    {mission.mission_option && (
                      <Badge variant="outline" className="text-white border-white/30">
                        ตัวเลือกที่ {mission.mission_option}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-lg">
                    {mission.skill_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>{mission.total_questions} ข้อ</span>
                    </div>
                    {mission.ai_reasoning && (
                      <p className="text-sm mt-3 p-3 bg-slate-900 rounded-lg text-slate-200 font-medium">
                        💡 {mission.ai_reasoning}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Start Button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={() => handleStartMission(selectedMission)}
              disabled={!selectedMission || selectedMission?.status === 'completed'}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-12 disabled:opacity-50"
            >
              <Zap className="w-5 h-5 mr-2" />
              เริ่มภารกิจที่เลือก
            </Button>

            {/* Regenerate Button */}
            <Button
              onClick={handleRegenerateMissions}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="text-white font-semibold border-slate-400 bg-slate-800 hover:bg-slate-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้างภารกิจใหม่...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  สร้างภารกิจใหม่
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayFocusMode;