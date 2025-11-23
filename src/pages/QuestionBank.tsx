import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuestionBankManager from '@/components/QuestionBankManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function QuestionBank() {
  const { registrationId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!registrationId) {
      navigate('/login');
    }
  }, [registrationId, navigate]);

  if (!registrationId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="flex-1 container mx-auto py-6">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/teacher')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปหน้าแผงควบคุม
          </Button>
        </div>
        
        <QuestionBankManager teacherId={registrationId} />
      </div>
      
      <Footer />
    </div>
  );
}