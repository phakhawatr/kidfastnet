import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, School, Users, BookOpen, TrendingUp, Award, 
  Calendar, Clock, Target, BarChart3, Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolAdmin } from "@/hooks/useSchoolAdmin";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

interface ClassAnalytics {
  classId: string;
  className: string;
  grade: number;
  studentCount: number;
  averageAccuracy: number;
  totalMissionsCompleted: number;
  totalStarsEarned: number;
  averageStreak: number;
  activeStudents: number;
}

interface SkillPerformance {
  skillName: string;
  averageAccuracy: number;
  totalAttempts: number;
  studentsAttempted: number;
}

interface DailyActivity {
  date: string;
  missionsCompleted: number;
  activeStudents: number;
  averageAccuracy: number;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function SchoolAnalyticsDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  
  // Get user ID from localStorage
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const authData = localStorage.getItem('kidfast_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      setUserId(parsed.registrationId);
    }
  }, []);
  
  const { userSchools, isLoading: schoolsLoading } = useSchoolAdmin(userId);
  
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7days");
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics[]>([]);
  const [skillPerformance, setSkillPerformance] = useState<SkillPerformance[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(false);

  // School-wide stats
  const [schoolStats, setSchoolStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalMissions: 0,
    averageAccuracy: 0,
    totalStars: 0,
    activeToday: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (userSchools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(userSchools[0].id);
    }
  }, [userSchools]);

  useEffect(() => {
    if (selectedSchoolId) {
      fetchSchoolAnalytics();
    }
  }, [selectedSchoolId, selectedPeriod]);

  const fetchSchoolAnalytics = async () => {
    setLoading(true);
    try {
      // Get date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case "7days": startDate.setDate(endDate.getDate() - 7); break;
        case "30days": startDate.setDate(endDate.getDate() - 30); break;
        case "90days": startDate.setDate(endDate.getDate() - 90); break;
        default: startDate.setDate(endDate.getDate() - 7);
      }
      const startDateStr = startDate.toISOString().split('T')[0];

      // Fetch classes for the school
      const { data: classes } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', selectedSchoolId)
        .eq('is_active', true);

      if (!classes || classes.length === 0) {
        setClassAnalytics([]);
        setLoading(false);
        return;
      }

      // Fetch school members
      const { data: members } = await supabase
        .from('school_memberships')
        .select('*')
        .eq('school_id', selectedSchoolId)
        .eq('is_active', true);

      const teachers = members?.filter(m => m.role === 'teacher' || m.role === 'school_admin') || [];
      const studentMembers = members?.filter(m => m.role === 'student') || [];

      // Fetch class students
      const classIds = classes.map(c => c.id);
      const { data: classStudents } = await supabase
        .from('class_students')
        .select('*, user_registrations(*)')
        .in('class_id', classIds)
        .eq('is_active', true);

      const studentIds = classStudents?.map(cs => cs.student_id) || [];

      // Fetch missions for all students in the school
      let missionsQuery = supabase
        .from('daily_missions')
        .select('*')
        .in('user_id', studentIds)
        .gte('mission_date', startDateStr);

      const { data: missions } = await missionsQuery;

      // Fetch user streaks
      const { data: streaks } = await supabase
        .from('user_streaks')
        .select('*')
        .in('user_id', studentIds);

      // Fetch skill assessments
      const { data: skillAssessments } = await supabase
        .from('skill_assessments')
        .select('*')
        .in('user_id', studentIds);

      // Calculate class analytics
      const classAnalyticsData: ClassAnalytics[] = classes.map(cls => {
        const classStudentList = classStudents?.filter(cs => cs.class_id === cls.id) || [];
        const classStudentIds = classStudentList.map(cs => cs.student_id);
        const classMissions = missions?.filter(m => classStudentIds.includes(m.user_id)) || [];
        const completedMissions = classMissions.filter(m => m.status === 'completed' || m.completed_at);
        const classStreaks = streaks?.filter(s => classStudentIds.includes(s.user_id)) || [];

        const todayStr = new Date().toISOString().split('T')[0];
        const activeToday = classMissions.filter(m => m.mission_date === todayStr && (m.status === 'completed' || m.completed_at)).length;

        return {
          classId: cls.id,
          className: cls.name,
          grade: cls.grade,
          studentCount: classStudentList.length,
          averageAccuracy: completedMissions.length > 0 
            ? Math.round(completedMissions.reduce((sum, m) => sum + ((m.correct_answers || 0) / (m.total_questions || 1) * 100), 0) / completedMissions.length)
            : 0,
          totalMissionsCompleted: completedMissions.length,
          totalStarsEarned: completedMissions.reduce((sum, m) => sum + (m.stars_earned || 0), 0),
          averageStreak: classStreaks.length > 0
            ? Math.round(classStreaks.reduce((sum, s) => sum + (s.current_streak || 0), 0) / classStreaks.length)
            : 0,
          activeStudents: activeToday
        };
      });

      setClassAnalytics(classAnalyticsData);

      // Calculate skill performance
      const skillMap = new Map<string, { total: number; attempts: number; students: Set<string> }>();
      skillAssessments?.forEach(sa => {
        const existing = skillMap.get(sa.skill_name) || { total: 0, attempts: 0, students: new Set() };
        existing.total += sa.accuracy_rate * sa.total_attempts;
        existing.attempts += sa.total_attempts;
        existing.students.add(sa.user_id);
        skillMap.set(sa.skill_name, existing);
      });

      const skillPerformanceData: SkillPerformance[] = Array.from(skillMap.entries())
        .map(([skillName, data]) => ({
          skillName,
          averageAccuracy: Math.round(data.total / data.attempts),
          totalAttempts: data.attempts,
          studentsAttempted: data.students.size
        }))
        .sort((a, b) => b.totalAttempts - a.totalAttempts)
        .slice(0, 10);

      setSkillPerformance(skillPerformanceData);

      // Calculate daily activity
      const dailyMap = new Map<string, { completed: number; students: Set<string>; accuracySum: number; accuracyCount: number }>();
      missions?.forEach(m => {
        const existing = dailyMap.get(m.mission_date) || { completed: 0, students: new Set(), accuracySum: 0, accuracyCount: 0 };
        if (m.status === 'completed' || m.completed_at) {
          existing.completed++;
          const accuracy = (m.correct_answers || 0) / (m.total_questions || 1) * 100;
          existing.accuracySum += accuracy;
          existing.accuracyCount++;
        }
        existing.students.add(m.user_id);
        dailyMap.set(m.mission_date, existing);
      });

      const dailyActivityData: DailyActivity[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
          missionsCompleted: data.completed,
          activeStudents: data.students.size,
          averageAccuracy: data.accuracyCount > 0 ? Math.round(data.accuracySum / data.accuracyCount) : 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setDailyActivity(dailyActivityData);

      // Calculate school-wide stats
      const completedMissions = missions?.filter(m => m.status === 'completed' || m.completed_at) || [];
      const todayStr = new Date().toISOString().split('T')[0];
      const todayMissions = missions?.filter(m => m.mission_date === todayStr) || [];
      const todayCompleted = todayMissions.filter(m => m.status === 'completed' || m.completed_at);
      const uniqueActiveToday = new Set(todayCompleted.map(m => m.user_id)).size;

      setSchoolStats({
        totalStudents: studentIds.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        totalMissions: completedMissions.length,
        averageAccuracy: completedMissions.length > 0
          ? Math.round(completedMissions.reduce((sum, m) => sum + ((m.correct_answers || 0) / (m.total_questions || 1) * 100), 0) / completedMissions.length)
          : 0,
        totalStars: completedMissions.reduce((sum, m) => sum + (m.stars_earned || 0), 0),
        activeToday: uniqueActiveToday,
        completionRate: todayMissions.length > 0 
          ? Math.round((todayCompleted.length / todayMissions.length) * 100) 
          : 0
      });

    } catch (error) {
      console.error('Error fetching school analytics:', error);
    }
    setLoading(false);
  };

  const selectedSchool = userSchools.find(s => s.id === selectedSchoolId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/school-admin')}
                className="text-white hover:bg-slate-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  School Analytics Dashboard
                </h1>
                <p className="text-slate-400 text-sm">ภาพรวมผลการเรียนรู้ของโรงเรียน</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* School Selector */}
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger className="w-[200px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="เลือกโรงเรียน" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {userSchools.map(school => (
                    <SelectItem key={school.id} value={school.id} className="text-white hover:bg-slate-700">
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Period Selector */}
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="7days" className="text-white hover:bg-slate-700">7 วัน</SelectItem>
                  <SelectItem value="30days" className="text-white hover:bg-slate-700">30 วัน</SelectItem>
                  <SelectItem value="90days" className="text-white hover:bg-slate-700">90 วัน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/90 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">นักเรียนทั้งหมด</p>
                      <p className="text-2xl font-bold text-white">{schoolStats.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/90 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Active วันนี้</p>
                      <p className="text-2xl font-bold text-white">{schoolStats.activeToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/90 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">ความแม่นยำเฉลี่ย</p>
                      <p className="text-2xl font-bold text-white">{schoolStats.averageAccuracy}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/90 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">ดาวรวม</p>
                      <p className="text-2xl font-bold text-white">{schoolStats.totalStars}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/90 border-slate-700">
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{schoolStats.totalClasses}</p>
                  <p className="text-slate-400 text-xs">ห้องเรียน</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/90 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{schoolStats.totalTeachers}</p>
                  <p className="text-slate-400 text-xs">ครู</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/90 border-slate-700">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{schoolStats.totalMissions}</p>
                  <p className="text-slate-400 text-xs">ภารกิจสำเร็จ</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/90 border-slate-700">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{schoolStats.completionRate}%</p>
                  <p className="text-slate-400 text-xs">อัตราทำภารกิจวันนี้</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Daily Activity Chart */}
              <Card className="bg-slate-800/90 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">กิจกรรมรายวัน</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyActivity.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="missionsCompleted" 
                          name="ภารกิจสำเร็จ"
                          stroke="#8b5cf6" 
                          fill="#8b5cf6" 
                          fillOpacity={0.3}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="activeStudents" 
                          name="นักเรียน Active"
                          stroke="#06b6d4" 
                          fill="#06b6d4" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-slate-400">
                      ไม่มีข้อมูลกิจกรรม
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Accuracy Trend Chart */}
              <Card className="bg-slate-800/90 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">แนวโน้มความแม่นยำ</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyActivity.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="averageAccuracy" 
                          name="ความแม่นยำเฉลี่ย (%)"
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-slate-400">
                      ไม่มีข้อมูลความแม่นยำ
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Class Performance & Skill Performance */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Class Performance */}
              <Card className="bg-slate-800/90 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">ผลงานแต่ละห้องเรียน</CardTitle>
                </CardHeader>
                <CardContent>
                  {classAnalytics.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={classAnalytics} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                        <YAxis 
                          dataKey="className" 
                          type="category" 
                          stroke="#9ca3af" 
                          fontSize={12}
                          width={100}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="averageAccuracy" name="ความแม่นยำ (%)" fill="#8b5cf6" />
                        <Bar dataKey="totalMissionsCompleted" name="ภารกิจสำเร็จ" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400">
                      ไม่มีข้อมูลห้องเรียน
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skill Performance */}
              <Card className="bg-slate-800/90 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">ทักษะยอดนิยม</CardTitle>
                </CardHeader>
                <CardContent>
                  {skillPerformance.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {skillPerformance.map((skill, index) => (
                        <div key={skill.skillName} className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white text-sm truncate max-w-[150px]">
                                {skill.skillName}
                              </span>
                              <span className="text-slate-400 text-xs">
                                {skill.averageAccuracy}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${skill.averageAccuracy}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                            <p className="text-slate-500 text-xs mt-1">
                              {skill.studentsAttempted} นักเรียน • {skill.totalAttempts} ครั้ง
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-400">
                      ไม่มีข้อมูลทักษะ
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Class Details Table */}
            <Card className="bg-slate-800/90 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">รายละเอียดห้องเรียน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 text-sm py-3 px-2">ห้องเรียน</th>
                        <th className="text-center text-slate-400 text-sm py-3 px-2">ระดับ</th>
                        <th className="text-center text-slate-400 text-sm py-3 px-2">นักเรียน</th>
                        <th className="text-center text-slate-400 text-sm py-3 px-2">Active</th>
                        <th className="text-center text-slate-400 text-sm py-3 px-2">ความแม่นยำ</th>
                        <th className="text-center text-slate-400 text-sm py-3 px-2">ภารกิจ</th>
                        <th className="text-center text-slate-400 text-sm py-3 px-2">ดาว</th>
                        <th className="text-center text-slate-400 text-sm py-3 px-2">Streak เฉลี่ย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classAnalytics.map(cls => (
                        <tr key={cls.classId} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-2 text-white">{cls.className}</td>
                          <td className="py-3 px-2 text-center text-slate-300">ป.{cls.grade}</td>
                          <td className="py-3 px-2 text-center text-slate-300">{cls.studentCount}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              cls.activeStudents > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'
                            }`}>
                              {cls.activeStudents}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`font-medium ${
                              cls.averageAccuracy >= 80 ? 'text-green-400' :
                              cls.averageAccuracy >= 60 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {cls.averageAccuracy}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center text-slate-300">{cls.totalMissionsCompleted}</td>
                          <td className="py-3 px-2 text-center text-yellow-400">⭐ {cls.totalStarsEarned}</td>
                          <td className="py-3 px-2 text-center text-orange-400">🔥 {cls.averageStreak}</td>
                        </tr>
                      ))}
                      {classAnalytics.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            ไม่มีข้อมูลห้องเรียน
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
