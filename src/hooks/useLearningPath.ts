import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SkillAssessment {
  id: string;
  skill_name: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy_rate: number;
  average_time: number | null;
  difficulty_level: string;
  last_practiced_at: string | null;
}

export interface LearningPathStep {
  step: number;
  skill: string;
  difficulty: string;
  estimatedTime: number;
  reasoning: string;
}

export interface LearningPath {
  id: string;
  path_name: string;
  current_step: number;
  total_steps: number;
  skills_to_focus: string[];
  difficulty_progression: string;
  estimated_duration: number;
  status: string;
  ai_reasoning: string;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  skill_name: string;
  suggested_difficulty: string;
  reasoning: string;
  priority: number;
  is_completed: boolean;
}

export const useLearningPath = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // 1. Try Supabase Auth first
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          // Has Supabase Auth session
          const { data: registration } = await supabase
            .from('user_registrations')
            .select('id')
            .eq('parent_email', user.email)
            .single();
          
          if (registration) {
            console.log('[useLearningPath] UserId from Supabase Auth:', registration.id);
            setUserId(registration.id);
            return;
          }
        }
        
        // 2. Fallback: Check localStorage (kidfast_last_email)
        const lastEmail = localStorage.getItem('kidfast_last_email');
        if (lastEmail) {
          const { data: registration } = await supabase
            .from('user_registrations')
            .select('id')
            .eq('parent_email', lastEmail)
            .single();
          
          if (registration) {
            console.log('[useLearningPath] UserId from localStorage:', registration.id);
            setUserId(registration.id);
            return;
          }
        }
        
        // 3. Final fallback: Check authState in localStorage
        const authState = localStorage.getItem('authState');
        if (authState) {
          const { user: localUser } = JSON.parse(authState);
          if (localUser?.email) {
            const { data: registration } = await supabase
              .from('user_registrations')
              .select('id')
              .eq('parent_email', localUser.email)
              .single();
            
            if (registration) {
              console.log('[useLearningPath] UserId from authState:', registration.id);
              setUserId(registration.id);
              return;
            }
          }
        }
        
        console.warn('[useLearningPath] No userId found');
      } catch (error) {
        console.error('[useLearningPath] Error fetching userId:', error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch data when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch skill assessments
        const { data: assessments, error: assessError } = await supabase
          .from('skill_assessments')
          .select('*')
          .eq('user_id', userId)
          .order('accuracy_rate', { ascending: true });

        if (assessError) throw assessError;
        setSkillAssessments(assessments || []);

        // Fetch learning paths
        const { data: paths, error: pathsError } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (pathsError) throw pathsError;
        setLearningPaths(paths || []);

        // Fetch recommendations
        const { data: recs, error: recsError } = await supabase
          .from('ai_recommendations')
          .select('*')
          .eq('user_id', userId)
          .eq('is_completed', false)
          .order('priority', { ascending: true });

        if (recsError) throw recsError;
        setRecommendations(recs || []);

      } catch (error) {
        console.error('Error fetching learning data:', error);
        toast.error('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const generateLearningPath = async () => {
    if (!userId) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning-path', {
        body: { userId }
      });

      if (error) {
        console.error('Error generating learning path:', error);
        
        if (error.message?.includes('quota exceeded') || error.message?.includes('402')) {
          toast.error('คุณใช้ AI ครบโควต้าแล้ว โปรดรอเดือนหน้า');
          return;
        }
        
        if (error.message?.includes('429')) {
          toast.error('มีการใช้งานมากเกินไป กรุณารอสักครู่');
          return;
        }
        
        throw error;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success('สร้าง Learning Path สำเร็จ! 🎉');
      
      // Refresh data
      const { data: paths } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      setLearningPaths(paths || []);

      const { data: recs } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .order('priority', { ascending: true });
      
      setRecommendations(recs || []);

      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง Learning Path');
    } finally {
      setIsGenerating(false);
    }
  };

  const completeRecommendation = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_completed: true })
        .eq('id', recommendationId);

      if (error) throw error;

      setRecommendations(prev => 
        prev.filter(r => r.id !== recommendationId)
      );
      
      toast.success('ทำภารกิจสำเร็จ! 🎯');
    } catch (error) {
      console.error('Error completing recommendation:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const updatePathProgress = async (pathId: string, newStep: number) => {
    try {
      const { error } = await supabase
        .from('learning_paths')
        .update({ current_step: newStep })
        .eq('id', pathId);

      if (error) throw error;

      setLearningPaths(prev =>
        prev.map(p => p.id === pathId ? { ...p, current_step: newStep } : p)
      );
    } catch (error) {
      console.error('Error updating path progress:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  return {
    userId,
    isLoading,
    skillAssessments,
    learningPaths,
    recommendations,
    isGenerating,
    generateLearningPath,
    completeRecommendation,
    updatePathProgress,
  };
};
