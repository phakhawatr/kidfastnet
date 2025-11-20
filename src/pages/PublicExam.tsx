import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAssessment } from '@/hooks/useAssessment';
import { useAccessibility } from '@/hooks/useAccessibility';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, Users, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

interface ExamLinkData {
  id: string;
  link_code: string;
  grade: number;
  semester: number | null;
  assessment_type: 'semester' | 'nt';
  max_students: number;
  current_students: number;
  status: string;
  activity_name: string | null;
  total_questions: number;
  has_custom_questions?: boolean;
  questions_finalized_at?: string;
}

const PublicExam = () => {
  const { linkCode } = useParams<{ linkCode: string }>();
  const navigate = useNavigate();
  const { fontSizeClass } = useAccessibility();
  
  const [examLink, setExamLink] = useState<ExamLinkData | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('ป.1/1');
  const [studentNumber, setStudentNumber] = useState<number>(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  const [sessionId] = useState(() => `public-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const [customQuestions, setCustomQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const {
    questions,
    currentIndex,
    answers,
    isLoading,
    setAnswer,
    previousQuestion,
    nextQuestion,
    goToQuestion,
    calculateCorrectAnswers,
    timeTaken
  } = useAssessment(
    sessionId,
    hasStarted && examLink && !examLink.has_custom_questions ? examLink.grade : 0,
    hasStarted && examLink && !examLink.has_custom_questions ? (examLink.assessment_type === 'nt' ? 'nt' : examLink.semester) : 0,
    hasStarted && examLink && !examLink.has_custom_questions ? examLink.total_questions : undefined
  );

  useEffect(() => {
    validateExamLink();
  }, [linkCode]);

  useEffect(() => {
    if (hasStarted && examLink?.has_custom_questions) {
      loadCustomQuestions();
    }
  }, [hasStarted, examLink]);

  const loadCustomQuestions = async () => {
    if (!examLink) return;
    setLoadingQuestions(true);

    try {
      const { data, error } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_link_id', examLink.id)
        .order('question_number');

      if (error) throw error;

      const formattedQuestions = data.map(q => ({
        id: q.id,
        skill: q.skill_name,
        question: q.question_text,
        correctAnswer: q.correct_answer,
        choices: q.choices,
        difficulty: q.difficulty,
        explanation: q.explanation,
        visualElements: q.visual_elements
      }));

      setCustomQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error loading custom questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const validateExamLink = async () => {
    if (!linkCode) {
      setError('Link code ไม่ถูกต้อง');
      setIsValidating(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('exam_links')
        .select('*')
        .eq('link_code', linkCode)
        .single();

      if (error || !data) {
        setError('ไม่พบ link ข้อสอบนี้');
        setIsValidating(false);
        return;
      }

      if (data.status !== 'active') {
        setError(data.status === 'full' ? 'ข้อสอบนี้เต็มแล้ว' : 'Link ข้อสอบนี้หมดอายุแล้ว');
        setIsValidating(false);
        return;
      }

      setExamLink(data as ExamLinkData);
      setIsValidating(false);
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
      setIsValidating(false);
    }
  };

  const handleStartExam = () => {
    if (!studentName.trim() || !studentClass.trim() || !studentNumber) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setHasStarted(true);
  };

  const handleSubmitExam = async () => {
    if (!examLink) return;
    setIsSubmitting(true);

    try {
      const activeQuestions = examLink.has_custom_questions ? customQuestions : questions;
      const correct = calculateCorrectAnswers();
      const score = activeQuestions.length > 0 ? (correct / activeQuestions.length) * 100 : 0;
      
      // Convert answers Map to object for JSON storage
      const answersObject = Object.fromEntries(answers);

      const { data: sessionData, error } = await supabase
        .from('exam_sessions')
        .insert([{
          exam_link_id: examLink.id,
          student_name: studentName,
          student_class: studentClass,
          student_number: studentNumber,
          grade: examLink.grade,
          semester: examLink.semester,
          assessment_type: examLink.assessment_type,
          total_questions: activeQuestions.length,
          correct_answers: correct,
          score: parseFloat(score.toFixed(2)),
          time_taken: timeTaken,
          is_draft: false,
          assessment_data: {
            questions: activeQuestions.map((q, idx) => ({
              question: q.question,
              userAnswer: answersObject[idx],
              correctAnswer: q.correctAnswer,
              originalIndex: idx
            }))
          } as any
        }])
        .select()
        .single();

      if (error) throw error;

      // Update current students count
      await supabase
        .from('exam_links')
        .update({ 
          current_students: examLink.current_students + 1 
        })
        .eq('id', examLink.id);

      // Redirect to detailed results page
      if (sessionData) {
        navigate(`/exam-result/${sessionData.id}`);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกผลสอบ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeQuestions = examLink?.has_custom_questions ? customQuestions : questions;
  const currentQuestion = activeQuestions[currentIndex];
  const isLoadingState = isLoading || (examLink?.has_custom_questions && loadingQuestions);

  if (isValidating || error || showResults || !hasStarted) {
    return <div className={`min-h-screen flex items-center justify-center ${fontSizeClass}`}>
      <Card className="w-full max-w-md"><CardContent className="pt-6 text-center">
        {isValidating && <p>กำลังตรวจสอบ...</p>}
        {error && <><AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" /><p>{error}</p></>}
        {showResults && <><p className="text-6xl mb-4">{finalScore >= 80 ? '🎉' : '😊'}</p><p className="text-4xl font-bold">{finalScore.toFixed(2)}</p></>}
        {!hasStarted && !error && <div className="space-y-4">
          <Label>ชื่อ-สกุล</Label>
          <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          <Label>ชั้นเรียน</Label>
          <Select value={studentClass} onValueChange={setStudentClass}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[1,2,3,4,5,6].map(g => [...Array(10)].map((_,r) => <SelectItem key={`${g}-${r+1}`} value={`ป.${g}/${r+1}`}>ป.{g}/{r+1}</SelectItem>))}</SelectContent>
          </Select>
          <Label>เลขที่</Label>
          <Input type="number" value={studentNumber} onChange={(e) => setStudentNumber(parseInt(e.target.value) || 1)} />
          <Button onClick={handleStartExam} className="w-full">เริ่มทำข้อสอบ</Button>
        </div>}
      </CardContent></Card>
    </div>;
  }

  const progress = ((currentIndex + 1) / activeQuestions.length) * 100;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 ${fontSizeClass}`}>
      <div className="container mx-auto max-w-4xl py-8">
        <AccessibilityToolbar showKeyboardShortcuts={true} />
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span>ข้อ {currentIndex + 1} / {activeQuestions.length}</span>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {isLoadingState ? <Card><CardContent className="py-12 text-center">กำลังโหลด...</CardContent></Card> : (
          <Card>
            <CardHeader><CardTitle>{currentQuestion?.question}</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={answers.get(currentIndex)?.toString()} onValueChange={(v) => setAnswer(currentIndex, parseInt(v))}>
                {currentQuestion?.choices.map((choice, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent/50">
                    <RadioGroupItem value={idx.toString()} id={`choice-${idx}`} />
                    <Label htmlFor={`choice-${idx}`} className="flex-1 cursor-pointer">{idx + 1}. {choice}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          <Button onClick={previousQuestion} disabled={currentIndex === 0} variant="outline">← ข้อก่อนหน้า</Button>
          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleSubmitExam} disabled={isSubmitting}>✓ ส่งคำตอบ</Button>
          ) : (
            <Button onClick={nextQuestion}>ข้อถัดไป →</Button>
          )}
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">ข้อสอบทั้งหมด</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((_, idx) => (
                <Button key={idx} variant={idx === currentIndex ? "default" : answers.has(idx) ? "secondary" : "outline"} size="sm" onClick={() => goToQuestion(idx)} className="aspect-square">{idx + 1}</Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicExam;
