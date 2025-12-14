import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTeacherRole } from '../hooks/useTeacherRole';
import { useIsMobile } from '../hooks/use-mobile';
import LanguageSwitcher from './LanguageSwitcher';
import logoAIBrain from '../assets/logo-ai-final.png';
import { FileQuestion, Rocket, RefreshCw, Atom, GraduationCap, Menu, LogOut, UserPlus, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const { isLoggedIn, logout, registrationId, username, profile } = useAuth();
  const { t } = useTranslation('header');
  const location = useLocation();
  const { isTeacher } = useTeacherRole(registrationId);
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get avatar URL from profile or use default
  const avatarUrl = profile?.avatar || '';
  const displayName = username || profile?.nickname || 'ผู้ใช้';
  
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // Check if we should show hamburger menu (mobile or tablet)
  const showHamburger = isMobile || (typeof window !== 'undefined' && window.innerWidth < 1024);
  
  const handleMenuClose = () => setIsMenuOpen(false);
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/20 border-b border-white/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white hover:scale-105 transition-transform duration-200">
            <img src={logoAIBrain} alt="KidFastAI Logo" className="w-10 h-10 md:w-12 md:h-12 scale-110 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="text-amber-400 hidden sm:inline">KidFastAI.com</span>
            <span className="text-amber-400 sm:hidden">KidFast</span>
          </Link>
          
          {/* Right side controls */}
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
            
            {/* Large Desktop (lg+): แสดงปุ่มเมนูในแถวเดียวกัน */}
            {isLoggedIn && (
              <div className="hidden lg:flex items-center gap-2">
                <Link 
                  to="/profile" 
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Rocket className="w-4 h-4" />
                  {t('startPractice')}
                </Link>
                
                <div className="relative">
                  <Link 
                    to="/stem" 
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-medium transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Atom className="w-4 h-4" />
                    {t('stemxai')}
                  </Link>
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 animate-pulse shadow-lg border-2 border-white">
                    Beta
                  </Badge>
                </div>
                
                <div className="relative">
                  <Link 
                    to="/quiz" 
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all duration-300 hover:scale-105 text-sm flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <FileQuestion className="w-4 h-4" />
                    {t('quiz')}
                  </Link>
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 animate-pulse shadow-lg border-2 border-white">
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
              </div>
            )}
            
            {/* Large Desktop (lg+): ยังไม่ login */}
            {!isLoggedIn && (
              <div className="hidden lg:flex items-center gap-2">
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
              </div>
            )}
            
            {/* Hamburger Menu for Mobile & Tablet */}
            <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
                    aria-label="Menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[280px] sm:w-[320px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-l border-purple-500/30"
                >
                  <SheetHeader className="pb-4 border-b border-white/10">
                    <SheetTitle className="text-white flex items-center gap-2">
                      <img src={logoAIBrain} alt="Logo" className="w-8 h-8" />
                      <span className="text-amber-400">KidFastAI</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  {/* User Info Section */}
                  {isLoggedIn && (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10">
                      <Avatar className="w-12 h-12 border-2 border-purple-400 shadow-lg">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{displayName}</p>
                        <p className="text-white/60 text-sm">{profile?.grade || ''}</p>
                      </div>
                    </div>
                  )}
                  
                  <nav className="mt-4 flex flex-col gap-3">
                    {isLoggedIn ? (
                      <>
                        <Link 
                          to="/profile" 
                          onClick={handleMenuClose}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:scale-[1.02] transition-all"
                        >
                          <Rocket className="w-5 h-5" />
                          {t('startPractice')}
                        </Link>
                        
                        <div className="relative">
                          <Link 
                            to="/stem" 
                            onClick={handleMenuClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-medium shadow-md hover:scale-[1.02] transition-all"
                          >
                            <Atom className="w-5 h-5" />
                            {t('stemxai')}
                          </Link>
                          <Badge className="absolute top-1 right-2 bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                            Beta
                          </Badge>
                        </div>
                        
                        <div className="relative">
                          <Link 
                            to="/quiz" 
                            onClick={handleMenuClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md hover:scale-[1.02] transition-all"
                          >
                            <FileQuestion className="w-5 h-5" />
                            {t('quiz')}
                          </Link>
                          <Badge className="absolute top-1 right-2 bg-green-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                            New !
                          </Badge>
                        </div>
                        
                        {isTeacher && (
                          <Link 
                            to="/teacher" 
                            onClick={handleMenuClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium shadow-md hover:scale-[1.02] transition-all"
                          >
                            <GraduationCap className="w-5 h-5" />
                            {t('teacherDashboard', 'ครู')}
                          </Link>
                        )}
                        
                        <div className="border-t border-white/10 my-2" />
                        
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-md hover:scale-[1.02] transition-all"
                        >
                          <LogOut className="w-5 h-5" />
                          {t('logout')}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                          to="/signup" 
                          onClick={handleMenuClose}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md hover:scale-[1.02] transition-all"
                        >
                          <UserPlus className="w-5 h-5" />
                          {t('signup')}
                        </Link>
                        
                        <Link 
                          to="/login" 
                          onClick={handleMenuClose}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium shadow-md hover:scale-[1.02] transition-all"
                          style={{
                            background: 'linear-gradient(135deg, hsl(142, 100%, 60%) 0%, hsl(171, 100%, 65%) 100%)',
                          }}
                        >
                          <LogIn className="w-5 h-5" />
                          {t('login')}
                        </Link>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;