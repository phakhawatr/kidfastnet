import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTeacherRole } from '../hooks/useTeacherRole';
import LanguageSwitcher from './LanguageSwitcher';
import logoAIBrain from '../assets/logo-ai-final.png';
import { FileQuestion, Rocket, RefreshCw, Atom, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { isLoggedIn, logout, registrationId } = useAuth();
  const { t } = useTranslation('header');
  const location = useLocation();
  const { isTeacher } = useTeacherRole(registrationId);
  
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/20 border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white hover:scale-105 transition-transform duration-200">
            <img src={logoAIBrain} alt="KidFastAI Logo" className="w-12 h-12 scale-110 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="text-amber-400">KidFastAI.com</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {!isAdminPage && <LanguageSwitcher />}
            
            {/* Manual Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              title={t('refresh')}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            {isLoggedIn ? (
              <>
                <Link 
                  to="/profile" 
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Rocket className="w-4 h-4" />
                  {t('startPractice')}
                </Link>
                
                {/* STEMxAI Button with Beta Badge */}
                <div className="relative">
                  <Link 
                    to="/stem" 
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-medium transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Atom className="w-4 h-4" />
                    {t('stemxai')}
                  </Link>
                  <Badge 
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 animate-pulse shadow-lg border-2 border-white whitespace-nowrap"
                  >
                    กำลังทดลองใช้
                  </Badge>
                </div>
                
                <Link 
                  to="/quiz" 
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <FileQuestion className="w-4 h-4" />
                  {t('quiz')}
                </Link>

                {isTeacher && (
                  <Link 
                    to="/teacher" 
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <GraduationCap className="w-4 h-4" />
                    {t('teacherDashboard', 'ครู')}
                  </Link>
                )}
                <button 
                  onClick={logout} 
                  className="px-4 py-2 rounded-full text-white/80 hover:text-white transition-all duration-200 text-sm bg-red-600 hover:bg-red-500"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn-primary text-sm">
                  {t('signup')}
                </Link>
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 text-sm" 
                  style={{
                    background: 'linear-gradient(135deg, hsl(142, 100%, 60%) 0%, hsl(171, 100%, 65%) 100%)',
                    boxShadow: '0 4px 15px hsl(142 100% 60% / 0.3)'
                  }}
                >
                  {t('login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
