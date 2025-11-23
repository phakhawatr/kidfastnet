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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* AI Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Header />
      
      <div className="flex-1 container mx-auto py-6 relative z-10">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/teacher')} className="text-white hover:text-white/80">
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