import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherExams, ExamSession } from '@/hooks/useTeacherExams';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExamLinkQRCode from '@/components/ExamLinkQRCode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Link as LinkIcon, Users, Clock, BarChart, ExternalLink, CheckCircle, QrCode, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, generateReportSummary } from '@/utils/examReportUtils';

const TeacherDashboard = () => {
  const { registrationId } = useAuth();
  const { examLinks, isLoading, createExamLink, fetchExamSessions, updateExamLinkStatus, refreshExamLinks } = useTeacherExams(registrationId);
  const { toast } = useToast();
  
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<'semester' | 'nt'>('semester');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [maxStudents, setMaxStudents] = useState<number>(30);
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [viewingSessions, setViewingSessions] = useState<{ linkId: string; linkCode: string; sessions: ExamSession[] } | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  const handleCreateLink = async () => {
    const semester = selectedType === 'semester' ? selectedSemester : null;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    const link = await createExamLink(selectedGrade, semester, selectedType, maxStudents);
    
    if (link) {
      // Update with expiry date
      await supabase
        .from('exam_links')
        .update({ expires_at: expiresAt.toISOString() })
        .eq('id', link.id);
      
      await refreshExamLinks();
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

              <div>
                <Label htmlFor="maxStudents">จำนวนนักเรียนสูงสุด</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  max="100"
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

            <Button onClick={handleCreateLink} className="w-full md:w-auto">
              <LinkIcon className="w-4 h-4 mr-2" />
              สร้าง Link ข้อสอบ
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
                            <p>📚 ชั้น ป.{link.grade} - {getAssessmentTypeName(link.assessment_type, link.semester)}</p>
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
                          
                          {link.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => updateExamLinkStatus(link.id, 'expired')}
                            >
                              ปิด
                            </Button>
                          )}
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3">#</th>
                        <th className="text-left p-3">ชื่อ-สกุล</th>
                        <th className="text-left p-3">ชั้น</th>
                        <th className="text-left p-3">เลขที่</th>
                        <th className="text-right p-3">คะแนน</th>
                        <th className="text-right p-3">เวลา (นาที)</th>
                        <th className="text-left p-3">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingSessions.sessions.map((session, index) => (
                        <tr key={session.id} className="border-b border-border/50 hover:bg-accent/50">
                          <td className="p-3 font-medium">{index + 1}</td>
                          <td className="p-3">{session.student_name}</td>
                          <td className="p-3">{session.student_class}</td>
                          <td className="p-3 text-center">{session.student_number}</td>
                          <td className="p-3 text-right">
                            <span className={`font-bold ${session.score >= 80 ? 'text-green-600' : session.score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                              {session.score.toFixed(2)}%
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              ({session.correct_answers}/{session.total_questions})
                            </span>
                          </td>
                          <td className="p-3 text-right">{Math.floor(session.time_taken / 60)}:{(session.time_taken % 60).toString().padStart(2, '0')}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">คะแนนเฉลี่ย</p>
                          <p className="text-3xl font-bold text-primary">
                            {(viewingSessions.sessions.reduce((sum, s) => sum + s.score, 0) / viewingSessions.sessions.length).toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">คะแนนสูงสุด</p>
                          <p className="text-3xl font-bold text-green-600">
                            {Math.max(...viewingSessions.sessions.map(s => s.score)).toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">คะแนนต่ำสุด</p>
                          <p className="text-3xl font-bold text-red-600">
                            {Math.min(...viewingSessions.sessions.map(s => s.score)).toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">อัตราผ่าน</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {((viewingSessions.sessions.filter(s => s.score >= 50).length / viewingSessions.sessions.length) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
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

      <Footer />
    </div>
  );
};

export default TeacherDashboard;
