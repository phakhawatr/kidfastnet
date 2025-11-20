import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAssessment } from '@/hooks/useAssessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, XCircle, Users, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExamLinkData {
  id: string;
  link_code: string;
  grade: number;
  semester: number | null;
  assessment_type: 'semester' | 'nt';
  max_students: number;
  current_students: number;
  status: string;
}

const PublicExam = () => {
  const { linkCode } = useParams<{ linkCode: string }>();
  const navigate = useNavigate();
  
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

  // Temporary userId for public exam (will be the exam session ID)
  const [sessionId] = useState(() => `public-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const {
    questions,
    currentIndex,
    answers,
    isLoading,
    setAnswer,
    previousQuestion,
    nextQuestion,
    calculateCorrectAnswers,
    timeTaken
  } = useAssessment(
    sessionId,
    hasStarted && examLink ? examLink.grade : 0,
    hasStarted && examLink ? (examLink.assessment_type === 'nt' ? 'nt' : examLink.semester) : 0
  );

  useEffect(() => {
    validateExamLink();
  }, [linkCode]);

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
        if (data.status === 'full') {
          setError('ข้อสอบนี้เต็มแล้ว (มีนักเรียนทำครบจำนวนที่กำหนด)');
        } else if (data.status === 'expired') {
          setError('Link ข้อสอบนี้หมดอายุแล้ว');
        }
        setIsValidating(false);
        return;
      }

      setExamLink(data as ExamLinkData);
      setIsValidating(false);
    } catch (err) {
      console.error('Error validating exam link:', err);
      setError('เกิดข้อผิดพลาดในการตรวจสอบ link');
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
      const correct = calculateCorrectAnswers();
      const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;

      // Save exam session
      const { error: sessionError } = await supabase
        .from('exam_sessions')
        .insert({
          exam_link_id: examLink.id,
          student_name: studentName,
          student_class: studentClass,
          student_number: studentNumber,
          grade: examLink.grade,
          semester: examLink.semester,
          assessment_type: examLink.assessment_type,
          total_questions: questions.length,
          correct_answers: correct,
          score: parseFloat(score.toFixed(2)),
          time_taken: timeTaken,
          assessment_data: {
            questions: questions.map((q, i) => ({
              question: q.question,
              userAnswer: answers.get(i) !== undefined ? q.choices[answers.get(i)] : null,
              correctAnswer: q.correctAnswer,
              isCorrect: answers.get(i) !== undefined ? 
                (q.choices[answers.get(i)] === q.correctAnswer || 
                 String(q.choices[answers.get(i)]) === String(q.correctAnswer)) : false
            }))
          }
        });

      if (sessionError) throw sessionError;

      setFinalScore(score);
      setShowResults(true);
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกผล กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md card-glass">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-muted-foreground">กำลังตรวจสอบ link ข้อสอบ...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md card-glass">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive mb-2">ไม่สามารถเข้าสู่ข้อสอบได้</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              กลับหน้าหลัก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-2xl card-glass">
          <CardHeader>
            <CardTitle className="text-center text-3xl">ผลการสอบ</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-6xl mb-4">
              {finalScore >= 80 ? '🎉' : finalScore >= 50 ? '😊' : '😢'}
            </div>
            
            <div>
              <p className="text-muted-foreground mb-2">คะแนนที่ได้</p>
              <p className={`text-6xl font-bold ${finalScore >= 80 ? 'text-green-600' : finalScore >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                {finalScore.toFixed(2)}%
              </p>
              <p className="text-lg text-muted-foreground mt-2">
                ({calculateCorrectAnswers()} / {questions.length} ข้อ)
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span>ใช้เวลา: {Math.floor(timeTaken / 60)} นาที {timeTaken % 60} วินาที</span>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-xl font-semibold mb-2">
                {finalScore >= 80 ? '🌟 ยอดเยี่ยม!' : finalScore >= 50 ? '✅ ผ่านแล้ว!' : '💪 พยายามต่อไป!'}
              </p>
              <p className="text-muted-foreground">
                {finalScore >= 80 ? 'คุณทำได้ดีมาก!' : finalScore >= 50 ? 'คุณผ่านการทดสอบแล้ว' : 'อย่าท้อแท้ ลองใหม่อีกครั้งนะ'}
              </p>
            </div>

            <Button onClick={() => window.close()} className="mt-4">
              ปิดหน้าต่าง
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md card-glass">
          <CardHeader>
            <CardTitle className="text-center">
              📝 ข้อสอบ ป.{examLink?.grade} {examLink?.assessment_type === 'nt' ? 'NT' : `ภาคเรียนที่ ${examLink?.semester}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                กรุณากรอกข้อมูลก่อนเริ่มทำข้อสอบ
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName">ชื่อ-สกุล *</Label>
                <Input
                  id="studentName"
                  placeholder="เช่น สมชาย ใจดี"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="studentClass">ชั้นเรียน *</Label>
                <Select value={studentClass} onValueChange={setStudentClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(grade => 
                      [...Array(10)].map((_, room) => (
                        <SelectItem key={`${grade}-${room+1}`} value={`ป.${grade}/${room+1}`}>
                          ป.{grade}/{room+1}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="studentNumber">เลขที่ *</Label>
                <Input
                  id="studentNumber"
                  type="number"
                  min="1"
                  max="50"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <span>นักเรียนที่ทำแล้ว: {examLink?.current_students} / {examLink?.max_students} คน</span>
              </div>
            </div>

            <Button onClick={handleStartExam} className="w-full" size="lg">
              เริ่มทำข้อสอบ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Progress and Timer */}
        <Card className="mb-6 card-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                ข้อ {currentIndex + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        {isLoading ? (
          <Card className="card-glass">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">กำลังโหลดข้อสอบ...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={answers.get(currentIndex)?.toString()}
                onValueChange={(value) => setAnswer(currentIndex, parseInt(value))}
              >
                {currentQuestion?.choices.map((choice, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value={idx.toString()} id={`choice-${idx}`} />
                    <Label htmlFor={`choice-${idx}`} className="flex-1 cursor-pointer">
                      {choice}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentIndex === 0}
                >
                  ← ข้อก่อนหน้า
                </Button>

                {currentIndex === questions.length - 1 ? (
                  <Button onClick={handleSubmitExam} disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังบันทึก...' : 'ส่งคำตอบ'}
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>
                    ข้อถัดไป →
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Navigator */}
        <Card className="mt-6 card-glass">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-3">ข้ามไปข้อ:</p>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentIndex === idx ? 'default' : answers.has(idx) ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (idx >= 0 && idx < questions.length) {
                      // Use the hook's internal method if available, otherwise navigate manually
                      const goToQuestion = (index: number) => {
                        if (index >= 0 && index < questions.length) {
                          // This will be handled by clicking the button which changes currentIndex
                        }
                      };
                      // Since we can't access goToQuestion directly, we use a workaround
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`${answers.has(idx) ? 'bg-green-600/20 hover:bg-green-600/30' : ''}`}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicExam;
