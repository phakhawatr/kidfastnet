import { useState, useEffect } from 'react';
import { AssessmentQuestion, generateAssessmentQuestions } from '@/utils/assessmentUtils';
import { supabase } from '@/integrations/supabase/client';

export const useAssessment = (userId: string, grade: number, semesterOrType: number | string) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, any>>(new Map());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    if (grade && semesterOrType) {
      setIsLoading(true);
      let qs: AssessmentQuestion[];
      
      // ตรวจสอบว่าเป็น NT หรือ semester
      if (semesterOrType === 'nt') {
        qs = generateAssessmentQuestions(grade, 'nt' as any);
      } else {
        qs = generateAssessmentQuestions(grade, semesterOrType as number);
      }
      
      setQuestions(qs);
      setStartTime(Date.now());
      setCurrentIndex(0);
      setAnswers(new Map());
      setIsSubmitted(false);
      setTimeTaken(0);
      setIsLoading(false);
    }
  }, [grade, semesterOrType]);

  // Timer effect - update every second
  useEffect(() => {
    if (grade && semesterOrType && !isSubmitted) {
      const interval = setInterval(() => {
        setTimeTaken(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, grade, semesterOrType, isSubmitted]);

  const setAnswer = (questionIndex: number, answer: any) => {
    setAnswers(prev => new Map(prev).set(questionIndex, answer));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateCorrectAnswers = (): number => {
    let correct = 0;
    questions.forEach((q, i) => {
      const userAnswerIndex = answers.get(i);
      if (userAnswerIndex !== undefined) {
        const userAnswerValue = q.choices[userAnswerIndex];
        // ตรวจสอบ 2 กรณี: เปรียบเทียบค่าโดยตรง หรือ convert เป็น string
        if (userAnswerValue === q.correctAnswer || 
            String(userAnswerValue) === String(q.correctAnswer)) {
          correct++;
        }
      }
    });
    return correct;
  };

  const submitAssessment = async () => {
    console.log('📝 useAssessment - submitAssessment called');
    console.log('🔍 useAssessment - userId:', userId);
    console.log('🔍 useAssessment - Is userId empty?', !userId);
    
    if (!userId) {
      console.error('❌ User ID is required to submit assessment');
      throw new Error('User ID is required to submit assessment');
    }

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const correct = calculateCorrectAnswers();
    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;

    // Determine semester and assessment_type from semesterOrType
    const assessmentType = semesterOrType === 'nt' ? 'nt' : 'semester';
    const semesterValue = typeof semesterOrType === 'number' ? semesterOrType : null;

    console.log('📊 Assessment data:', {
      user_id: userId,
      grade,
      semester: semesterValue,
      assessment_type: assessmentType,
      total_questions: questions.length,
      correct_answers: correct,
      score: parseFloat(score.toFixed(2)),
      time_taken: timeTaken
    });

    try {
      const insertData = {
        user_id: userId,
        grade,
        semester: semesterValue,
        assessment_type: assessmentType,
        total_questions: questions.length,
        correct_answers: correct,
        score: parseFloat(score.toFixed(2)),
        time_taken: timeTaken,
        assessment_data: {
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            correctAnswer: q.correctAnswer,
            skill: q.skill
          })),
          answers: Array.from(answers.entries())
        },
        completed_at: new Date().toISOString()
      };
      
      console.log('💾 Attempting to insert into Supabase:', insertData);
      
      const { error } = await supabase.from('level_assessments').insert([insertData]);

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        throw new Error(`Failed to save assessment: ${error.message}`);
      }
      
      console.log('✅ Assessment saved successfully!');
      
      // Check and award achievements
      console.log('🏆 Checking for new achievements...');
      const { data: newAchievements, error: achievementError } = await supabase
        .rpc('check_and_award_achievements', {
          p_user_id: userId,
          p_score: score,
          p_time_taken: timeTaken
        });

      if (achievementError) {
        console.error('⚠️ Error checking achievements:', achievementError);
      } else if (newAchievements && newAchievements.length > 0) {
        console.log('🎉 New achievements earned:', newAchievements);
      }
      
      setIsSubmitted(true);
      
      return { newAchievements: newAchievements || [] };
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  };

  return {
    questions,
    currentIndex,
    answers,
    isLoading,
    isSubmitted,
    setAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitAssessment,
    calculateCorrectAnswers,
    timeTaken
  };
};
