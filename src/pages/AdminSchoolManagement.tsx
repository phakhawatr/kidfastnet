import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft,
  Users, 
  GraduationCap, 
  Building2, 
  Plus, 
  Settings, 
  Trash2,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  Save,
  X,
  Upload,
  ImageIcon
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface School {
  id: string;
  name: string;
  code: string;
  address: string | null;
  district: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  background_url: string | null;
}

interface ClassData {
  id: string;
  name: string;
  grade: number;
  academic_year: number;
  semester: number | null;
  max_students: number | null;
  teacher_id: string | null;
  teacher_name?: string;
  student_count?: number;
}

interface MemberData {
  id: string;
  user_id: string;
  role: 'school_admin' | 'teacher' | 'student';
  user_nickname?: string;
  user_email?: string;
  user_avatar?: string;
}

interface ClassStudentData {
  id: string;
  student_id: string;
  student_number: number | null;
  enrolled_at: string;
  student_nickname?: string;
  student_email?: string;
  student_avatar?: string;
}

const AdminSchoolManagement = () => {
  const navigate = useNavigate();
  const { schoolId } = useParams<{ schoolId: string }>();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [teachers, setTeachers] = useState<{id: string; nickname: string}[]>([]);
  
  // Dialog states
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditSchool, setShowEditSchool] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [showClassManagement, setShowClassManagement] = useState(false);
  
  // Class management states
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudentData[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState<number | ''>('');
  
  // Form states
  const [editSchoolData, setEditSchoolData] = useState({
    name: '',
    code: '',
    address: '',
    district: '',
    province: '',
    phone: '',
    email: '',
    website: '',
  });
  
  const [newClass, setNewClass] = useState({
    name: '',
    grade: 1,
    academic_year: new Date().getFullYear() + 543,
    semester: 1,
    max_students: 40,
    teacher_id: '',
  });
  
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'teacher' as 'school_admin' | 'teacher' | 'student',
  });

  // Fetch school data
  useEffect(() => {
    if (schoolId) {
      fetchSchoolData();
    }
  }, [schoolId]);

  const fetchSchoolData = async () => {
    if (!schoolId) return;
    
    setIsLoading(true);
    try {
      // Fetch school
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
      
      if (schoolError) throw schoolError;
      setSchool(schoolData);
      setEditSchoolData({
        name: schoolData.name || '',
        code: schoolData.code || '',
        address: schoolData.address || '',
        district: schoolData.district || '',
        province: schoolData.province || '',
        phone: schoolData.phone || '',
        email: schoolData.email || '',
        website: schoolData.website || '',
      });
      setLogoPreview(schoolData.logo_url || null);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('grade', { ascending: true });
      
      if (classesError) throw classesError;

      // Get teacher names and student counts
      const classesWithDetails = await Promise.all(
        (classesData || []).map(async (cls) => {
          let teacherName = '';
          if (cls.teacher_id) {
            const { data: teacher } = await supabase
              .from('user_registrations')
              .select('nickname')
              .eq('id', cls.teacher_id)
              .single();
            teacherName = teacher?.nickname || '';
          }
          
          const { count } = await supabase
            .from('class_students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id)
            .eq('is_active', true);
          
          return {
            ...cls,
            teacher_name: teacherName,
            student_count: count || 0,
          };
        })
      );
      
      setClasses(classesWithDetails);

      // Fetch members from school_memberships
      const { data: membersData, error: membersError } = await supabase
        .from('school_memberships')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true);
      
      if (membersError) throw membersError;

      // Get user details for members
      const membersWithDetails = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: user } = await supabase
            .from('user_registrations')
            .select('nickname, parent_email, avatar')
            .eq('id', member.user_id)
            .single();
          
          return {
            ...member,
            user_nickname: user?.nickname,
            user_email: user?.parent_email,
            user_avatar: user?.avatar,
          };
        })
      );

      // Also fetch students from class_students for all classes in this school
      const classIds = (classesData || []).map(c => c.id);
      const existingMemberUserIds = new Set(membersWithDetails.map(m => m.user_id));
      
      if (classIds.length > 0) {
        const { data: classStudentsData } = await supabase
          .from('class_students')
          .select('*')
          .in('class_id', classIds)
          .eq('is_active', true);
        
        if (classStudentsData && classStudentsData.length > 0) {
          // Get unique student IDs not already in memberships
          const uniqueStudentIds = [...new Set(classStudentsData.map(cs => cs.student_id))]
            .filter(sid => !existingMemberUserIds.has(sid));
          
          const studentMembers = await Promise.all(
            uniqueStudentIds.map(async (studentId) => {
              const { data: user } = await supabase
                .from('user_registrations')
                .select('nickname, parent_email, avatar')
                .eq('id', studentId)
                .single();
              
              return {
                id: `class-student-${studentId}`,
                school_id: schoolId,
                user_id: studentId,
                role: 'student' as const,
                is_active: true,
                created_at: new Date().toISOString(),
                joined_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_nickname: user?.nickname,
                user_email: user?.parent_email,
                user_avatar: user?.avatar,
              };
            })
          );
          
          membersWithDetails.push(...studentMembers);
        }
      }
      
      setMembers(membersWithDetails);
      
      // Set teachers for class assignment
      const teacherMembers = membersWithDetails.filter(m => m.role === 'teacher' || m.role === 'school_admin');
      setTeachers(teacherMembers.map(m => ({
        id: m.user_id,
        nickname: m.user_nickname || 'ไม่ระบุชื่อ',
      })));
      
    } catch (error: any) {
      console.error('Error fetching school data:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถโหลดข้อมูลโรงเรียนได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!schoolId || !newClass.name) {
      toast({
        title: 'กรุณากรอกข้อมูล',
        description: 'ชื่อห้องเรียนจำเป็นต้องกรอก',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('classes')
        .insert({
          school_id: schoolId,
          name: newClass.name,
          grade: newClass.grade,
          academic_year: newClass.academic_year,
          semester: newClass.semester,
          max_students: newClass.max_students,
          teacher_id: newClass.teacher_id || null,
        });
      
      if (error) throw error;
      
      setShowCreateClass(false);
      setNewClass({
        name: '',
        grade: 1,
        academic_year: new Date().getFullYear() + 543,
        semester: 1,
        max_students: 40,
        teacher_id: '',
      });
      toast({ title: 'สร้างห้องเรียนสำเร็จ' });
      fetchSchoolData();
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถสร้างห้องเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`ยืนยันการลบห้องเรียน "${className}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .eq('id', classId);
      
      if (error) throw error;
      toast({ title: 'ลบห้องเรียนสำเร็จ' });
      fetchSchoolData();
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถลบห้องเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const handleAddMember = async () => {
    if (!schoolId || !newMember.email) {
      toast({
        title: 'กรุณากรอกข้อมูล',
        description: 'อีเมลผู้ใช้จำเป็นต้องกรอก',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('parent_email', newMember.email)
        .single();
      
      if (userError || !user) {
        toast({
          title: 'ไม่พบผู้ใช้',
          description: 'ไม่พบผู้ใช้ที่มีอีเมลนี้ในระบบ',
          variant: 'destructive',
        });
        return;
      }
      
      // Add membership
      const { error } = await supabase
        .from('school_memberships')
        .insert({
          school_id: schoolId,
          user_id: user.id,
          role: newMember.role,
        });
      
      if (error) throw error;
      
      setShowAddMember(false);
      setNewMember({ email: '', role: 'teacher' });
      toast({ title: 'เพิ่มสมาชิกสำเร็จ' });
      fetchSchoolData();
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถเพิ่มสมาชิกได้',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (membershipId: string, memberName: string) => {
    if (!confirm(`ยืนยันการลบ "${memberName}" ออกจากโรงเรียน?`)) return;
    
    try {
      const { error } = await supabase
        .from('school_memberships')
        .update({ is_active: false })
        .eq('id', membershipId);
      
      if (error) throw error;
      toast({ title: 'ลบสมาชิกสำเร็จ' });
      fetchSchoolData();
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถลบสมาชิกได้',
        variant: 'destructive',
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !schoolId) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'กรุณาเลือกไฟล์รูปภาพ', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)', variant: 'destructive' });
      return;
    }

    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${schoolId}/logo.${ext}`;

      // Remove old logo if exists
      await supabase.storage.from('school-logos').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('school-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('school-logos')
        .getPublicUrl(filePath);

      const logoUrl = urlData.publicUrl + '?t=' + Date.now();

      // Use security definer function to bypass RLS
      await supabase.rpc('admin_update_school', {
        p_school_id: schoolId,
        p_data: { logo_url: logoUrl }
      });

      setLogoPreview(logoUrl);
      toast({ title: 'อัปโหลดโลโก้สำเร็จ' });
      fetchSchoolData();
    } catch (error: any) {
      toast({
        title: 'อัปโหลดไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !schoolId) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'กรุณาเลือกไฟล์รูปภาพ', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'ไฟล์ใหญ่เกินไป (สูงสุด 10MB)', variant: 'destructive' });
      return;
    }

    setUploadingBackground(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${schoolId}/background.${ext}`;

      await supabase.storage.from('school-logos').remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from('school-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('school-logos')
        .getPublicUrl(filePath);

      const bgUrl = urlData.publicUrl + '?t=' + Date.now();

      await supabase.rpc('admin_update_school', {
        p_school_id: schoolId,
        p_data: { background_url: bgUrl }
      });

      setBackgroundPreview(bgUrl);
      toast({ title: 'อัปโหลดภาพพื้นหลังสำเร็จ' });
      fetchSchoolData();
    } catch (error: any) {
      toast({
        title: 'อัปโหลดไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleUpdateSchool = async () => {
    if (!schoolId) return;
    
    try {
      const { error } = await supabase.rpc('admin_update_school', {
        p_school_id: schoolId,
        p_data: editSchoolData
      });
      
      if (error) throw error;
      setShowEditSchool(false);
      toast({ title: 'บันทึกข้อมูลสำเร็จ' });
      fetchSchoolData();
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
        variant: 'destructive',
      });
    }
  };

  // Class management functions
  const openClassManagement = async (cls: ClassData) => {
    setSelectedClass(cls);
    setShowClassManagement(true);
    await fetchClassStudents(cls.id);
  };

  const fetchClassStudents = async (classId: string) => {
    setLoadingStudents(true);
    try {
      const { data: studentsData, error } = await supabase
        .from('class_students')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('student_number', { ascending: true });
      
      if (error) throw error;

      const studentsWithDetails = await Promise.all(
        (studentsData || []).map(async (student) => {
          const { data: user } = await supabase
            .from('user_registrations')
            .select('nickname, parent_email, avatar')
            .eq('id', student.student_id)
            .single();
          
          return {
            ...student,
            student_nickname: user?.nickname,
            student_email: user?.parent_email,
            student_avatar: user?.avatar,
          };
        })
      );
      
      setClassStudents(studentsWithDetails);
    } catch (error: any) {
      console.error('Error fetching class students:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดรายชื่อนักเรียนได้',
        variant: 'destructive',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudentToClass = async () => {
    if (!selectedClass || !newStudentEmail) {
      toast({
        title: 'กรุณากรอกข้อมูล',
        description: 'อีเมลนักเรียนจำเป็นต้องกรอก',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Find student by email
      const { data: student, error: studentError } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('parent_email', newStudentEmail)
        .single();
      
      if (studentError || !student) {
        toast({
          title: 'ไม่พบนักเรียน',
          description: 'ไม่พบนักเรียนที่มีอีเมลนี้ในระบบ',
          variant: 'destructive',
        });
        return;
      }

      // Check if already in class
      const { data: existing } = await supabase
        .from('class_students')
        .select('id')
        .eq('class_id', selectedClass.id)
        .eq('student_id', student.id)
        .eq('is_active', true)
        .single();
      
      if (existing) {
        toast({
          title: 'นักเรียนอยู่ในห้องแล้ว',
          description: 'นักเรียนคนนี้อยู่ในห้องเรียนนี้แล้ว',
          variant: 'destructive',
        });
        return;
      }

      // Add student to class
      const { error } = await supabase
        .from('class_students')
        .insert({
          class_id: selectedClass.id,
          student_id: student.id,
          student_number: newStudentNumber || null,
        });
      
      if (error) throw error;
      
      setNewStudentEmail('');
      setNewStudentNumber('');
      toast({ title: 'เพิ่มนักเรียนสำเร็จ' });
      await fetchClassStudents(selectedClass.id);
      fetchSchoolData(); // Update student count
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถเพิ่มนักเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveStudentFromClass = async (enrollmentId: string, studentName: string) => {
    if (!confirm(`ยืนยันการลบ "${studentName}" ออกจากห้องเรียน?`)) return;
    
    try {
      const { error } = await supabase
        .from('class_students')
        .update({ is_active: false })
        .eq('id', enrollmentId);
      
      if (error) throw error;
      toast({ title: 'ลบนักเรียนสำเร็จ' });
      if (selectedClass) {
        await fetchClassStudents(selectedClass.id);
      }
      fetchSchoolData(); // Update student count
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถลบนักเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'school_admin': return 'ผู้ดูแลโรงเรียน';
      case 'teacher': return 'ครู';
      case 'student': return 'นักเรียน';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'school_admin': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'teacher': return 'bg-violet-100 text-violet-700 border-violet-300';
      case 'student': return 'bg-sky-100 text-sky-700 border-sky-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center font-sarabun">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="text-lg text-purple-600 font-semibold">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center font-sarabun">
        <Card className="p-8 text-center shadow-xl border-0">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-purple-300" />
          <p className="text-xl text-gray-600 mb-4">ไม่พบข้อมูลโรงเรียน</p>
          <Button onClick={() => navigate('/admin/dashboard')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            กลับหน้าหลัก
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sarabun relative">
      {/* Background Image */}
      {(backgroundPreview || school.background_url) ? (
        <div className="fixed inset-0 z-0">
          <img 
            src={backgroundPreview || school.background_url || ''} 
            alt="พื้นหลัง" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-[2px]" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
      )}
      <div className="relative z-10">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4 text-purple-700 hover:text-purple-900 hover:bg-purple-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับหน้าหลัก
          </Button>
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-4">
              {school.logo_url ? (
                <img src={school.logo_url} alt="โลโก้โรงเรียน" className="w-16 h-16 rounded-2xl object-cover bg-white shadow-lg" />
              ) : (
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🏫
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
                <p className="text-purple-100 text-lg mt-1">รหัสโรงเรียน: <span className="font-semibold text-white bg-white/20 px-3 py-0.5 rounded-full text-base">{school.code}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* School Info Card */}
        <Card className="p-6 mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {school.address && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-base">{school.address} {school.district} {school.province}</span>
                </div>
              )}
              {school.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-base">{school.phone}</span>
                </div>
              )}
              {school.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-base">{school.email}</span>
                </div>
              )}
              {school.website && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-amber-600" />
                  </div>
                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-base">
                    {school.website}
                  </a>
                </div>
              )}
            </div>
            <Dialog open={showEditSchool} onOpenChange={setShowEditSchool}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Edit className="w-4 h-4 mr-2" />
                  แก้ไข
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>แก้ไขข้อมูลโรงเรียน</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Logo Upload */}
                  <div className="col-span-2">
                    <Label className="text-base">โลโก้โรงเรียน</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 flex items-center justify-center overflow-hidden">
                        {(logoPreview || school?.logo_url) ? (
                          <img src={logoPreview || school?.logo_url || ''} alt="โลโก้" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-purple-300" />
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${uploadingLogo ? 'bg-gray-200 text-gray-500' : 'bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer'}`}>
                            <Upload className="w-4 h-4" />
                            {uploadingLogo ? 'กำลังอัปโหลด...' : 'เลือกรูปโลโก้'}
                          </span>
                        </label>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG สูงสุด 5MB</p>
                      </div>
                    </div>
                  </div>
                  {/* Background Upload */}
                  <div className="col-span-2">
                    <Label className="text-base">ภาพพื้นหลัง (Background)</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-32 h-20 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50 flex items-center justify-center overflow-hidden">
                        {(backgroundPreview || school?.background_url) ? (
                          <img src={backgroundPreview || school?.background_url || ''} alt="พื้นหลัง" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-indigo-300" />
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackgroundUpload}
                            className="hidden"
                          />
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${uploadingBackground ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 cursor-pointer'}`}>
                            <Upload className="w-4 h-4" />
                            {uploadingBackground ? 'กำลังอัปโหลด...' : 'เลือกภาพพื้นหลัง'}
                          </span>
                        </label>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG สูงสุด 10MB</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>ชื่อโรงเรียน</Label>
                    <Input
                      value={editSchoolData.name}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>รหัสโรงเรียน</Label>
                    <Input
                      value={editSchoolData.code}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, code: e.target.value.toUpperCase() })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>เบอร์โทร</Label>
                    <Input
                      value={editSchoolData.phone}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>อีเมล</Label>
                    <Input
                      value={editSchoolData.email}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>เว็บไซต์</Label>
                    <Input
                      value={editSchoolData.website}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, website: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>ที่อยู่</Label>
                    <Input
                      value={editSchoolData.address}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, address: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>อำเภอ/เขต</Label>
                    <Input
                      value={editSchoolData.district}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, district: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>จังหวัด</Label>
                    <Input
                      value={editSchoolData.province}
                      onChange={(e) => setEditSchoolData({ ...editSchoolData, province: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="ghost" onClick={() => setShowEditSchool(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleUpdateSchool} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    บันทึก
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="classes" className="space-y-5">
          <TabsList className="bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl shadow-md border-0 h-auto gap-1">
            <TabsTrigger value="classes" className="rounded-xl px-5 py-3 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              <GraduationCap className="w-5 h-5 mr-2" />
              ห้องเรียน ({classes.length})
            </TabsTrigger>
            <TabsTrigger value="teachers" className="rounded-xl px-5 py-3 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              <GraduationCap className="w-5 h-5 mr-2" />
              ครู ({members.filter(m => m.role === 'teacher' || m.role === 'school_admin').length})
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-xl px-5 py-3 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
              <Users className="w-5 h-5 mr-2" />
              นักเรียน ({members.filter(m => m.role === 'student').length})
            </TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                  </span>
                  ห้องเรียนทั้งหมด
                </h2>
                <Dialog open={showCreateClass} onOpenChange={setShowCreateClass}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-md text-base">
                      <Plus className="w-5 h-5 mr-2" />
                      เพิ่มห้องเรียน
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="font-sarabun">
                    <DialogHeader>
                      <DialogTitle className="text-xl">สร้างห้องเรียนใหม่</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 mt-4">
                      <div>
                        <Label className="text-base">ชื่อห้องเรียน *</Label>
                        <Input
                          value={newClass.name}
                          onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                          placeholder="เช่น ป.1/1"
                          className="mt-1 text-base"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base">ระดับชั้น</Label>
                          <Select
                            value={newClass.grade.toString()}
                            onValueChange={(v) => setNewClass({ ...newClass, grade: parseInt(v) })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5,6].map(g => (
                                <SelectItem key={g} value={g.toString()}>ป.{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-base">ปีการศึกษา</Label>
                          <Input
                            type="number"
                            value={newClass.academic_year}
                            onChange={(e) => setNewClass({ ...newClass, academic_year: parseInt(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-base">ภาคเรียน</Label>
                          <Select
                            value={newClass.semester.toString()}
                            onValueChange={(v) => setNewClass({ ...newClass, semester: parseInt(v) })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">ภาคเรียนที่ 1</SelectItem>
                              <SelectItem value="2">ภาคเรียนที่ 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-base">จำนวนนักเรียนสูงสุด</Label>
                          <Input
                            type="number"
                            value={newClass.max_students}
                            onChange={(e) => setNewClass({ ...newClass, max_students: parseInt(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      {teachers.length > 0 && (
                        <div>
                          <Label className="text-base">ครูประจำชั้น</Label>
                          <Select
                            value={newClass.teacher_id}
                            onValueChange={(v) => setNewClass({ ...newClass, teacher_id: v })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="เลือกครูประจำชั้น" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.nickname}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={() => setShowCreateClass(false)}>
                        ยกเลิก
                      </Button>
                      <Button onClick={handleCreateClass} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        สร้างห้องเรียน
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-emerald-300" />
                  </div>
                  <p className="text-lg text-gray-500">ยังไม่มีห้องเรียน</p>
                  <p className="text-sm text-gray-400 mt-1">กดปุ่ม "เพิ่มห้องเรียน" เพื่อเริ่มต้น</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map(cls => (
                    <Card 
                      key={cls.id} 
                      className="p-5 border-0 cursor-pointer hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50 shadow-md group hover:-translate-y-1 border-t-4 border-t-emerald-400"
                      onClick={() => openClassManagement(cls)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{cls.name}</h3>
                          <p className="text-base text-gray-600 mt-1">ป.{cls.grade} • ปีการศึกษา {cls.academic_year}</p>
                          {cls.teacher_name && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5" />
                              ครู: {cls.teacher_name}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls.id, cls.name);
                          }}
                          className="text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-semibold">{cls.student_count || 0} / {cls.max_students || 40} คน</span>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-500 font-medium group-hover:text-emerald-700 transition-colors">จัดการ →</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-violet-600" />
                  </span>
                  ครูทั้งหมด
                </h2>
                <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl shadow-md text-base" onClick={() => setNewMember({ email: '', role: 'teacher' })}>
                      <UserPlus className="w-5 h-5 mr-2" />
                      เพิ่มครู
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="font-sarabun">
                    <DialogHeader>
                      <DialogTitle className="text-xl">เพิ่มสมาชิกใหม่</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 mt-4">
                      <div>
                        <Label className="text-base">อีเมลผู้ใช้ *</Label>
                        <Input
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                          placeholder="user@email.com"
                          className="mt-1 text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-base">ตำแหน่ง</Label>
                        <Select
                          value={newMember.role}
                          onValueChange={(v) => setNewMember({ ...newMember, role: v as any })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="school_admin">ผู้ดูแลโรงเรียน</SelectItem>
                            <SelectItem value="teacher">ครู</SelectItem>
                            <SelectItem value="student">นักเรียน</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="ghost" onClick={() => setShowAddMember(false)}>
                        ยกเลิก
                      </Button>
                      <Button onClick={handleAddMember} className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                        เพิ่มสมาชิก
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {members.filter(m => m.role === 'teacher' || m.role === 'school_admin').length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-50 flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-violet-300" />
                  </div>
                  <p className="text-lg text-gray-500">ยังไม่มีครู</p>
                  <p className="text-sm text-gray-400 mt-1">กดปุ่ม "เพิ่มครู" เพื่อเพิ่มครูในโรงเรียน</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.filter(m => m.role === 'teacher' || m.role === 'school_admin').map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl border-0 bg-gradient-to-r from-white to-violet-50/50 shadow-sm hover:shadow-md transition-all border-l-4 border-l-violet-400">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-2xl shadow-md">
                          {member.user_avatar || '👤'}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{member.user_nickname || 'ไม่ระบุชื่อ'}</p>
                          <p className="text-sm text-gray-500">{member.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 text-sm rounded-xl border font-semibold ${getRoleBadgeColor(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.user_nickname || '')}
                          className="text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-sky-600" />
                  </span>
                  นักเรียนทั้งหมด
                </h2>
                <Button className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-xl shadow-md text-base" onClick={() => { setNewMember({ email: '', role: 'student' }); setShowAddMember(true); }}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  เพิ่มนักเรียน
                </Button>
              </div>
              
              {members.filter(m => m.role === 'student').length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-50 flex items-center justify-center">
                    <Users className="w-10 h-10 text-sky-300" />
                  </div>
                  <p className="text-lg text-gray-500">ยังไม่มีนักเรียน</p>
                  <p className="text-sm text-gray-400 mt-1">กดปุ่ม "เพิ่มนักเรียน" หรือเพิ่มผ่านห้องเรียน</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.filter(m => m.role === 'student').map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl border-0 bg-gradient-to-r from-white to-sky-50/50 shadow-sm hover:shadow-md transition-all border-l-4 border-l-sky-400">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-2xl shadow-md">
                          {member.user_avatar || '👤'}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{member.user_nickname || 'ไม่ระบุชื่อ'}</p>
                          <p className="text-sm text-gray-500">{member.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 text-sm rounded-xl border font-semibold ${getRoleBadgeColor(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id, member.user_nickname || '')}
                          className="text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Class Management Dialog */}
        <Dialog open={showClassManagement} onOpenChange={setShowClassManagement}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                จัดการห้องเรียน: {selectedClass?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedClass && (
              <div className="space-y-6 mt-4">
                {/* Class Info */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">ระดับชั้น:</span> ป.{selectedClass.grade}</div>
                    <div><span className="text-gray-500">ปีการศึกษา:</span> {selectedClass.academic_year}</div>
                    <div><span className="text-gray-500">ภาคเรียน:</span> {selectedClass.semester}</div>
                    <div><span className="text-gray-500">ครูประจำชั้น:</span> {selectedClass.teacher_name || '-'}</div>
                  </div>
                </div>

                {/* Add Student Form */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    เพิ่มนักเรียน
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      placeholder="อีเมลนักเรียน"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={newStudentNumber}
                      onChange={(e) => setNewStudentNumber(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="เลขที่"
                      className="w-20"
                    />
                    <Button onClick={handleAddStudentToClass} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-1" />
                      เพิ่ม
                    </Button>
                  </div>
                </div>

                {/* Student List */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    รายชื่อนักเรียน ({classStudents.length} คน)
                  </h3>
                  
                  {loadingStudents ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                  ) : classStudents.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>ยังไม่มีนักเรียนในห้องนี้</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">เลขที่</TableHead>
                          <TableHead>ชื่อ</TableHead>
                          <TableHead>อีเมล</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.student_number || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{student.student_avatar || '👤'}</span>
                                {student.student_nickname || 'ไม่ระบุชื่อ'}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-500 text-sm">
                              {student.student_email}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStudentFromClass(student.id, student.student_nickname || '')}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      </div>
    </div>
  );
};

export default AdminSchoolManagement;
