import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  School, 
  Users, 
  GraduationCap, 
  Building2, 
  Plus, 
  Settings, 
  Trash2,
  UserPlus,
  BookOpen,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  BarChart3,
  Save
} from 'lucide-react';
import ManualDownloader from '@/components/ManualDownloader';
import ClassStudentManager from '@/components/ClassStudentManager';
import BatchStudentImport from '@/components/BatchStudentImport';

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get user ID from localStorage
  const authData = localStorage.getItem('kidfast_auth');
  const userId = authData ? JSON.parse(authData).registrationId : null;
  
  const {
    isLoading,
    userSchools,
    selectedSchool,
    setSelectedSchool,
    classes,
    members,
    fetchUserSchools,
    fetchClasses,
    fetchMembers,
    createSchool,
    updateSchool,
    createClass,
    updateClass,
    deleteClass,
    addMember,
    removeMember,
  } = useSchoolAdmin(userId);

  // Form states
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditSchool, setShowEditSchool] = useState(false);
  const [managingClassId, setManagingClassId] = useState<string | null>(null);
  const [managingClassName, setManagingClassName] = useState('');
  const [teachers, setTeachers] = useState<{id: string; nickname: string}[]>([]);
  
  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    address: '',
    district: '',
    province: '',
    phone: '',
    email: '',
    website: '',
  });
  
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

  // Fetch teachers when school changes
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!selectedSchool) return;
      
      const teacherMembers = members.filter(m => m.role === 'teacher' || m.role === 'school_admin');
      const teacherData = teacherMembers.map(m => ({
        id: m.user_id,
        nickname: m.user_nickname || 'ไม่ระบุชื่อ',
      }));
      setTeachers(teacherData);
    };
    
    fetchTeachers();
  }, [selectedSchool, members]);

  // Update edit school data when selected school changes
  useEffect(() => {
    if (selectedSchool) {
      setEditSchoolData({
        name: selectedSchool.name || '',
        code: selectedSchool.code || '',
        address: selectedSchool.address || '',
        district: selectedSchool.district || '',
        province: selectedSchool.province || '',
        phone: selectedSchool.phone || '',
        email: selectedSchool.email || '',
        website: selectedSchool.website || '',
      });
    }
  }, [selectedSchool]);

  const handleCreateSchool = async () => {
    try {
      if (!newSchool.name || !newSchool.code) {
        toast({
          title: 'กรุณากรอกข้อมูล',
          description: 'ชื่อโรงเรียนและรหัสโรงเรียนจำเป็นต้องกรอก',
          variant: 'destructive',
        });
        return;
      }
      
      await createSchool(newSchool);
      setShowCreateSchool(false);
      setNewSchool({
        name: '',
        code: '',
        address: '',
        district: '',
        province: '',
        phone: '',
        email: '',
        website: '',
      });
      toast({
        title: 'สร้างโรงเรียนสำเร็จ',
        description: `โรงเรียน ${newSchool.name} ถูกสร้างเรียบร้อยแล้ว`,
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถสร้างโรงเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const handleCreateClass = async () => {
    try {
      if (!newClass.name) {
        toast({
          title: 'กรุณากรอกข้อมูล',
          description: 'ชื่อห้องเรียนจำเป็นต้องกรอก',
          variant: 'destructive',
        });
        return;
      }
      
      await createClass(newClass);
      setShowCreateClass(false);
      setNewClass({
        name: '',
        grade: 1,
        academic_year: new Date().getFullYear() + 543,
        semester: 1,
        max_students: 40,
        teacher_id: '',
      });
      toast({
        title: 'สร้างห้องเรียนสำเร็จ',
        description: `ห้องเรียน ${newClass.name} ถูกสร้างเรียบร้อยแล้ว`,
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถสร้างห้องเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const handleAddMember = async () => {
    try {
      if (!newMember.email) {
        toast({
          title: 'กรุณากรอกข้อมูล',
          description: 'อีเมลผู้ใช้จำเป็นต้องกรอก',
          variant: 'destructive',
        });
        return;
      }
      
      await addMember(newMember.email, newMember.role);
      setShowAddMember(false);
      setNewMember({ email: '', role: 'teacher' });
      toast({
        title: 'เพิ่มสมาชิกสำเร็จ',
        description: 'เพิ่มสมาชิกใหม่เข้าโรงเรียนเรียบร้อยแล้ว',
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถเพิ่มสมาชิกได้',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`ยืนยันการลบห้องเรียน "${className}"?`)) return;
    
    try {
      await deleteClass(classId);
      toast({
        title: 'ลบห้องเรียนสำเร็จ',
        description: `ห้องเรียน ${className} ถูกลบเรียบร้อยแล้ว`,
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถลบห้องเรียนได้',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (membershipId: string, memberName: string) => {
    if (!confirm(`ยืนยันการลบ "${memberName}" ออกจากโรงเรียน?`)) return;
    
    try {
      await removeMember(membershipId);
      toast({
        title: 'ลบสมาชิกสำเร็จ',
        description: `${memberName} ถูกลบออกจากโรงเรียนเรียบร้อยแล้ว`,
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถลบสมาชิกได้',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateSchool = async () => {
    if (!selectedSchool) return;
    
    try {
      await updateSchool(selectedSchool.id, editSchoolData);
      setShowEditSchool(false);
      toast({
        title: 'บันทึกสำเร็จ',
        description: 'ข้อมูลโรงเรียนถูกอัปเดตเรียบร้อยแล้ว',
      });
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถบันทึกข้อมูลได้',
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
      case 'school_admin': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700';
      case 'teacher': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700';
      case 'student': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-600';
    }
  };

  // Common style classes for light/dark support
  const pageBackground = 'bg-orange-50/50 dark:bg-neutral-950';
  const cardStyle = 'bg-orange-50 border-orange-200/60 shadow-sm dark:bg-neutral-800 dark:border-neutral-700';
  const cardInnerStyle = 'bg-white border-orange-200/50 dark:bg-neutral-900 dark:border-neutral-700';
  const textPrimary = 'text-neutral-900 dark:text-white';
  const textSecondary = 'text-amber-800 dark:text-neutral-300';
  const textMuted = 'text-amber-700/60 dark:text-neutral-400';
  const borderStyle = 'border-orange-200/60 dark:border-neutral-700';
  const inputStyle = 'bg-white border-orange-300 text-neutral-900 dark:bg-neutral-900 dark:border-neutral-600 dark:text-white';
  const labelStyle = 'text-amber-900 dark:text-neutral-200';
  const dialogStyle = 'bg-white border-orange-200 dark:bg-neutral-800 dark:border-neutral-700';
  const selectContentStyle = 'bg-white border-orange-200 dark:bg-neutral-800 dark:border-neutral-700';
  const selectItemStyle = 'text-neutral-900 dark:text-white hover:bg-orange-100 dark:hover:bg-neutral-700';
  const cancelBtnStyle = 'text-amber-700 hover:text-amber-900 dark:text-neutral-400 dark:hover:text-white';

  if (isLoading) {
    return (
      <div className={`min-h-screen ${pageBackground} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageBackground} font-sarabun`}>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section with School Branding */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4">
            {selectedSchool?.logo_url && (
              <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 ${borderStyle} shadow-lg bg-white dark:bg-white/10`}>
                <img src={selectedSchool.logo_url} alt={selectedSchool.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className={`text-3xl font-bold ${textPrimary} mb-1`}>
                🏫 ระบบบริหารจัดการโรงเรียน
              </h1>
              <p className={textSecondary}>
                {selectedSchool ? selectedSchool.name : 'จัดการโรงเรียน ห้องเรียน และสมาชิก'}
              </p>
            </div>
          </div>
          
          {/* Navigation Buttons + Theme Toggle */}
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <ThemeToggle />
            <ManualDownloader 
              defaultManual="school-admin" 
              showDropdown={false}
              buttonVariant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
            />
            {selectedSchool && (
              <Button
                onClick={() => navigate('/school-admin/analytics')}
                className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-full"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                ดูสถิติโรงเรียน
              </Button>
            )}
          </div>
          {/* School Selector - only show if multiple schools */}
          {userSchools.length > 1 && (
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <Select
                value={selectedSchool?.id || ''}
                onValueChange={(value) => {
                  const school = userSchools.find(s => s.id === value);
                  if (school) setSelectedSchool(school);
                }}
              >
                <SelectTrigger className={`w-[280px] ${inputStyle}`}>
                  <SelectValue placeholder="เลือกโรงเรียน" />
                </SelectTrigger>
                <SelectContent className={selectContentStyle}>
                  {userSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id} className={selectItemStyle}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* No Schools State */}
        {userSchools.length === 0 && (
          <Card className={`${cardStyle} p-12 text-center`}>
            <Building2 className={`w-16 h-16 ${textMuted} mx-auto mb-4`} />
            <h2 className={`text-xl font-semibold ${textPrimary} mb-2`}>ยังไม่มีโรงเรียนที่เชื่อมต่อ</h2>
            <p className={`${textSecondary} mb-6`}>กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มบัญชีของคุณเข้าโรงเรียน</p>
          </Card>
        )}

        {/* School Dashboard */}
        {selectedSchool && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className={`${cardStyle} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                    <Building2 className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                  </div>
                  <div>
                    <p className={`${textSecondary} text-sm`}>โรงเรียน</p>
                    <p className={`text-xl font-bold ${textPrimary}`}>{selectedSchool.name}</p>
                  </div>
                </div>
              </Card>
              
              <Card className={`${cardStyle} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className={`${textSecondary} text-sm`}>ครูทั้งหมด</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>{selectedSchool.teacher_count || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className={`${cardStyle} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-orange-700 dark:text-orange-300" />
                  </div>
                  <div>
                    <p className={`${textSecondary} text-sm`}>นักเรียนทั้งหมด</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>{selectedSchool.student_count || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className={`${cardStyle} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                    <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div>
                    <p className={`${textSecondary} text-sm`}>ห้องเรียน</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>{selectedSchool.class_count || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Divider */}
            <div className={`border-t ${borderStyle} mb-6`} />

            {/* Tabs */}
            <Tabs defaultValue="classes" className="space-y-6">
              <TabsList className={`bg-orange-100/60 border ${borderStyle} dark:bg-neutral-800`}>
                <TabsTrigger value="classes" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  ห้องเรียน ({classes.length})
                </TabsTrigger>
                <TabsTrigger value="teachers" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  ครู ({members.filter(m => m.role === 'teacher' || m.role === 'school_admin').length})
                </TabsTrigger>
                <TabsTrigger value="students" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  นักเรียน ({members.filter(m => m.role === 'student').length})
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-amber-800 data-[state=active]:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  ตั้งค่า
                </TabsTrigger>
              </TabsList>

              {/* Classes Tab */}
              <TabsContent value="classes">
                {/* Show class student manager if a class is selected */}
                {managingClassId && selectedSchool ? (
                  <ClassStudentManager
                    classId={managingClassId}
                    className={managingClassName}
                    schoolId={selectedSchool.id}
                    onBack={() => setManagingClassId(null)}
                  />
                ) : (
                <Card className={cardStyle}>
                  <div className={`p-6 border-b ${borderStyle} flex items-center justify-between`}>
                    <h2 className={`text-xl font-semibold ${textPrimary}`}>ห้องเรียนทั้งหมด</h2>
                    <div className="flex gap-2">
                      {selectedSchool && (
                        <BatchStudentImport
                          schoolId={selectedSchool.id}
                          classes={classes.map(c => ({ id: c.id, name: c.name, grade: c.grade }))}
                          onComplete={() => {
                            fetchClasses();
                            fetchMembers();
                            fetchUserSchools();
                          }}
                        />
                      )}
                      <Dialog open={showCreateClass} onOpenChange={setShowCreateClass}>
                      <DialogTrigger asChild>
                        <Button className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-full">
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่มห้องเรียน
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={dialogStyle}>
                        <DialogHeader>
                          <DialogTitle className={textPrimary}>สร้างห้องเรียนใหม่</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label className={labelStyle}>ชื่อห้องเรียน *</Label>
                            <Input
                              value={newClass.name}
                              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                              className={`${inputStyle} mt-1`}
                              placeholder="เช่น ป.1/1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className={labelStyle}>ระดับชั้น</Label>
                              <Select
                                value={newClass.grade.toString()}
                                onValueChange={(value) => setNewClass({ ...newClass, grade: parseInt(value) })}
                              >
                                <SelectTrigger className={`${inputStyle} mt-1`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={selectContentStyle}>
                                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                                    <SelectItem key={grade} value={grade.toString()} className={selectItemStyle}>
                                      ป.{grade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className={labelStyle}>ภาคเรียน</Label>
                              <Select
                                value={newClass.semester.toString()}
                                onValueChange={(value) => setNewClass({ ...newClass, semester: parseInt(value) })}
                              >
                                <SelectTrigger className={`${inputStyle} mt-1`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className={selectContentStyle}>
                                  <SelectItem value="1" className={selectItemStyle}>ภาคเรียนที่ 1</SelectItem>
                                  <SelectItem value="2" className={selectItemStyle}>ภาคเรียนที่ 2</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className={labelStyle}>ปีการศึกษา</Label>
                              <Input
                                type="number"
                                value={newClass.academic_year}
                                onChange={(e) => setNewClass({ ...newClass, academic_year: parseInt(e.target.value) })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                            <div>
                              <Label className={labelStyle}>จำนวนนักเรียนสูงสุด</Label>
                              <Input
                                type="number"
                                value={newClass.max_students}
                                onChange={(e) => setNewClass({ ...newClass, max_students: parseInt(e.target.value) })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                          </div>
                          
                          {/* Teacher Selection */}
                          <div>
                            <Label className={labelStyle}>ครูประจำชั้น</Label>
                            <Select
                              value={newClass.teacher_id}
                              onValueChange={(value) => setNewClass({ ...newClass, teacher_id: value })}
                            >
                              <SelectTrigger className={`${inputStyle} mt-1`}>
                                <SelectValue placeholder="เลือกครูประจำชั้น (ไม่บังคับ)" />
                              </SelectTrigger>
                              <SelectContent className={selectContentStyle}>
                                <SelectItem value="" className={`${selectItemStyle} opacity-60`}>ไม่ระบุ</SelectItem>
                                {teachers.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id} className={selectItemStyle}>
                                    {teacher.nickname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <Button variant="ghost" onClick={() => setShowCreateClass(false)} className={cancelBtnStyle}>
                            ยกเลิก
                          </Button>
                          <Button onClick={handleCreateClass} className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-full">
                            สร้างห้องเรียน
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {classes.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className={`w-12 h-12 ${textMuted} mx-auto mb-4`} />
                        <p className={textSecondary}>ยังไม่มีห้องเรียน</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((cls) => (
                          <Card key={cls.id} className={`${cardInnerStyle} p-4 hover:border-primary/50 transition-colors`}>
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className={`text-lg font-semibold ${textPrimary}`}>{cls.name}</h3>
                                <p className={`${textSecondary} text-sm`}>ป.{cls.grade} • ปีการศึกษา {cls.academic_year}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className={`h-8 w-8 ${textMuted} hover:text-foreground`}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={`h-8 w-8 ${textMuted} hover:text-red-600 dark:hover:text-red-400`}
                                  onClick={() => handleDeleteClass(cls.id, cls.name)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm mb-3">
                              <div className={`flex items-center gap-2 ${textSecondary}`}>
                                <Users className="w-4 h-4" />
                                <span>{cls.student_count || 0} / {cls.max_students} คน</span>
                              </div>
                              {cls.teacher_name && (
                                <span className="text-orange-600 dark:text-orange-400">ครู: {cls.teacher_name}</span>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-orange-400/50 text-orange-700 hover:bg-orange-50 dark:border-orange-500/30 dark:text-orange-300 dark:hover:bg-orange-500/20"
                              onClick={() => {
                                setManagingClassId(cls.id);
                                setManagingClassName(cls.name);
                              }}
                            >
                              <Users className="w-3.5 h-3.5 mr-1.5" />
                              จัดการนักเรียน
                            </Button>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
                )}
              </TabsContent>

              {/* Teachers Tab */}
              <TabsContent value="teachers">
                <Card className={cardStyle}>
                  <div className={`p-6 border-b ${borderStyle} flex items-center justify-between`}>
                    <h2 className={`text-xl font-semibold ${textPrimary}`}>👩‍🏫 ครูและผู้ดูแล</h2>
                    <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                      <DialogTrigger asChild>
                        <Button className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-full" onClick={() => setNewMember({ email: '', role: 'teacher' })}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          เพิ่มครู
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={dialogStyle}>
                        <DialogHeader>
                          <DialogTitle className={textPrimary}>เพิ่มสมาชิกใหม่</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label className={labelStyle}>อีเมลผู้ใช้ *</Label>
                            <Input
                              type="email"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                              className={`${inputStyle} mt-1`}
                              placeholder="teacher@email.com"
                            />
                          </div>
                          <div>
                            <Label className={labelStyle}>บทบาท</Label>
                            <Select
                              value={newMember.role}
                              onValueChange={(value: 'school_admin' | 'teacher' | 'student') => 
                                setNewMember({ ...newMember, role: value })
                              }
                            >
                              <SelectTrigger className={`${inputStyle} mt-1`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className={selectContentStyle}>
                                <SelectItem value="teacher" className={selectItemStyle}>ครู</SelectItem>
                                <SelectItem value="school_admin" className={selectItemStyle}>ผู้ดูแลโรงเรียน</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <Button variant="ghost" onClick={() => setShowAddMember(false)} className={cancelBtnStyle}>
                            ยกเลิก
                          </Button>
                          <Button onClick={handleAddMember} className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-full">
                            เพิ่มสมาชิก
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="p-6">
                    {members.filter(m => m.role === 'teacher' || m.role === 'school_admin').length === 0 ? (
                      <div className="text-center py-12">
                        <GraduationCap className={`w-12 h-12 ${textMuted} mx-auto mb-4`} />
                        <p className={textSecondary}>ยังไม่มีครูในโรงเรียน</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {members.filter(m => m.role === 'teacher' || m.role === 'school_admin').map((member) => (
                          <div key={member.id} className={`flex items-center justify-between p-4 rounded-lg border ${cardInnerStyle} hover:border-orange-400/50 transition-colors`}>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">{member.user_avatar || '👩‍🏫'}</span>
                              </div>
                              <div>
                                <p className={`${textPrimary} font-medium`}>{member.user_nickname || 'ไม่ระบุชื่อ'}</p>
                                <p className={`${textSecondary} text-sm`}>{member.user_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm border ${getRoleBadgeColor(member.role)}`}>
                                {getRoleLabel(member.role)}
                              </span>
                              {member.role !== 'school_admin' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={`h-8 w-8 ${textMuted} hover:text-red-600 dark:hover:text-red-400`}
                                  onClick={() => handleRemoveMember(member.id, member.user_nickname || '')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students">
                <Card className={cardStyle}>
                  <div className={`p-6 border-b ${borderStyle} flex items-center justify-between`}>
                    <h2 className={`text-xl font-semibold ${textPrimary}`}>👨‍🎓 นักเรียน</h2>
                    <Button className="bg-amber-800 hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600 text-white rounded-full" onClick={() => {
                      setNewMember({ email: '', role: 'student' });
                      setShowAddMember(true);
                    }}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      เพิ่มนักเรียน
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    {members.filter(m => m.role === 'student').length === 0 ? (
                      <div className="text-center py-12">
                        <Users className={`w-12 h-12 ${textMuted} mx-auto mb-4`} />
                        <p className={textSecondary}>ยังไม่มีนักเรียนในโรงเรียน</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {members.filter(m => m.role === 'student').map((member) => (
                          <div key={member.id} className={`flex items-center justify-between p-4 rounded-lg border ${cardInnerStyle} hover:border-amber-400/50 transition-colors`}>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">{member.user_avatar || '👨‍🎓'}</span>
                              </div>
                              <div>
                                <p className={`${textPrimary} font-medium`}>{member.user_nickname || 'ไม่ระบุชื่อ'}</p>
                                <p className={`${textSecondary} text-sm`}>{member.user_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm border ${getRoleBadgeColor(member.role)}`}>
                                {getRoleLabel(member.role)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`h-8 w-8 ${textMuted} hover:text-red-600 dark:hover:text-red-400`}
                                onClick={() => handleRemoveMember(member.id, member.user_nickname || '')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className={cardStyle}>
                  <div className={`p-6 border-b ${borderStyle}`}>
                    <h2 className={`text-xl font-semibold ${textPrimary}`}>ข้อมูลโรงเรียน</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                          <Building2 className="w-5 h-5 text-orange-700 dark:text-orange-300" />
                        </div>
                        <div>
                          <p className={`${textSecondary} text-sm`}>ชื่อโรงเรียน</p>
                          <p className={textPrimary}>{selectedSchool.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                          <School className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                        </div>
                        <div>
                          <p className={`${textSecondary} text-sm`}>รหัสโรงเรียน</p>
                          <p className={textPrimary}>{selectedSchool.code}</p>
                        </div>
                      </div>
                      
                      {selectedSchool.email && (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                            <Mail className="w-5 h-5 text-orange-700 dark:text-orange-300" />
                          </div>
                          <div>
                            <p className={`${textSecondary} text-sm`}>อีเมล</p>
                            <p className={textPrimary}>{selectedSchool.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedSchool.phone && (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                            <Phone className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                          </div>
                          <div>
                            <p className={`${textSecondary} text-sm`}>เบอร์โทร</p>
                            <p className={textPrimary}>{selectedSchool.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedSchool.address && (
                        <div className="flex items-start gap-4 col-span-2">
                          <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                            <MapPin className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                          </div>
                          <div>
                            <p className={`${textSecondary} text-sm`}>ที่อยู่</p>
                            <p className={textPrimary}>
                              {selectedSchool.address}
                              {selectedSchool.district && `, ${selectedSchool.district}`}
                              {selectedSchool.province && `, ${selectedSchool.province}`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedSchool.website && (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
                            <Globe className="w-5 h-5 text-orange-700 dark:text-orange-300" />
                          </div>
                          <div>
                            <p className={`${textSecondary} text-sm`}>เว็บไซต์</p>
                            <a href={selectedSchool.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                              {selectedSchool.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`pt-6 border-t ${borderStyle}`}>
                      <Dialog open={showEditSchool} onOpenChange={setShowEditSchool}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                            <Edit className="w-4 h-4 mr-2" />
                            แก้ไขข้อมูลโรงเรียน
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={`${dialogStyle} max-w-2xl`}>
                          <DialogHeader>
                            <DialogTitle className={textPrimary}>แก้ไขข้อมูลโรงเรียน</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="col-span-2">
                              <Label className={labelStyle}>ชื่อโรงเรียน</Label>
                              <Input
                                value={editSchoolData.name}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, name: e.target.value })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                            <div>
                              <Label className={labelStyle}>รหัสโรงเรียน</Label>
                              <Input
                                value={editSchoolData.code}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, code: e.target.value.toUpperCase() })}
                                className={`${inputStyle} mt-1`}
                                disabled
                              />
                            </div>
                            <div>
                              <Label className={labelStyle}>เบอร์โทร</Label>
                              <Input
                                value={editSchoolData.phone}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, phone: e.target.value })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                            <div>
                              <Label className={labelStyle}>อีเมล</Label>
                              <Input
                                value={editSchoolData.email}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, email: e.target.value })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                            <div>
                              <Label className={labelStyle}>เว็บไซต์</Label>
                              <Input
                                value={editSchoolData.website}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, website: e.target.value })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className={labelStyle}>ที่อยู่</Label>
                              <Input
                                value={editSchoolData.address}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, address: e.target.value })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                            <div>
                              <Label className={labelStyle}>อำเภอ/เขต</Label>
                              <Input
                                value={editSchoolData.district}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, district: e.target.value })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                            <div>
                              <Label className={labelStyle}>จังหวัด</Label>
                              <Input
                                value={editSchoolData.province}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, province: e.target.value })}
                                className={`${inputStyle} mt-1`}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowEditSchool(false)} className={cancelBtnStyle}>
                              ยกเลิก
                            </Button>
                            <Button onClick={handleUpdateSchool} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Save className="w-4 h-4 mr-2" />
                              บันทึก
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SchoolAdminDashboard;
