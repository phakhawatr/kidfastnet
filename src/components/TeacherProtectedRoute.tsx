import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TeacherProtectedRouteProps {
  children: React.ReactNode;
}

const TeacherProtectedRoute = ({ children }: TeacherProtectedRouteProps) => {
  const { user, registrationId } = useAuth();
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeacherRole = async () => {
      const userId = user?.id || registrationId;
      if (!userId) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'teacher')
        .maybeSingle();

      setIsTeacher(!!data);
      setIsLoading(false);
    };

    checkTeacherRole();
  }, [user, registrationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="card-glass p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์ครู...</p>
        </div>
      </div>
    );
  }

  if (!isTeacher) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default TeacherProtectedRoute;
