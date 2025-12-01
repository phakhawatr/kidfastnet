import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTeacherRole } from '../hooks/useTeacherRole';
import { useIsMobile } from '../hooks/use-mobile';
import LanguageSwitcher from './LanguageSwitcher';
import logoAIBrain from '../assets/logo-ai-final.png';
import { FileQuestion, Rocket, RefreshCw, Atom, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { isLoggedIn, logout, registrationId } = useAuth();
  const { t } = useTranslation('header');
  const location = useLocation();
  const { isTeacher } = useTeacherRole(registrationId);
  const isMobile = useIsMobile();
  
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/20 border-b border-white/20">
      <div className="container mx-auto px-4 py-3">
        {/* แถวที่ 1: Logo + Utility Buttons */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white hover:scale-105 transition-transform duration-200">
            <img src={logoAIBrain} alt="KidFastAI Logo" className="w-10 h-10 md:w-12 md:h-12 scale-110 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="text-amber-400 hidden sm:inline">KidFastAI.com</span>
            <span className="text-amber-400 sm:hidden">KidFast</span>
          </Link>
          
          {/* Utility buttons + Desktop Menu */}
          <div className="flex items-center gap-2 md:gap-3">
            {!isAdminPage && <LanguageSwitcher />}
            
            {/* Manual Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-2 shadow-sm border border-white/20"
              title={t('refresh')}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{t('refresh', 'รีเฟรช')}</span>
            </button>
            
            {/* Desktop: แสดงปุ่มเมนูในแถวเดียวกัน */}
            {!isMobile && isLoggedIn && (
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
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 animate-pulse shadow-lg border-2 border-white"
                  >
                    Beta
                  </Badge>
                </div>
                
                {/* Quiz Button with New Badge */}
                <div className="relative">
                  <Link 
                    to="/quiz" 
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <FileQuestion className="w-4 h-4" />
                    {t('quiz')}
                  </Link>
                  <Badge 
                    className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 animate-pulse shadow-lg border-2 border-white"
                  >
                    New !
                  </Badge>
                </div>

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
            )}
            
            {/* Desktop: ยังไม่ login */}
            {!isMobile && !isLoggedIn && (
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
        
        {/* แถวที่ 2: Mobile Menu Buttons (Logged In) */}
        {isMobile && isLoggedIn && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-white/10">
            <Link 
              to="/profile" 
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-md"
            >
              <Rocket className="w-3.5 h-3.5" />
              {t('startPractice')}
            </Link>
            
            <div className="relative">
              <Link 
                to="/stem" 
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md"
              >
                <Atom className="w-3.5 h-3.5" />
                {t('stemxai')}
              </Link>
              <Badge 
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse shadow-lg border border-white"
              >
                Beta
              </Badge>
            </div>
            
            <div className="relative">
              <Link 
                to="/quiz" 
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md"
              >
                <FileQuestion className="w-3.5 h-3.5" />
                {t('quiz')}
              </Link>
              <Badge 
                className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[10px] px-1.5 py-0 animate-pulse shadow-lg border border-white"
              >
                New
              </Badge>
            </div>
            
            {isTeacher && (
              <Link 
                to="/teacher" 
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                {t('teacherDashboard', 'ครู')}
              </Link>
            )}
            
            <button 
              onClick={logout} 
              className="px-3 py-1.5 rounded-full text-white text-xs bg-red-600 hover:bg-red-500 shadow-md"
            >
              {t('logout')}
            </button>
          </div>
        )}
        
        {/* แถวที่ 2: Mobile - Not Logged In */}
        {isMobile && !isLoggedIn && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-white/10">
            <Link to="/signup" className="btn-primary text-xs px-3 py-1.5">
              {t('signup')}
            </Link>
            <Link 
              to="/login" 
              className="px-3 py-1.5 rounded-full text-white font-medium text-xs shadow-md" 
              style={{
                background: 'linear-gradient(135deg, hsl(142, 100%, 60%) 0%, hsl(171, 100%, 65%) 100%)',
                boxShadow: '0 4px 15px hsl(142 100% 60% / 0.3)'
              }}
            >
              {t('login')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
