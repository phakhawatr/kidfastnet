import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherExams, ExamSession } from '@/hooks/useTeacherExams';
import { supabase } from '@/integrations/supabase/client';
import { generateAssessmentQuestions, AssessmentQuestion } from '@/utils/assessmentUtils';
import { compressImage } from '@/utils/imageCompression';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExamLinkQRCode from '@/components/ExamLinkQRCode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Link as LinkIcon, Users, Clock, BarChart, ExternalLink, CheckCircle, QrCode, Download, FileText, Trash2, Eye, X, FileDown, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF, generateReportSummary, generateItemAnalysis, compareAnswers } from '@/utils/examReportUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TeacherDashboard = () => {
  const { registrationId } = useAuth();
  const { 
    examLinks, 
    isLoading, 
    createExamLink, 
    fetchExamSessions, 
    updateExamLinkStatus, 
    refreshExamLinks, 
    deleteExamSession,
    deleteExamLink,
    fetchExamQuestions,
    updateExamQuestion,
    saveToQuestionBank,
    fetchQuestionBank,
    deleteFromQuestionBank,
  } = useTeacherExams(registrationId);
  const { toast } = useToast();
  
  const [activityName, setActivityName] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<'semester' | 'nt'>('semester');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(20);
  const [maxStudents, setMaxStudents] = useState<number>(30);
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string>('');
  const [schoolLogoFile, setSchoolLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [viewingSessions, setViewingSessions] = useState<{ linkId: string; linkCode: string; sessions: ExamSession[] } | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [viewingSessionDetail, setViewingSessionDetail] = useState<ExamSession | null>(null);
  
  // Preview mode states
  const [previewMode, setPreviewMode] = useState<{
    questions: AssessmentQuestion[];
    metadata: {
      activityName: string;
      grade: number;
      semester: number | null;
      assessmentType: 'semester' | 'nt';
      totalQuestions: number;
    };
  } | null>(null);
  
  const [editingQuestion, setEditingQuestion] = useState<{
    index: number;
    question: AssessmentQuestion;
  } | null>(null);

  // Edit existing exam states
  const [editingExamLink, setEditingExamLink] = useState<{
    linkId: string;
    linkCode: string;
    questions: any[];
  } | null>(null);

  const [editingExamQuestion, setEditingExamQuestion] = useState<{
    question: any;
    index: number;
  } | null>(null);

  // Question Bank states
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [questionBank, setQuestionBank] = useState<any[]>([]);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState<Set<string>>(new Set());

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณาเลือกไฟล์รูปภาพเท่านั้น',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไฟล์รูปภาพมีขนาดใหญ่เกิน 5MB',
        variant: 'destructive'
      });
      return;
    }

    setSchoolLogoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setSchoolLogoUrl(previewUrl);
    
    toast({
      title: 'สำเร็จ',
      description: 'เลือกรูปภาพเรียบร้อยแล้ว',
    });
  };

  const uploadLogoToStorage = async (): Promise<string | null> => {
    // If no file selected, return null
    if (!schoolLogoFile) {
      console.log('No logo file selected');
      return null;
    }
    
    if (!registrationId) {
      console.error('No registrationId available');
      return null;
    }

    setIsUploadingLogo(true);
    try {
      console.log('Starting logo upload...', schoolLogoFile.name);
      
      // Compress image
      const compressedBlob = await compressImage(schoolLogoFile, 400, 400, 0.8);
      console.log('Image compressed successfully');
      
      // Generate unique filename
      const fileExt = schoolLogoFile.name.split('.').pop();
      const fileName = `${registrationId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading to path:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('school-logos')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('school-logos')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      toast({
        title: 'สำเร็จ',
        description: 'อัปโหลดโลโก้เรียบร้อยแล้ว',
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปโหลดรูปภาพได้',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handlePreviewQuestions = () => {
    const questions = generateAssessmentQuestions(
      selectedGrade,
      selectedType === 'semester' ? selectedSemester : 'nt',
      totalQuestions
    );
    
    setPreviewMode({
      questions,
      metadata: {
        activityName: activityName || `ข้อสอบ ป.${selectedGrade} ${getAssessmentTypeName(selectedType, selectedSemester)}`,
        grade: selectedGrade,
        semester: selectedType === 'semester' ? selectedSemester : null,
        assessmentType: selectedType,
        totalQuestions
      }
    });
  };

  const handleFinalizeAndCreateLink = async () => {
    if (!previewMode || !registrationId) return;
    
    try {
      // Upload logo if file is selected
      const uploadedLogoUrl = await uploadLogoToStorage();
      
      const semester = previewMode.metadata.semester;
      const link = await createExamLink(
        previewMode.metadata.grade,
        semester,
        previewMode.metadata.assessmentType,
        maxStudents,
        undefined,
        null,
        null,
        false,
        previewMode.metadata.activityName,
        previewMode.metadata.totalQuestions,
        schoolName,
        uploadedLogoUrl || undefined
      );
      
      if (!link) throw new Error('Failed to create exam link');
      
      // Save all questions to exam_questions table
      const questionsData = previewMode.questions.map((q, idx) => ({
        exam_link_id: link.id,
        question_number: idx + 1,
        question_text: q.question,
        choices: q.choices,
        correct_answer: String(q.correctAnswer),
        difficulty: q.difficulty,
        skill_name: q.skill,
        is_edited: false,
        explanation: q.explanation,
        visual_elements: q.visualElements
      }));
      
      const { error: questionsError } = await supabase
        .from('exam_questions')
        .insert(questionsData);
      
      if (questionsError) throw questionsError;
      
      // Update exam_link with custom questions flag
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
      
      await supabase
        .from('exam_links')
        .update({
          has_custom_questions: true,
          questions_finalized_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .eq('id', link.id);
      
      setPreviewMode(null);
      setActivityName('');
      setTotalQuestions(20);
      await refreshExamLinks();
      
      toast({
        title: 'สำเร็จ!',
        description: `สร้าง Link ข้อสอบเรียบร้อยแล้ว (${link.link_code})`,
      });
      
    } catch (error) {
      console.error('Error finalizing exam:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้าง Link ข้อสอบได้',
        variant: 'destructive'
      });
    }
  };

  const handleEditExamLink = async (linkId: string, linkCode: string) => {
    const questions = await fetchExamQuestions(linkId);
    setEditingExamLink({ linkId, linkCode, questions });
  };

  const handleSaveExamQuestion = async () => {
    if (!editingExamQuestion || !editingExamLink) return;

    const success = await updateExamQuestion(editingExamQuestion.question.id, {
      question_text: editingExamQuestion.question.question_text,
      choices: editingExamQuestion.question.choices,
      correct_answer: editingExamQuestion.question.correct_answer,
      difficulty: editingExamQuestion.question.difficulty,
      explanation: editingExamQuestion.question.explanation,
      is_edited: true
    });

    if (success) {
      // Refresh the questions list
      const updatedQuestions = await fetchExamQuestions(editingExamLink.linkId);
      setEditingExamLink({ ...editingExamLink, questions: updatedQuestions });
      setEditingExamQuestion(null);
    }
  };

  const handleSaveToBank = async (question: any) => {
    if (!question) return;

    await saveToQuestionBank({
      question_text: question.question_text || question.question,
      choices: question.choices,
      correct_answer: question.correct_answer || String(question.correctAnswer),
      difficulty: question.difficulty,
      skill_name: question.skill_name || question.skill,
      grade: selectedGrade,
      explanation: question.explanation,
      visual_elements: question.visual_elements || question.visualElements,
      tags: [],
      times_used: 0
    });
  };

  const handleLoadQuestionBank = async () => {
    const bank = await fetchQuestionBank({ grade: selectedGrade });
    setQuestionBank(bank);
    setShowQuestionBank(true);
  };

  const handleCreateLink = async () => {
    const semester = selectedType === 'semester' ? selectedSemester : null;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    // Upload logo if file is selected
    const uploadedLogoUrl = await uploadLogoToStorage();
    
    const link = await createExamLink(
      selectedGrade, 
      semester, 
      selectedType, 
      maxStudents,
      undefined, // passcode
      null, // startTime
      null, // timeLimitMinutes
      false, // allowRetake
      activityName || undefined,
      totalQuestions,
      schoolName || undefined,
      uploadedLogoUrl || undefined
    );
    
    if (link) {
      // Update with expiry date
      await supabase
        .from('exam_links')
        .update({ expires_at: expiresAt.toISOString() })
        .eq('id', link.id);
      
      await refreshExamLinks();
      
      // Reset form
      setActivityName('');
      setTotalQuestions(20);
    }
  };

  const handleCopyLink = (linkCode: string) => {
    const fullUrl = `${window.location.origin}/exam/${linkCode}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: 'คัดลอกสำเร็จ!',
      description: 'Link ข้อสอบถูกคัดลอกไปยังคลิปบอร์ดแล้ว',
    });
  };

  const handleViewReport = async (linkId: string, linkCode: string) => {
    const sessions = await fetchExamSessions(linkId);
    setViewingSessions({ linkId, linkCode, sessions });
  };

  const handleExportCSV = () => {
    if (!viewingSessions) return;
    exportToCSV(viewingSessions.sessions, viewingSessions.linkCode);
    toast({
      title: 'สำเร็จ!',
      description: 'ดาวน์โหลดรายงานเป็น CSV เรียบร้อยแล้ว',
    });
  };

  const handleExportPDF = async () => {
    if (!viewingSessions) return;
    try {
      await exportToPDF(viewingSessions.sessions, viewingSessions.linkCode);
      toast({
        title: 'สำเร็จ!',
        description: 'ดาวน์โหลดรายงานเป็น PDF เรียบร้อยแล้ว',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้าง PDF ได้',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('ต้องการลบข้อมูลการสอบนี้หรือไม่?')) return;
    
    const success = await deleteExamSession(sessionId);
    if (success && viewingSessions) {
      // Refresh sessions list
      const updatedSessions = await fetchExamSessions(viewingSessions.linkId);
      setViewingSessions({
        ...viewingSessions,
        sessions: updatedSessions
      });
    }
  };

  const handleDeleteExamLink = async (linkId: string, linkCode: string) => {
    if (!confirm(
      `⚠️ คำเตือน: การลบข้อสอบนี้จะลบข้อมูลทั้งหมด:\n\n` +
      `• โจทย์ทั้งหมด\n` +
      `• ข้อมูลนักเรียนที่สอบแล้ว\n` +
      `• Link ข้อสอบ ${linkCode}\n\n` +
      `ต้องการลบข้อสอบนี้หรือไม่?`
    )) return;
    
    await deleteExamLink(linkId);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-500 text-white',
      full: 'bg-orange-500 text-white',
      expired: 'bg-gray-500 text-white'
    };
    const labels = {
      active: '🟢 เปิดใช้งาน',
      full: '🟠 เต็มแล้ว',
      expired: '⚫ หมดอายุ'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getAssessmentTypeName = (type: string, semester: number | null) => {
    if (type === 'nt') return 'NT';
    return `ภาคเรียนที่ ${semester}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">👨‍🏫 แดชบอร์ดครู</h1>
          <p className="text-muted-foreground">สร้างและจัดการ link ข้อสอบสำหรับนักเรียน</p>
        </div>

        {/* Create Exam Link Section */}
        <Card className="mb-8 card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              สร้าง Link ข้อสอบใหม่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="activityName">ชื่อกิจกรรม</Label>
                <Input
                  id="activityName"
                  type="text"
                  placeholder="เช่น ทดสอบกลางภาค"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="grade">ชั้นเรียน</Label>
                <Select value={selectedGrade.toString()} onValueChange={(v) => setSelectedGrade(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <SelectItem key={g} value={g.toString()}>
                        ป.{g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">ประเภท</Label>
                <Select value={selectedType} onValueChange={(v: 'semester' | 'nt') => setSelectedType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semester">ภาคเรียน</SelectItem>
                    <SelectItem value="nt">NT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedType === 'semester' && (
                <div>
                  <Label htmlFor="semester">ภาคเรียนที่</Label>
                  <Select value={selectedSemester.toString()} onValueChange={(v) => setSelectedSemester(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ภาคเรียนที่ 1</SelectItem>
                      <SelectItem value="2">ภาคเรียนที่ 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="totalQuestions">จำนวนข้อ</Label>
                <Select value={totalQuestions.toString()} onValueChange={(v) => setTotalQuestions(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 ข้อ</SelectItem>
                    <SelectItem value="20">20 ข้อ</SelectItem>
                    <SelectItem value="30">30 ข้อ</SelectItem>
                    <SelectItem value="40">40 ข้อ</SelectItem>
                    <SelectItem value="50">50 ข้อ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxStudents">จำนวนนักเรียนสูงสุด</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  max="500"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(parseInt(e.target.value) || 30)}
                />
              </div>

              <div>
                <Label htmlFor="expiryDays">หมดอายุภายใน (วัน)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  min="1"
                  max="365"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value) || 7)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="schoolName">ชื่อโรงเรียน</Label>
                <Input
                  id="schoolName"
                  type="text"
                  placeholder="เช่น โรงเรียนอนุบาลสายรุ้ง"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="schoolLogo">โลโก้โรงเรียน</Label>
                <div className="flex gap-2">
                  <Input
                    id="schoolLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {schoolLogoUrl && (
                    <div className="relative w-16 h-16 border rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={schoolLogoUrl} 
                        alt="Logo Preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  รองรับไฟล์ JPG, PNG (สูงสุด 5MB) จะถูกบีบอัดให้เหมาะสมอัตโนมัติ
                </p>
              </div>
            </div>

            <Button onClick={handlePreviewQuestions} className="w-full md:w-auto" disabled={isUploadingLogo}>
              <Eye className="w-4 h-4 mr-2" />
              {isUploadingLogo ? 'กำลังอัปโหลด...' : 'ตรวจสอบโจทย์'}
            </Button>
          </CardContent>
        </Card>

        {/* Exam Links List */}
        {!viewingSessions ? (
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Link ข้อสอบทั้งหมด ({examLinks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {examLinks.length === 0 ? (
                <div className="text-center py-12">
                  <LinkIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">ยังไม่มี link ข้อสอบ</p>
                  <p className="text-sm text-muted-foreground mt-2">สร้าง link แรกของคุณเพื่อเริ่มต้น</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {examLinks.map((link) => (
                    <div key={link.id} className="p-4 border border-border rounded-lg bg-card/50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-lg font-bold text-primary">{link.link_code}</span>
                              {getStatusBadge(link.status)}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {link.activity_name && (
                                <p className="flex items-center gap-2 font-medium text-base text-foreground">
                                  <FileText className="w-4 h-4" />
                                  {link.activity_name}
                                </p>
                              )}
                              <p>📚 ชั้น ป.{link.grade} - {getAssessmentTypeName(link.assessment_type, link.semester)} ({link.total_questions} ข้อ)</p>
                              <p className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {link.current_students} / {link.max_students} คน
                              </p>
                              <p className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                สร้างเมื่อ: {new Date(link.created_at).toLocaleDateString('th-TH')}
                              </p>
                              {link.expires_at && (
                                <p className="flex items-center gap-2 text-orange-600">
                                  <Clock className="w-4 h-4" />
                                  หมดอายุ: {new Date(link.expires_at).toLocaleDateString('th-TH')}
                                </p>
                              )}
                            </div>
                          </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(link.link_code)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            คัดลอก Link
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQRCode(link.link_code)}
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            QR Code
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/exam/${link.link_code}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            เปิด
                          </Button>
                          
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleViewReport(link.id, link.link_code)}
                            disabled={link.current_students === 0}
                          >
                            <BarChart className="w-4 h-4 mr-2" />
                            รายงาน ({link.current_students})
                          </Button>

                          {link.has_custom_questions && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditExamLink(link.id, link.link_code)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              แก้ไขโจทย์
                            </Button>
                          )}
                          
                          {link.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateExamLinkStatus(link.id, 'expired')}
                            >
                              ปิด
                            </Button>
                          )}
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteExamLink(link.id, link.link_code)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบ
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Exam Sessions Report
          <Card className="card-glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  รายงานผลการสอบ - {viewingSessions.linkCode}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={() => setViewingSessions(null)}>
                    ← กลับ
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewingSessions.sessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">ยังไม่มีนักเรียนทำข้อสอบ</p>
                </div>
              ) : (
                <>
                  {/* Summary Statistics */}
                  <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">คะแนนเฉลี่ย</p>
                          <p className="text-2xl font-bold text-primary">
                            {generateReportSummary(viewingSessions.sessions).avgScore.toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-500/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">ค่ามัธยฐาน</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {generateReportSummary(viewingSessions.sessions).median.toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-500/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">ส่วนเบี่ยงเบน</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {generateReportSummary(viewingSessions.sessions).stdDev.toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-500/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">คะแนนสูงสุด</p>
                          <p className="text-2xl font-bold text-green-600">
                            {generateReportSummary(viewingSessions.sessions).maxScore.toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-red-500/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">คะแนนต่ำสุด</p>
                          <p className="text-2xl font-bold text-red-600">
                            {generateReportSummary(viewingSessions.sessions).minScore.toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-500/5">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">อัตราผ่าน</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {generateReportSummary(viewingSessions.sessions).passRate.toFixed(0)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Item Analysis */}
                  {generateItemAnalysis(viewingSessions.sessions).length > 0 && (
                    <Card className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Item Analysis (การวิเคราะห์ข้อสอบ)</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToCSV(viewingSessions.sessions, viewingSessions.linkCode)}
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Export CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToPDF(viewingSessions.sessions, viewingSessions.linkCode, generateItemAnalysis(viewingSessions.sessions))}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Export PDF
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {viewingSessions.sessions.length < 10 && (
                          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-500 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              ⚠️ <strong>หมายเหตุ:</strong> การคำนวณค่า Discrimination Index (DI) ต้องมีนักเรียนอย่างน้อย 10 คน 
                              ปัจจุบันมี {viewingSessions.sessions.length} คน ค่า DI จึงแสดงเป็น N/A
                            </p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
                          {generateItemAnalysis(viewingSessions.sessions).map((item) => (
                            <div 
                              key={item.questionIndex}
                              className={`p-3 rounded-lg text-center border-2 ${
                                item.difficulty === 'ง่าย' 
                                  ? 'bg-green-50 dark:bg-green-950/20 border-green-500' 
                                  : item.difficulty === 'ยาก' 
                                  ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
                                  : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
                              }`}
                              title={`ข้อ ${item.questionIndex}: ${item.correctCount}/${item.totalCount} ตอบถูก (${item.percentCorrect}%)\nค่าความแยกแยะ: ${item.discriminationIndex?.toFixed(2) || 'N/A'}\n${item.difficulty}`}
                            >
                              <div className="text-xs font-bold mb-1">ข้อ {item.questionIndex}</div>
                              <div className="text-lg font-bold">{item.percentCorrect}%</div>
                              <div className="text-xs text-muted-foreground">{item.difficulty}</div>
                              {item.discriminationIndex !== undefined && item.discriminationIndex !== null && item.discriminationIndex !== 0 ? (
                                <div className="text-xs mt-1 font-medium">
                                  DI: {item.discriminationIndex.toFixed(2)}
                                </div>
                              ) : (
                                <div className="text-xs mt-1 text-muted-foreground">
                                  DI: N/A
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            <span>ง่าย (≥70%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-500"></div>
                            <span>ปานกลาง (50-69%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            <span>ยาก (&lt;50%)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Student Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3">#</th>
                          <th className="text-left p-3">ชื่อ-สกุล</th>
                          <th className="text-left p-3">ชั้น</th>
                          <th className="text-left p-3">เลขที่</th>
                          <th className="text-center p-3">ครั้งที่</th>
                          <th className="text-right p-3">คะแนน</th>
                          <th className="text-right p-3">เวลา</th>
                          <th className="text-left p-3">วันที่ทำ</th>
                          <th className="text-left p-3">สถานะ</th>
                          <th className="text-center p-3">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingSessions.sessions.map((session, index) => (
                          <tr key={session.id} className="border-b border-border/50 hover:bg-accent/50">
                            <td className="p-3 font-medium">{index + 1}</td>
                            <td className="p-3">{session.student_name}</td>
                            <td className="p-3">{session.student_class}</td>
                            <td className="p-3 text-center">{session.student_number}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-1 rounded-full bg-muted text-xs">
                                {session.attempt_number || 1}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className={`font-bold ${session.score >= 80 ? 'text-green-600' : session.score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                                {session.score.toFixed(2)}%
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({session.correct_answers}/{session.total_questions})
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {Math.floor(session.time_taken / 60)}:{(session.time_taken % 60).toString().padStart(2, '0')}
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {new Date(session.completed_at).toLocaleDateString('th-TH', { 
                                day: '2-digit', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </td>
                            <td className="p-3">
                              {session.score >= 80 ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" /> ดีมาก
                                </span>
                              ) : session.score >= 50 ? (
                                <span className="text-orange-600">ผ่าน</span>
                              ) : (
                                <span className="text-red-600">ไม่ผ่าน</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewingSessionDetail(session)}
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {showQRCode && (
        <ExamLinkQRCode
          linkCode={showQRCode}
          onClose={() => setShowQRCode(null)}
        />
      )}

      {/* Session Detail Dialog */}
      <Dialog open={!!viewingSessionDetail} onOpenChange={() => setViewingSessionDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              ผลการสอบ - {viewingSessionDetail?.student_name}
            </DialogTitle>
          </DialogHeader>
          
          {viewingSessionDetail && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">ชั้น</p>
                  <p className="font-semibold">{viewingSessionDetail.student_class}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">เลขที่</p>
                  <p className="font-semibold">{viewingSessionDetail.student_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">คะแนน</p>
                  <p className={`font-bold text-lg ${viewingSessionDetail.score >= 80 ? 'text-green-600' : viewingSessionDetail.score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                    {viewingSessionDetail.score.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">เวลาที่ใช้</p>
                  <p className="font-semibold">
                    {Math.floor(viewingSessionDetail.time_taken / 60)}:{(viewingSessionDetail.time_taken % 60).toString().padStart(2, '0')} นาที
                  </p>
                </div>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">รายละเอียดคำตอบ ({viewingSessionDetail.correct_answers}/{viewingSessionDetail.total_questions})</h3>
                
                {viewingSessionDetail.assessment_data && Array.isArray((viewingSessionDetail.assessment_data as any).questions) && 
                  ((viewingSessionDetail.assessment_data as any).questions as any[]).map((q, index) => {
                    const studentAnswer = q.userAnswer;
                    const isCorrect = compareAnswers(studentAnswer, q.correctAnswer);
                    
                    return (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCorrect 
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20 dark:border-green-600' 
                            : 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isCorrect 
                              ? 'bg-green-500 text-white dark:bg-green-600' 
                              : 'bg-red-500 text-white dark:bg-red-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-3">
                            {/* Question Text */}
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-muted-foreground mb-1">โจทย์</p>
                              <p className="font-medium text-base">{q.question}</p>
                            </div>
                            
                            {/* Choices */}
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">ตัวเลือก</p>
                              <div className="space-y-1.5">
                                {q.choices?.map((choice: string, cIndex: number) => {
                                  const choiceLetter = String.fromCharCode(65 + cIndex);
                                  const isStudentChoice = compareAnswers(studentAnswer, choice);
                                  const isCorrectChoice = compareAnswers(q.correctAnswer, choice);
                                  
                                  return (
                                    <div 
                                      key={cIndex}
                                      className={`p-3 rounded-lg border-2 transition-all ${
                                        isCorrectChoice 
                                          ? 'bg-green-100 dark:bg-green-950/40 border-green-600 font-semibold shadow-sm' 
                                          : isStudentChoice 
                                          ? 'bg-red-100 dark:bg-red-950/40 border-red-600 shadow-sm'
                                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                          isCorrectChoice 
                                            ? 'bg-green-600 text-white' 
                                            : isStudentChoice 
                                            ? 'bg-red-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}>
                                          {choiceLetter}
                                        </span>
                                        <span className={isCorrectChoice || isStudentChoice ? 'font-medium' : ''}>
                                          {choice}
                                        </span>
                                        {isCorrectChoice && (
                                          <span className="ml-auto text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> คำตอบที่ถูก
                                          </span>
                                        )}
                                        {isStudentChoice && !isCorrectChoice && (
                                          <span className="ml-auto text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                                            <X className="w-4 h-4" /> คำตอบที่เลือก
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Explanation */}
                            {q.explanation && (
                              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">💡 คำอธิบาย:</p>
                                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setViewingSessionDetail(null)}>
                  <X className="w-4 h-4 mr-2" />
                  ปิด
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Questions Dialog */}
      {previewMode && (
        <Dialog open={!!previewMode} onOpenChange={() => setPreviewMode(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                ตรวจสอบโจทย์: {previewMode.metadata.activityName}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                ชั้น {previewMode.metadata.grade} • {previewMode.metadata.totalQuestions} ข้อ • 
                คลิกแต่ละข้อเพื่อดูและแก้ไขโจทย์
              </p>
            </DialogHeader>
            
            {/* Grid of Questions */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 my-6">
              {previewMode.questions.map((question, idx) => (
                <div
                  key={idx}
                  onClick={() => setEditingQuestion({ index: idx, question })}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all
                    ${question.difficulty === 'easy' 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-500' 
                      : question.difficulty === 'hard'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
                      : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold">{idx + 1}</div>
                    <div className="text-xs mt-1">
                      {question.difficulty === 'easy' ? 'ง่าย' : 
                       question.difficulty === 'hard' ? 'ยาก' : 'ปานกลาง'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setPreviewMode(null)} className="flex-1">
                ยกเลิก
              </Button>
              <Button onClick={handleFinalizeAndCreateLink} className="flex-1" size="lg">
                ✅ สร้าง Link ข้อสอบ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Question Dialog */}
      {editingQuestion && previewMode && (
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                แก้ไขข้อ {editingQuestion.index + 1}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Question Text */}
              <div>
                <Label>โจทย์</Label>
                <Textarea
                  value={editingQuestion.question.question}
                  onChange={(e) => {
                    const updated = { ...editingQuestion };
                    updated.question.question = e.target.value;
                    setEditingQuestion(updated);
                  }}
                  rows={4}
                  className="mt-2"
                />
              </div>
              
              {/* Choices */}
              <div>
                <Label>ตัวเลือก</Label>
                <div className="space-y-2 mt-2">
                  {editingQuestion.question.choices.map((choice, choiceIdx) => (
                    <div key={choiceIdx} className="flex items-center gap-2">
                      <Input
                        value={String(choice)}
                        onChange={(e) => {
                          const updated = { ...editingQuestion };
                          updated.question.choices[choiceIdx] = e.target.value;
                          setEditingQuestion(updated);
                        }}
                        className={`flex-1 ${
                          String(choice) === String(editingQuestion.question.correctAnswer)
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : ''
                        }`}
                      />
                      <Button
                        variant={String(choice) === String(editingQuestion.question.correctAnswer) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const updated = { ...editingQuestion };
                          updated.question.correctAnswer = choice;
                          setEditingQuestion(updated);
                        }}
                      >
                        {String(choice) === String(editingQuestion.question.correctAnswer) ? '✓ ถูก' : 'ตั้งเป็นคำตอบ'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Difficulty */}
              <div>
                <Label>ระดับความยาก</Label>
                <Select
                  value={editingQuestion.question.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => {
                    const updated = { ...editingQuestion };
                    updated.question.difficulty = value;
                    setEditingQuestion(updated);
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">ง่าย</SelectItem>
                    <SelectItem value="medium">ปานกลาง</SelectItem>
                    <SelectItem value="hard">ยาก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Explanation */}
              <div>
                <Label>คำอธิบาย (ถ้ามี)</Label>
                <Textarea
                  value={editingQuestion.question.explanation || ''}
                  onChange={(e) => {
                    const updated = { ...editingQuestion };
                    updated.question.explanation = e.target.value;
                    setEditingQuestion(updated);
                  }}
                  rows={3}
                  className="mt-2"
                  placeholder="คำอธิบายเพิ่มเติมสำหรับนักเรียน..."
                />
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditingQuestion(null)} className="flex-1">
                ยกเลิก
              </Button>
              <Button 
                onClick={async () => {
                  if (previewMode) {
                    const updated = { ...previewMode };
                    updated.questions[editingQuestion.index] = editingQuestion.question;
                    setPreviewMode(updated);
                  }
                  
                  // Save to Question Bank option
                  await handleSaveToBank(editingQuestion.question);
                  
                  setEditingQuestion(null);
                  toast({
                    title: 'บันทึกสำเร็จ',
                    description: `แก้ไขข้อ ${editingQuestion.index + 1} เรียบร้อยแล้ว`
                  });
                }} 
                className="flex-1"
              >
                💾 บันทึก
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Existing Exam Dialog */}
      {editingExamLink && (
        <Dialog open={!!editingExamLink} onOpenChange={() => setEditingExamLink(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                แก้ไขโจทย์: {editingExamLink.linkCode}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {editingExamLink.questions.length} ข้อ • คลิกแต่ละข้อเพื่อแก้ไข
              </p>
            </DialogHeader>
            
            {/* Grid of Questions */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 my-6">
              {editingExamLink.questions.map((question, idx) => (
                <div
                  key={idx}
                  onClick={() => setEditingExamQuestion({ question, index: idx })}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer hover:scale-105 transition-all
                    ${question.difficulty === 'easy' 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-500' 
                      : question.difficulty === 'hard'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
                      : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-xl font-bold">{question.question_number}</div>
                    <div className="text-xs mt-1">
                      {question.difficulty === 'easy' ? 'ง่าย' : 
                       question.difficulty === 'hard' ? 'ยาก' : 'ปานกลาง'}
                    </div>
                    {question.is_edited && (
                      <div className="text-xs text-blue-600 mt-1">✏️</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditingExamLink(null)} className="flex-1">
                ปิด
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Exam Question Dialog */}
      {editingExamQuestion && (
        <Dialog open={!!editingExamQuestion} onOpenChange={() => setEditingExamQuestion(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                แก้ไขข้อ {editingExamQuestion.question.question_number}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Question Text */}
              <div>
                <Label>โจทย์</Label>
                <Textarea
                  value={editingExamQuestion.question.question_text}
                  onChange={(e) => {
                    const updated = { ...editingExamQuestion };
                    updated.question.question_text = e.target.value;
                    setEditingExamQuestion(updated);
                  }}
                  rows={4}
                  className="mt-2"
                />
              </div>
              
              {/* Choices */}
              <div>
                <Label>ตัวเลือก</Label>
                <div className="space-y-2 mt-2">
                  {editingExamQuestion.question.choices.map((choice: any, choiceIdx: number) => (
                    <div key={choiceIdx} className="flex items-center gap-2">
                      <Input
                        value={String(choice)}
                        onChange={(e) => {
                          const updated = { ...editingExamQuestion };
                          updated.question.choices[choiceIdx] = e.target.value;
                          setEditingExamQuestion(updated);
                        }}
                        className={`flex-1 ${
                          String(choice) === String(editingExamQuestion.question.correct_answer)
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : ''
                        }`}
                      />
                      <Button
                        variant={String(choice) === String(editingExamQuestion.question.correct_answer) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const updated = { ...editingExamQuestion };
                          updated.question.correct_answer = String(choice);
                          setEditingExamQuestion(updated);
                        }}
                      >
                        {String(choice) === String(editingExamQuestion.question.correct_answer) ? '✓ ถูก' : 'ตั้งเป็นคำตอบ'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Difficulty */}
              <div>
                <Label>ระดับความยาก</Label>
                <Select
                  value={editingExamQuestion.question.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => {
                    const updated = { ...editingExamQuestion };
                    updated.question.difficulty = value;
                    setEditingExamQuestion(updated);
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">ง่าย</SelectItem>
                    <SelectItem value="medium">ปานกลาง</SelectItem>
                    <SelectItem value="hard">ยาก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Explanation */}
              <div>
                <Label>คำอธิบาย</Label>
                <Textarea
                  value={editingExamQuestion.question.explanation || ''}
                  onChange={(e) => {
                    const updated = { ...editingExamQuestion };
                    updated.question.explanation = e.target.value;
                    setEditingExamQuestion(updated);
                  }}
                  rows={3}
                  className="mt-2"
                  placeholder="คำอธิบายเพิ่มเติม..."
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={async () => {
                  await handleSaveToBank(editingExamQuestion.question);
                }}
              >
                💾 บันทึกลง Question Bank
              </Button>
              <div className="flex-1"></div>
              <Button variant="outline" onClick={() => setEditingExamQuestion(null)}>
                ยกเลิก
              </Button>
              <Button 
                onClick={handleSaveExamQuestion}
              >
                ✅ บันทึกการแก้ไข
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
};

export default TeacherDashboard;
