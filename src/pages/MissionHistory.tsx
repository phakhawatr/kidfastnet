import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTrainingCalendar } from '@/hooks/useTrainingCalendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, Target, Star, Clock, TrendingUp, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MissionHistory = () => {
  const { userId, fetchAllMissions } = useTrainingCalendar();
  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState('all'); // week, month, all
  const [skillFilter, setSkillFilter] = useState('all');
  const [starsFilter, setStarsFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [allMissions, dateRange, skillFilter, starsFilter, statusFilter]);

  const loadData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    const missions = await fetchAllMissions(userId);
    setAllMissions(missions);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...allMissions];

    // Date range filter
    if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(m => new Date(m.mission_date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(m => new Date(m.mission_date) >= monthAgo);
    }

    // Skill filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter(m => m.skill_name === skillFilter);
    }

    // Stars filter
    if (starsFilter !== 'all') {
      filtered = filtered.filter(m => m.stars_earned === parseInt(starsFilter));
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    setFilteredMissions(filtered);
  };

  // Get unique skills for filter
  const uniqueSkills = Array.from(new Set(allMissions.map(m => m.skill_name)));

  // Calculate summary stats
  const totalMissions = filteredMissions.length;
  const avgAccuracy = filteredMissions.length > 0
    ? filteredMissions.reduce((sum, m) => sum + (m.correct_answers / m.total_questions * 100), 0) / filteredMissions.length
    : 0;
  const totalStars = filteredMissions.reduce((sum, m) => sum + (m.stars_earned || 0), 0);
  const totalTime = filteredMissions.reduce((sum, m) => sum + (m.time_spent || 0), 0);

  // Prepare chart data (last 30 missions)
  const chartData = filteredMissions
    .slice(0, 30)
    .reverse()
    .map((m, index) => ({
      index: index + 1,
      accuracy: m.total_questions > 0 ? (m.correct_answers / m.total_questions * 100) : 0,
      skill: m.skill_name,
      date: format(new Date(m.mission_date), 'dd MMM', { locale: th }),
    }));

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours} ชม. ${minutes} นาที`;
    if (minutes > 0) return `${minutes} นาที ${secs} วินาที`;
    return `${secs} วินาที`;
  };

  const renderStars = (stars: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
          />
        ))}
      </div>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'ง่าย': return 'text-green-400 bg-green-400/10';
      case 'ปานกลาง': return 'text-yellow-400 bg-yellow-400/10';
      case 'ยาก': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-300">กำลังโหลดประวัติ...</p>
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
            <Calendar className="w-8 h-8 text-purple-400" />
            ประวัติภารกิจทั้งหมด
          </h1>
          <p className="text-slate-400 mt-2">ทบทวนผลการทำภารกิจย้อนหลัง</p>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-slate-200">ตัวกรอง</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">ช่วงเวลา</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="week">สัปดาห์นี้</SelectItem>
                    <SelectItem value="month">เดือนนี้</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">ทักษะ</label>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {uniqueSkills.map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">ดาว</label>
                <Select value={starsFilter} onValueChange={setStarsFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3 ดาว)</SelectItem>
                    <SelectItem value="2">⭐⭐ (2 ดาว)</SelectItem>
                    <SelectItem value="1">⭐ (1 ดาว)</SelectItem>
                    <SelectItem value="0">ไม่มีดาว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">สถานะ</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="completed">✅ ทำสำเร็จ</SelectItem>
                    <SelectItem value="catchup">⏰ ทำย้อนหลัง</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
            <div className="p-4 text-center">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{totalMissions}</p>
              <p className="text-xs text-slate-400">ภารกิจทั้งหมด</p>
            </div>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
            <div className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{avgAccuracy.toFixed(1)}%</p>
              <p className="text-xs text-slate-400">ค่าเฉลี่ยความแม่นยำ</p>
            </div>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
            <div className="p-4 text-center">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{totalStars}</p>
              <p className="text-xs text-slate-400">ดาวรวม</p>
            </div>
          </Card>

          <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
            <div className="p-4 text-center">
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-200">{Math.floor(totalTime / 3600)}:{String(Math.floor((totalTime % 3600) / 60)).padStart(2, '0')}</p>
              <p className="text-xs text-slate-400">เวลารวม (ชม:นาที)</p>
            </div>
          </Card>
        </div>

        {/* Accuracy Chart */}
        {chartData.length > 0 && (
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-200 mb-6">กราฟความแม่นยำ (30 ภารกิจล่าสุด)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#a78bfa" 
                    strokeWidth={2} 
                    dot={{ fill: '#a78bfa', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Mission List */}
        <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-200 mb-6">รายการภารกิจ ({filteredMissions.length})</h2>
            <div className="space-y-3">
              {filteredMissions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>ไม่พบภารกิจที่ตรงกับเงื่อนไข</p>
                </div>
              ) : (
                filteredMissions.map((mission) => {
                  const accuracy = mission.total_questions > 0 
                    ? (mission.correct_answers / mission.total_questions * 100) 
                    : 0;
                  
                  return (
                    <Card key={mission.id} className="bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm text-slate-400">
                                📅 {format(new Date(mission.mission_date), 'dd MMMM yyyy', { locale: th })}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(mission.difficulty)}`}>
                                {mission.difficulty}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-200 mb-1">
                              {mission.skill_name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                              <span>✅ {mission.correct_answers}/{mission.total_questions} ข้อ ({accuracy.toFixed(1)}%)</span>
                              <span>⏱️ {formatTime(mission.time_spent || 0)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {renderStars(mission.stars_earned || 0)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MissionHistory;
