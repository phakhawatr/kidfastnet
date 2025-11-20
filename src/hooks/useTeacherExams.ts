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
  has_custom_questions?: boolean;
  questions_finalized_at?: string;
}

export interface ExamQuestion {
  id: string;
  exam_link_id: string;
  question_number: number;
  question_text: string;
  choices: any[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skill_name: string;
  is_edited: boolean;
  explanation?: string;
  visual_elements?: any;
  is_from_bank?: boolean;
  question_bank_id?: string;
}

export interface QuestionBankItem {
  id: string;
  teacher_id: string;
  question_text: string;
  choices: any[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skill_name: string;
  grade: number;
  subject: string;
  explanation?: string;
  visual_elements?: any;
  tags: string[];
  times_used: number;
  created_at: string;
  updated_at: string;
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

  const fetchExamQuestions = async (examLinkId: string): Promise<ExamQuestion[]> => {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_link_id', examLinkId)
      .order('question_number');
    
    if (error) {
      console.error('Error fetching exam questions:', error);
      return [];
    }
    
    return (data || []) as ExamQuestion[];
  };

  const updateExamQuestion = async (questionId: string, updates: Partial<ExamQuestion>) => {
    try {
      const { error } = await supabase
        .from('exam_questions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'อัพเดทโจทย์เรียบร้อยแล้ว',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating exam question:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัพเดทโจทย์ได้',
        variant: 'destructive'
      });
      return false;
    }
  };

  const saveToQuestionBank = async (question: Partial<QuestionBankItem>) => {
    if (!teacherId) return null;

    try {
      const { data, error } = await supabase
        .from('question_bank')
        .insert([{
          teacher_id: teacherId,
          ...question
        } as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'สำเร็จ!',
        description: 'บันทึกโจทย์ลง Question Bank แล้ว',
      });

      return data;
    } catch (error: any) {
      console.error('Error saving to question bank:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถบันทึกโจทย์ได้',
        variant: 'destructive'
      });
      return null;
    }
  };

  const fetchQuestionBank = async (filters?: { grade?: number; difficulty?: string }) => {
    if (!teacherId) return [];

    try {
      let query = supabase
        .from('question_bank')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (filters?.grade) {
        query = query.eq('grade', filters.grade);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as QuestionBankItem[];
    } catch (error: any) {
      console.error('Error fetching question bank:', error);
      return [];
    }
  };

  const deleteFromQuestionBank = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('question_bank')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: 'สำเร็จ',
        description: 'ลบโจทย์จาก Question Bank แล้ว',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting from question bank:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบโจทย์ได้',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    examLinks,
    isLoading,
    createExamLink,
    fetchExamSessions,
    updateExamLinkStatus,
    refreshExamLinks: fetchExamLinks,
    deleteExamSession,
    fetchExamQuestions,
    updateExamQuestion,
    saveToQuestionBank,
    fetchQuestionBank,
    deleteFromQuestionBank,
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
