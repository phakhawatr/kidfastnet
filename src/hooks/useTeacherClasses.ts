import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Class = Database['public']['Tables']['classes']['Row'];
type ClassStudent = Database['public']['Tables']['class_students']['Row'];

interface ClassWithDetails extends Class {
  school_name?: string;
  student_count?: number;
}

interface StudentWithProgress {
  id: string;
  student_id: string;
  student_number: number | null;
  is_active: boolean;
  enrolled_at: string;
  // User details
  nickname: string;
  avatar: string;
  grade: string;
  parent_email: string;
  // Progress stats
  total_missions: number;
  completed_missions: number;
  total_stars: number;
  current_streak: number;
  avg_accuracy: number;
  last_activity: string | null;
}

interface ClassProgress {
  class_id: string;
  class_name: string;
  total_students: number;
  active_students_today: number;
  avg_accuracy: number;
  avg_stars: number;
  completion_rate: number;
}

export const useTeacherClasses = (userId: string | null) => {
  const [teacherClasses, setTeacherClasses] = useState<ClassWithDetails[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(null);
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [classProgress, setClassProgress] = useState<ClassProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch classes assigned to this teacher
  const fetchTeacherClasses = useCallback(async () => {
    if (!userId) {
      setTeacherClasses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data: classes, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', userId)
        .eq('is_active', true)
        .order('grade', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Get school names and student counts
      const classesWithDetails: ClassWithDetails[] = await Promise.all(
        (classes || []).map(async (cls) => {
          // Get school name
          const { data: school } = await supabase
            .from('schools')
            .select('name')
            .eq('id', cls.school_id)
            .single();

          // Count students
          const { count: studentCount } = await supabase
            .from('class_students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id)
            .eq('is_active', true);

          return {
            ...cls,
            school_name: school?.name || '',
            student_count: studentCount || 0,
          };
        })
      );

      setTeacherClasses(classesWithDetails);

      // Auto-select first class if none selected
      if (!selectedClass && classesWithDetails.length > 0) {
        setSelectedClass(classesWithDetails[0]);
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedClass]);

  // Fetch students in selected class with their progress
  const fetchClassStudents = useCallback(async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    try {
      // Get class students
      const { data: classStudents, error: studentsError } = await supabase
        .from('class_students')
        .select('*')
        .eq('class_id', selectedClass.id)
        .eq('is_active', true)
        .order('student_number', { ascending: true });

      if (studentsError) throw studentsError;

      // Get student details and progress
      const studentsWithProgress: StudentWithProgress[] = await Promise.all(
        (classStudents || []).map(async (cs) => {
          // Get user details
          const { data: user } = await supabase
            .from('user_registrations')
            .select('nickname, avatar, grade, parent_email, last_activity_at')
            .eq('id', cs.student_id)
            .single();

          // Get streak info
          const { data: streak } = await supabase
            .from('user_streaks')
            .select('current_streak, total_stars_earned, total_missions_completed')
            .eq('user_id', cs.student_id)
            .single();

          // Get missions from last 30 days for accuracy calculation
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: missions } = await supabase
            .from('daily_missions')
            .select('correct_answers, total_questions, status')
            .eq('user_id', cs.student_id)
            .gte('mission_date', thirtyDaysAgo.toISOString().split('T')[0]);

          const completedMissions = missions?.filter(m => m.status === 'completed') || [];
          const totalCorrect = completedMissions.reduce((sum, m) => sum + (m.correct_answers || 0), 0);
          const totalQuestions = completedMissions.reduce((sum, m) => sum + (m.total_questions || 0), 0);
          const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

          return {
            id: cs.id,
            student_id: cs.student_id,
            student_number: cs.student_number,
            is_active: cs.is_active ?? true,
            enrolled_at: cs.enrolled_at,
            nickname: user?.nickname || 'ไม่ระบุชื่อ',
            avatar: user?.avatar || '👤',
            grade: user?.grade || '',
            parent_email: user?.parent_email || '',
            total_missions: streak?.total_missions_completed || 0,
            completed_missions: completedMissions.length,
            total_stars: streak?.total_stars_earned || 0,
            current_streak: streak?.current_streak || 0,
            avg_accuracy: avgAccuracy,
            last_activity: user?.last_activity_at || null,
          };
        })
      );

      setStudents(studentsWithProgress);

      // Calculate class progress
      const activeToday = studentsWithProgress.filter(s => {
        if (!s.last_activity) return false;
        const today = new Date().toISOString().split('T')[0];
        return s.last_activity.startsWith(today);
      }).length;

      const avgAccuracy = studentsWithProgress.length > 0
        ? Math.round(studentsWithProgress.reduce((sum, s) => sum + s.avg_accuracy, 0) / studentsWithProgress.length)
        : 0;

      const avgStars = studentsWithProgress.length > 0
        ? Math.round(studentsWithProgress.reduce((sum, s) => sum + s.total_stars, 0) / studentsWithProgress.length)
        : 0;

      const completionRate = studentsWithProgress.length > 0
        ? Math.round((studentsWithProgress.filter(s => s.completed_missions > 0).length / studentsWithProgress.length) * 100)
        : 0;

      setClassProgress({
        class_id: selectedClass.id,
        class_name: selectedClass.name,
        total_students: studentsWithProgress.length,
        active_students_today: activeToday,
        avg_accuracy: avgAccuracy,
        avg_stars: avgStars,
        completion_rate: completionRate,
      });

    } catch (error) {
      console.error('Error fetching class students:', error);
    }
  }, [selectedClass]);

  // Add student to class
  const addStudentToClass = async (studentEmail: string, studentNumber?: number) => {
    if (!selectedClass) throw new Error('No class selected');

    try {
      // Find student by email
      const { data: user, error: userError } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('parent_email', studentEmail)
        .single();

      if (userError || !user) {
        throw new Error('ไม่พบนักเรียนด้วยอีเมลนี้');
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('class_students')
        .select('id')
        .eq('class_id', selectedClass.id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (existing) {
        throw new Error('นักเรียนอยู่ในห้องเรียนนี้แล้ว');
      }

      // Add to class_students
      const { error } = await supabase
        .from('class_students')
        .insert([{
          class_id: selectedClass.id,
          student_id: user.id,
          student_number: studentNumber,
          is_active: true,
        }]);

      if (error) throw error;

      // Also ensure student is a school member
      const { data: existingMembership } = await supabase
        .from('school_memberships')
        .select('id')
        .eq('school_id', selectedClass.school_id)
        .eq('user_id', user.id)
        .eq('role', 'student')
        .maybeSingle();

      if (!existingMembership) {
        await supabase
          .from('school_memberships')
          .insert([{
            school_id: selectedClass.school_id,
            user_id: user.id,
            role: 'student',
            is_active: true,
          }]);
      }

      await fetchClassStudents();
      await fetchTeacherClasses();
    } catch (error) {
      console.error('Error adding student to class:', error);
      throw error;
    }
  };

  // Remove student from class
  const removeStudentFromClass = async (classStudentId: string) => {
    try {
      const { error } = await supabase
        .from('class_students')
        .update({ is_active: false })
        .eq('id', classStudentId);

      if (error) throw error;

      await fetchClassStudents();
      await fetchTeacherClasses();
    } catch (error) {
      console.error('Error removing student from class:', error);
      throw error;
    }
  };

  // Update student number
  const updateStudentNumber = async (classStudentId: string, studentNumber: number) => {
    try {
      const { error } = await supabase
        .from('class_students')
        .update({ student_number: studentNumber })
        .eq('id', classStudentId);

      if (error) throw error;

      await fetchClassStudents();
    } catch (error) {
      console.error('Error updating student number:', error);
      throw error;
    }
  };

  // Get detailed student progress
  const getStudentDetailedProgress = async (studentId: string) => {
    try {
      // Get skill assessments
      const { data: skills } = await supabase
        .from('skill_assessments')
        .select('*')
        .eq('user_id', studentId)
        .order('accuracy_rate', { ascending: true });

      // Get recent missions
      const { data: missions } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', studentId)
        .order('mission_date', { ascending: false })
        .limit(30);

      // Get practice sessions
      const { data: sessions } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', studentId)
        .order('session_date', { ascending: false })
        .limit(20);

      return {
        skills: skills || [],
        missions: missions || [],
        sessions: sessions || [],
      };
    } catch (error) {
      console.error('Error fetching student detailed progress:', error);
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    fetchTeacherClasses();
  }, [fetchTeacherClasses]);

  useEffect(() => {
    fetchClassStudents();
  }, [selectedClass, fetchClassStudents]);

  return {
    teacherClasses,
    selectedClass,
    setSelectedClass,
    students,
    classProgress,
    isLoading,
    fetchTeacherClasses,
    fetchClassStudents,
    addStudentToClass,
    removeStudentFromClass,
    updateStudentNumber,
    getStudentDetailedProgress,
  };
};
