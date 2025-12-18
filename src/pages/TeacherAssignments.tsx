import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  FileText, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  ArrowLeft
} from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
  grade: number;
  school_id: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  assignment_type: string;
  due_date: string | null;
  max_score: number;
  class_id: string;
  class_name?: string;
  submission_count?: number;
  is_active: boolean;
  created_at: string;
}

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const { registrationId } = useAuth();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    assignment_type: 'homework',
    class_id: '',
    due_date: '',
    max_score: 100,
  });

  useEffect(() => {
    if (registrationId) {
      fetchClasses();
      fetchAssignments();
    }
  }, [registrationId]);

  const fetchClasses = async () => {
    try {
      // Get classes where teacher is assigned
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, grade, school_id')
        .eq('teacher_id', registrationId)
        .eq('is_active', true);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('class_assignments')
        .select(`
          *,
          classes!inner(name)
        `)
        .eq('teacher_id', registrationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const assignmentsWithDetails = (data || []).map((a: any) => ({
        ...a,
        class_name: a.classes?.name,
      }));
      
      setAssignments(assignmentsWithDetails);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.class_id) {
      toast({
        title: 'กรุณากรอกข้อมูล',
        description: 'ชื่องานและห้องเรียนจำเป็นต้องระบุ',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('class_assignments')
        .insert([{
          title: newAssignment.title,
          description: newAssignment.description,
          assignment_type: newAssignment.assignment_type,
          class_id: newAssignment.class_id,
          teacher_id: registrationId,
          due_date: newAssignment.due_date || null,
          max_score: newAssignment.max_score,
          is_active: true,
        }]);

      if (error) throw error;

      toast({
        title: 'สร้างงานสำเร็จ',
        description: `งาน "${newAssignment.title}" ถูกสร้างเรียบร้อยแล้ว`,
      });

      setShowCreateDialog(false);
      setNewAssignment({
        title: '',
        description: '',
        assignment_type: 'homework',
        class_id: '',
        due_date: '',
        max_score: 100,
      });
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถสร้างงานได้',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!confirm(`ยืนยันการลบงาน "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('class_assignments')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'ลบงานสำเร็จ',
        description: `งาน "${title}" ถูกลบเรียบร้อยแล้ว`,
      });

      fetchAssignments();
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถลบงานได้',
        variant: 'destructive',
      });
    }
  };

  const getAssignmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      homework: '📝 การบ้าน',
      quiz: '📋 แบบทดสอบ',
      exam: '📖 ข้อสอบ',
      project: '🎯 โปรเจกต์',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/teacher')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">📋 มอบหมายงาน</h1>
            <p className="text-slate-400">สร้างและจัดการงานให้นักเรียนในห้องเรียน</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                สร้างงานใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white">สร้างงานใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-slate-300">ชื่องาน *</Label>
                  <Input
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    className="bg-slate-900 border-slate-600 text-white mt-1"
                    placeholder="เช่น การบ้านบทที่ 5"
                  />
                </div>
                
                <div>
                  <Label className="text-slate-300">ห้องเรียน *</Label>
                  <Select
                    value={newAssignment.class_id}
                    onValueChange={(value) => setNewAssignment({ ...newAssignment, class_id: value })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                      <SelectValue placeholder="เลือกห้องเรียน" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id} className="text-white">
                          {cls.name} (ป.{cls.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-slate-300">ประเภทงาน</Label>
                  <Select
                    value={newAssignment.assignment_type}
                    onValueChange={(value) => setNewAssignment({ ...newAssignment, assignment_type: value })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="homework" className="text-white">📝 การบ้าน</SelectItem>
                      <SelectItem value="quiz" className="text-white">📋 แบบทดสอบ</SelectItem>
                      <SelectItem value="exam" className="text-white">📖 ข้อสอบ</SelectItem>
                      <SelectItem value="project" className="text-white">🎯 โปรเจกต์</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-slate-300">รายละเอียด</Label>
                  <Textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    className="bg-slate-900 border-slate-600 text-white mt-1"
                    placeholder="คำอธิบายงาน..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">กำหนดส่ง</Label>
                    <Input
                      type="datetime-local"
                      value={newAssignment.due_date}
                      onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                      className="bg-slate-900 border-slate-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">คะแนนเต็ม</Label>
                    <Input
                      type="number"
                      value={newAssignment.max_score}
                      onChange={(e) => setNewAssignment({ ...newAssignment, max_score: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-600 text-white mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="text-slate-400">
                  ยกเลิก
                </Button>
                <Button onClick={handleCreateAssignment} className="bg-purple-600 hover:bg-purple-700">
                  สร้างงาน
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* No Classes Warning */}
        {classes.length === 0 && (
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-8 text-center mb-8">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">ยังไม่มีห้องเรียน</h2>
            <p className="text-slate-400 mb-4">คุณต้องได้รับมอบหมายเป็นครูประจำห้องก่อนจึงจะสามารถสร้างงานได้</p>
            <Button onClick={() => navigate('/teacher/classes')} variant="outline" className="border-purple-500/50 text-purple-300">
              ไปที่จัดการห้องเรียน
            </Button>
          </Card>
        )}

        {/* Assignments List */}
        {assignments.length === 0 && classes.length > 0 ? (
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">ยังไม่มีงานที่มอบหมาย</h2>
            <p className="text-slate-400 mb-6">สร้างงานแรกเพื่อเริ่มต้นใช้งาน</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} className="bg-slate-800/80 backdrop-blur border-slate-700 hover:border-purple-500/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{assignment.title}</CardTitle>
                      <p className="text-sm text-slate-400">{assignment.class_name}</p>
                    </div>
                    <span className="text-sm bg-slate-700 px-2 py-1 rounded">
                      {getAssignmentTypeLabel(assignment.assignment_type)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {assignment.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{assignment.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    {assignment.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(assignment.due_date).toLocaleDateString('th-TH')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>คะแนน: {assignment.max_score}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      ดูผลงาน
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherAssignments;
