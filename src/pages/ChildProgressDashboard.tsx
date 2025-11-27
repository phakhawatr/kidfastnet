import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Award, Target, Flame, Star, Bell, BellOff } from 'lucide-react';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_stars_earned: number;
  perfect_days: number;
}

interface MissionData {
  mission_date: string;
  skill_name: string;
  status: string;
  stars_earned: number;
  correct_answers: number;
  completed_questions: number;
}

interface SkillStats {
  skill: string;
  accuracy: number;
  count: number;
}

interface NotificationPrefs {
  streak_warning: boolean;
}

const ChildProgressDashboard = () => {
  const { t } = useTranslation('childprogress');
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [recentMissions, setRecentMissions] = useState<MissionData[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [weakSkills, setWeakSkills] = useState<SkillStats[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({ streak_warning: true });
  const [lineConnected, setLineConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get user ID from localStorage
      const authState = localStorage.getItem('kidfast_auth');
      if (!authState) {
        navigate('/login');
        return;
      }
      
      const parsed = JSON.parse(authState);
      const registrationId = parsed.registrationId;
      
      if (!registrationId) {
        navigate('/login');
        return;
      }

      setUserId(registrationId);

      // Check LINE connection
      const { data: userData } = await supabase
        .from('user_registrations')
        .select('line_user_id')
        .eq('id', registrationId)
        .maybeSingle();
      
      setLineConnected(!!userData?.line_user_id);

      // Load streak data
      const { data: streak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', registrationId)
        .maybeSingle();
      
      setStreakData(streak);

      // Load recent missions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const { data: missions } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', registrationId)
        .gte('mission_date', sevenDaysAgoStr)
        .not('completed_at', 'is', null)
        .order('mission_date', { ascending: false });
      
      setRecentMissions(missions || []);

      // Process weekly data for chart
      const dailyAccuracy: { [key: string]: { total: number; correct: number } } = {};
      missions?.forEach(mission => {
        const date = mission.mission_date;
        if (!dailyAccuracy[date]) {
          dailyAccuracy[date] = { total: 0, correct: 0 };
        }
        dailyAccuracy[date].total += mission.completed_questions || 0;
        dailyAccuracy[date].correct += mission.correct_answers || 0;
      });

      const chartData = Object.entries(dailyAccuracy)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
          accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
        }))
        .reverse();
      
      setWeeklyData(chartData);

      // Calculate weak skills (accuracy < 70%)
      const skillStats: { [key: string]: { total: number; correct: number; count: number } } = {};
      missions?.forEach(mission => {
        const skill = mission.skill_name;
        if (!skillStats[skill]) {
          skillStats[skill] = { total: 0, correct: 0, count: 0 };
        }
        skillStats[skill].total += mission.completed_questions || 0;
        skillStats[skill].correct += mission.correct_answers || 0;
        skillStats[skill].count++;
      });

      const weakSkillsList = Object.entries(skillStats)
        .map(([skill, data]) => ({
          skill,
          accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
          count: data.count
        }))
        .filter(s => s.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5);
      
      setWeakSkills(weakSkillsList);

      // Load notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', registrationId)
        .maybeSingle();
      
      if (prefs) {
        setNotificationPrefs({ streak_warning: prefs.streak_warning });
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          streak_warning: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setNotificationPrefs({ streak_warning: value });
      toast.success(t('notifications.saveSuccess'));
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(t('notifications.saveError'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      completed: { label: t('status.completed'), class: 'bg-green-100 text-green-800 border-green-300' },
      pending: { label: t('status.pending'), class: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      skipped: { label: t('status.skipped'), class: 'bg-red-100 text-red-800 border-red-300' },
      catchup: { label: t('status.catchup'), class: 'bg-blue-100 text-blue-800 border-blue-300' }
    };

    const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800 border-gray-300' };

    return (
      <Badge className={`${config.class} border-2 font-semibold`}>
        {config.label}
      </Badge>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-white">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/parent')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-bold text-white">
            {t('pageTitle')}
          </h1>
        </div>

        {/* Streak Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                {t('streak.current')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {streakData?.current_streak || 0}
                <span className="text-sm text-slate-400 ml-2">{t('streak.days')}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                {t('streak.longest')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {streakData?.longest_streak || 0}
                <span className="text-sm text-slate-400 ml-2">{t('streak.days')}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                {t('streak.totalStars')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {streakData?.total_stars_earned || 0}
                <span className="text-sm text-slate-400 ml-2">{t('streak.stars')}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/90 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                {t('streak.perfectDays')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {streakData?.perfect_days || 0}
                <span className="text-sm text-slate-400 ml-2">{t('streak.days')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card className="mb-8 bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{t('weeklyProgress.title')}</CardTitle>
            <CardDescription className="text-slate-400">{t('recentMissions.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-400">
                {t('weeklyProgress.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills to Improve */}
        <Card className="mb-8 bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              {t('skillsToImprove.title')}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {t('skillsToImprove.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weakSkills.length > 0 ? (
              <div className="space-y-4">
                {weakSkills.map((skill, index) => (
                  <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{skill.skill}</span>
                      <span className="text-sm text-slate-300">
                        {t('skillsToImprove.practiced')} {skill.count} {t('skillsToImprove.times')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${skill.accuracy < 50 ? 'bg-red-500' : skill.accuracy < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${skill.accuracy}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-white min-w-[60px]">
                        {skill.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-white font-semibold text-lg">{t('skillsToImprove.noWeakSkills')}</p>
                <p className="text-slate-400 text-sm mt-2">{t('skillsToImprove.allGood')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Missions Table */}
        <Card className="mb-8 bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{t('recentMissions.title')}</CardTitle>
            <CardDescription className="text-slate-400">{t('recentMissions.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">{t('recentMissions.date')}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">{t('recentMissions.skill')}</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">{t('recentMissions.status')}</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">{t('recentMissions.stars')}</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">{t('recentMissions.accuracy')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMissions.map((mission, index) => {
                      const accuracy = mission.completed_questions > 0 
                        ? Math.round((mission.correct_answers / mission.completed_questions) * 100)
                        : 0;
                      
                      return (
                        <tr key={index} className="border-b border-slate-700/50">
                          <td className="py-3 px-4 text-sm text-slate-300">
                            {new Date(mission.mission_date).toLocaleDateString('th-TH', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="py-3 px-4 text-sm text-white">{mission.skill_name}</td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(mission.status)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {Array.from({ length: mission.stars_earned || 0 }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-semibold ${
                              accuracy >= 90 ? 'text-green-400' :
                              accuracy >= 70 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {accuracy}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                {t('recentMissions.noMissions')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              {t('notifications.title')}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {t('notifications.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lineConnected ? (
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {notificationPrefs.streak_warning ? (
                    <Bell className="w-5 h-5 text-green-400" />
                  ) : (
                    <BellOff className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="font-semibold text-white">{t('notifications.streakWarning')}</p>
                    <p className="text-sm text-slate-400">
                      {notificationPrefs.streak_warning ? t('notifications.enabled') : t('notifications.disabled')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationPrefs.streak_warning}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <BellOff className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-semibold mb-2">{t('notifications.lineNotConnected')}</p>
                <p className="text-slate-400 text-sm">{t('notifications.connectLine')}</p>
                <Button 
                  onClick={() => navigate('/profile')}
                  className="mt-4"
                  variant="outline"
                >
                  {t('notifications.connectLine')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ChildProgressDashboard;
