import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, isLoading } = useAuth();
  const [shouldCheckAuth, setShouldCheckAuth] = useState(false);

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

  const hasLocalAuth = getLocalAuthState();

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

  console.log('ProtectedRoute check:', { isLoggedIn, hasLocalAuth, isAuthenticated, isLoading });

  // If we have localStorage auth, render immediately without waiting
  if (hasLocalAuth) {
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
    return <Navigate to="/login" replace />;
  }

  console.log('Authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;