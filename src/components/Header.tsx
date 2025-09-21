import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/20 border-b border-white/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:scale-105 transition-transform duration-200">
            🧮 <span>KidFast.net</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/profile" 
                  className="btn-secondary text-sm"
                >
                  โปรไฟล์
                </Link>
                <button 
                  onClick={logout}
                  className="px-4 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/signup" 
                  className="btn-primary text-sm"
                >
                  สมัครสมาชิก
                </Link>
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 text-sm"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(142, 100%, 60%) 0%, hsl(171, 100%, 65%) 100%)',
                    boxShadow: '0 4px 15px hsl(142 100% 60% / 0.3)'
                  }}
                >
                  เข้าสู่ระบบ
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