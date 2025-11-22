import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuestionBankItem {
  id: string;
  teacher_id: string;
  question_text: string;
  choices: any;
  correct_answer: string;
  explanation?: string;
  grade: number;
  topic?: string;
  difficulty: string;
  skill_name: string;
  tags?: string[];
  visual_elements?: any;
  times_used: number;
  is_template: boolean;
  template_variables?: any;
  ai_generated: boolean;
  image_urls?: string[];
  created_at: string;
  updated_at: string;
}

export interface CurriculumTopic {
  id: string;
  grade: number;
  semester?: number;
  subject: string;
  topic_name_th: string;
  topic_name_en: string;
  skill_category: string;
  order_index?: number;
}

export interface QuestionTemplate {
  id: string;
  teacher_id: string;
  template_name: string;
  template_text: string;
  variables: any;
  answer_formula: string;
  choices_formula?: any;
  grade: number;
  topic?: string;
  difficulty: string;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionFilters {
  grade?: number;
  topic?: string;
  difficulty?: string;
  tags?: string[];
  search?: string;
}

export function useQuestionBank(teacherId: string | null) {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchQuestions = async (filters: QuestionFilters = {}) => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('question_bank')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (filters.grade) query = query.eq('grade', filters.grade);
      if (filters.topic) query = query.eq('topic', filters.topic);
      if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
      if (filters.search) {
        query = query.ilike('question_text', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsByGrade = async (grade: number) => {
    try {
      const { data, error } = await supabase
        .from('curriculum_topics')
        .select('*')
        .eq('grade', grade)
        .order('order_index');

      if (error) throw error;
      setTopics(data || []);
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createQuestion = async (question: Partial<QuestionBankItem>) => {
    if (!teacherId) return null;

    try {
      const { data, error } = await supabase
        .from('question_bank')
        .insert([{
          teacher_id: teacherId,
          choices: question.choices || [],
          correct_answer: question.correct_answer || '',
          difficulty: question.difficulty || 'medium',
          grade: question.grade || 1,
          question_text: question.question_text || '',
          skill_name: question.skill_name || '',
          ...question,
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'สร้างโจทย์สำเร็จ',
        description: 'บันทึกโจทย์ลงคลังข้อสอบแล้ว',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateQuestion = async (id: string, updates: Partial<QuestionBankItem>) => {
    try {
      const { error } = await supabase
        .from('question_bank')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'อัพเดทสำเร็จ',
        description: 'แก้ไขโจทย์เรียบร้อยแล้ว',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('question_bank')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'ลบสำเร็จ',
        description: 'ลบโจทย์ออกจากคลังแล้ว',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const uploadImage = async (file: File) => {
    if (!teacherId) return null;

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      // Call edge function
      const { data, error } = await supabase.functions.invoke('upload-question-image', {
        body: { image: base64, teacherId },
      });

      if (error) throw error;
      return data.url;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const generateWithAI = async (params: {
    grade: number;
    topic: string;
    difficulty: string;
    count: number;
    language?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-questions', {
        body: params,
      });

      if (error) throw error;
      
      toast({
        title: 'สร้างโจทย์สำเร็จ',
        description: `AI สร้างโจทย์ได้ ${data.questions.length} ข้อ`,
      });

      return data.questions;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!teacherId) return;

    try {
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createTemplate = async (template: Partial<QuestionTemplate>) => {
    if (!teacherId) return null;

    try {
      const { data, error } = await supabase
        .from('question_templates')
        .insert([{
          teacher_id: teacherId,
          template_name: template.template_name || '',
          template_text: template.template_text || '',
          variables: template.variables || {},
          answer_formula: template.answer_formula || '',
          grade: template.grade || 1,
          difficulty: template.difficulty || 'medium',
          ...template,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'สร้างแม่แบบสำเร็จ',
        description: 'บันทึกแม่แบบโจทย์แล้ว',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const generateFromTemplate = async (templateId: string, count: number, customVariables?: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-from-template', {
        body: { templateId, count, customVariables },
      });

      if (error) throw error;

      toast({
        title: 'สร้างโจทย์สำเร็จ',
        description: `สร้างโจทย์จากแม่แบบได้ ${data.questions.length} ข้อ`,
      });

      return data.questions;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    topics,
    templates,
    loading,
    fetchQuestions,
    fetchTopicsByGrade,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    uploadImage,
    generateWithAI,
    fetchTemplates,
    createTemplate,
    generateFromTemplate,
  };
}