import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { ToastManager } from '../components/Toast';

interface AuthState {
  loggedIn: boolean;
  username: string;
  isDemo?: boolean;
}

interface ProfileData {
  nickname: string;
  age: number;
  grade: string;
  avatar: string;
  is_approved: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch to avoid recursion
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, age, grade, avatar, is_approved')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const login = async (email: string, password: string, isDemo = false) => {
    try {
      if (isDemo) {
        // Demo mode - create temporary auth state
        const demoAuthState: AuthState = { 
          loggedIn: true, 
          username: 'นักเรียนทดลอง',
          isDemo: true
        };
        localStorage.setItem('kidfast_auth', JSON.stringify(demoAuthState));
        
        ToastManager.show({
          message: 'เข้าสู่โหมดทดลองเรียบร้อย!',
          type: 'success'
        });
        
        navigate('/profile');
        return { success: true };
      }

      // Use secure authentication function to check approved users
      try {
        console.log('Attempting to authenticate user:', email);
        const { data: authResult, error } = await supabase.rpc('authenticate_user', {
          user_email: email,
          user_password: password
        });

        console.log('Authentication result:', authResult, 'Error:', error);

        if (!error && authResult && authResult.length > 0) {
          const result = authResult[0];
          console.log('User found:', result);
          if (result.is_valid) {
            const authState: AuthState = { 
              loggedIn: true, 
              username: result.nickname,
              isDemo: false
            };
            localStorage.setItem('kidfast_auth', JSON.stringify(authState));
            
            ToastManager.show({
              message: `ยินดีต้อนรับ ${result.nickname}!`,
              type: 'success'
            });
            
            navigate('/profile');
            return { success: true };
          }
        }
      } catch (dbError) {
        console.log('User authentication failed:', dbError);
      }

      // Check for test user credentials
      if (email === 'test@kidfast.net' && password === '123456') {
        const demoAuthState: AuthState = { 
          loggedIn: true, 
          username: 'ผู้ใช้ทดสอบ',
          isDemo: false
        };
        localStorage.setItem('kidfast_auth', JSON.stringify(demoAuthState));
        
        ToastManager.show({
          message: 'เข้าสู่ระบบทดสอบเรียบร้อย!',
          type: 'success'
        });
        
        navigate('/profile');
        return { success: true };
      }

      // Try Supabase Auth as fallback
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        ToastManager.show({
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูลหรือสมัครสมาชิกใหม่',
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        ToastManager.show({
          message: 'เข้าสู่ระบบเรียบร้อย!',
          type: 'success'
        });
        
        navigate('/profile');
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        type: 'error'
      });
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        ToastManager.show({
          message: error.message,
          type: 'error'
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        ToastManager.show({
          message: 'สมัครสมาชิกเรียบร้อย! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
          type: 'success'
        });
        return { success: true };
      }

      return { success: false, error: 'Signup failed' };
    } catch (error: any) {
      ToastManager.show({
        message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
        type: 'error'
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Clear demo auth if exists
      localStorage.removeItem('kidfast_auth');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }

      ToastManager.show({
        message: 'ออกจากระบบเรียบร้อย!',
        type: 'info'
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const demoLogin = () => {
    return login('demo@example.com', 'demopassword', true);
  };

  // Check if user is in demo mode
  const isDemoMode = () => {
    try {
      const stored = localStorage.getItem('kidfast_auth');
      if (stored) {
        const authState = JSON.parse(stored);
        return authState.isDemo === true;
      }
    } catch (e) {
      localStorage.removeItem('kidfast_auth');
    }
    return false;
  };

  const isLoggedIn = user !== null || isDemoMode();
  const username = profile?.nickname || user?.email || (isDemoMode() ? 'นักเรียนทดลอง' : '');
  const isDemo = isDemoMode();

  return {
    user,
    session,
    profile,
    isLoggedIn,
    username,
    isDemo,
    isLoading,
    login,
    signup,
    logout,
    demoLogin,
    fetchUserProfile
  };
};