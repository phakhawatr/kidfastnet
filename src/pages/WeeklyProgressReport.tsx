import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTrainingCalendar } from '@/hooks/useTrainingCalendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Flame, Star, Trophy, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WeeklyProgressReport = () => {
  const { userId, streak, fetchAllMissions, getSkillStats, getWeeklyTrends } = useTrainingCalendar();
  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [skillStats, setSkillStats] = useState<any[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    const missions = await fetchAllMissions(userId);
    setAllMissions(missions);
    setSkillStats(getSkillStats(missions).slice(0, 10)); // Top 10 skills
    setWeeklyTrends(getWeeklyTrends(missions));
    setIsLoading(false);
  };

  // Calculate this week vs last week
  const thisWeekMissions = allMissions.filter(m => {
    const missionDate = new Date(m.mission_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return missionDate >= weekAgo && (m.status === 'completed' || m.status === 'catchup');
  });

  const lastWeekMissions = allMissions.filter(m => {
    const missionDate = new Date(m.mission_date);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return missionDate >= twoWeeksAgo && missionDate < weekAgo && (m.status === 'completed' || m.status === 'catchup');
  });

  const thisWeekAvgAccuracy = thisWeekMissions.length > 0
    ? thisWeekMissions.reduce((sum, m) => sum + (m.correct_answers / m.total_questions * 100), 0) / thisWeekMissions.length
    : 0;

  const lastWeekAvgAccuracy = lastWeekMissions.length > 0
    ? lastWeekMissions.reduce((sum, m) => sum + (m.correct_answers / m.total_questions * 100), 0) / lastWeekMissions.length
    : 0;

  const missionsChange = thisWeekMissions.length - lastWeekMissions.length;
  const accuracyChange = thisWeekAvgAccuracy - lastWeekAvgAccuracy;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-300">กำลังโหลดรายงาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/training-calendar">
            <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            รายงานความก้าวหน้าประจำสัปดาห์
          </h1>
          <p className="text-slate-400 mt-2">วิเคราะห์ผลการเรียนรู้และพัฒนาการของคุณ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
                <span className="text-sm font-medium text-slate-300">Streak ปัจจุบัน</span>
              </div>
              <p className="text-4xl font-bold text-orange-400">{streak?.current_streak || 0}</p>
              <p className="text-xs text-slate-400 mt-1">สูงสุด: {streak?.longest_streak || 0} วัน</p>
            </div>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-slate-300">ดาวรวม</span>
              </div>
              <p className="text-4xl font-bold text-yellow-400">{streak?.total_stars_earned || 0}</p>
              <p className="text-xs text-slate-400 mt-1">สะสมทั้งหมด</p>
            </div>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="w-6 h-6 text-blue-400" />
                <span className="text-sm font-medium text-slate-300">ภารกิจรวม</span>
              </div>
              <p className="text-4xl font-bold text-blue-400">{streak?.total_missions_completed || 0}</p>
              <p className="text-xs text-slate-400 mt-1">ทำสำเร็จแล้ว</p>
            </div>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="w-6 h-6 text-green-400" />
                <span className="text-sm font-medium text-slate-300">วันสมบูรณ์</span>
              </div>
              <p className="text-4xl font-bold text-green-400">{streak?.perfect_days || 0}</p>
              <p className="text-xs text-slate-400 mt-1">3 ดาวเต็ม!</p>
            </div>
          </Card>
        </div>

        {/* Weekly Summary */}
        <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              สรุปสัปดาห์นี้ เทียบกับสัปดาห์ก่อน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">จำนวนภารกิจที่ทำ</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-200">{thisWeekMissions.length}</span>
                    {missionsChange !== 0 && (
                      <span className={`text-sm font-medium ${missionsChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {missionsChange > 0 ? '↑' : '↓'} {Math.abs(missionsChange)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500">สัปดาห์ก่อน: {lastWeekMissions.length} ภารกิจ</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">ค่าเฉลี่ยความแม่นยำ</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-200">{thisWeekAvgAccuracy.toFixed(1)}%</span>
                    {accuracyChange !== 0 && (
                      <span className={`text-sm font-medium ${accuracyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {accuracyChange > 0 ? '↑' : '↓'} {Math.abs(accuracyChange).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500">สัปดาห์ก่อน: {lastWeekAvgAccuracy.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Most Practiced Skills */}
        <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-200 mb-6">ทักษะที่ฝึกบ่อยที่สุด (Top 10)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={skillStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="skill" 
                  stroke="#94a3b8" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Bar dataKey="count" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Improvement Trends */}
        <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-200 mb-6">แนวโน้มพัฒนาการ (8 สัปดาห์)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgAccuracy" 
                  stroke="#f472b6" 
                  strokeWidth={3} 
                  dot={{ fill: '#f472b6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyProgressReport;
