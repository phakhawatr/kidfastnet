import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Calendar, Target, Award, Hash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AssessmentRecord {
  id: string;
  grade: number;
  semester: number;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number;
  created_at: string;
  assessment_data?: any;
}

interface QuizHistoryProps {
  userId: string;
}

const QuizHistory = ({ userId }: QuizHistoryProps) => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    totalCorrect: 0,
    totalQuestions: 0
  });

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('level_assessments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data) {
          setAssessments(data);
          calculateStats(data);
        }
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [userId]);

  const calculateStats = (data: AssessmentRecord[]) => {
    if (data.length === 0) {
      setStats({
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalCorrect: 0,
        totalQuestions: 0
      });
      return;
    }

    const totalScore = data.reduce((sum, a) => sum + (a.score || 0), 0);
    const totalCorrect = data.reduce((sum, a) => sum + (a.correct_answers || 0), 0);
    const totalQuestions = data.reduce((sum, a) => sum + (a.total_questions || 0), 0);
    const bestScore = Math.max(...data.map(a => a.score || 0));

    setStats({
      totalTests: data.length,
      averageScore: totalScore / data.length,
      bestScore,
      totalCorrect,
      totalQuestions
    });
  };

  // Prepare chart data - show last 10 tests
  const chartData = assessments.slice(0, 10).reverse().map((a, idx) => ({
    name: `ครั้งที่ ${assessments.length - 9 + idx}`,
    คะแนน: a.score?.toFixed(0) || 0,
    'ตอบถูก': a.correct_answers || 0,
    date: new Date(a.created_at).toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short' 
    })
  }));

  // Grade/Semester breakdown
  const gradeSemesterData = Object.entries(
    assessments.reduce((acc, a) => {
      const key = `ป.${a.grade} ภาค ${a.semester}`;
      if (!acc[key]) {
        acc[key] = { total: 0, count: 0 };
      }
      acc[key].total += a.score || 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([key, value]) => ({
    name: key,
    'คะแนนเฉลี่ย': (value.total / value.count).toFixed(1),
    'จำนวนครั้ง': value.count
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">ยังไม่มีประวัติการทำแบบทดสอบ</h3>
          <p className="text-gray-500">เริ่มทำแบบทดสอบเพื่อดูสถิติและความก้าวหน้าของคุณ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">จำนวนครั้ง</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalTests}</p>
              </div>
              <Hash className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">คะแนนเฉลี่ย</p>
                <p className="text-3xl font-bold text-green-700">{stats.averageScore.toFixed(1)}</p>
              </div>
              <Target className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">คะแนนสูงสุด</p>
                <p className="text-3xl font-bold text-purple-700">{stats.bestScore.toFixed(0)}</p>
              </div>
              <Trophy className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">ความแม่นยำ</p>
                <p className="text-3xl font-bold text-orange-700">
                  {stats.totalQuestions > 0 
                    ? ((stats.totalCorrect / stats.totalQuestions) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
              <Award className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Progress Chart */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <TrendingUp className="w-5 h-5" />
            กราฟความก้าวหน้า (10 ครั้งล่าสุด)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border-2">
                        <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
                        <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
                        <p className="text-purple-600 font-bold">คะแนน: {payload[0].value}%</p>
                        <p className="text-blue-600">ตอบถูก: {payload[0].payload.ตอบถูก} ข้อ</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="คะแนน" 
                stroke="#9333ea" 
                strokeWidth={3}
                dot={{ fill: '#9333ea', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grade/Semester Performance */}
      {gradeSemesterData.length > 0 && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calendar className="w-5 h-5" />
              สรุปคะแนนแยกตามชั้น/เทอม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeSemesterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="คะแนนเฉลี่ย" fill="#3b82f6" />
                <Bar yAxisId="right" dataKey="จำนวนครั้ง" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Tests Table */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            ประวัติการทำแบบทดสอบล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3 font-semibold">วันที่</th>
                  <th className="text-left p-3 font-semibold">ชั้น/เทอม</th>
                  <th className="text-center p-3 font-semibold">คะแนน</th>
                  <th className="text-center p-3 font-semibold">ตอบถูก</th>
                  <th className="text-center p-3 font-semibold">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {assessments.slice(0, 10).map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(a.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3">ป.{a.grade} ภาค {a.semester}</td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${
                        a.score >= 80 ? 'text-green-600' : 
                        a.score >= 60 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {a.score?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {a.correct_answers}/{a.total_questions}
                    </td>
                    <td className="p-3 text-center text-gray-600">
                      {Math.floor(a.time_taken / 60)}:{(a.time_taken % 60).toString().padStart(2, '0')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizHistory;
