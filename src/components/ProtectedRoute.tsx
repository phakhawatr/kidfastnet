import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { hasAppAccess, FREE_TIER_APPS } from '../config/subscriptionConfig';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isLoading, profile } = useAuth();
  const location = useLocation();
  const [shouldCheckAuth, setShouldCheckAuth] = useState(false);
  const [localAuthState, setLocalAuthState] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [tierLoading, setTierLoading] = useState(true);

  // Check localStorage auth state immediately (synchronous)
  const getLocalAuthState = () => {
    try {
      const stored = localStorage.getItem('kidfast_auth');
      if (stored) {
        const authState = JSON.parse(stored);
        return authState.loggedIn === true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };

  // Fetch subscription tier
  useEffect(() => {
    const fetchTier = async () => {
      try {
        // Check from profile first
        if (profile?.subscription_tier) {
          setSubscriptionTier(profile.subscription_tier);
          setTierLoading(false);
          return;
        }

        // Check from localStorage
        const stored = localStorage.getItem('kidfast_auth');
        if (stored) {
          const authState = JSON.parse(stored);
          const email = localStorage.getItem('kidfast_last_email');
          
          if (authState.registrationId) {
            const { data } = await supabase
              .from('user_registrations')
              .select('subscription_tier')
              .eq('id', authState.registrationId)
              .maybeSingle();
            
            if (data?.subscription_tier) {
              setSubscriptionTier(data.subscription_tier);
            }
          } else if (email) {
            const { data } = await supabase
              .from('user_registrations')
              .select('subscription_tier')
              .eq('parent_email', email)
              .eq('status', 'approved')
              .maybeSingle();
            
            if (data?.subscription_tier) {
              setSubscriptionTier(data.subscription_tier);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching subscription tier:', error);
      }
      setTierLoading(false);
    };

    fetchTier();
  }, [profile]);

  // Initialize and listen for localStorage changes
  useEffect(() => {
    // Set initial state
    setLocalAuthState(getLocalAuthState());

    // Listen for storage changes (from login in another tab or after login)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kidfast_auth' || e.key === null) {
        setLocalAuthState(getLocalAuthState());
      }
    };

    // Listen for custom auth change events (from same tab)
    const handleAuthChange = () => {
      setLocalAuthState(getLocalAuthState());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const hasLocalAuth = localAuthState;

  // If we have localStorage auth, we're good to go immediately
  // Only wait for Supabase auth if we don't have localStorage auth
  useEffect(() => {
    if (hasLocalAuth) {
      // Has local auth, no need to wait
      setShouldCheckAuth(true);
    } else if (!isLoading) {
      // No local auth and not loading anymore, check full auth
      setShouldCheckAuth(true);
    }
  }, [hasLocalAuth, isLoading]);

  const isAuthenticated = isLoggedIn || hasLocalAuth;
  const currentPath = location.pathname;

  console.log('ProtectedRoute check:', { isLoggedIn, hasLocalAuth, isAuthenticated, isLoading, currentPath, subscriptionTier });

  // If we have localStorage auth, check tier access
  if (hasLocalAuth) {
    // If still loading tier, show loading for non-free apps
    if (tierLoading && !FREE_TIER_APPS.some(app => currentPath.startsWith(app))) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="card-glass p-8 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-[hsl(var(--text-secondary))]">กำลังตรวจสอบสิทธิ์...</p>
          </div>
        </div>
      );
    }

    // Check tier access
    const tier = profile?.subscription_tier || subscriptionTier || 'basic';
    const canAccess = hasAppAccess(currentPath, tier);

    if (!canAccess) {
      console.log('Access denied for path:', currentPath, 'tier:', tier);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <div className="card-glass p-8 text-center max-w-md mx-4">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">ต้องอัพเกรดเป็น Premium</h2>
            <p className="text-muted-foreground mb-6">
              ฟีเจอร์นี้สำหรับสมาชิก Premium เท่านั้น<br/>
              อัพเกรดเพื่อเข้าถึงแอปทั้งหมด!
            </p>
            <div className="space-y-3">
              <a
                href="/profile?tab=subscription"
                className="block w-full btn-primary py-3 text-center"
              >
                ⭐ ดูแพ็คเกจ Premium
              </a>
              <a
                href="/profile"
                className="block w-full py-3 text-center text-muted-foreground hover:text-foreground transition-colors"
              >
                กลับหน้าโปรไฟล์
              </a>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>สมาชิกฟรี</strong> สามารถเล่น:<br/>
                ➕ บวกเลข ➖ ลบเลข ✖️ คูณเลข ➗ หารเลข
              </p>
            </div>
          </div>
        </div>
      );
    }

    console.log('Authenticated via localStorage, rendering protected content');
    return <>{children}</>;
  }

  // Otherwise, show loading while checking Supabase auth
  if (isLoading || !shouldCheckAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-[hsl(var(--text-secondary))]">กำลังตรวจสอบ...</p>
        </div>
      </div>
    );
  }

  // Check Supabase auth
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    // Store current path for redirect after login
    sessionStorage.setItem('redirect_after_login', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  console.log('Authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;