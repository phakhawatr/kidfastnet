import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTrainingCalendar } from '@/hooks/useTrainingCalendar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';

const SKILL_COLORS = [
  '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#ef4444', '#14b8a6', '#f97316', '#6366f1', '#a855f7',
  '#06b6d4', '#84cc16', '#eab308', '#22c55e', '#0ea5e9'
];

interface WeeklySkillData {
  week: string;
  weekStart: Date;
  weekEnd: Date;
  [skillName: string]: number | string | Date;
}

const SkillProgressTracking = () => {
  const { userId, fetchAllMissions } = useTrainingCalendar();
  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [weekRange, setWeekRange] = useState(8); // Last 8 weeks

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    const missions = await fetchAllMissions(userId);
    // Filter only completed missions
    const completedMissions = missions.filter(m => m.completed_at !== null);
    setAllMissions(completedMissions);
    
    // Auto-select top 5 most practiced skills
    const skillCounts: Record<string, number> = {};
    completedMissions.forEach(m => {
      skillCounts[m.skill_name] = (skillCounts[m.skill_name] || 0) + 1;
    });
    
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);
    
    setSelectedSkills(topSkills);
    setIsLoading(false);
  };

  // Get unique skills
  const allSkills = Array.from(new Set(allMissions.map(m => m.skill_name))).sort();

  // Calculate weekly data for each skill
  const getWeeklyData = (): WeeklySkillData[] => {
    const now = new Date();
    const weeks: WeeklySkillData[] = [];

    for (let i = weekRange - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { locale: th });
      const weekEnd = endOfWeek(subWeeks(now, i), { locale: th });
      
      const weekData: WeeklySkillData = {
        week: `${format(weekStart, 'dd/MM', { locale: th })}`,
        weekStart,
        weekEnd,
      };

      // Calculate average accuracy for each selected skill in this week
      selectedSkills.forEach(skill => {
        const skillMissions = allMissions.filter(m => 
          m.skill_name === skill &&
          isWithinInterval(new Date(m.mission_date), { start: weekStart, end: weekEnd })
        );

        if (skillMissions.length > 0) {
          const avgAccuracy = skillMissions.reduce((sum, m) => {
            const accuracy = (m.correct_answers / m.total_questions) * 100;
            return sum + accuracy;
          }, 0) / skillMissions.length;
          
          weekData[skill] = Math.round(avgAccuracy * 10) / 10; // Round to 1 decimal
        } else {
          weekData[skill] = null as any;
        }
      });

      weeks.push(weekData);
    }

    return weeks;
  };

  const weeklyData = getWeeklyData();

  // Calculate skill statistics
  const getSkillStats = () => {
    return selectedSkills.map((skill, index) => {
      const skillMissions = allMissions.filter(m => m.skill_name === skill);
      
      if (skillMissions.length === 0) return null;

      const avgAccuracy = skillMissions.reduce((sum, m) => {
        const accuracy = (m.correct_answers / m.total_questions) * 100;
        return sum + accuracy;
      }, 0) / skillMissions.length;

      const avgStars = skillMissions.reduce((sum, m) => sum + (m.stars_earned || 0), 0) / skillMissions.length;
      
      // Calculate trend (last 4 weeks vs previous 4 weeks)
      const now = new Date();
      const last4WeeksStart = startOfWeek(subWeeks(now, 3), { locale: th });
      const prev4WeeksStart = startOfWeek(subWeeks(now, 7), { locale: th });
      const prev4WeeksEnd = endOfWeek(subWeeks(now, 4), { locale: th });

      const recentMissions = skillMissions.filter(m => 
        new Date(m.mission_date) >= last4WeeksStart
      );
      const prevMissions = skillMissions.filter(m => 
        isWithinInterval(new Date(m.mission_date), { start: prev4WeeksStart, end: prev4WeeksEnd })
      );

      const recentAvg = recentMissions.length > 0 
        ? recentMissions.reduce((sum, m) => sum + (m.correct_answers / m.total_questions) * 100, 0) / recentMissions.length 
        : 0;
      const prevAvg = prevMissions.length > 0 
        ? prevMissions.reduce((sum, m) => sum + (m.correct_answers / m.total_questions) * 100, 0) / prevMissions.length 
        : 0;

      const trend = recentAvg - prevAvg;

      return {
        skill,
        color: SKILL_COLORS[index % SKILL_COLORS.length],
        totalMissions: skillMissions.length,
        avgAccuracy: Math.round(avgAccuracy * 10) / 10,
        avgStars: Math.round(avgStars * 10) / 10,
        trend: Math.round(trend * 10) / 10,
      };
    }).filter(Boolean);
  };

  const skillStats = getSkillStats();

  // Calculate missions count per skill for bar chart
  const getMissionsCountData = () => {
    return selectedSkills.map((skill, index) => {
      const skillMissions = allMissions.filter(m => m.skill_name === skill);
      return {
        skill: skill.length > 15 ? skill.substring(0, 15) + '...' : skill,
        fullSkill: skill,
        count: skillMissions.length,
        color: SKILL_COLORS[allSkills.indexOf(skill) % SKILL_COLORS.length]
      };
    }).sort((a, b) => b.count - a.count);
  };

  const missionsCountData = getMissionsCountData();

  // Calculate week-over-week improvement
  const getWeekComparison = () => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { locale: th });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { locale: th });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { locale: th });

    return selectedSkills.map((skill, index) => {
      const thisWeekMissions = allMissions.filter(m => 
        m.skill_name === skill &&
        new Date(m.mission_date) >= thisWeekStart
      );
      const lastWeekMissions = allMissions.filter(m => 
        m.skill_name === skill &&
        isWithinInterval(new Date(m.mission_date), { start: lastWeekStart, end: lastWeekEnd })
      );

      const thisWeekAvg = thisWeekMissions.length > 0
        ? thisWeekMissions.reduce((sum, m) => sum + (m.correct_answers / m.total_questions) * 100, 0) / thisWeekMissions.length
        : 0;
      const lastWeekAvg = lastWeekMissions.length > 0
        ? lastWeekMissions.reduce((sum, m) => sum + (m.correct_answers / m.total_questions) * 100, 0) / lastWeekMissions.length
        : 0;

      const improvement = thisWeekAvg - lastWeekAvg;
      const improvementPercent = lastWeekAvg > 0 ? (improvement / lastWeekAvg) * 100 : 0;

      return {
        skill,
        color: SKILL_COLORS[allSkills.indexOf(skill) % SKILL_COLORS.length],
        thisWeekAvg: Math.round(thisWeekAvg * 10) / 10,
        lastWeekAvg: Math.round(lastWeekAvg * 10) / 10,
        improvement: Math.round(improvement * 10) / 10,
        improvementPercent: Math.round(improvementPercent * 10) / 10,
        thisWeekCount: thisWeekMissions.length,
        lastWeekCount: lastWeekMissions.length,
      };
    }).filter(s => s.thisWeekCount > 0 || s.lastWeekCount > 0)
      .sort((a, b) => b.improvement - a.improvement);
  };

  const weekComparison = getWeekComparison();

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-300">กำลังโหลดข้อมูล...</p>
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
            <TrendingUp className="w-8 h-8 text-purple-400" />
            ความคืบหน้าทักษะรายสัปดาห์
          </h1>
          <p className="text-slate-400 mt-2">ติดตามพัฒนาการของแต่ละทักษะตามช่วงเวลา</p>
        </div>

        {/* Skill Selection */}
        <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-slate-200">เลือกทักษะที่ต้องการดู</h2>
              <Badge variant="outline" className="ml-2 text-slate-300 border-slate-600">
                {selectedSkills.length} ทักษะ
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allSkills.map((skill, index) => (
                <div
                  key={skill}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  <Checkbox
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => toggleSkill(skill)}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: SKILL_COLORS[allSkills.indexOf(skill) % SKILL_COLORS.length] }}
                  />
                  <span className="text-slate-200 text-sm flex-1">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Skill Statistics */}
        {skillStats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {skillStats.map((stat: any) => (
              <Card key={stat.skill} className="bg-slate-800/80 backdrop-blur border-slate-700">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <h3 className="text-slate-200 font-semibold text-sm flex-1">{stat.skill}</h3>
                    {stat.trend !== 0 && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          stat.trend > 0 
                            ? 'text-green-400 border-green-400/30 bg-green-400/10' 
                            : 'text-red-400 border-red-400/30 bg-red-400/10'
                        }`}
                      >
                        {stat.trend > 0 ? '↗' : '↘'} {Math.abs(stat.trend)}%
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>ภารกิจทั้งหมด:</span>
                      <span className="text-slate-200 font-semibold">{stat.totalMissions} ครั้ง</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>ความแม่นยำเฉลี่ย:</span>
                      <span className="text-slate-200 font-semibold">{stat.avgAccuracy}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>ดาวเฉลี่ย:</span>
                      <span className="text-yellow-400 font-semibold">⭐ {stat.avgStars}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Missions Count Bar Chart */}
        {missionsCountData.length > 0 && (
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl mb-8">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-slate-200">จำนวนภารกิจต่อทักษะ</h2>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={missionsCountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="skill" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'จำนวนภารกิจ', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569', 
                      borderRadius: '8px' 
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} ภารกิจ`,
                      props.payload.fullSkill
                    ]}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[8, 8, 0, 0]}
                  >
                    {missionsCountData.map((entry, index) => (
                      <Bar key={`bar-${index}`} dataKey="count" fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Week-over-Week Comparison */}
        {weekComparison.length > 0 && (
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl mb-8">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-slate-200">เปรียบเทียบทักษะระหว่างสัปดาห์</h2>
                <Badge variant="outline" className="ml-2 text-slate-300 border-slate-600">
                  สัปดาห์นี้ vs สัปดาห์ที่แล้ว
                </Badge>
              </div>
              
              <div className="space-y-4">
                {weekComparison.map((comparison, index) => (
                  <div
                    key={comparison.skill}
                    className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: comparison.color }}
                        />
                        <span className="text-slate-200 font-semibold">{comparison.skill}</span>
                        {index === 0 && comparison.improvement > 0 && (
                          <Badge className="bg-yellow-500 text-yellow-950">
                            🏆 พัฒนาเร็วที่สุด
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          comparison.improvement > 0 
                            ? 'text-green-400 border-green-400/30 bg-green-400/10' 
                            : comparison.improvement < 0
                            ? 'text-red-400 border-red-400/30 bg-red-400/10'
                            : 'text-slate-400 border-slate-600'
                        }`}
                      >
                        {comparison.improvement > 0 ? '↗' : comparison.improvement < 0 ? '↘' : '→'} 
                        {' '}{Math.abs(comparison.improvement)}%
                        {comparison.improvementPercent !== 0 && (
                          <span className="ml-1 text-xs">
                            ({comparison.improvementPercent > 0 ? '+' : ''}{comparison.improvementPercent}%)
                          </span>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="text-slate-400">สัปดาห์นี้</div>
                        <div className="text-slate-200 font-semibold">
                          {comparison.thisWeekAvg}% ({comparison.thisWeekCount} ภารกิจ)
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-400">สัปดาห์ที่แล้ว</div>
                        <div className="text-slate-200 font-semibold">
                          {comparison.lastWeekAvg}% ({comparison.lastWeekCount} ภารกิจ)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Weekly Progress Chart */}
        <Card className="bg-slate-800/80 backdrop-blur border-slate-700 shadow-xl mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-slate-200">กราฟความแม่นยำรายสัปดาห์</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={weekRange === 4 ? 'default' : 'outline'}
                  size="sm"
                  className={weekRange === 4 ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}
                  onClick={() => setWeekRange(4)}
                >
                  4 สัปดาห์
                </Button>
                <Button
                  variant={weekRange === 8 ? 'default' : 'outline'}
                  size="sm"
                  className={weekRange === 8 ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}
                  onClick={() => setWeekRange(8)}
                >
                  8 สัปดาห์
                </Button>
                <Button
                  variant={weekRange === 12 ? 'default' : 'outline'}
                  size="sm"
                  className={weekRange === 12 ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}
                  onClick={() => setWeekRange(12)}
                >
                  12 สัปดาห์
                </Button>
              </div>
            </div>

            {selectedSkills.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>กรุณาเลือกทักษะที่ต้องการดูกราฟ</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }}
                    label={{ value: 'ความแม่นยำ (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569', 
                      borderRadius: '8px' 
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: any) => [`${value}%`, '']}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  {selectedSkills.map((skill, index) => (
                    <Line
                      key={skill}
                      type="monotone"
                      dataKey={skill}
                      name={skill}
                      stroke={SKILL_COLORS[allSkills.indexOf(skill) % SKILL_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
          <div className="p-6">
            <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              คำแนะนำ
            </h3>
            <ul className="text-slate-300 text-sm space-y-2 list-disc list-inside">
              <li>กราฟแสดงค่าเฉลี่ยความแม่นยำของแต่ละทักษะในแต่ละสัปดาห์</li>
              <li>สัปดาห์ที่ไม่มีการฝึกจะไม่แสดงจุดข้อมูล</li>
              <li>ลูกศรสีเขียว (↗) หมายถึงความแม่นยำเพิ่มขึ้น, สีแดง (↘) หมายถึงลดลง</li>
              <li>เปรียบเทียบระหว่างทักษะต่างๆ เพื่อดูจุดที่ต้องพัฒนา</li>
              <li>เลือกช่วงเวลาที่ต้องการดูได้ (4, 8, หรือ 12 สัปดาห์)</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SkillProgressTracking;
