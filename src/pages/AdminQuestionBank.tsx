import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PDFQuestionImporter from '@/components/PDFQuestionImporter';
import QuestionBankManager from '@/components/QuestionBankManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

// System Teacher ID - This should be the ID of the "KidFast System" teacher account
// Admin needs to create this account first in the Admin Dashboard
const SYSTEM_TEACHER_ID = '00000000-0000-0000-0000-000000000000'; // Placeholder - will be updated after creating system account

export default function AdminQuestionBank() {
  const { isLoggedIn, name } = useAdmin();
  const navigate = useNavigate();
  const [systemTeacherId, setSystemTeacherId] = useState<string | null>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(true);

  useEffect(() => {
    console.log('🔍 AdminQuestionBank mounted, isLoggedIn:', isLoggedIn, 'name:', name);
    checkSystemTeacherAccount();
  }, []);

  const checkSystemTeacherAccount = async () => {
    try {
      console.log('🔍 Checking for system teacher account...');
      setIsCheckingAccount(true);
      
      // Check if KidFast System teacher account exists
      const { data: systemUser, error } = await supabase
        .from('user_registrations')
        .select('id, nickname')
        .eq('nickname', 'KidFast System')
        .eq('grade', 'admin')
        .maybeSingle();

      console.log('📊 System user query result:', { systemUser, error });

      if (error) {
        console.error('❌ Error checking system teacher:', error);
        return;
      }

      if (systemUser) {
        console.log('✅ Found system user:', systemUser.id);
        // Verify this user has teacher role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', systemUser.id)
          .eq('role', 'teacher')
          .maybeSingle();

        console.log('📊 Role data:', roleData);

        if (roleData) {
          console.log('✅ System teacher account verified');
          setSystemTeacherId(systemUser.id);
        } else {
          console.log('⚠️ System user found but no teacher role');
        }
      } else {
        console.log('⚠️ No system teacher account found');
      }
    } catch (error) {
      console.error('❌ Error checking system account:', error);
    } finally {
      setIsCheckingAccount(false);
    }
  };


  if (isCheckingAccount) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="card-glass p-8 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-muted-foreground">กำลังตรวจสอบบัญชีระบบ...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
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

        {/* System Teacher Account Status */}
        {!systemTeacherId ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>ยังไม่พบบัญชีครูระบบ (System Teacher Account)</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>กรุณาสร้างบัญชีครูระบบก่อนใช้งาน:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>ไปที่ Admin Dashboard</li>
                <li>สร้างผู้ใช้ใหม่:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>ชื่อเล่น: <strong>KidFast System</strong></li>
                    <li>ระดับชั้น: <strong>admin</strong></li>
                    <li>อีเมล: system@kidfastai.com</li>
                  </ul>
                </li>
                <li>อนุมัติผู้ใช้</li>
                <li>มอบสิทธิ์ครู (Assign Teacher Role)</li>
                <li>กลับมาหน้านี้และรีเฟรช</li>
              </ol>
              <Button 
                onClick={checkSystemTeacherAccount}
                variant="outline"
                className="mt-4"
              >
                🔄 ตรวจสอบอีกครั้ง
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Success Alert */}
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-200">
                ✅ พร้อมใช้งาน
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                เชื่อมต่อกับบัญชีครูระบบเรียบร้อย - ข้อสอบที่นำเข้าจะถูกบันทึกในคลังข้อสอบระบบ
              </AlertDescription>
            </Alert>

            {/* PDF Importer Section */}
            <div className="card-glass p-6 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                📄 นำเข้าข้อสอบจาก PDF
              </h2>
              <p className="text-muted-foreground mb-6">
                อัปโหลดไฟล์ PDF ที่มีข้อสอบ ระบบจะใช้ AI วิเคราะห์และแปลงเป็นข้อสอบอัตโนมัติ
              </p>
              <PDFQuestionImporter 
                teacherId={systemTeacherId}
                grade={1}
                semester={1}
                onImportComplete={() => {
                  // Refresh the question bank manager after import
                  window.location.reload();
                }}
              />
            </div>

            {/* Question Bank Manager Section */}
            <div className="card-glass p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                📋 คลังข้อสอบระบบทั้งหมด
              </h2>
              <p className="text-muted-foreground mb-6">
                จัดการข้อสอบที่นำเข้าแล้ว - แก้ไข ลบ หรือแชร์ให้ครูทุกคนใช้งานได้
              </p>
              <QuestionBankManager teacherId={systemTeacherId} />
            </div>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
