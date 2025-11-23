import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PDFQuestionImporter from '@/components/PDFQuestionImporter';
import QuestionBankManager from '@/components/QuestionBankManager';
import SystemQuestionsBrowser from '@/components/SystemQuestionsBrowser';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

export default function AdminQuestionBank() {
  const { isLoggedIn, adminId, name } = useAdmin();
  const navigate = useNavigate();

  if (!isLoggedIn || !adminId) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="flex-1 container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้า Admin Dashboard
          </Button>
          
          <div className="card-glass p-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              📚 จัดการคลังข้อสอบระบบ
            </h1>
            <p className="text-muted-foreground">
              สวัสดี คุณ{name} - นำเข้าและจัดการข้อสอบมาตรฐานสำหรับระบบ KidFast
            </p>
          </div>
        </div>

        {/* PDF Importer Section */}
        <div className="card-glass p-6 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            📄 นำเข้าข้อสอบจาก PDF
          </h2>
          <p className="text-muted-foreground mb-6">
            อัปโหลดไฟล์ PDF ที่มีข้อสอบ ระบบจะใช้ AI วิเคราะห์และแปลงเป็นข้อสอบอัตโนมัติ
          </p>
          <PDFQuestionImporter 
            adminId={adminId}
            grade={1}
            semester={1}
            onImportComplete={() => {
              window.location.reload();
            }}
          />
        </div>

        {/* Question Bank Manager Section */}
        <div className="card-glass p-6">
          <Tabs defaultValue="my-questions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-questions">📋 ข้อสอบของฉัน</TabsTrigger>
              <TabsTrigger value="system-questions">🗄️ คลังกลาง</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-questions" className="mt-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  📋 คลังข้อสอบระบบทั้งหมด
                </h2>
                <p className="text-muted-foreground">
                  จัดการข้อสอบที่นำเข้าแล้ว - แก้ไข ลบ หรือแชร์ให้ครูทุกคนใช้งานได้
                </p>
              </div>
              <QuestionBankManager adminId={adminId} isAdmin={true} />
            </TabsContent>
            
            <TabsContent value="system-questions" className="mt-6">
              <SystemQuestionsBrowser 
                teacherId={adminId} 
                isAdmin={true}
                onImportSuccess={() => {}}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
