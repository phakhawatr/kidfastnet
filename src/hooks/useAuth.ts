import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastManager } from '../components/Toast';

interface AuthState {
  loggedIn: boolean;
  username: string;
  isDemo?: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('kidfast_auth');
    if (stored) {
      try {
        setAuthState(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('kidfast_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string, isDemo = false) => {
    if (username === 'user' && password === '123456') {
      const newAuthState: AuthState = { 
        loggedIn: true, 
        username: isDemo ? 'นักเรียนทดลอง' : username,
        isDemo 
      };
      setAuthState(newAuthState);
      localStorage.setItem('kidfast_auth', JSON.stringify(newAuthState));
      
      ToastManager.show({
        message: isDemo ? 'เข้าสู่โหมดทดลองเรียบร้อย!' : 'เข้าสู่ระบบเรียบร้อย!',
        type: 'success'
      });
      
      navigate('/profile');
      return true;
    } else {
      ToastManager.show({
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        type: 'error'
      });
      return false;
    }
  };

  const logout = () => {
    setAuthState(null);
    localStorage.removeItem('kidfast_auth');
    ToastManager.show({
      message: 'ออกจากระบบเรียบร้อย!',
      type: 'info'
    });
    navigate('/login');
  };

  const demoLogin = () => {
    return login('user', '123456', true);
  };

  return {
    isLoggedIn: authState?.loggedIn || false,
    username: authState?.username,
    isDemo: authState?.isDemo || false,
    isLoading,
    login,
    logout,
    demoLogin
  };
};