import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Trash2, ArrowLeft, Hash } from 'lucide-react';

const avatarEmojiMap: Record<string, string> = {
  tiger: '🐯', cat: '🐱', dog: '🐶', rabbit: '🐰', bear: '🐻',
  monkey: '🐵', elephant: '🐘', panda: '🐼', lion: '🦁', fox: '🦊',
  penguin: '🐧', koala: '🐨', frog: '🐸', unicorn: '🦄', owl: '🦉',
  dolphin: '🐬', butterfly: '🦋', bee: '🐝', ladybug: '🐞', turtle: '🐢',
  giraffe: '🦒', whale: '🐋', octopus: '🐙', star: '⭐', rocket: '🚀',
};

interface ClassStudent {
  id: string;
  student_id: string;
  student_number: number | null;
  nickname: string;
  email: string;
  avatar: string;
  line_picture_url: string | null;
}

interface ClassStudentManagerProps {
  classId: string;
  className: string;
  schoolId: string;
  onBack: () => void;
}

const ClassStudentManager = ({ classId, className, schoolId, onBack }: ClassStudentManagerProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('class_students')
        .select('id, student_id, student_number')
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('student_number', { ascending: true });

      if (error) throw error;

      const studentsWithDetails: ClassStudent[] = await Promise.all(
        (data || []).map(async (cs) => {
          const { data: user } = await supabase
            .from('user_registrations')
            .select('nickname, parent_email, avatar')
            .eq('id', cs.student_id)
            .single();

          return {
            id: cs.id,
            student_id: cs.student_id,
            student_number: cs.student_number,
            nickname: user?.nickname || 'ไม่ระบุชื่อ',
            email: user?.parent_email || '',
            avatar: user?.avatar || '👨‍🎓',
          };
        })
      );

      setStudents(studentsWithDetails);
    } catch (error) {
      console.error('Error fetching class students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const handleAddStudent = async () => {
    if (!studentEmail) return;
    setIsAdding(true);

    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('parent_email', studentEmail)
        .single();

      if (userError || !user) {
        toast({ title: 'ไม่พบผู้ใช้', description: 'ไม่พบผู้ใช้งานด้วยอีเมลนี้', variant: 'destructive' });
        setIsAdding(false);
        return;
      }

      // Check duplicate
      const { data: existing } = await supabase
        .from('class_students')
        .select('id')
        .eq('class_id', classId)
        .eq('student_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existing) {
        toast({ title: 'ซ้ำ', description: 'นักเรียนอยู่ในห้องนี้แล้ว', variant: 'destructive' });
        setIsAdding(false);
        return;
      }

      // Add to class_students
      const { error } = await supabase
        .from('class_students')
        .insert([{
          class_id: classId,
          student_id: user.id,
          student_number: studentNumber ? parseInt(studentNumber) : null,
          is_active: true,
        }]);

      if (error) throw error;

      // Also ensure school membership exists
      const { data: memberExists } = await supabase
        .from('school_memberships')
        .select('id')
        .eq('school_id', schoolId)
        .eq('user_id', user.id)
        .eq('role', 'student')
        .maybeSingle();

      if (!memberExists) {
        await supabase.from('school_memberships').insert([{
          school_id: schoolId,
          user_id: user.id,
          role: 'student',
          is_active: true,
        }]);
      }

      toast({ title: 'เพิ่มนักเรียนสำเร็จ' });
      setShowAddStudent(false);
      setStudentEmail('');
      setStudentNumber('');
      fetchStudents();
    } catch (error: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudent = async (csId: string, name: string) => {
    if (!confirm(`ยืนยันลบ "${name}" ออกจากห้องเรียน?`)) return;

    try {
      const { error } = await supabase
        .from('class_students')
        .update({ is_active: false })
        .eq('id', csId);

      if (error) throw error;
      toast({ title: 'ลบนักเรียนสำเร็จ' });
      fetchStudents();
    } catch (error: any) {
      toast({ title: 'เกิดข้อผิดพลาด', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-white">📚 {className}</h2>
              <p className="text-slate-400 text-sm">{students.length} นักเรียน</p>
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddStudent(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            เพิ่มนักเรียน
          </Button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400 mx-auto"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">ยังไม่มีนักเรียนในห้องนี้</p>
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowAddStudent(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              เพิ่มนักเรียนคนแรก
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs text-slate-500 font-medium uppercase">
              <div className="col-span-1">เลขที่</div>
              <div className="col-span-5">ชื่อ</div>
              <div className="col-span-4">อีเมล</div>
              <div className="col-span-2 text-right">จัดการ</div>
            </div>
            {students.map((student) => (
              <div key={student.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-slate-900/50 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                <div className="col-span-1">
                  <span className="text-emerald-400 font-mono text-sm">
                    {student.student_number || '-'}
                  </span>
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-sm">
                    {student.avatar}
                  </div>
                  <span className="text-white font-medium">{student.nickname}</span>
                </div>
                <div className="col-span-4">
                  <span className="text-slate-400 text-sm">{student.email}</span>
                </div>
                <div className="col-span-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-400"
                    onClick={() => handleRemoveStudent(student.id, student.nickname)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">เพิ่มนักเรียนเข้าห้อง {className}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">อีเมลนักเรียน *</Label>
              <Input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white mt-1"
                placeholder="student@email.com"
              />
            </div>
            <div>
              <Label className="text-slate-300">เลขที่</Label>
              <Input
                type="number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white mt-1"
                placeholder="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setShowAddStudent(false)} className="text-slate-400">
              ยกเลิก
            </Button>
            <Button onClick={handleAddStudent} disabled={isAdding} className="bg-emerald-600 hover:bg-emerald-700">
              {isAdding ? 'กำลังเพิ่ม...' : 'เพิ่มนักเรียน'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClassStudentManager;
