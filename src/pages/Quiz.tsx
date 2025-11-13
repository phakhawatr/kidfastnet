import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAssessment } from '@/hooks/useAssessment';
import { useAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShapeDisplay from '@/components/ShapeDisplay';
import QuizHistory from '@/components/QuizHistory';
import CertificateCard from '@/components/CertificateCard';
import AchievementBadge from '@/components/AchievementBadge';
import AchievementNotification from '@/components/AchievementNotification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardPen, Clock, Award, ChevronLeft, ChevronRight, BookOpen, Send, Eye, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus, Hash, Scale, ArrowUpDown, Grid3x3, Plus, Sparkles, Shapes, Ruler, BarChart2, LucideIcon, BarChart3, Download, Share2, Facebook, MessageCircle, Twitter, Trophy } from 'lucide-react';
import { getGradeOptions, getSemesterOptions, curriculumConfig } from '@/config/curriculum';
import { evaluateAssessment } from '@/utils/assessmentUtils';
import { downloadCertificate, shareCertificate } from '@/utils/certificateUtils';

const Quiz = () => {
  const { user, registrationId, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['quiz', 'common']);
  const { toast } = useToast();
  const [screen, setScreen] = useState<'select' | 'assessment' | 'results'>('select');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [showTopicOutline, setShowTopicOutline] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isSendingLine, setIsSendingLine] = useState(false);
  const [lineSent, setLineSent] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const { achievements: allAchievements, userAchievements } = useAchievements(user?.id || registrationId || null);

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
      const result = await submitAssessment();
      
      // Check for new achievements
      if (result?.newAchievements && result.newAchievements.length > 0) {
        const achievementDetails = result.newAchievements.map((na: any) => {
          const achievement = allAchievements.find(a => a.code === na.new_achievement_code);
          return achievement ? {
            code: achievement.code,
            name: achievement.name_th,
            description: achievement.description_th,
            color: achievement.color,
            icon: achievement.icon
          } : null;
        }).filter(Boolean);
        
        setNewAchievements(achievementDetails);
      }
      
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
    setShowAnswers(false);
    setShowTopicOutline(false);
    setLineSent(false);
    setShowCertificate(false);
    setNewAchievements([]);
  };

  const handleDownloadCertificate = async () => {
    try {
      const filename = `certificate_${profile?.nickname || 'student'}_${new Date().toISOString().split('T')[0]}.png`;
      await downloadCertificate(certificateRef.current, filename);
      toast({
        title: "ดาวน์โหลดสำเร็จ",
        description: "บันทึกใบประกาศเรียบร้อยแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดาวน์โหลดใบประกาศได้",
        variant: "destructive",
      });
    }
  };

  const handleShareCertificate = async (platform: 'facebook' | 'line' | 'twitter') => {
    try {
      const correctAnswers = calculateCorrectAnswers();
      const score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
      
      await shareCertificate(
        certificateRef.current,
        platform,
        score,
        profile?.nickname || 'นักเรียน'
      );
      
      toast({
        title: "แชร์สำเร็จ",
        description: `เปิดหน้าต่างแชร์ไปยัง ${platform === 'facebook' ? 'Facebook' : platform === 'line' ? 'LINE' : 'Twitter'} แล้ว`,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถแชร์ใบประกาศได้",
        variant: "destructive",
      });
    }
  };

  // Get topic outline for selected grade and semester
  const getTopicOutline = () => {
    const gradeKey = `grade${selectedGrade}`;
    const semesterKey = `semester${selectedSemester}`;
    return curriculumConfig[gradeKey]?.[semesterKey] || [];
  };

  // Skill name translations
  const skillNamesTh: Record<string, string> = {
    counting: 'จำนวนนับ',
    comparing: 'การเปรียบเทียบ',
    ordering: 'การเรียงลำดับ',
    placeValue: 'ค่าประจำหลัก',
    addition: 'การบวก',
    subtraction: 'การลบ',
    patterns: 'แบบรูป',
    shapes: 'รูปทรงเรขาคณิต',
    measurement: 'การวัด',
    pictograph: 'แผนภูมิรูปภาพ',
    multiplication: 'การคูณ',
    division: 'การหาร',
    money: 'เงิน',
    time: 'เวลา',
    fractions: 'เศษส่วน',
    decimals: 'ทศนิยม',
    percentage: 'ร้อยละ',
    ratios: 'อัตราส่วน',
    algebra: 'พีชคณิต',
    geometry: 'เรขาคณิต',
    statistics: 'สถิติ',
    probability: 'ความน่าจะเป็น'
  };

  // Skill icons mapping
  const skillIcons: Record<string, LucideIcon> = {
    counting: Hash,
    comparing: Scale,
    ordering: ArrowUpDown,
    placeValue: Grid3x3,
    addition: Plus,
    subtraction: Minus,
    patterns: Sparkles,
    shapes: Shapes,
    measurement: Ruler,
    pictograph: BarChart2,
    multiplication: Plus,
    division: Minus,
    money: Clock,
    time: Clock,
    fractions: Grid3x3,
    decimals: Grid3x3,
    percentage: TrendingUp,
    ratios: Scale,
    algebra: Hash,
    geometry: Shapes,
    statistics: BarChart2,
    probability: TrendingUp
  };

  const handleSendLine = async () => {
    const userId = user?.id || registrationId;
    if (!userId) {
      toast({
        title: "ไม่สามารถส่งข้อความได้",
        description: "ไม่พบข้อมูลผู้ใช้",
        variant: "destructive",
      });
      return;
    }

    setIsSendingLine(true);
    try {
      const correctAnswers = calculateCorrectAnswers();
      const score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-line-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          exerciseType: `แบบทดสอบชั้น ป.${selectedGrade} เทอม ${selectedSemester}`,
          nickname: 'นักเรียน',
          correctAnswers,
          totalQuestions: questions.length,
          percentage: Math.round(score),
          timeTaken: `${Math.floor(timeTaken / 60)} นาที ${timeTaken % 60} วินาที`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send LINE message');
      }

      setLineSent(true);
      toast({
        title: "ส่งผลการสอบสำเร็จ",
        description: "ส่งผลการสอบไปยัง LINE ผู้ปกครองเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error sending LINE message:', error);
      toast({
        title: "ไม่สามารถส่งข้อความได้",
        description: "กรุณาตรวจสอบการเชื่อมต่อ LINE Notify",
        variant: "destructive",
      });
    } finally {
      setIsSendingLine(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Helper function to render question with shapes
  const renderQuestionText = (questionText: string) => {
    // Check for shape markers [shapes:shape1,shape2,...]
    const shapeMatch = questionText.match(/\[shapes:(.*?)\]/);
    if (shapeMatch) {
      const shapesStr = shapeMatch[1];
      const shapes = shapesStr.split(',');
      const textBefore = questionText.substring(0, shapeMatch.index);
      const textAfter = questionText.substring(shapeMatch.index! + shapeMatch[0].length);
      
      return (
        <div className="space-y-3">
          <div className="text-xl font-semibold whitespace-pre-line">{textBefore}</div>
          <div className="flex flex-wrap gap-2 p-4 bg-purple-50 rounded-lg justify-center">
            {shapes.map((shape, idx) => (
              <ShapeDisplay key={idx} shape={shape.trim()} size={56} />
            ))}
          </div>
          <div className="text-xl font-semibold whitespace-pre-line">{textAfter}</div>
        </div>
      );
    }
    
    // Check for single shape marker [shape-color]
    const singleShapeMatch = questionText.match(/\[(triangle|square|circle)-(red|blue|green|orange|yellow|sky)\]/);
    if (singleShapeMatch) {
      const shape = singleShapeMatch[1] + '-' + singleShapeMatch[2];
      const textBefore = questionText.substring(0, singleShapeMatch.index);
      const textAfter = questionText.substring(singleShapeMatch.index! + singleShapeMatch[0].length);
      
      return (
        <div className="text-xl font-semibold whitespace-pre-line">
          {textBefore}
          <span className="inline-flex mx-2 align-middle">
            <ShapeDisplay shape={shape} size={48} />
          </span>
          {textAfter}
        </div>
      );
    }
    
    return <h3 className="text-xl font-semibold whitespace-pre-line">{questionText}</h3>;
  };

  // Helper function to render choice with shapes
  const renderChoice = (choice: string | number) => {
    const choiceStr = String(choice);
    // Check if choice is a shape identifier
    if (choiceStr.match(/^(triangle|square|circle)-(red|blue|green|orange|yellow|sky)$/)) {
      return (
        <div className="flex justify-center py-2">
          <ShapeDisplay shape={choiceStr} size={64} />
        </div>
      );
    }
    return <span className="text-lg">{choice}</span>;
  };

  // Selection Screen
  if (screen === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="test" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="test" className="text-base font-semibold">
                <ClipboardPen className="w-4 h-4 mr-2" />
                ทำแบบทดสอบ
              </TabsTrigger>
              <TabsTrigger value="history" className="text-base font-semibold">
                <BarChart3 className="w-4 h-4 mr-2" />
                ประวัติ & สถิติ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="test">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-3xl text-center flex items-center justify-center gap-3 text-purple-600">
                    <ClipboardPen className="w-8 h-8" />
                    แบบทดสอบวัดระดับความรู้
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">{/* ... keep existing code (selection form content) */}
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

              {!showTopicOutline ? (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-2 text-blue-900">📋 ข้อมูลการสอบ</h3>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• จำนวนข้อสอบ: 40 ข้อ</li>
                      <li>• รูปแบบ: เลือกตัวเลือก 4 ข้อ</li>
                      <li>• ไม่จำกัดเวลา</li>
                      <li>• สามารถกลับมาแก้คำตอบได้ก่อนส่ง</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => setShowTopicOutline(true)} 
                    className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="lg"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    ดูหัวข้อการสอบ
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                    <h3 className="font-semibold mb-4 text-purple-900 flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5" />
                      แผนผังหัวข้อการสอบ
                    </h3>
                     <div className="space-y-2">
                      {getTopicOutline().map((topic, idx) => {
                        const skillNameTh = skillNamesTh[topic.skill] || topic.skill;
                        const SkillIcon = skillIcons[topic.skill];
                        return (
                          <div 
                            key={idx} 
                            className="bg-white p-4 rounded-lg border border-purple-200 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {SkillIcon && <SkillIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />}
                                <span className="font-semibold text-gray-800">
                                  {idx + 1}. {skillNameTh}
                                </span>
                              </div>
                              <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                                {topic.count} ข้อ
                              </span>
                            </div>
                            {topic.description && (
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {topic.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-sm text-purple-800 font-medium">
                        รวมทั้งหมด: {getTopicOutline().reduce((sum, topic) => sum + topic.count, 0)} ข้อ
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setShowTopicOutline(false)} 
                      variant="outline"
                      className="flex-1 py-6 text-lg"
                      size="lg"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      กลับ
                    </Button>
                    <Button 
                      onClick={handleStartAssessment} 
                      className="flex-1 py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      size="lg"
                    >
                      <ClipboardPen className="w-5 h-5 mr-2" />
                      เริ่มทำข้อสอบ
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <QuizHistory userId={user?.id || registrationId || ''} />
        </TabsContent>
      </Tabs>
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
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
                    {renderQuestionText(currentQuestion.question)}
                  </div>

                  <RadioGroup 
                    value={String(answers.get(currentIndex) ?? '')} 
                    onValueChange={(v) => setAnswer(currentIndex, Number(v))}
                  >
                    <div className="space-y-3">
                      {currentQuestion.choices.map((choice, idx) => {
                        const isSelected = answers.get(currentIndex) === idx;
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-400 shadow-sm' 
                                : 'border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                            }`}
                          >
                            <RadioGroupItem value={String(idx)} id={`choice-${idx}`} />
                            <Label htmlFor={`choice-${idx}`} className="flex-1 cursor-pointer">
                              {renderChoice(choice)}
                            </Label>
                          </div>
                        );
                      })}
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
                        disabled={isSubmitting || answers.get(currentIndex) === undefined}
                      >
                        {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={nextQuestion}
                        size="lg"
                        disabled={answers.get(currentIndex) === undefined}
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

  // Calculate skill breakdown
  const calculateSkillBreakdown = () => {
    const skillStats: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach((q, idx) => {
      if (!skillStats[q.skill]) {
        skillStats[q.skill] = { correct: 0, total: 0 };
      }
      skillStats[q.skill].total++;
      
      const userAnswer = answers.get(idx);
                      const isCorrect = userAnswer !== undefined && (
                        q.choices[userAnswer] === q.correctAnswer || 
                        String(q.choices[userAnswer]) === String(q.correctAnswer)
                      );
      if (isCorrect) {
        skillStats[q.skill].correct++;
      }
    });
    
    return Object.entries(skillStats).map(([skill, stats]) => ({
      skill,
      correct: stats.correct,
      total: stats.total,
      percentage: (stats.correct / stats.total) * 100
    })).sort((a, b) => b.percentage - a.percentage);
  };

  const skillBreakdown = calculateSkillBreakdown();

  const getSkillIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (percentage >= 50) return <Minus className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  const getSkillColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      <Header />
      
      {/* Achievement Notification */}
      {newAchievements.length > 0 && screen === 'results' && (
        <AchievementNotification
          achievements={newAchievements}
          onClose={() => setNewAchievements([])}
        />
      )}
      
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
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

            {/* Achievement Badges Section */}
            {userAchievements.length > 0 && (
              <div className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-bold text-yellow-900">ตราสัญลักษณ์ความสำเร็จ</h3>
                  <span className="ml-auto bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {userAchievements.length} / {allAchievements.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {userAchievements.map((ua) => (
                    <AchievementBadge
                      key={ua.id}
                      code={ua.achievement?.icon || 'award'}
                      name={ua.achievement?.name_th || ''}
                      description={ua.achievement?.description_th}
                      color={ua.achievement?.color || 'blue'}
                      size="md"
                      showName={true}
                      earnedAt={ua.earned_at}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Section */}
            <div className="border-t-2 border-purple-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  ใบประกาศผลการสอบ
                </h3>
                <Button
                  onClick={() => setShowCertificate(!showCertificate)}
                  variant="outline"
                  size="sm"
                >
                  {showCertificate ? 'ซ่อน' : 'แสดง'}
                </Button>
              </div>

              {showCertificate && (
                <div className="space-y-4">
                  {/* Certificate Preview */}
                  <div className="flex justify-center overflow-x-auto pb-4">
                    <div className="transform scale-75 origin-top">
                      <CertificateCard
                        ref={certificateRef}
                        nickname={profile?.nickname || 'นักเรียน'}
                        score={score}
                        grade={selectedGrade}
                        semester={selectedSemester}
                        correctAnswers={correctAnswers}
                        totalQuestions={questions.length}
                        date={new Date().toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        evaluation={evaluation}
                        badges={userAchievements.slice(0, 3).map(ua => ({
                          icon: ua.achievement?.icon || 'award',
                          color: ua.achievement?.color || 'blue',
                          name: ua.achievement?.name_th || ''
                        }))}
                      />
                    </div>
                  </div>

                  {/* Download and Share Buttons */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      ดาวน์โหลดและแชร์
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        onClick={handleDownloadCertificate}
                        className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        ดาวน์โหลดใบประกาศ
                      </Button>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          onClick={() => handleShareCertificate('facebook')}
                          variant="outline"
                          className="flex items-center justify-center gap-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Facebook className="w-4 h-4" />
                          <span className="hidden md:inline">FB</span>
                        </Button>
                        <Button
                          onClick={() => handleShareCertificate('line')}
                          variant="outline"
                          className="flex items-center justify-center gap-1 border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden md:inline">LINE</span>
                        </Button>
                        <Button
                          onClick={() => handleShareCertificate('twitter')}
                          variant="outline"
                          className="flex items-center justify-center gap-1 border-sky-600 text-sky-600 hover:bg-sky-50"
                        >
                          <Twitter className="w-4 h-4" />
                          <span className="hidden md:inline">X</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      💡 คลิกดาวน์โหลดเพื่อบันทึกใบประกาศ หรือแชร์ไปยัง Social Media เพื่อโชว์ผลการเรียนของคุณ!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Skill Breakdown Section */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2 text-xl font-bold text-purple-600">
                <Award className="w-6 h-6" />
                <span>ผลคะแนนแยกตามทักษะ</span>
              </div>
              <p className="text-sm text-gray-600">ดูว่าทักษะไหนที่แข็งแรงและควรพัฒนาต่อ</p>
              
              <div className="space-y-3">
                {skillBreakdown.map((item) => (
                  <Card key={item.skill} className="border-2 hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                           {getSkillIcon(item.percentage)}
                           <span className="font-semibold text-gray-800">
                             {skillNamesTh[item.skill] || item.skill}
                           </span>
                         </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {item.correct}/{item.total} ข้อ
                          </span>
                          <span className={`font-bold text-lg ${
                            item.percentage >= 80 ? 'text-green-600' : 
                            item.percentage >= 50 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {item.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={item.percentage} 
                        className="h-3"
                        indicatorClassName={getSkillColor(item.percentage)}
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        {item.percentage >= 80 && '✨ ยอดเยี่ยม! เข้าใจดีมาก'}
                        {item.percentage >= 50 && item.percentage < 80 && '👍 ดี แต่ควรฝึกเพิ่มเติม'}
                        {item.percentage < 50 && '📚 ควรทบทวนและฝึกฝนเพิ่มเติม'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 คำแนะนำ</h4>
                <p className="text-sm text-blue-800">
                  ทักษะที่ได้คะแนนต่ำกว่า 50% ควรฝึกฝนเพิ่มเติมโดยเข้าไปเล่นเกมฝึกทักษะในหน้าหลัก
                </p>
              </div>
            </div>

            {/* Answer Review Section */}
            {showAnswers && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-purple-600 border-t pt-4">
                  <BookOpen className="w-5 h-5" />
                  <span>เฉลยข้อสอบ</span>
                </div>
                {questions.map((q, idx) => {
                  const userAnswer = answers.get(idx);
                  const isCorrect = userAnswer !== undefined && (
                    q.choices[userAnswer] === q.correctAnswer || 
                    String(q.choices[userAnswer]) === String(q.correctAnswer)
                  );
                  
                  return (
                    <Card key={idx} className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                          )}
                           <div className="flex-1">
                            <div className="font-semibold text-gray-800 mb-2">
                              <span>ข้อ {idx + 1}: </span>
                              {renderQuestionText(q.question)}
                            </div>
                            <div className="space-y-2 text-sm">
                              {q.choices.map((choice, choiceIdx) => {
                                const isUserChoice = userAnswer === choiceIdx;
                                const isCorrectChoice = choice === q.correctAnswer || 
                                                      String(choice) === String(q.correctAnswer);
                                
                                return (
                                  <div
                                    key={choiceIdx}
                                    className={`p-3 rounded-lg border-2 ${
                                      isCorrectChoice
                                        ? 'bg-green-100 border-green-400 font-semibold shadow-sm'
                                        : isUserChoice
                                        ? 'bg-red-100 border-red-400'
                                        : 'bg-white border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{choiceIdx + 1}.</span>
                                        {renderChoice(choice)}
                                      </div>
                                      {isCorrectChoice && (
                                        <span className="text-green-700 font-semibold flex items-center gap-1">
                                          <CheckCircle className="w-4 h-4" />
                                          คำตอบที่ถูกต้อง
                                        </span>
                                      )}
                                      {isUserChoice && !isCorrectChoice && (
                                        <span className="text-red-700 font-semibold flex items-center gap-1">
                                          <XCircle className="w-4 h-4" />
                                          คำตอบของคุณ
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* แสดงคำอธิบายเฉลย โดยเฉพาะข้อที่ตอบผิด */}
                            {q.explanation && (
                              <div className={`mt-3 p-3 rounded-lg border-2 ${
                                isCorrect 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : 'bg-yellow-50 border-yellow-300'
                              }`}>
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">💡</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-800 mb-1">
                                      {isCorrect ? 'คำอธิบาย:' : 'เฉลย:'}
                                    </p>
                                    <p className="text-sm text-gray-700">{q.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => setShowAnswers(!showAnswers)} 
                  variant="outline" 
                  className="flex items-center justify-center gap-2"
                  size="lg"
                >
                  <Eye className="w-4 h-4" />
                  {showAnswers ? 'ซ่อนเฉลย' : 'ดูเฉลย'}
                </Button>
                <Button 
                  onClick={handleSendLine}
                  disabled={isSendingLine || lineSent}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  <Send className="w-4 h-4" />
                  {lineSent ? 'ส่ง LINE แล้ว' : isSendingLine ? 'กำลังส่ง...' : 'ส่ง LINE ผู้ปกครอง'}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleRestart} variant="outline" size="lg">
                  ทำใหม่อีกครั้ง
                </Button>
                <Button onClick={() => navigate('/profile')} size="lg">
                  กลับหน้าหลัก
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Quiz;
