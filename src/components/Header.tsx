import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import logoAIBrain from '../assets/logo-ai-final.png';
const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const { t } = useTranslation('header');
  const location = useLocation();
  
  const isAdminPage = location.pathname.startsWith('/admin');
  return <header className="sticky top-0 z-50 backdrop-blur-md bg-white/20 border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white hover:scale-105 transition-transform duration-200">
            <img src={logoAIBrain} alt="KidFastAI Logo" className="w-12 h-12 scale-110 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
            <span className="text-amber-400">KidFastAI.com</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {!isAdminPage && <LanguageSwitcher />}
            
            {isLoggedIn ? <>
                <Link to="/profile" className="btn-secondary text-sm">
                  {t('profile')}
                </Link>
                <button onClick={logout} className="px-4 py-2 rounded-full text-white/80 hover:text-white transition-all duration-200 text-sm bg-red-600 hover:bg-red-500">
                  {t('logout')}
                </button>
              </> : <>
                <Link to="/signup" className="btn-primary text-sm">
                  {t('signup')}
                </Link>
                <Link to="/login" className="px-4 py-2 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 text-sm" style={{
              background: 'linear-gradient(135deg, hsl(142, 100%, 60%) 0%, hsl(171, 100%, 65%) 100%)',
              boxShadow: '0 4px 15px hsl(142 100% 60% / 0.3)'
            }}>
                  {t('login')}
                </Link>
              </>}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;