import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface ExamLink {
  id: string;
  link_code: string;
  grade: number;
  semester: number | null;
  assessment_type: 'semester' | 'nt';
  max_students: number;
  current_students: number;
  status: 'active' | 'full' | 'expired';
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  activity_name: string | null;
  total_questions: number;
}

export interface ExamSession {
  id: string;
  exam_link_id: string;
  student_name: string;
  student_class: string;
  student_number: number;
  grade: number;
  semester: number | null;
  assessment_type: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_taken: number;
  completed_at: string;
  attempt_number?: number;
  assessment_data?: {
    questions: Array<{
      question: string;
      userAnswer: any;
      correctAnswer: any;
      originalIndex?: number;
    }>;
  };
}

export const useTeacherExams = (teacherId: string | null) => {
  const [examLinks, setExamLinks] = useState<ExamLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchExamLinks = async () => {
    if (!teacherId) return;

    try {
      const { data, error } = await supabase
        .from('exam_links')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExamLinks((data as ExamLink[]) || []);
    } catch (error: any) {
      console.error('Error fetching exam links:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดข้อมูล link ข้อสอบได้',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExamLinks();
  }, [teacherId]);

  const createExamLink = async (
    grade: number,
    semester: number | null,
    assessmentType: 'semester' | 'nt',
    maxStudents: number = 30,
    passcode?: string,
    startTime?: Date | null,
    timeLimitMinutes?: number | null,
    allowRetake: boolean = false,
    activityName?: string,
    totalQuestions: number = 20
  ) => {
    if (!teacherId) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่พบข้อมูลครู',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // Generate unique code
      const linkCode = generateLinkCode(grade, semester, assessmentType);

      const { data, error } = await supabase
        .from('exam_links')
        .insert({
          teacher_id: teacherId as string,
          link_code: linkCode,
          grade,
          semester,
          assessment_type: assessmentType,
          max_students: maxStudents,
          status: 'active',
          exam_passcode: passcode || null,
          start_time: startTime ? startTime.toISOString() : null,
          time_limit_minutes: timeLimitMinutes || null,
          allow_retake: allowRetake,
          activity_name: activityName || null,
          total_questions: totalQuestions
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'สำเร็จ!',
        description: 'สร้าง link ข้อสอบเรียบร้อยแล้ว',
      });

      await fetchExamLinks();
      return data;
    } catch (error: any) {
      console.error('Error creating exam link:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถสร้าง link ได้',
        variant: 'destructive'
      });
      return null;
    }
  };

  const fetchExamSessions = async (examLinkId: string): Promise<ExamSession[]> => {
    try {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('exam_link_id', examLinkId)
        .eq('is_draft', false)
        .order('score', { ascending: false });

      if (error) throw error;
      return (data as any[])?.map(session => ({
        ...session,
        assessment_data: session.assessment_data as ExamSession['assessment_data']
      })) || [];
    } catch (error: any) {
      console.error('Error fetching exam sessions:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดผลการสอบได้',
        variant: 'destructive'
      });
      return [];
    }
  };

  const deleteExamSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('exam_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'ลบข้อมูลการสอบเรียบร้อยแล้ว',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting exam session:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบข้อมูลได้',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateExamLinkStatus = async (linkId: string, status: 'active' | 'expired') => {
    try {
      const { error } = await supabase
        .from('exam_links')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'อัพเดทสถานะเรียบร้อย',
      });

      await fetchExamLinks();
    } catch (error: any) {
      console.error('Error updating exam link:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัพเดทสถานะได้',
        variant: 'destructive'
      });
    }
  };

  return {
    examLinks,
    isLoading,
    createExamLink,
    fetchExamSessions,
    updateExamLinkStatus,
    refreshExamLinks: fetchExamLinks,
    deleteExamSession
  };
};

// Helper function to generate unique secure exam link code (20+ characters)
function generateLinkCode(grade: number, semester: number | null, type: 'semester' | 'nt'): string {
  const typePrefix = type === 'nt' ? 'NT' : `S${semester}`;
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 10);
  const random2 = Math.random().toString(36).substring(2, 10);
  return `G${grade}${typePrefix}-${timestamp}-${random1}${random2}`.toUpperCase();
}
