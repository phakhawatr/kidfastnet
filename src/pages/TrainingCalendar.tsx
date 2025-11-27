import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTrainingCalendar } from '@/hooks/useTrainingCalendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Calendar, Trophy, Star, Flame, TrendingUp, Target } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, isAfter, getDay } from 'date-fns';
import { th } from 'date-fns/locale';

const TrainingCalendar = () => {
  const { t } = useTranslation('trainingCalendar');
  const navigate = useNavigate();
  const { missions, streak, isLoading, userId } = useTrainingCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get week view for mobile (current week)
  const today = new Date();
  const weekDays = isMobile ? daysInMonth.filter(day => {
    const diff = Math.abs(day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3;
  }).slice(0, 7) : daysInMonth;

  const getMissionForDay = (day: Date) => {
    return missions.find(m => isSameDay(new Date(m.mission_date), day));
  };

  const getDayStatus = (day: Date) => {
    const mission = getMissionForDay(day);
    const dayOfWeek = getDay(day);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isWeekend) return 'rest';
    if (isToday(day)) return 'today';
    if (isAfter(day, today)) return 'future';
    if (!mission) return 'skipped';
    
    if (mission.status === 'completed') {
      if (mission.stars_earned === 3) return 'perfect';
      if (mission.stars_earned === 2) return 'good';
      if (mission.stars_earned === 1) return 'pass';
    }
    if (mission.status === 'catchup') return 'catchup';
    if (mission.status === 'skipped') return 'skipped';
    
    return 'pending';
  };

  const getDayStyles = (status: string) => {
    const baseStyles = 'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative';
    
    // Add cursor-pointer for clickable days
    const isClickable = ['today', 'perfect', 'good', 'pass', 'skipped', 'catchup', 'pending'].includes(status);
    const clickableStyles = isClickable ? 'cursor-pointer' : 'cursor-default';
    
    switch (status) {
      case 'perfect':
        return `${baseStyles} ${clickableStyles} bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-105`;
      case 'good':
        return `${baseStyles} ${clickableStyles} bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md shadow-green-400/20 hover:shadow-lg hover:scale-105`;
      case 'pass':
        return `${baseStyles} ${clickableStyles} bg-gradient-to-br from-green-300 to-emerald-400 text-white shadow-sm shadow-green-300/20 hover:shadow-md hover:scale-105`;
      case 'skipped':
        return `${baseStyles} ${clickableStyles} bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-md shadow-red-400/30 hover:shadow-lg hover:scale-105`;
      case 'today':
        return `${baseStyles} ${clickableStyles} bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 text-white shadow-xl shadow-orange-400/50 hover:shadow-2xl hover:scale-110 animate-pulse`;
      case 'rest':
        return `${baseStyles} ${clickableStyles} bg-gradient-to-br from-blue-100 to-sky-200 text-blue-700 border-2 border-blue-300`;
      case 'catchup':
        return `${baseStyles} ${clickableStyles} bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md shadow-yellow-400/30 hover:shadow-lg hover:scale-105`;
      case 'pending':
        return `${baseStyles} ${clickableStyles} bg-slate-600 text-white border border-slate-500 hover:shadow-md hover:scale-105`;
      case 'future':
        return `${baseStyles} ${clickableStyles} bg-gradient-to-br from-slate-700 to-slate-800 text-slate-500 border border-slate-600`;
      default:
        return `${baseStyles} ${clickableStyles} bg-slate-600 text-white border border-slate-500`;
    }
  };

  const renderDayIcon = (status: string, mission: any) => {
    switch (status) {
      case 'perfect':
        return <div className="flex gap-0.5 text-yellow-200"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>;
      case 'good':
        return <div className="flex gap-0.5 text-yellow-200"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>;
      case 'pass':
        return <div className="flex gap-0.5 text-yellow-200"><Star className="w-3 h-3 fill-current" /></div>;
      case 'skipped':
        return <span className="text-xs font-medium">ทำย้อนหลัง</span>;
      case 'today':
        return <span className="text-xl animate-bounce">🌟</span>;
      case 'rest':
        return <span className="text-2xl">⛱️</span>;
      case 'catchup':
        return <div className="flex gap-0.5 text-amber-200"><Star className="w-3 h-3 fill-current" /></div>;
      case 'future':
        return <Lock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleDayClick = (day: Date, status: string) => {
    const mission = getMissionForDay(day);
    const dateStr = format(day, 'yyyy-MM-dd'); // "2025-11-25"
    
    if (status === 'today') {
      // Today → go to today's mission page
      navigate('/today-mission');
    } else if (status === 'skipped' && mission) {
      // Skipped day with mission → view history
      navigate(`/today-mission?date=${dateStr}`);
    } else if (mission && (status === 'perfect' || status === 'good' || status === 'pass' || status === 'catchup')) {
      // Completed mission → view history
      navigate(`/today-mission?date=${dateStr}`);
    } else if (status === 'pending' && mission) {
      // Pending mission → view history
      navigate(`/today-mission?date=${dateStr}`);
    }
    // Future and Rest → do nothing
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Calculate progress
  const workDays = daysInMonth.filter(day => {
    const dayOfWeek = getDay(day);
    return dayOfWeek !== 0 && dayOfWeek !== 6 && !isAfter(day, new Date());
  }).length;

  const completedMissions = missions.filter(m => m.status === 'completed' || m.status === 'catchup').length;
  const progressPercentage = workDays > 0 ? (completedMissions / workDays) * 100 : 0;

  const totalStarsThisMonth = missions.reduce((sum, m) => sum + (m.stars_earned || 0), 0);

  if (!userId && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md bg-slate-800/90 border-slate-700">
          <h2 className="text-2xl font-bold mb-4 text-white">{t('loginRequired')}</h2>
          <p className="text-slate-300 mb-6">{t('loginMessage')}</p>
          <Button onClick={() => navigate('/login')} size="lg" className="w-full">
            {t('goToLogin')}
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-300">กำลังโหลดปฏิทิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Link to="/profile">
            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => navigate('/weekly-progress')}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              รายงานสัปดาห์
            </Button>
            <Button
              onClick={() => navigate('/skill-progress')}
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              <Target className="w-4 h-4 mr-2" />
              ความคืบหน้าทักษะ
            </Button>
            <Button
              onClick={() => navigate('/mission-history')}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              ประวัติภารกิจ
            </Button>
            <Button
              onClick={() => navigate('/rewards-shop')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              <Trophy className="w-4 h-4 mr-2" />
              ร้านรางวัล
            </Button>
            <Button
              onClick={() => navigate('/today-mission')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              <Calendar className="w-4 h-4 mr-2" />
              ภารกิจวันนี้
            </Button>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-800/90 backdrop-blur-sm border-2 border-slate-700 shadow-2xl">
          <div className="p-6 space-y-6">
            {/* Title & Month Navigation */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-purple-400" />
                  ปฏิทินการฝึกของฉัน
                </h1>
                <p className="text-slate-300 mt-2">ติดตามความก้าวหน้าในแต่ละวัน</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changeMonth('prev')}
                  className="hover:bg-slate-600 text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-lg font-semibold px-4 text-white">
                  {format(currentDate, 'MMMM yyyy', { locale: th })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changeMonth('next')}
                  className="hover:bg-slate-600 text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Streak */}
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg">
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-6 h-6 animate-pulse" />
                    <span className="text-sm font-medium">วันติดต่อกัน</span>
                  </div>
                  <p className="text-4xl font-bold">{streak?.current_streak || 0}</p>
                  <p className="text-xs opacity-90 mt-1">สูงสุด: {streak?.longest_streak || 0} วัน</p>
                </div>
              </Card>

              {/* Stars */}
              <Card className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white border-0 shadow-lg">
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-6 h-6 fill-white" />
                    <span className="text-sm font-medium">ดาวสะสม</span>
                  </div>
                  <p className="text-4xl font-bold">{totalStarsThisMonth}</p>
                  <p className="text-xs opacity-90 mt-1">เดือนนี้</p>
                </div>
              </Card>

              {/* Perfect Days */}
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-6 h-6" />
                    <span className="text-sm font-medium">วันสมบูรณ์แบบ</span>
                  </div>
                  <p className="text-4xl font-bold">{streak?.perfect_days || 0}</p>
                  <p className="text-xs opacity-90 mt-1">3 ดาวเต็ม!</p>
                </div>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-white">ภารกิจเดือนนี้</span>
                <span className="text-slate-300">{completedMissions}/{workDays} วัน</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Calendar Grid */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              {/* Day Headers */}
              {!isMobile && (
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                    <div key={index} className="text-center text-sm font-semibold text-slate-300 py-2">
                      {day}
                    </div>
                  ))}
                </div>
              )}

              {/* Days Grid */}
              <div className={`grid ${isMobile ? 'grid-cols-7 gap-1' : 'grid-cols-7 gap-2'}`}>
                {/* Empty cells for alignment (desktop only) */}
                {!isMobile && Array.from({ length: getDay(monthStart) }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}

                {/* Day cells */}
                {(isMobile ? weekDays : daysInMonth).map((day, index) => {
                  const status = getDayStatus(day);
                  const mission = getMissionForDay(day);
                  const dayNum = format(day, 'd');

                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(day, status)}
                      className={getDayStyles(status)}
                    >
                      <span className={`text-sm font-bold ${isMobile ? 'text-xs' : ''}`}>
                        {dayNum}
                      </span>
                      {!isMobile && (
                        <>
                          {renderDayIcon(status, mission)}
                          {mission && (
                            <span className="text-xs opacity-90 mt-1 line-clamp-1">
                              {mission.skill_name}
                            </span>
                          )}
                        </>
                      )}
                      {isMobile && status === 'today' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
                <span>3 ดาว</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded"></div>
                <span>2 ดาว</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-300 to-emerald-400 rounded"></div>
                <span>1 ดาว</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-rose-500 rounded"></div>
                <span>ไม่ได้ทำ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-yellow-400 rounded animate-pulse"></div>
                <span>วันนี้</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-100 to-sky-200 rounded border border-blue-300"></div>
                <span>วันหยุด</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded"></div>
                <span>ย้อนหลัง</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-slate-600 to-slate-700 rounded border border-slate-500"></div>
                <span>อนาคต</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TrainingCalendar;
