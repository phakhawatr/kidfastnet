import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowLeft, Trophy, Clock, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { compareAnswers } from '@/utils/examReportUtils';
import QuestionTextRenderer from '@/components/QuestionTextRenderer';
import ChoiceRenderer from '@/components/ChoiceRenderer';
import { ClockDisplay } from '@/components/ClockDisplay';
import { isTimeQuestion, extractTimeFromThaiFormat } from '@/utils/timeQuestionUtils';

interface QuestionResult {
  question: string;
  userAnswer: any;
  correctAnswer: any;
}

interface SessionData {
  id: string;
  student_name: string;
  student_class: string;
  student_number: number;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken: number;
  completed_at: string;
  assessment_data: {
    questions: QuestionResult[];
  };
}

// Helper function to check if answer is correct
const isAnswerCorrect = (userAnswer: any, correctAnswer: any, choices?: any[]): boolean => {
  // If userAnswer is undefined or null
  if (userAnswer === undefined || userAnswer === null) return false;
  
  // If userAnswer is the actual value already (string/number)
  if (compareAnswers(userAnswer, correctAnswer)) {
    return true;
  }
  
  // If userAnswer is an index (for old data)
  // Check if it's a small number (0-3) and we have choices array
  if (choices && typeof userAnswer === 'number' && userAnswer >= 0 && userAnswer < choices.length) {
    const actualValue = choices[userAnswer];
    return compareAnswers(actualValue, correctAnswer);
  }
  
  return false;
};

// Helper function to display user's answer
const getUserAnswerDisplay = (userAnswer: any, choices?: any[]): string => {
  if (userAnswer === undefined || userAnswer === null) return '-';
  
  // If userAnswer is an index (0-3) and we have choices
  if (choices && typeof userAnswer === 'number' && userAnswer >= 0 && userAnswer < 10) {
    // Try to convert to actual value
    return choices[userAnswer] !== undefined ? String(choices[userAnswer]) : String(userAnswer);
  }
  
  return String(userAnswer);
};

function StudentExamResult() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) {
        setError('ไม่พบรหัสผลสอบ');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('exam_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('ไม่พบข้อมูลผลสอบ');

        setSession(data as any as SessionData);
      } catch (err: any) {
        console.error('Error loading session:', err);
        setError('ไม่สามารถโหลดผลสอบได้');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">กำลังโหลดผลสอบ...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">{error || 'ไม่พบข้อมูลผลสอบ'}</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              เข้าสู่ระบบ KidFastAI
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const minutes = Math.floor(session.time_taken / 60);
  const seconds = session.time_taken % 60;
  const accuracy = (session.correct_answers / session.total_questions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          เข้าสู่ระบบ KidFastAI
        </Button>

        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ผลการสอบของคุณ</span>
              {session.score >= 80 ? (
                <Trophy className="w-8 h-8 text-yellow-500" />
              ) : session.score >= 50 ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <Target className="w-8 h-8 text-orange-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {session.score >= 80 ? '🎉' : session.score >= 50 ? '😊' : '💪'}
                </div>
                <div className="text-4xl font-bold text-primary">
                  {session.score.toFixed(2)}%
                </div>
                <p className="text-muted-foreground mt-2">คะแนน</p>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {session.correct_answers}/{session.total_questions}
                </div>
                <Progress value={accuracy} className="h-2 mb-2" />
                <p className="text-muted-foreground">ตอบถูก</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-2">
                  <Clock className="w-6 h-6" />
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <p className="text-muted-foreground">เวลาที่ใช้</p>
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ชื่อ-สกุล:</span>
                  <span className="ml-2 font-medium">{session.student_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ชั้นเรียน:</span>
                  <span className="ml-2 font-medium">{session.student_class}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">เลขที่:</span>
                  <span className="ml-2 font-medium">{session.student_number}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">วันที่ทำ:</span>
                  <span className="ml-2 font-medium">
                    {new Date(session.completed_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดแต่ละข้อ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.assessment_data?.questions?.map((q, index) => {
              // Extract choices from question if available (for old data)
              const choices = (q as any).choices;
              
              // Check if answer is correct
              const isCorrect = isAnswerCorrect(q.userAnswer, q.correctAnswer, choices);
              
              // Display user's answer
              const displayUserAnswer = getUserAnswerDisplay(q.userAnswer, choices);
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                      : 'bg-red-50 dark:bg-red-950/20 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">ข้อ {index + 1}</span>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          isCorrect
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {isCorrect ? '✓ ถูก' : '✗ ผิด'}
                        </span>
                      </div>
                      
                      <QuestionTextRenderer text={q.question} className="text-foreground mb-3" />
                      
                      {/* Auto Clock Display for Time Questions */}
                      {isTimeQuestion(q.question) && (() => {
                        const time = extractTimeFromThaiFormat(q.correctAnswer);
                        if (time) {
                          return (
                            <div className="flex justify-center my-3">
                              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border-2 shadow-sm">
                                <ClockDisplay hour={time.hour} minute={time.minute} size={120} />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground whitespace-nowrap">คำตอบของคุณ:</span>
                          <ChoiceRenderer 
                            choice={displayUserAnswer} 
                            size={48} 
                            className={`font-medium ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                          />
                        </div>
                        
                        {!isCorrect && (
                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground whitespace-nowrap">เฉลย:</span>
                            <ChoiceRenderer 
                              choice={q.correctAnswer} 
                              size={48} 
                              className="font-medium text-green-700 dark:text-green-400"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="mt-6 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="pt-6 text-center">
            {session.score >= 80 ? (
              <>
                <p className="text-2xl font-bold mb-2">🌟 ยอดเยี่ยมมาก! 🌟</p>
                <p className="text-muted-foreground">
                  คุณทำได้ดีมาก! เก่งจริงๆ ขอให้ประสบความสำเร็จในการเรียนต่อไปนะ
                </p>
              </>
            ) : session.score >= 50 ? (
              <>
                <p className="text-2xl font-bold mb-2">👏 ผ่านเกณฑ์! 👏</p>
                <p className="text-muted-foreground">
                  คุณทำได้ดี ลองทบทวนอีกครั้งเพื่อพัฒนาต่อไปนะ
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold mb-2">💪 ลองใหม่อีกครั้ง! 💪</p>
                <p className="text-muted-foreground">
                  ไม่เป็นไร ทุกคนเคยผิดพลาด ลองทบทวนและฝึกฝนต่อไปนะ คุณทำได้แน่นอน!
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StudentExamResult;
