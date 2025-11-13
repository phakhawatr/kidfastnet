import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAssessment } from '@/hooks/useAssessment';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileQuestion, Clock, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGradeOptions, getSemesterOptions } from '@/config/curriculum';
import { evaluateAssessment } from '@/utils/assessmentUtils';

const Quiz = () => {
  const { user, registrationId } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [screen, setScreen] = useState<'select' | 'assessment' | 'results'>('select');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    questions,
    currentIndex,
    answers,
    isLoading,
    isSubmitted,
    setAnswer,
    previousQuestion,
    nextQuestion,
    submitAssessment,
    calculateCorrectAnswers,
    timeTaken
  } = useAssessment(user?.id || registrationId || '', hasStarted ? selectedGrade : 0, hasStarted ? selectedSemester : 0);

  // Debug logs for userId
  console.log('🔍 Quiz - User ID:', user?.id);
  console.log('🔍 Quiz - Registration ID:', registrationId);
  console.log('🔍 Quiz - Final userId for assessment:', user?.id || registrationId || '');

  const handleStartAssessment = () => {
    const userId = user?.id || registrationId;
    if (!userId) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "กรุณาเข้าสู่ระบบก่อนทำแบบทดสอบ",
        variant: "destructive",
      });
      return;
    }
    setHasStarted(true);
    setScreen('assessment');
  };

  const handleSubmit = async () => {
    const userId = user?.id || registrationId;
    
    console.log('🚀 Quiz - handleSubmit called');
    console.log('🔍 Quiz - User ID for submission:', userId);
    
    if (!userId) {
      toast({
        title: "ไม่สามารถส่งคำตอบได้",
        description: "กรุณาเข้าสู่ระบบก่อนส่งคำตอบ",
        variant: "destructive",
      });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('❌ Invalid userId format:', userId);
      toast({
        title: "ข้อผิดพลาดระบบ",
        description: "รูปแบบ User ID ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ UUID validation passed');
    setIsSubmitting(true);
    try {
      await submitAssessment();
      toast({
        title: "ส่งคำตอบสำเร็จ",
        description: "บันทึกผลการสอบเรียบร้อยแล้ว",
        variant: "default",
      });
      setScreen('results');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถส่งคำตอบได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setScreen('select');
    setHasStarted(false);
    setSelectedGrade(1);
    setSelectedSemester(1);
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Selection Screen
  if (screen === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl text-center flex items-center justify-center gap-3 text-purple-600">
                <FileQuestion className="w-8 h-8" />
                การสอบวัดระดับ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-lg mb-3 block font-semibold">เลือกชั้น</Label>
                <RadioGroup value={String(selectedGrade)} onValueChange={(v) => setSelectedGrade(Number(v))}>
                  <div className="grid gap-2">
                    {getGradeOptions().map(opt => (
                      <div key={opt.value} className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                        <RadioGroupItem value={String(opt.value)} id={`grade-${opt.value}`} />
                        <Label htmlFor={`grade-${opt.value}`} className="flex-1 cursor-pointer font-medium">{opt.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-lg mb-3 block font-semibold">เลือกเทอม</Label>
                <RadioGroup value={String(selectedSemester)} onValueChange={(v) => setSelectedSemester(Number(v))}>
                  <div className="grid gap-2">
                    {getSemesterOptions().map(opt => (
                      <div key={opt.value} className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                        <RadioGroupItem value={String(opt.value)} id={`sem-${opt.value}`} />
                        <Label htmlFor={`sem-${opt.value}`} className="flex-1 cursor-pointer font-medium">{opt.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold mb-2 text-blue-900">📋 ข้อมูลการสอบ</h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• จำนวนข้อสอบ: 30 ข้อ</li>
                  <li>• รูปแบบ: เลือกตัวเลือก 4 ข้อ</li>
                  <li>• ไม่จำกัดเวลา</li>
                  <li>• สามารถกลับมาแก้คำตอบได้ก่อนส่ง</li>
                </ul>
              </div>

              <Button 
                onClick={handleStartAssessment} 
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                <FileQuestion className="w-5 h-5 mr-2" />
                เริ่มทำข้อสอบ
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Assessment Screen
  if (screen === 'assessment' && !isSubmitted) {
    if (isLoading || questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
          <Card className="p-8">
            <div className="text-center">กำลังโหลดข้อสอบ...</div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono">{Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="text-sm font-medium bg-purple-100 px-3 py-1 rounded-full">
                  ข้อ {currentIndex + 1} / {questions.length}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>

            <CardContent className="space-y-6">
              {currentQuestion && (
                <>
                  <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                    <h3 className="text-xl font-semibold whitespace-pre-line">{currentQuestion.question}</h3>
                  </div>

                  <RadioGroup 
                    value={String(answers.get(currentIndex) || '')} 
                    onValueChange={(v) => setAnswer(currentIndex, v)}
                  >
                    <div className="space-y-3">
                      {currentQuestion.choices.map((choice, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-all"
                        >
                          <RadioGroupItem value={String(choice)} id={`choice-${idx}`} />
                          <Label htmlFor={`choice-${idx}`} className="flex-1 cursor-pointer text-lg">
                            {choice}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between gap-4 pt-4">
                    <Button
                      onClick={previousQuestion}
                      disabled={currentIndex === 0}
                      variant="outline"
                      size="lg"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      ข้อก่อนหน้า
                    </Button>

                    {currentIndex === questions.length - 1 ? (
                      <Button 
                        onClick={handleSubmit} 
                        className="bg-green-600 hover:bg-green-700"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={nextQuestion}
                        size="lg"
                      >
                        ข้อถัดไป
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Results Screen
  const correctAnswers = calculateCorrectAnswers();
  const score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
  const evaluation = evaluateAssessment(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center flex items-center justify-center gap-3 text-purple-600">
              <Award className="w-8 h-8 text-yellow-500" />
              ผลการสอบ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl font-bold text-purple-600 mb-4">
                {score.toFixed(1)}%
              </div>
              <div className="text-3xl mb-3">
                {'⭐'.repeat(evaluation.stars)}
              </div>
              <p className="text-xl text-gray-700 font-medium">{evaluation.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{correctAnswers}</div>
                  <div className="text-sm text-green-700 font-medium">คำตอบถูก</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">{questions.length - correctAnswers}</div>
                  <div className="text-sm text-red-700 font-medium">คำตอบผิด</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>เวลาที่ใช้:</span>
                <span className="font-mono font-semibold">{Math.floor(timeTaken / 60)} นาที {timeTaken % 60} วินาที</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleRestart} variant="outline" className="flex-1" size="lg">
                ทำใหม่อีกครั้ง
              </Button>
              <Button onClick={() => navigate('/profile')} className="flex-1" size="lg">
                กลับหน้าหลัก
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Quiz;
