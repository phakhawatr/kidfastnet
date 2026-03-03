import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Calendar, Target, Award, Hash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import CompetencyRadarChart from '@/components/CompetencyRadarChart';
import type { SkillDataItem } from '@/components/CompetencyRadarChart';

const skillNamesTh: Record<string, string> = {
  counting: 'จำนวนนับ', comparing: 'การเปรียบเทียบ', ordering: 'การเรียงลำดับ',
  placeValue: 'ค่าประจำหลัก', addition: 'การบวก', subtraction: 'การลบ',
  patterns: 'แบบรูป', shapes: 'รูปทรงเรขาคณิต', measurement: 'การวัด',
  pictograph: 'แผนภูมิรูปภาพ', multiplication: 'การคูณ', division: 'การหาร',
  money: 'เงิน', time: 'เวลา', fractions: 'เศษส่วน', decimals: 'ทศนิยม',
  percentage: 'ร้อยละ', ratios: 'อัตราส่วน', algebra: 'พีชคณิต',
  geometry: 'เรขาคณิต', statistics: 'สถิติ', probability: 'ความน่าจะเป็น',
  weighing: 'การชั่ง', volume: 'ปริมาตร/ความจุ', mixedOperations: 'ระคน',
  dataPresentation: 'การนำเสนอข้อมูล',
};

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
  assessment_type?: string;
}

interface QuizHistoryProps {
  userId: string;
}

function computeSkillBreakdown(assessmentData: any): SkillDataItem[] {
  if (!assessmentData) return [];
  const questions = Array.isArray(assessmentData) ? assessmentData : assessmentData?.questions;
  if (!Array.isArray(questions) || questions.length === 0) return [];

  const stats: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q: any) => {
    const skill = q.skill || 'unknown';
    if (!stats[skill]) stats[skill] = { correct: 0, total: 0 };
    stats[skill].total++;
    if (q.isCorrect || q.is_correct) stats[skill].correct++;
  });

  return Object.entries(stats).map(([skill, s]) => ({
    skill: skillNamesTh[skill] || skill,
    percentage: s.total > 0 ? (s.correct / s.total) * 100 : 0,
  }));
}

const QuizHistory = ({ userId }: QuizHistoryProps) => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentRecord | null>(null);
  const [stats, setStats] = useState({
    totalTests: 0, averageScore: 0, bestScore: 0, totalCorrect: 0, totalQuestions: 0,
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
      setStats({ totalTests: 0, averageScore: 0, bestScore: 0, totalCorrect: 0, totalQuestions: 0 });
      return;
    }
    const totalScore = data.reduce((sum, a) => sum + (a.score || 0), 0);
    const totalCorrect = data.reduce((sum, a) => sum + (a.correct_answers || 0), 0);
    const totalQuestions = data.reduce((sum, a) => sum + (a.total_questions || 0), 0);
    const bestScore = Math.max(...data.map(a => a.score || 0));
    setStats({ totalTests: data.length, averageScore: totalScore / data.length, bestScore, totalCorrect, totalQuestions });
  };

  const chartData = assessments.slice(0, 10).reverse().map((a, idx) => ({
    name: `ครั้งที่ ${assessments.length - 9 + idx}`,
    คะแนน: a.score?.toFixed(0) || 0,
    'ตอบถูก': a.correct_answers || 0,
    date: new Date(a.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
  }));

  const gradeSemesterData = Object.entries(
    assessments.reduce((acc, a) => {
      const key = `ป.${a.grade} ภาค ${a.semester}`;
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += a.score || 0;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([key, value]) => ({
    name: key,
    'คะแนนเฉลี่ย': (value.total / value.count).toFixed(1),
    'จำนวนครั้ง': value.count,
  }));

  const selectedSkillData = selectedAssessment ? computeSkillBreakdown(selectedAssessment.assessment_data) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
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
                  {stats.totalQuestions > 0 ? ((stats.totalCorrect / stats.totalQuestions) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <Award className="w-10 h-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment History Cards with Mini Radar */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Calendar className="w-5 h-5" />
            ประวัติผลการทดสอบวัดระดับความรู้
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessments.map((a) => {
              const skillData = computeSkillBreakdown(a.assessment_data);
              const hasRadar = skillData.length >= 3;
              return (
                <Card
                  key={a.id}
                  className="border hover:shadow-lg transition-shadow cursor-pointer hover:border-indigo-400"
                  onClick={() => setSelectedAssessment(a)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Mini Radar Chart */}
                      <div className="flex-shrink-0">
                        {hasRadar ? (
                          <CompetencyRadarChart skillData={skillData} size="sm" showLabels={false} averageScore={a.score} />
                        ) : (
                          <div className="w-[120px] h-[120px] bg-gray-100 rounded-lg flex items-center justify-center">
                            <Target className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">
                          {a.assessment_type === 'nt' ? 'NT ป.3' : `ป.${a.grade} เทอม ${a.semester}`}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(a.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        <div className="mt-2">
                          <span className={`text-2xl font-bold ${
                            a.score >= 85 ? 'text-green-600' :
                            a.score >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {a.score?.toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          ✅ {a.correct_answers}/{a.total_questions} ข้อ
                          &nbsp;⏱ {Math.floor(a.time_taken / 60)}:{(a.time_taken % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                type="monotone" dataKey="คะแนน" stroke="#9333ea" strokeWidth={3}
                dot={{ fill: '#9333ea', r: 5 }} activeDot={{ r: 8 }}
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedAssessment} onOpenChange={(open) => !open && setSelectedAssessment(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-700 flex items-center gap-2">
              <Award className="w-5 h-5" />
              {selectedAssessment?.assessment_type === 'nt'
                ? 'NT ป.3'
                : `ป.${selectedAssessment?.grade} เทอม ${selectedAssessment?.semester}`}
              {' '}— ผลการทดสอบ
            </DialogTitle>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {new Date(selectedAssessment.created_at).toLocaleDateString('th-TH', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className={`text-2xl font-bold ${
                    selectedAssessment.score >= 85 ? 'text-green-600' :
                    selectedAssessment.score >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{selectedAssessment.score?.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">คะแนน</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">{selectedAssessment.correct_answers}</p>
                  <p className="text-xs text-gray-500">ตอบถูก</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor(selectedAssessment.time_taken / 60)}:{(selectedAssessment.time_taken % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-gray-500">เวลา</p>
                </div>
              </div>

              {/* Large Radar Chart */}
              {selectedSkillData.length >= 3 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">ผลการทดสอบวัดระดับความรู้</h4>
                  <div className="flex justify-center">
                    <CompetencyRadarChart
                      skillData={selectedSkillData}
                      size="md"
                      averageScore={selectedAssessment.score}
                    />
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> ≥85%</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 50-84%</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &lt;50%</span>
                  </div>
                </div>
              )}

              {/* Skill breakdown list */}
              {selectedSkillData.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">คะแนนแยกตามทักษะ</h4>
                  <div className="space-y-2">
                    {selectedSkillData.map((s) => (
                      <div key={s.skill} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{s.skill}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                s.percentage >= 85 ? 'bg-green-500' :
                                s.percentage >= 50 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${s.percentage}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold min-w-[3rem] text-right ${
                            s.percentage >= 85 ? 'text-green-600' :
                            s.percentage >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {s.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizHistory;
