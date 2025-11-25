import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrainingCalendar, DailyMission } from '@/hooks/useTrainingCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, Target, Clock, Zap, Trophy, Star, Flame, Sparkles, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

const TodayFocusMode = () => {
  const { t } = useTranslation('trainingCalendar');
  const navigate = useNavigate();
  const { missions, streak, isLoading, userId, startMission, generateTodayMission } = useTrainingCalendar();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMission, setSelectedMission] = useState<DailyMission | null>(null);

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
    setIsGenerating(true);
    try {
      await generateTodayMission();
      toast.success('สร้างภารกิจวันนี้สำเร็จ!');
    } catch (error: any) {
      if (error.message.includes('429')) {
        toast.error('กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
      } else if (error.message.includes('402')) {
        toast.error('คุณใช้ AI quota หมดแล้ว กรุณารอจนถึงเดือนหน้า');
      } else {
        toast.error('ไม่สามารถสร้างภารกิจได้: ' + error.message);
      }
    } finally {
      setIsGenerating(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">กำลังโหลด...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 flex flex-col">
        <Button
          variant="ghost"
          onClick={() => navigate('/training-calendar')}
          className="self-start text-white hover:bg-white/10 mb-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          กลับสู่หน้าปฏิทินของฉัน
        </Button>

        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-2xl w-full bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-500/30 p-6 rounded-full">
                  <PartyPopper className="w-16 h-16" />
                </div>
              </div>
              <CardTitle className="text-4xl mb-2">🎉 วันหยุดพักผ่อน!</CardTitle>
              <p className="text-xl text-white/80">ผ่อนคลายและเตรียมพร้อมสำหรับสัปดาห์หน้า</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg mb-4">
                  วันนี้ไม่มีภารกิจบังคับ แต่คุณสามารถฝึกเพิ่มเติมได้ตามใจชอบ!
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate('/training-calendar')}
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                ดูปฏิทินการฝึก
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No mission exists yet
  if (todayMissions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 flex flex-col">
        <Button
          variant="ghost"
          onClick={() => navigate('/training-calendar')}
          className="self-start text-white hover:bg-white/10 mb-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          กลับสู่หน้าปฏิทินของฉัน
        </Button>

        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-2xl w-full bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-500/30 p-6 rounded-full">
                  <Brain className="w-16 h-16" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">ยังไม่มีภารกิจวันนี้</CardTitle>
              <p className="text-white/80">กด "สร้างภารกิจ" เพื่อให้ AI สร้าง 3 ภารกิจให้คุณเลือก</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                size="lg"
                onClick={handleGenerateMission}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl py-8"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    AI กำลังสร้างภารกิจ...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-6 w-6" />
                    สร้างภารกิจวันนี้
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/training-calendar')}
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                ดูปฏิทินการฝึก
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mission exists - check if any completed
  const completedMissions = todayMissions.filter(m => m.status === 'completed');
  const pendingMissions = todayMissions.filter(m => m.status === 'pending');
  const allCompleted = completedMissions.length === todayMissions.length;

  // Show completed view
  if (allCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 flex flex-col">
        <Button
          variant="ghost"
          onClick={() => navigate('/training-calendar')}
          className="self-start text-white hover:bg-white/10 mb-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          กลับสู่หน้าปฏิทินของฉัน
        </Button>

        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-4xl w-full bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-green-500/30 p-6 rounded-full">
                    <Trophy className="w-16 h-16 text-green-300" />
                  </div>
                </div>
                <CardTitle className="text-4xl text-white">
                  🎉 เยี่ยมมาก! คุณทำภารกิจวันนี้สำเร็จแล้ว
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {completedMissions.map((mission) => (
                <Card key={mission.id} className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex justify-center gap-2 mb-4">
                      {Array.from({ length: mission.stars_earned || 0 }).map((_, i) => (
                        <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-4">
                      {mission.skill_name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <p className="text-white/70 text-sm">คะแนน</p>
                        <p className="text-white text-lg font-bold">
                          {mission.correct_answers}/{mission.total_questions}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <p className="text-white/70 text-sm">เวลาที่ใช้</p>
                        <p className="text-white text-lg font-bold">
                          {mission.time_spent ? Math.round(mission.time_spent / 60) : 0} นาที
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="text-center space-y-4">
                <p className="text-white text-xl">
                  ทำครบทุกภารกิจแล้ว! 🌟 พรุ่งนี้กลับมาฝึกต่อนะ
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/training-calendar')}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    ดูปฏิทิน
                  </Button>
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    ดูความก้าวหน้า
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show mission selection view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/training-calendar')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          กลับสู่หน้าปฏิทินของฉัน
        </Button>

        {/* Streak indicator */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-white font-bold">{streak?.current_streak || 0} วัน</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-bold">{streak?.total_stars_earned || 0} ดาว</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-6xl w-full bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-purple-500/30 p-6 rounded-full animate-pulse">
                  <Target className="w-16 h-16 text-purple-300" />
                </div>
              </div>
              <CardTitle className="text-5xl text-white">
                🎯 ภารกิจวันนี้
              </CardTitle>
              <p className="text-xl text-white/80">
                {new Date().toLocaleDateString('th-TH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              {(todayMissions[0] as any).daily_message && (
                <p className="text-yellow-200 text-lg font-medium">
                  {(todayMissions[0] as any).daily_message}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Completed missions summary */}
            {completedMissions.length > 0 && (
              <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/30">
                <p className="text-white text-center">
                  ✅ ทำเสร็จแล้ว {completedMissions.length}/{todayMissions.length} ภารกิจ
                </p>
              </div>
            )}

            {/* Mission selection */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4 text-center">
                เลือกภารกิจที่อยากทำ:
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {todayMissions.map((mission, index) => {
                  const isCompleted = mission.status === 'completed';
                  const isSelected = selectedMission?.id === mission.id;
                  
                  return (
                    <Card
                      key={mission.id}
                      onClick={() => !isCompleted && setSelectedMission(mission)}
                      className={`transition-all duration-300 ${
                        isCompleted
                          ? 'opacity-60 cursor-not-allowed bg-green-500/20'
                          : 'cursor-pointer hover:scale-105'
                      } ${
                        isSelected && !isCompleted
                          ? 'ring-4 ring-green-400 bg-green-500/30 shadow-xl shadow-green-500/50'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <CardContent className="p-6 text-center space-y-3">
                        <Badge className="mb-2 bg-purple-500">
                          ภารกิจ {index + 1} {isCompleted && '✓'}
                        </Badge>
                        <h3 className="text-xl font-bold text-white">
                          {mission.skill_name}
                        </h3>
                        <Badge className={getDifficultyColor(mission.difficulty)}>
                          {getDifficultyLabel(mission.difficulty)}
                        </Badge>
                        <p className="text-sm text-white/70 flex items-center justify-center gap-2">
                          <Target className="h-4 w-4" />
                          {mission.total_questions} ข้อ
                        </p>
                        {mission.ai_reasoning && (
                          <p className="text-xs text-white/60 italic mt-2 line-clamp-3">
                            {mission.ai_reasoning}
                          </p>
                        )}
                        {isCompleted && mission.stars_earned && (
                          <div className="flex justify-center gap-1 mt-2">
                            {Array.from({ length: mission.stars_earned }).map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            {pendingMissions.length > 0 && (
              <Button
                onClick={() => handleStartMission(selectedMission)}
                disabled={!selectedMission}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-2xl py-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trophy className="mr-3 h-8 w-8" />
                {selectedMission ? 'เริ่มทำภารกิจที่เลือก!' : 'เลือกภารกิจก่อนนะ'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodayFocusMode;