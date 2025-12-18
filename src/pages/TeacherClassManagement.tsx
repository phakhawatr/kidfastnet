import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTeacherClasses } from '@/hooks/useTeacherClasses';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Plus, 
  Trash2,
  UserPlus,
  Star,
  Flame,
  Target,
  TrendingUp,
  Activity,
  Eye,
  ChevronRight,
  BarChart3,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const TeacherClassManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get user ID from localStorage
  const authData = localStorage.getItem('kidfast_auth');
  const userId = authData ? JSON.parse(authData).registrationId : null;
  
  const {
    teacherClasses,
    selectedClass,
    setSelectedClass,
    students,
    classProgress,
    isLoading,
    addStudentToClass,
    removeStudentFromClass,
    updateStudentNumber,
    getStudentDetailedProgress,
  } = useTeacherClasses(userId);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState<number | undefined>();
  const [viewingStudent, setViewingStudent] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);

  const handleAddStudent = async () => {
    try {
      if (!newStudentEmail) {
        toast({
          title: 'กรุณากรอกอีเมล',
          description: 'อีเมลนักเรียนจำเป็นต้องกรอก',
          variant: 'destructive',
        });
        return;
      }

      await addStudentToClass(newStudentEmail, newStudentNumber);
      setShowAddStudent(false);
      setNewStudentEmail('');
      setNewStudentNumber(undefined);
      toast({
        title: 'เพิ่มนักเรียนสำเร็จ',
        description: 'เพิ่มนักเรียนเข้าห้องเรียนเรียบร้อยแล้ว',
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถเพิ่มนักเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveStudent = async (classStudentId: string, studentName: string) => {
    if (!confirm(`ยืนยันการลบ "${studentName}" ออกจากห้องเรียน?`)) return;

    try {
      await removeStudentFromClass(classStudentId);
      toast({
        title: 'ลบนักเรียนสำเร็จ',
        description: `${studentName} ถูกลบออกจากห้องเรียนเรียบร้อยแล้ว`,
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถลบนักเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const handleViewStudentDetail = async (studentId: string) => {
    try {
      setViewingStudent(studentId);
      const detail = await getStudentDetailedProgress(studentId);
      setStudentDetail(detail);
    } catch (error) {
      console.error('Error fetching student detail:', error);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400';
    if (accuracy >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 7) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    if (streak >= 3) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📚 จัดการห้องเรียน
            </h1>
            <p className="text-slate-400">จัดการนักเรียนและดูความก้าวหน้าในห้องเรียนของคุณ</p>
          </div>
          
          {/* Class Selector */}
          {teacherClasses.length > 0 && (
            <div className="mt-4 md:mt-0">
              <Select
                value={selectedClass?.id || ''}
                onValueChange={(value) => {
                  const cls = teacherClasses.find(c => c.id === value);
                  if (cls) setSelectedClass(cls);
                }}
              >
                <SelectTrigger className="w-[280px] bg-slate-800/90 border-slate-700 text-white">
                  <SelectValue placeholder="เลือกห้องเรียน" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {teacherClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="text-white hover:bg-slate-700">
                      {cls.name} ({cls.school_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* No Classes State */}
        {teacherClasses.length === 0 && (
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">ยังไม่มีห้องเรียน</h2>
            <p className="text-slate-400 mb-6">ผู้ดูแลโรงเรียนจะมอบหมายห้องเรียนให้คุณ</p>
          </Card>
        )}

        {/* Class Dashboard */}
        {selectedClass && (
          <>
            {/* Class Progress Overview */}
            {classProgress && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">นักเรียน</p>
                      <p className="text-xl font-bold text-white">{classProgress.total_students}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Activity className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">เรียนวันนี้</p>
                      <p className="text-xl font-bold text-white">{classProgress.active_students_today}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">ความแม่นยำเฉลี่ย</p>
                      <p className="text-xl font-bold text-white">{classProgress.avg_accuracy}%</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">ดาวเฉลี่ย</p>
                      <p className="text-xl font-bold text-white">{classProgress.avg_stars}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">อัตราการทำ</p>
                      <p className="text-xl font-bold text-white">{classProgress.completion_rate}%</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Students List */}
            <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedClass.name}</h2>
                  <p className="text-slate-400 text-sm">{selectedClass.school_name} • ป.{selectedClass.grade}</p>
                </div>
                <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      เพิ่มนักเรียน
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">เพิ่มนักเรียนเข้าห้องเรียน</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="text-slate-300">อีเมลนักเรียน *</Label>
                        <Input
                          type="email"
                          value={newStudentEmail}
                          onChange={(e) => setNewStudentEmail(e.target.value)}
                          className="bg-slate-900 border-slate-600 text-white mt-1"
                          placeholder="student@email.com"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">เลขที่</Label>
                        <Input
                          type="number"
                          value={newStudentNumber || ''}
                          onChange={(e) => setNewStudentNumber(parseInt(e.target.value) || undefined)}
                          className="bg-slate-900 border-slate-600 text-white mt-1"
                          placeholder="เช่น 1, 2, 3..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={() => setShowAddStudent(false)} className="text-slate-400">
                        ยกเลิก
                      </Button>
                      <Button onClick={handleAddStudent} className="bg-purple-600 hover:bg-purple-700">
                        เพิ่มนักเรียน
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="p-6">
                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">ยังไม่มีนักเรียนในห้องเรียนนี้</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">เลขที่</th>
                          <th className="text-left py-3 px-4 text-slate-400 font-medium">นักเรียน</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">Streak</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">ดาวรวม</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">ความแม่นยำ</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">ภารกิจ</th>
                          <th className="text-center py-3 px-4 text-slate-400 font-medium">เข้าใช้ล่าสุด</th>
                          <th className="text-right py-3 px-4 text-slate-400 font-medium">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                            <td className="py-4 px-4">
                              <span className="text-white font-medium">
                                {student.student_number || '-'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                  <span className="text-lg">{student.avatar}</span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">{student.nickname}</p>
                                  <p className="text-slate-400 text-xs">{student.parent_email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm border ${getStreakBadge(student.current_streak)}`}>
                                <Flame className="w-3 h-3" />
                                {student.current_streak}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-yellow-400 font-medium flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400" />
                                {student.total_stars}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`font-medium ${getAccuracyColor(student.avg_accuracy)}`}>
                                {student.avg_accuracy}%
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-slate-300">{student.completed_missions}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-slate-400 text-sm">
                                {student.last_activity 
                                  ? format(new Date(student.last_activity), 'dd MMM', { locale: th })
                                  : '-'
                                }
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-400 hover:text-blue-400"
                                  onClick={() => handleViewStudentDetail(student.student_id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-400 hover:text-red-400"
                                  onClick={() => handleRemoveStudent(student.id, student.nickname)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>

            {/* Student Detail Modal */}
            <Dialog open={!!viewingStudent} onOpenChange={(open) => !open && setViewingStudent(null)}>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">รายละเอียดนักเรียน</DialogTitle>
                </DialogHeader>
                
                {studentDetail && (
                  <div className="mt-4 space-y-6">
                    {/* Recent Missions */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        ภารกิจล่าสุด
                      </h3>
                      <div className="space-y-2">
                        {studentDetail.missions.slice(0, 10).map((mission: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <div>
                              <p className="text-white text-sm">{mission.skill_name}</p>
                              <p className="text-slate-400 text-xs">{mission.mission_date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm ${mission.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {mission.correct_answers || 0}/{mission.total_questions}
                              </span>
                              <div className="flex">
                                {[...Array(mission.stars_earned || 0)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        {studentDetail.missions.length === 0 && (
                          <p className="text-slate-400 text-center py-4">ยังไม่มีประวัติภารกิจ</p>
                        )}
                      </div>
                    </div>

                    {/* Skill Assessment */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        ทักษะที่ต้องพัฒนา
                      </h3>
                      <div className="space-y-2">
                        {studentDetail.skills.slice(0, 5).map((skill: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                            <span className="text-white text-sm">{skill.skill_name}</span>
                            <span className={`text-sm font-medium ${getAccuracyColor(skill.accuracy_rate)}`}>
                              {Math.round(skill.accuracy_rate)}%
                            </span>
                          </div>
                        ))}
                        {studentDetail.skills.length === 0 && (
                          <p className="text-slate-400 text-center py-4">ยังไม่มีข้อมูลทักษะ</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherClassManagement;
