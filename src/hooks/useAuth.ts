import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { ToastManager } from '../components/Toast';
import { useUserPresence } from './useUserPresence';
import { sessionManager } from '../utils/sessionTimeout';

interface AuthState {
  loggedIn: boolean;
  username: string;
  isDemo?: boolean;
  registrationId?: string; // Store registration ID for presence tracking
  memberId?: string; // Store member ID
}

interface ProfileData {
  nickname: string;
  age: number;
  grade: string;
  avatar: string;
  is_approved: boolean;
  subscription_tier?: string;
  ai_features_enabled?: boolean;
  ai_monthly_quota?: number;
  ai_usage_count?: number;
  ai_quota_reset_date?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authRefresh, setAuthRefresh] = useState(0); // Force refresh trigger
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
          
          // Start session timeout monitoring
          sessionManager.startSession(() => {
            ToastManager.show({
              message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
              type: 'info'
            });
            logout();
          });
        } else {
          setProfile(null);
          sessionManager.endSession();
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
        
        // Start session timeout monitoring for existing session
        sessionManager.startSession(() => {
          ToastManager.show({
            message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
            type: 'info'
          });
          logout();
        });
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      sessionManager.endSession();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try to get profile from profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('nickname, age, grade, avatar, is_approved, parent_email')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        return;
      }

      // If we have profile data, also fetch subscription data from user_registrations
      if (profileData) {
        const { data: regData } = await supabase
          .from('user_registrations')
          .select('subscription_tier, ai_features_enabled, ai_monthly_quota, ai_usage_count, ai_quota_reset_date')
          .eq('parent_email', profileData.parent_email)
          .maybeSingle();

        // Merge both data sources
        setProfile({
          ...profileData,
          subscription_tier: regData?.subscription_tier,
          ai_features_enabled: regData?.ai_features_enabled,
          ai_monthly_quota: regData?.ai_monthly_quota,
          ai_usage_count: regData?.ai_usage_count,
          ai_quota_reset_date: regData?.ai_quota_reset_date,
        });
      }
    } catch (error) {
      // Error fetching profile
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
        
        setTimeout(() => {
          setAuthRefresh(prev => prev + 1);
          navigate('/profile');
        }, 500);
        return { success: true };
      }

      // Generate unique session ID for this login attempt
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const deviceInfo = navigator.userAgent || 'Unknown Device';

      // First check if user can login (not already logged in from another device)
      try {
        const { data: sessionCheck, error: sessionError } = await supabase.rpc('check_user_session_status', {
          user_email: email,
          new_session_id: sessionId,
          new_device_info: deviceInfo
        });

        if (sessionError) {
          throw sessionError;
        }

        if (sessionCheck && sessionCheck.length > 0) {
          const sessionResult = sessionCheck[0];
          
          if (!sessionResult.can_login) {
            ToastManager.show({
              message: sessionResult.message || 'ไม่สามารถเข้าสู่ระบบได้',
              type: 'error'
            });
            return { success: false, error: sessionResult.message };
          }
        }
      } catch (sessionError) {
        // Continue with login attempt even if session check fails
      }

      // Use secure authentication function to check approved users
      try {
        const { data: authResult, error } = await supabase.rpc('authenticate_user', {
          user_email: email,
          user_password: password
        });

        if (!error && authResult && authResult.length > 0) {
          const result = authResult[0];
            if (result.is_valid) {
              // Update session after successful authentication
              try {
                await supabase.rpc('update_user_session', {
                  user_email: email,
                  session_id: sessionId,
                  device_info: deviceInfo
                });
              } catch (updateError) {
                // Don't block login if session update fails
              }

              const authState: AuthState = { 
                loggedIn: true, 
                username: result.nickname,
                isDemo: false,
                registrationId: result.user_id,
                memberId: result.member_id
              };
              localStorage.setItem('kidfast_auth', JSON.stringify(authState));
              localStorage.setItem('kidfast_session_id', sessionId);
              localStorage.setItem('kidfast_last_email', email);
              
              ToastManager.show({
                message: `ยินดีต้อนรับ ${result.nickname}!`,
                type: 'success'
              });
              
              setTimeout(() => {
                setAuthRefresh(prev => prev + 1);
                navigate('/profile');
              }, 500);
              
              return { success: true };
            }
        }
      } catch (dbError) {
        // Authentication failed silently
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
        
        setTimeout(() => {
          setAuthRefresh(prev => prev + 1);
          navigate('/profile');
        }, 500);
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
      // Stop session monitoring
      sessionManager.endSession();
      
      // Get current auth state and session info
      const authState = getAuthState();
      const sessionId = localStorage.getItem('kidfast_session_id');
      
      // Clear session in database if we have email info
      if (authState?.username && user?.email) {
        try {
          await supabase.rpc('logout_user_session', {
            user_email: user.email,
            session_id: sessionId || undefined
          });
        } catch (sessionError) {
          // Failed to clear session
        }
      }
      
      // Clear local storage
      localStorage.removeItem('kidfast_auth');
      localStorage.removeItem('kidfast_session_id');
      
      const { error } = await supabase.auth.signOut();

      ToastManager.show({
        message: 'ออกจากระบบเรียบร้อย!',
        type: 'info'
      });
      
      navigate('/login');
    } catch (error) {
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

  // Check if user is logged in
  const getAuthState = () => {
    try {
      const stored = localStorage.getItem('kidfast_auth');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      localStorage.removeItem('kidfast_auth');
    }
    return null;
  };

  const authState = getAuthState();
  const isLoggedIn = (user !== null) || (authState?.loggedIn === true);
  const username = profile?.nickname || user?.email || authState?.username || '';
  const isDemo = isDemoMode();

  // Set up presence tracking for authenticated users
  useUserPresence({
    userId: user?.id,
    userInfo: profile ? {
      nickname: profile.nickname,
      status: profile.is_approved ? 'approved' : 'pending'
    } : (authState?.username ? {
      nickname: authState.username,
      status: 'approved'
    } : undefined),
    registrationId: authState?.registrationId
  });

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