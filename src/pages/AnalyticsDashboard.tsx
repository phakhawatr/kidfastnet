import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Award, Clock, Target, 
  Calendar, ChevronLeft, BookOpen, BarChart3 
} from 'lucide-react';

interface Assessment {
  id: string;
  grade: number;
  semester: number;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number;
  created_at: string;
  assessment_data: any;
}

interface SkillProgress {
  skill: string;
  attempts: number;
  averageScore: number;
  trend: 'up' | 'down' | 'stable';
}

const AnalyticsDashboard = () => {
  const { user, registrationId } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [user, registrationId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get parent email
      const parentEmail = user?.email || localStorage.getItem('kidfast_last_email');
      
      if (!parentEmail) {
        console.error('No parent email found');
        return;
      }

      // Get children for this parent
      const { data: childrenData, error: childrenError } = await supabase
        .from('user_registrations')
        .select('id, nickname, avatar, grade')
        .eq('parent_email', parentEmail)
        .eq('status', 'approved');

      if (childrenError) throw childrenError;

      setChildren(childrenData || []);
      
      // Set first child as default
      if (childrenData && childrenData.length > 0 && !selectedChild) {
        setSelectedChild(childrenData[0].id);
      }

      // Load assessments for selected child
      if (selectedChild || (childrenData && childrenData.length > 0)) {
        const childId = selectedChild || childrenData[0].id;
        
        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from('level_assessments')
          .select('*')
          .eq('user_id', childId)
          .order('created_at', { ascending: false });

        if (assessmentsError) throw assessmentsError;

        setAssessments(assessmentsData || []);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      loadData();
    }
  }, [selectedChild]);

  // Calculate statistics
  const calculateStats = () => {
    if (assessments.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalTimeSpent: 0,
        improvementRate: 0
      };
    }

    const scores = assessments.map(a => a.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const totalTimeSpent = assessments.reduce((sum, a) => sum + (a.time_taken || 0), 0);

    // Calculate improvement rate (compare last 3 vs first 3)
    let improvementRate = 0;
    if (assessments.length >= 6) {
      const recent = assessments.slice(0, 3).map(a => a.score);
      const older = assessments.slice(-3).map(a => a.score);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      improvementRate = ((recentAvg - olderAvg) / olderAvg) * 100;
    }

    return {
      totalAssessments: assessments.length,
      averageScore,
      highestScore,
      lowestScore,
      totalTimeSpent,
      improvementRate
    };
  };

  // Prepare data for score trend chart
  const prepareScoreTrendData = () => {
    return assessments
      .slice()
      .reverse()
      .map((assessment, index) => ({
        name: `ครั้งที่ ${index + 1}`,
        คะแนน: assessment.score,
        date: new Date(assessment.created_at).toLocaleDateString('th-TH', { 
          day: 'numeric', 
          month: 'short' 
        })
      }));
  };

  // Calculate skill breakdown across all assessments
  const calculateSkillBreakdown = (): SkillProgress[] => {
    const skillStats: Record<string, { total: number; correct: number; count: number; scores: number[] }> = {};

    assessments.forEach(assessment => {
      if (assessment.assessment_data?.questions) {
        assessment.assessment_data.questions.forEach((q: any, idx: number) => {
          if (!skillStats[q.skill]) {
            skillStats[q.skill] = { total: 0, correct: 0, count: 0, scores: [] };
          }
          skillStats[q.skill].total++;
          skillStats[q.skill].count++;
          
          const userAnswer = assessment.assessment_data.answers?.[idx];
          const isCorrect = q.choices?.[userAnswer] === q.correctAnswer || userAnswer === q.correctAnswer;
          if (isCorrect) {
            skillStats[q.skill].correct++;
          }
          
          const skillScore = (skillStats[q.skill].correct / skillStats[q.skill].total) * 100;
          skillStats[q.skill].scores.push(skillScore);
        });
      }
    });

    return Object.entries(skillStats).map(([skill, stats]) => {
      const averageScore = (stats.correct / stats.total) * 100;
      
      // Calculate trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (stats.scores.length >= 2) {
        const recent = stats.scores.slice(-Math.ceil(stats.scores.length / 2));
        const older = stats.scores.slice(0, Math.floor(stats.scores.length / 2));
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        if (recentAvg > olderAvg + 5) trend = 'up';
        else if (recentAvg < olderAvg - 5) trend = 'down';
      }

      return {
        skill,
        attempts: stats.count,
        averageScore,
        trend
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  };

  // Prepare data for skill comparison chart
  const prepareSkillComparisonData = () => {
    const skillBreakdown = calculateSkillBreakdown();
    return skillBreakdown.map(skill => ({
      name: t(`quiz.skills.${skill.skill}`, skill.skill),
      คะแนนเฉลี่ย: skill.averageScore.toFixed(1),
      จำนวนครั้ง: skill.attempts
    }));
  };

  const stats = calculateStats();
  const scoreTrendData = prepareScoreTrendData();
  const skillComparisonData = prepareSkillComparisonData();
  const skillBreakdown = calculateSkillBreakdown();

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="p-8">
            <div className="text-center">กำลังโหลดข้อมูล...</div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const currentChild = children.find(c => c.id === selectedChild);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/parent')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            กลับหน้าผู้ปกครอง
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-600 flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">วิเคราะห์พัฒนาการและผลการเรียนของบุตรหลาน</p>
            </div>
          </div>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-600">เลือกบุตรหลาน:</span>
                {children.map(child => (
                  <Button
                    key={child.id}
                    variant={selectedChild === child.id ? "default" : "outline"}
                    onClick={() => setSelectedChild(child.id)}
                    className="flex items-center gap-2"
                  >
                    <span className="text-2xl">{child.avatar}</span>
                    {child.nickname}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Child Info */}
        {currentChild && (
          <Card className="mb-6 border-2 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{currentChild.avatar}</div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-600">{currentChild.nickname}</h2>
                  <p className="text-gray-600">ระดับชั้น: {currentChild.grade}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">ยังไม่มีประวัติการทำข้อสอบ</h3>
              <p className="text-gray-500 mb-4">เริ่มทำแบบทดสอบเพื่อดูผลการเรียนและพัฒนาการ</p>
              <Button onClick={() => navigate('/quiz')}>
                ไปทำแบบทดสอบ
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    คะแนนเฉลี่ย
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.averageScore.toFixed(1)}%
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    สูงสุด: {stats.highestScore.toFixed(1)}% | ต่ำสุด: {stats.lowestScore.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    จำนวนครั้งที่ทำ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalAssessments}
                  </div>
                  <p className="text-xs text-green-600 mt-1">ครั้ง</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    เวลารวม
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.floor(stats.totalTimeSpent / 60)}
                  </div>
                  <p className="text-xs text-purple-600 mt-1">นาที</p>
                </CardContent>
              </Card>

              <Card className={`border-2 ${stats.improvementRate >= 0 ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm font-medium ${stats.improvementRate >= 0 ? 'text-green-700' : 'text-orange-700'} flex items-center gap-2`}>
                    {stats.improvementRate >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    การพัฒนา
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stats.improvementRate >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {stats.improvementRate >= 0 ? '+' : ''}{stats.improvementRate.toFixed(1)}%
                  </div>
                  <p className={`text-xs ${stats.improvementRate >= 0 ? 'text-green-600' : 'text-orange-600'} mt-1`}>
                    เทียบกับช่วงแรก
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Score Trend Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  กราฟคะแนนตามเวลา
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreTrendData}>
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
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{payload[0].payload.name}</p>
                              <p className="text-sm text-gray-600">{payload[0].payload.date}</p>
                              <p className="text-lg font-bold text-purple-600">
                                {payload[0].value}%
                              </p>
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
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Breakdown */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  คะแนนแยกตามทักษะ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillBreakdown.map((skill, idx) => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {skill.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {skill.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                          {skill.trend === 'stable' && <Award className="w-4 h-4 text-gray-600" />}
                          <span className="font-semibold">
                            {t(`quiz.skills.${skill.skill}`, skill.skill)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {skill.attempts} ครั้ง
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg ${
                            skill.averageScore >= 80 ? 'text-green-600' : 
                            skill.averageScore >= 50 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {skill.averageScore.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={skill.averageScore} 
                        className="h-2"
                        indicatorClassName={
                          skill.averageScore >= 80 ? 'bg-green-500' : 
                          skill.averageScore >= 50 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Comparison Bar Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  เปรียบเทียบทักษะ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={skillComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="คะแนนเฉลี่ย" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Assessments History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  ประวัติการทำข้อสอบล่าสุด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessments.slice(0, 10).map((assessment, idx) => (
                    <div 
                      key={assessment.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {assessment.score.toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {assessment.correct_answers}/{assessment.total_questions}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">
                            ป.{assessment.grade} เทอม {assessment.semester}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(assessment.created_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {Math.floor((assessment.time_taken || 0) / 60)}:{((assessment.time_taken || 0) % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AnalyticsDashboard;
