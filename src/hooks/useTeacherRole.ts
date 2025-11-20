import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTeacherRole = (userId: string | null) => {
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 useTeacherRole - userId:', userId);
    
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
        
        console.log('✅ Teacher role check result:', {
          userId,
          hasData: !!data,
          isTeacher: !!data
        });
        
        setIsTeacher(!!data);
      } catch (error) {
        console.error('Error checking teacher role:', error);
        setIsTeacher(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeacherRole();

    // Set up realtime subscription for teacher role changes
    if (!userId) return;

    const channel = supabase
      .channel(`teacher_role_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Teacher role change detected:', payload);
          
          // Check if teacher role exists after any change
          if (payload.eventType === 'INSERT' && payload.new.role === 'teacher') {
            setIsTeacher(true);
          } else if (payload.eventType === 'DELETE' && payload.old.role === 'teacher') {
            setIsTeacher(false);
          } else {
            // For UPDATE, re-check the role
            checkTeacherRole();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { isTeacher, isLoading };
};
