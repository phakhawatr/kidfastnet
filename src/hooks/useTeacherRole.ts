import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTeacherRole = (userId: string | null) => {
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeacherRole = async () => {
      if (!userId) {
        setIsTeacher(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'teacher')
          .maybeSingle();

        if (error) throw error;
        setIsTeacher(!!data);
      } catch (error) {
        console.error('Error checking teacher role:', error);
        setIsTeacher(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeacherRole();
  }, [userId]);

  return { isTeacher, isLoading };
};
