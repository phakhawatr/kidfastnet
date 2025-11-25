import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrainingCalendar } from '@/hooks/useTrainingCalendar';
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayMission = missions.find(m => {
    const missionDate = new Date(m.mission_date);
    missionDate.setHours(0, 0, 0, 0);
    return missionDate.getTime() === today.getTime();
  });

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
      
      // Other skills
      'เศษส่วน': '/fraction-shapes',
      'ทศนิยม': '/place-value',
      'ร้อยละ': '/percentage',
      'เงิน': '/money',
      'การวัด': '/measurement',
      'เวลา': '/time',
      'น้ำหนัก': '/weighing',
      'รูปทรง': '/shape-matching',
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

  const handleStartMission = async () => {
    if (!todayMission) return;

    try {
      await startMission(todayMission.id);
      
      const route = getSkillRoute(todayMission.skill_name);
      
      // Map difficulty to app's level
      const levelMap: Record<string, string> = {
        'easy': 'easy',
        'medium': 'medium', 
        'hard': 'hard'
      };
      const appLevel = levelMap[todayMission.difficulty] || 'easy';
      
      // Build query params
      const params = new URLSearchParams({
        level: appLevel,
        count: String(todayMission.total_questions),
        autoStart: 'true',
        missionId: todayMission.id
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
  if (isWeekend && !todayMission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 flex flex-col">
        <Button
          variant="ghost"
          onClick={() => navigate('/training-calendar')}
          className="self-start text-white hover:bg-white/10 mb-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          กลับ
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

              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  โบนัสพิเศษวันหยุด (ทำได้)
                </h3>
                <p className="text-white/80 mb-4">
                  ลองทำแบบฝึกหัดเพิ่มเติมเพื่อรับดาวโบนัส!
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate('/quiz')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-lg py-6"
                >
                  <Trophy className="mr-2 h-6 w-6" />
                  ลองทำโบนัสท้าทาย
                </Button>
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
  if (!todayMission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 flex flex-col">
        <Button
          variant="ghost"
          onClick={() => navigate('/training-calendar')}
          className="self-start text-white hover:bg-white/10 mb-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          กลับ
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
              <p className="text-white/80">กด "สร้างภารกิจ" เพื่อให้ AI สร้างภารกิจเหมาะกับคุณ</p>
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

  // Mission exists - show focus view
  const isCompleted = todayMission.status === 'completed';
  const canStart = !isCompleted;

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
          กลับ
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
        <Card className="max-w-4xl w-full bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <div className="text-center space-y-4">
              {isCompleted ? (
                <>
                  <div className="flex justify-center">
                    <div className="bg-green-500/30 p-6 rounded-full">
                      <Trophy className="w-16 h-16 text-green-300" />
                    </div>
                  </div>
                  <CardTitle className="text-4xl text-white">
                    🎉 เยี่ยมมาก! คุณทำภารกิจวันนี้สำเร็จแล้ว
                  </CardTitle>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: todayMission.stars_earned || 0 }).map((_, i) => (
                      <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
                    ))}
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mission details */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-white/60 text-sm mb-2">ทักษะ</div>
                  <div className="text-white text-2xl font-bold">{todayMission.skill_name}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-white/60 text-sm mb-2">ระดับความยาก</div>
                  <Badge className={`${getDifficultyColor(todayMission.difficulty)} text-white text-lg px-4 py-1`}>
                    {getDifficultyLabel(todayMission.difficulty)}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-white/60 text-sm mb-2">จำนวนข้อ</div>
                  <div className="text-white text-2xl font-bold">{todayMission.total_questions} ข้อ</div>
                </CardContent>
              </Card>
            </div>

            {/* AI Reasoning */}
            {todayMission.ai_reasoning && (
              <Card className="bg-gradient-to-br from-purple-600/60 to-pink-600/60 border-purple-400/40 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Brain className="w-6 h-6 text-purple-100 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-lg">
                        💡 AI แนะนำว่าทำไม
                      </h3>
                      <p className="text-white leading-relaxed text-base">
                        {todayMission.ai_reasoning}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action buttons */}
            {!isCompleted ? (
              <div className="space-y-4">
                <Button
                  size="lg"
                  onClick={handleStartMission}
                  disabled={!canStart}
                  className="w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:from-green-500 hover:via-emerald-600 hover:to-teal-600 text-white font-bold text-2xl py-8 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <Zap className="mr-3 h-8 w-8" />
                  เริ่มทำภารกิจเลย!
                </Button>

                <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>เวลาที่แนะนำ: 10-15 นาที</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6 text-center">
                  <p className="text-white text-lg mb-2">
                    คุณทำได้ {todayMission.correct_answers}/{todayMission.total_questions} ข้อ
                  </p>
                  <p className="text-white/70">
                    ใช้เวลา {Math.round((todayMission.time_spent || 0) / 60)} นาที
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => navigate('/training-calendar')}
                  className="w-full border-white/30 text-white hover:bg-white/10"
                >
                  กลับสู่ปฏิทิน
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodayFocusMode;
