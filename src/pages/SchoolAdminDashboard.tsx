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
      case 'school_admin': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'teacher': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'student': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🏫 ระบบบริหารจัดการโรงเรียน
            </h1>
            <p className="text-slate-400">จัดการโรงเรียน ห้องเรียน และสมาชิก</p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <ManualDownloader 
              defaultManual="school-admin" 
              showDropdown={false}
              buttonVariant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            />
            {selectedSchool && (
              <Button
                onClick={() => navigate('/school-admin/analytics')}
                className="bg-slate-700 hover:bg-slate-600"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                ดูสถิติโรงเรียน
              </Button>
            )}
          </div>
          
          {/* School Selector */}
          {userSchools.length > 0 && (
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <Select
                value={selectedSchool?.id || ''}
                onValueChange={(value) => {
                  const school = userSchools.find(s => s.id === value);
                  if (school) setSelectedSchool(school);
                }}
              >
                <SelectTrigger className="w-[280px] bg-slate-800/90 border-slate-700 text-white">
                  <SelectValue placeholder="เลือกโรงเรียน" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {userSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id} className="text-white hover:bg-slate-700">
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={showCreateSchool} onOpenChange={setShowCreateSchool}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มโรงเรียน
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">สร้างโรงเรียนใหม่</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="col-span-2">
                      <Label className="text-slate-300">ชื่อโรงเรียน *</Label>
                      <Input
                        value={newSchool.name}
                        onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="โรงเรียน..."
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">รหัสโรงเรียน *</Label>
                      <Input
                        value={newSchool.code}
                        onChange={(e) => setNewSchool({ ...newSchool, code: e.target.value.toUpperCase() })}
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="SCHOOL001"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">เบอร์โทร</Label>
                      <Input
                        value={newSchool.phone}
                        onChange={(e) => setNewSchool({ ...newSchool, phone: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="02-xxx-xxxx"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">อีเมล</Label>
                      <Input
                        value={newSchool.email}
                        onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="school@email.com"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">เว็บไซต์</Label>
                      <Input
                        value={newSchool.website}
                        onChange={(e) => setNewSchool({ ...newSchool, website: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-slate-300">ที่อยู่</Label>
                      <Input
                        value={newSchool.address}
                        onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                        placeholder="ที่อยู่โรงเรียน"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">อำเภอ/เขต</Label>
                      <Input
                        value={newSchool.district}
                        onChange={(e) => setNewSchool({ ...newSchool, district: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">จังหวัด</Label>
                      <Input
                        value={newSchool.province}
                        onChange={(e) => setNewSchool({ ...newSchool, province: e.target.value })}
                        className="bg-slate-900 border-slate-600 text-white mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowCreateSchool(false)} className="text-slate-400">
                      ยกเลิก
                    </Button>
                    <Button onClick={handleCreateSchool} className="bg-purple-600 hover:bg-purple-700">
                      สร้างโรงเรียน
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* No Schools State */}
        {userSchools.length === 0 && (
          <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">ยังไม่มีโรงเรียน</h2>
            <p className="text-slate-400 mb-6">สร้างโรงเรียนใหม่เพื่อเริ่มต้นใช้งาน</p>
            <Dialog open={showCreateSchool} onOpenChange={setShowCreateSchool}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  สร้างโรงเรียนใหม่
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        )}

        {/* School Dashboard */}
        {selectedSchool && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">โรงเรียน</p>
                    <p className="text-xl font-bold text-white">{selectedSchool.name}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">ครูทั้งหมด</p>
                    <p className="text-2xl font-bold text-white">{selectedSchool.teacher_count || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">นักเรียนทั้งหมด</p>
                    <p className="text-2xl font-bold text-white">{selectedSchool.student_count || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-slate-800/80 backdrop-blur border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <BookOpen className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">ห้องเรียน</p>
                    <p className="text-2xl font-bold text-white">{selectedSchool.class_count || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="classes" className="space-y-6">
              <TabsList className="bg-slate-800/80 border border-slate-700">
                <TabsTrigger value="classes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  ห้องเรียน
                </TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  สมาชิก
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  ตั้งค่าโรงเรียน
                </TabsTrigger>
              </TabsList>

              {/* Classes Tab */}
              <TabsContent value="classes">
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
                  <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">ห้องเรียนทั้งหมด</h2>
                    <Dialog open={showCreateClass} onOpenChange={setShowCreateClass}>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          เพิ่มห้องเรียน
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">สร้างห้องเรียนใหม่</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label className="text-slate-300">ชื่อห้องเรียน *</Label>
                            <Input
                              value={newClass.name}
                              onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                              className="bg-slate-900 border-slate-600 text-white mt-1"
                              placeholder="เช่น ป.1/1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-slate-300">ระดับชั้น</Label>
                              <Select
                                value={newClass.grade.toString()}
                                onValueChange={(value) => setNewClass({ ...newClass, grade: parseInt(value) })}
                              >
                                <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                                    <SelectItem key={grade} value={grade.toString()} className="text-white">
                                      ป.{grade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-slate-300">ภาคเรียน</Label>
                              <Select
                                value={newClass.semester.toString()}
                                onValueChange={(value) => setNewClass({ ...newClass, semester: parseInt(value) })}
                              >
                                <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                  <SelectItem value="1" className="text-white">ภาคเรียนที่ 1</SelectItem>
                                  <SelectItem value="2" className="text-white">ภาคเรียนที่ 2</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-slate-300">ปีการศึกษา</Label>
                              <Input
                                type="number"
                                value={newClass.academic_year}
                                onChange={(e) => setNewClass({ ...newClass, academic_year: parseInt(e.target.value) })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300">จำนวนนักเรียนสูงสุด</Label>
                              <Input
                                type="number"
                                value={newClass.max_students}
                                onChange={(e) => setNewClass({ ...newClass, max_students: parseInt(e.target.value) })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                          </div>
                          
                          {/* Teacher Selection */}
                          <div>
                            <Label className="text-slate-300">ครูประจำชั้น</Label>
                            <Select
                              value={newClass.teacher_id}
                              onValueChange={(value) => setNewClass({ ...newClass, teacher_id: value })}
                            >
                              <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                                <SelectValue placeholder="เลือกครูประจำชั้น (ไม่บังคับ)" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="" className="text-slate-400">ไม่ระบุ</SelectItem>
                                {teachers.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id} className="text-white">
                                    {teacher.nickname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <Button variant="ghost" onClick={() => setShowCreateClass(false)} className="text-slate-400">
                            ยกเลิก
                          </Button>
                          <Button onClick={handleCreateClass} className="bg-purple-600 hover:bg-purple-700">
                            สร้างห้องเรียน
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="p-6">
                    {classes.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">ยังไม่มีห้องเรียน</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((cls) => (
                          <Card key={cls.id} className="bg-slate-900/50 border-slate-700 p-4 hover:border-purple-500/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{cls.name}</h3>
                                <p className="text-slate-400 text-sm">ป.{cls.grade} • ปีการศึกษา {cls.academic_year}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-400 hover:text-red-400"
                                  onClick={() => handleDeleteClass(cls.id, cls.name)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Users className="w-4 h-4" />
                                <span>{cls.student_count || 0} / {cls.max_students} คน</span>
                              </div>
                              {cls.teacher_name && (
                                <span className="text-blue-400">ครู: {cls.teacher_name}</span>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members">
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
                  <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">สมาชิกทั้งหมด</h2>
                    <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <UserPlus className="w-4 h-4 mr-2" />
                          เพิ่มสมาชิก
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">เพิ่มสมาชิกใหม่</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label className="text-slate-300">อีเมลผู้ใช้ *</Label>
                            <Input
                              type="email"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                              className="bg-slate-900 border-slate-600 text-white mt-1"
                              placeholder="user@email.com"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300">บทบาท</Label>
                            <Select
                              value={newMember.role}
                              onValueChange={(value: 'school_admin' | 'teacher' | 'student') => 
                                setNewMember({ ...newMember, role: value })
                              }
                            >
                              <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="teacher" className="text-white">ครู</SelectItem>
                                <SelectItem value="student" className="text-white">นักเรียน</SelectItem>
                                <SelectItem value="school_admin" className="text-white">ผู้ดูแลโรงเรียน</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                          <Button variant="ghost" onClick={() => setShowAddMember(false)} className="text-slate-400">
                            ยกเลิก
                          </Button>
                          <Button onClick={handleAddMember} className="bg-purple-600 hover:bg-purple-700">
                            เพิ่มสมาชิก
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="p-6">
                    {members.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">ยังไม่มีสมาชิก</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">{member.user_avatar || '👤'}</span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{member.user_nickname || 'ไม่ระบุชื่อ'}</p>
                                <p className="text-slate-400 text-sm">{member.user_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm border ${getRoleBadgeColor(member.role)}`}>
                                {getRoleLabel(member.role)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-400"
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
                <Card className="bg-slate-800/80 backdrop-blur border-slate-700">
                  <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">ข้อมูลโรงเรียน</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <Building2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">ชื่อโรงเรียน</p>
                          <p className="text-white">{selectedSchool.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <School className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">รหัสโรงเรียน</p>
                          <p className="text-white">{selectedSchool.code}</p>
                        </div>
                      </div>
                      
                      {selectedSchool.email && (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-500/20 rounded-xl">
                            <Mail className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">อีเมล</p>
                            <p className="text-white">{selectedSchool.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedSchool.phone && (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-orange-500/20 rounded-xl">
                            <Phone className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">เบอร์โทร</p>
                            <p className="text-white">{selectedSchool.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedSchool.address && (
                        <div className="flex items-start gap-4 col-span-2">
                          <div className="p-3 bg-cyan-500/20 rounded-xl">
                            <MapPin className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">ที่อยู่</p>
                            <p className="text-white">
                              {selectedSchool.address}
                              {selectedSchool.district && `, ${selectedSchool.district}`}
                              {selectedSchool.province && `, ${selectedSchool.province}`}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {selectedSchool.website && (
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-pink-500/20 rounded-xl">
                            <Globe className="w-5 h-5 text-pink-400" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">เว็บไซต์</p>
                            <a href={selectedSchool.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                              {selectedSchool.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-6 border-t border-slate-700">
                      <Dialog open={showEditSchool} onOpenChange={setShowEditSchool}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                            <Edit className="w-4 h-4 mr-2" />
                            แก้ไขข้อมูลโรงเรียน
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-white">แก้ไขข้อมูลโรงเรียน</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="col-span-2">
                              <Label className="text-slate-300">ชื่อโรงเรียน</Label>
                              <Input
                                value={editSchoolData.name}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, name: e.target.value })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300">รหัสโรงเรียน</Label>
                              <Input
                                value={editSchoolData.code}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, code: e.target.value.toUpperCase() })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                                disabled
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300">เบอร์โทร</Label>
                              <Input
                                value={editSchoolData.phone}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, phone: e.target.value })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300">อีเมล</Label>
                              <Input
                                value={editSchoolData.email}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, email: e.target.value })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300">เว็บไซต์</Label>
                              <Input
                                value={editSchoolData.website}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, website: e.target.value })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-slate-300">ที่อยู่</Label>
                              <Input
                                value={editSchoolData.address}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, address: e.target.value })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300">อำเภอ/เขต</Label>
                              <Input
                                value={editSchoolData.district}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, district: e.target.value })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-300">จังหวัด</Label>
                              <Input
                                value={editSchoolData.province}
                                onChange={(e) => setEditSchoolData({ ...editSchoolData, province: e.target.value })}
                                className="bg-slate-900 border-slate-600 text-white mt-1"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowEditSchool(false)} className="text-slate-400">
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
