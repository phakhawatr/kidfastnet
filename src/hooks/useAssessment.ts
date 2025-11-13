import { useState, useEffect } from 'react';
import { AssessmentQuestion, generateAssessmentQuestions } from '@/utils/assessmentUtils';
import { supabase } from '@/integrations/supabase/client';

export const useAssessment = (userId: string, grade: number, semester: number) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, any>>(new Map());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (grade && semester) {
      setIsLoading(true);
      const qs = generateAssessmentQuestions(grade, semester);
      setQuestions(qs);
      setStartTime(Date.now());
      setCurrentIndex(0);
      setAnswers(new Map());
      setIsSubmitted(false);
      setIsLoading(false);
    }
  }, [grade, semester]);

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

    console.log('📊 Assessment data:', {
      user_id: userId,
      grade,
      semester,
      total_questions: questions.length,
      correct_answers: correct,
      score: parseFloat(score.toFixed(2)),
      time_taken: timeTaken
    });

    try {
      const insertData = {
        user_id: userId,
        grade,
        semester,
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
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  };

  const currentTimeTaken = Math.floor((Date.now() - startTime) / 1000);

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
    timeTaken: currentTimeTaken
  };
};
