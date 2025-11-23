import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { curriculumConfig } from '@/config/curriculum';
import { useTranslation } from 'react-i18next';

export interface QuestionBankItem {
  id: string;
  teacher_id: string | null;
  admin_id?: string | null;
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
  is_system_question?: boolean;
  template_variables?: any;
  ai_generated: boolean;
  image_urls?: string[];
  semester?: number;
  assessment_type?: string;
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
  semester?: number;
  assessment_type?: string;
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
  semester?: number;
  assessmentType?: string;
}

export function useQuestionBank(teacherId: string | null, isAdmin: boolean = false) {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Helper function to get Thai skill name from translation
  const getSkillNameTh = (skill: string): string => {
    try {
      return t(`skills:skills.${skill}.title`, { defaultValue: skill });
    } catch (error) {
      console.error('Translation error:', error);
      return skill;
    }
  };

  const fetchTopicsByGrade = (grade: number, semester?: number) => {
    try {
      console.log('Fetching topics for grade:', grade, 'semester:', semester);
      
      const gradeKey = `grade${grade}` as keyof typeof curriculumConfig;
      const semesterKey = semester ? `semester${semester}` : 'semester1';
      
      const gradeConfig = curriculumConfig[gradeKey];
      if (!gradeConfig) {
        console.log('No grade config found for:', gradeKey);
        setTopics([]);
        return;
      }

      const skills = gradeConfig[semesterKey] || [];
      console.log('Found skills:', skills.length, 'for', gradeKey, semesterKey);
      
      // Convert from SkillConfig[] to CurriculumTopic[]
      const topics: CurriculumTopic[] = skills.map((skill, index) => ({
        id: `${grade}-${semester || 1}-${skill.skill}-${index}`,
        grade: grade,
        semester: semester,
        subject: 'math',
        topic_name_th: getSkillNameTh(skill.skill),
        topic_name_en: skill.skill,
        skill_category: skill.skill,
        order_index: index
      }));
      
      console.log('Setting topics:', topics.map(t => t.topic_name_th));
      setTopics(topics);
    } catch (error: any) {
      console.error('Error fetching topics:', error);
      setTopics([]);
    }
  };

  const fetchQuestions = async (filters: QuestionFilters = {}) => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('question_bank')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter by teacher_id or admin_id based on user type
      if (isAdmin) {
        query = query.eq('admin_id', teacherId);
      } else {
        query = query.eq('teacher_id', teacherId);
      }

      if (filters.grade) query = query.eq('grade', filters.grade);
      if (filters.topic) query = query.eq('topic', filters.topic);
      if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
      if (filters.semester) query = query.eq('semester', filters.semester);
      if (filters.assessmentType) query = query.eq('assessment_type', filters.assessmentType);
      if (filters.search) {
        query = query.ilike('question_text', `%${filters.search}%`);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
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

  const createQuestion = async (question: Partial<QuestionBankItem>) => {
    if (!teacherId) return null;

    try {
      // Use the admin_id and is_system_question from the question parameter
      // Components already set these correctly based on whether admin is creating the question
      const isAdminQuestion = !!question.admin_id;
      
      const { data, error } = await supabase
        .from('question_bank')
        .insert([{
          teacher_id: isAdminQuestion ? null : teacherId,
          admin_id: question.admin_id || null,
          is_system_question: question.is_system_question || false,
          choices: question.choices || [],
          correct_answer: question.correct_answer || '',
          difficulty: question.difficulty || 'medium',
          grade: question.grade || 1,
          question_text: question.question_text || '',
          skill_name: question.skill_name || '',
          semester: question.semester,
          assessment_type: question.assessment_type,
          topic: question.topic,
          explanation: question.explanation,
          ai_generated: question.ai_generated || false,
          image_urls: question.image_urls,
          tags: question.tags,
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Add the new question to the questions state
      if (data) {
        setQuestions(prev => [data, ...prev]);
      }
      
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
    semester?: number;
    assessmentType?: string;
    topic: string;
    difficulty: string;
    count: number;
    language?: string;
  }) => {
    setLoading(true);
    try {
      // Find skill description and range from curriculumConfig
      const gradeKey = `grade${params.grade}` as keyof typeof curriculumConfig;
      const semesterKey = params.assessmentType === 'nt' 
        ? 'nt' 
        : `semester${params.semester || 1}`;
      
      const skills = curriculumConfig[gradeKey]?.[semesterKey] || [];
      
      // Find the skill config by matching translated topic name
      const skillConfig = skills.find(s => {
        const translatedTitle = t(`skills:skills.${s.skill}.title`);
        return translatedTitle === params.topic;
      });
      
      const description = skillConfig?.description || '';
      const range = skillConfig?.range;
      
      console.log('Generating with curriculum context:', {
        grade: params.grade,
        semester: params.semester,
        assessmentType: params.assessmentType,
        topic: params.topic,
        description,
        range
      });
      
      const { data, error } = await supabase.functions.invoke('ai-generate-questions', {
        body: {
          ...params,
          description,
          range
        }
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

  const shareQuestion = async (questionId: string, isPublic: boolean = true) => {
    if (!teacherId) return null;

    try {
      const { data, error } = await supabase
        .from('shared_questions')
        .insert([{
          question_id: questionId,
          shared_by: teacherId,
          is_public: isPublic,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'แชร์โจทย์สำเร็จ',
        description: `รหัสแชร์: ${data.share_code}`,
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

  const shareTemplate = async (templateId: string, isPublic: boolean = true) => {
    if (!teacherId) return null;

    try {
      const { data, error } = await supabase
        .from('shared_templates')
        .insert([{
          template_id: templateId,
          shared_by: teacherId,
          is_public: isPublic,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'แชร์แม่แบบสำเร็จ',
        description: `รหัสแชร์: ${data.share_code}`,
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

  const fetchSharedQuestions = async (filters: QuestionFilters = {}) => {
    try {
      let query = supabase
        .from('shared_questions')
        .select(`
          *,
          question:question_bank(*),
          shared_by_user:user_registrations(nickname)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const fetchSharedTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_templates')
        .select(`
          *,
          template:question_templates(*),
          shared_by_user:user_registrations(nickname)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const copySharedQuestion = async (questionId: string, sharedId: string) => {
    if (!teacherId) return null;

    try {
      // Get original question
      const { data: originalQuestion, error: fetchError } = await supabase
        .from('question_bank')
        .select('*')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      // Create copy with new teacher_id
      const { data: newQuestion, error: createError } = await supabase
        .from('question_bank')
        .insert([{
          ...originalQuestion,
          id: undefined,
          teacher_id: teacherId,
          created_at: undefined,
          updated_at: undefined,
          times_used: 0,
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Increment copy count
      const { data: sharedData } = await supabase
        .from('shared_questions')
        .select('copy_count')
        .eq('id', sharedId)
        .single();

      if (sharedData) {
        await supabase
          .from('shared_questions')
          .update({ copy_count: (sharedData.copy_count || 0) + 1 })
          .eq('id', sharedId);
      }

      toast({
        title: 'นำเข้าโจทย์สำเร็จ',
        description: 'คัดลอกโจทย์ไปยังคลังของคุณแล้ว',
      });

      return newQuestion;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const copySharedTemplate = async (templateId: string, sharedId: string) => {
    if (!teacherId) return null;

    try {
      // Get original template
      const { data: originalTemplate, error: fetchError } = await supabase
        .from('question_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Create copy with new teacher_id
      const { data: newTemplate, error: createError } = await supabase
        .from('question_templates')
        .insert([{
          ...originalTemplate,
          id: undefined,
          teacher_id: teacherId,
          created_at: undefined,
          updated_at: undefined,
          times_used: 0,
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Increment copy count
      const { data: sharedData } = await supabase
        .from('shared_templates')
        .select('copy_count')
        .eq('id', sharedId)
        .single();

      if (sharedData) {
        await supabase
          .from('shared_templates')
          .update({ copy_count: (sharedData.copy_count || 0) + 1 })
          .eq('id', sharedId);
      }

      toast({
        title: 'นำเข้าแม่แบบสำเร็จ',
        description: 'คัดลอกแม่แบบไปยังคลังของคุณแล้ว',
      });

      return newTemplate;
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // ========== System Questions (Admin) ==========
  const fetchSystemQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .or('admin_id.not.is.null,is_system_question.eq.true')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const copySystemQuestion = async (questionId: string) => {
    if (!teacherId) return false;

    try {
      // Fetch the original question
      const { data: originalQuestion, error: fetchError } = await supabase
        .from('question_bank')
        .select('*')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      // Create a copy for the teacher
      const { data: copiedQuestion, error: insertError } = await supabase
        .from('question_bank')
        .insert([{
          teacher_id: teacherId,
          admin_id: null,
          is_system_question: false,
          choices: originalQuestion.choices,
          correct_answer: originalQuestion.correct_answer,
          difficulty: originalQuestion.difficulty,
          grade: originalQuestion.grade,
          question_text: originalQuestion.question_text,
          skill_name: originalQuestion.skill_name,
          semester: originalQuestion.semester,
          assessment_type: originalQuestion.assessment_type,
          topic: originalQuestion.topic,
          explanation: originalQuestion.explanation,
          ai_generated: originalQuestion.ai_generated,
          image_urls: originalQuestion.image_urls,
          tags: originalQuestion.tags,
          visual_elements: originalQuestion.visual_elements,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Update times_used counter on original question
      await supabase
        .from('question_bank')
        .update({ times_used: (originalQuestion.times_used || 0) + 1 })
        .eq('id', questionId);

      // Add to local questions state
      if (copiedQuestion) {
        setQuestions(prev => [copiedQuestion, ...prev]);
      }

      toast({
        title: 'นำเข้าสำเร็จ',
        description: 'คัดลอกโจทย์จากคลังกลางเรียบร้อยแล้ว',
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

  const unshareQuestion = async (questionId: string) => {
    if (!teacherId) return false;

    try {
      // Delete from shared_questions table
      const { error } = await supabase
        .from('shared_questions')
        .delete()
        .eq('question_id', questionId)
        .eq('shared_by', teacherId);

      if (error) throw error;

      toast({
        title: 'ยกเลิกการแชร์สำเร็จ',
        description: 'ยกเลิกการแชร์โจทย์เรียบร้อยแล้ว',
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

  const checkSharedQuestions = async (questionIds: string[]) => {
    if (!teacherId || questionIds.length === 0) return {};

    try {
      const { data, error } = await supabase
        .from('shared_questions')
        .select('id, question_id, share_code')
        .eq('shared_by', teacherId)
        .in('question_id', questionIds);

      if (error) throw error;

      // Convert to map for easy lookup
      const sharedMap: Record<string, { id: string; share_code: string }> = {};
      data?.forEach((item) => {
        sharedMap[item.question_id] = {
          id: item.id,
          share_code: item.share_code || '',
        };
      });

      return sharedMap;
    } catch (error: any) {
      console.error('Error checking shared questions:', error);
      return {};
    }
  };

  const fetchAvailableTags = async (): Promise<string[]> => {
    try {
      let query = supabase
        .from('question_bank')
        .select('tags');
      
      if (isAdmin) {
        query = query.eq('admin_id', teacherId);
      } else {
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Extract unique tags from all questions
      const allTags = new Set<string>();
      data?.forEach((item) => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => allTags.add(tag));
        }
      });

      return Array.from(allTags).sort();
    } catch (error: any) {
      console.error('Error fetching available tags:', error);
      return [];
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
    shareQuestion,
    shareTemplate,
    fetchSharedQuestions,
    fetchSharedTemplates,
    copySharedQuestion,
    copySharedTemplate,
    fetchSystemQuestions,
    copySystemQuestion,
    unshareQuestion,
    fetchAvailableTags,
    checkSharedQuestions,
  };
}