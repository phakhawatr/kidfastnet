import { Navigate } from 'react-router-dom';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';

interface SchoolAdminProtectedRouteProps {
  children: React.ReactNode;
}

const SchoolAdminProtectedRoute = ({ children }: SchoolAdminProtectedRouteProps) => {
  // Get user ID from localStorage (custom auth system)
  const authData = localStorage.getItem('kidfast_auth');
  const userId = authData ? JSON.parse(authData).registrationId : null;
  
  const { isSchoolAdmin, isLoading } = useSchoolAdmin(userId);

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!isSchoolAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default SchoolAdminProtectedRoute;
