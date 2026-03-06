import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
import CompetencyRadarChart from '@/components/CompetencyRadarChart';
import ComparisonRadarChart from '@/components/ComparisonRadarChart';
import type { ComparisonSkillItem } from '@/components/ComparisonRadarChart';
import { ClockDisplay } from '@/components/ClockDisplay';
import { ReadAloudButton } from '@/components/ReadAloudButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardPen, Clock, Award, ChevronLeft, ChevronRight, BookOpen, Send, Eye, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus, Hash, Scale, ArrowUpDown, Grid3x3, Plus, Sparkles, Shapes, Ruler, BarChart2, LucideIcon, BarChart3, Download, Share2, Facebook, MessageCircle, Twitter, Trophy, GitCompareArrows, ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useQuizImage } from '@/hooks/useQuizImage';
import { getGradeOptions, getSemesterOptions, curriculumConfig } from '@/config/curriculum';
import { evaluateAssessment, generateSkillPracticeQuestions, AssessmentQuestion } from '@/utils/assessmentUtils';
import { downloadCertificate, shareCertificate } from '@/utils/certificateUtils';

const Quiz = () => {
  const { user, registrationId, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['quiz', 'common']);
  const { toast } = useToast();
  const locationState = location.state as { 
    grade?: number; semester?: number; 
    showResults?: boolean; 
    assessmentRecord?: {
      score: number; correct_answers: number; total_questions: number;
      time_taken: number; grade: number; semester: number;
      assessment_data: any; assessment_type?: string;
    };
  } | null;

  // Historical results override (when navigating from QuizHistory)
  const [historyMode, setHistoryMode] = useState(false);
  const [historyData, setHistoryData] = useState<{
    score: number; correctAnswers: number; totalQuestions: number;
    timeTaken: number; skillBreakdown: { skill: string; correct: number; total: number; percentage: number }[];
  } | null>(null);

  const [screen, setScreen] = useState<'select' | 'assessment' | 'results'>(
    locationState?.showResults ? 'results' : 'select'
  );
  const [selectedGrade, setSelectedGrade] = useState<number>(
    locationState?.assessmentRecord?.grade || locationState?.grade || 1
  );
  const [selectedSemester, setSelectedSemester] = useState<number>(
    locationState?.assessmentRecord?.semester || locationState?.semester || 1
  );
  const [assessmentType, setAssessmentType] = useState<'semester1' | 'semester2' | 'nt'>('semester1');
  const [selectedNTYear, setSelectedNTYear] = useState<string>('mixed');
  const [showTopicOutline, setShowTopicOutline] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isSendingLine, setIsSendingLine] = useState(false);
  const [lineSent, setLineSent] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const certificateRef = useRef<HTMLDivElement>(null);
  const radarChartRef = useRef<HTMLDivElement>(null);
  
  // Comparison state for previous assessment
  const [previousSkillBreakdown, setPreviousSkillBreakdown] = useState<{skill: string; percentage: number}[] | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Practice mode state
  const [practiceSkill, setPracticeSkill] = useState<string | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<AssessmentQuestion[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Map<number, number>>(new Map());
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceLoading, setPracticeLoading] = useState(false);

  // AI Image generation toggle
  const [showAIImages, setShowAIImages] = useState(() => {
    return localStorage.getItem('quiz-ai-images') === 'true';
  });
  
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
  } = useAssessment(
    user?.id || registrationId || '', 
    hasStarted ? selectedGrade : 0, 
    hasStarted ? (assessmentType === 'nt' ? 'nt' : selectedSemester) : 0,
    undefined,
    assessmentType === 'nt' ? selectedNTYear : undefined
  );

  // AI image generation for current question
  const currentQ = questions[currentIndex];
  const { imageUrl: aiImageUrl, isLoading: aiImageLoading } = useQuizImage(
    currentQ?.imagePrompt,
    currentQ?.skill,
    showAIImages && screen === 'assessment' && !isSubmitted
  );

  // Populate history mode from location state
  useEffect(() => {
    if (locationState?.showResults && locationState.assessmentRecord) {
      const rec = locationState.assessmentRecord;
      
      // Compute skill breakdown from assessment_data
      const assessmentData = rec.assessment_data;
      const qList = Array.isArray(assessmentData) ? assessmentData : assessmentData?.questions;
      const skillStats: Record<string, { correct: number; total: number }> = {};
      
      if (Array.isArray(qList)) {
        qList.forEach((q: any) => {
          const skill = q.skill || 'unknown';
          if (!skillStats[skill]) skillStats[skill] = { correct: 0, total: 0 };
          skillStats[skill].total++;
          if (q.isCorrect || q.is_correct || 
              (q.userAnswer !== undefined && String(q.userAnswer) === String(q.correctAnswer))) {
            skillStats[skill].correct++;
          }
        });
      }
      
      const breakdown = Object.entries(skillStats).map(([skill, s]) => ({
        skill,
        correct: s.correct,
        total: s.total,
        percentage: s.total > 0 ? (s.correct / s.total) * 100 : 0,
      })).sort((a, b) => b.percentage - a.percentage);
      
      setHistoryData({
        score: rec.score,
        correctAnswers: rec.correct_answers,
        totalQuestions: rec.total_questions,
        timeTaken: rec.time_taken,
        skillBreakdown: breakdown,
      });
      setHistoryMode(true);
      
      // Clear location state to prevent stale data on refresh
      setScreen('results');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (screen !== 'results') return;
    const userId = user?.id || registrationId;
    if (!userId) return;
    
    const fetchPreviousAssessment = async () => {
      setComparisonLoading(true);
      try {
        // Get the 2nd most recent assessment for same grade & semester
        const semesterVal = assessmentType === 'nt' ? null : selectedSemester;
        let query = supabase
          .from('level_assessments')
          .select('assessment_data')
          .eq('user_id', userId)
          .eq('grade', selectedGrade)
          .order('created_at', { ascending: false })
          .range(1, 1); // skip the latest (index 0), get index 1
        
        if (semesterVal !== null) {
          query = query.eq('semester', semesterVal);
        }
        
        const { data, error } = await query;
        
        if (error || !data || data.length === 0) {
          setPreviousSkillBreakdown(null);
          return;
        }
        
        const prevData = data[0].assessment_data as any;
        if (!prevData || !Array.isArray(prevData)) {
          setPreviousSkillBreakdown(null);
          return;
        }
        
        // Compute skill breakdown from previous assessment_data
        const skillStats: Record<string, { correct: number; total: number }> = {};
        prevData.forEach((item: any) => {
          const skill = item.skill || 'unknown';
          if (!skillStats[skill]) skillStats[skill] = { correct: 0, total: 0 };
          skillStats[skill].total++;
          if (item.isCorrect) {
            skillStats[skill].correct++;
          }
        });
        
        const breakdown = Object.entries(skillStats).map(([skill, s]) => ({
          skill,
          percentage: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
        }));
        
        setPreviousSkillBreakdown(breakdown);
      } catch (err) {
        console.error('Failed to fetch previous assessment:', err);
        setPreviousSkillBreakdown(null);
      } finally {
        setComparisonLoading(false);
      }
    };
    
    fetchPreviousAssessment();
  }, [screen, user?.id, registrationId, selectedGrade, selectedSemester, assessmentType]);

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
      console.error('Invalid userId format:', userId);
      toast({
        title: "ข้อผิดพลาดระบบ",
        description: "รูปแบบ User ID ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ",
        variant: "destructive",
      });
      return;
    }

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
    setAssessmentType('semester1');
    setShowAnswers(false);
    setShowTopicOutline(false);
    setLineSent(false);
    setShowCertificate(false);
    setNewAchievements([]);
    setSelectedNTYear('mixed');
  };

  // Practice mode handlers
  const handleStartPractice = (skill: string) => {
    setPracticeLoading(true);
    try {
      const qs = generateSkillPracticeQuestions(skill, selectedGrade, selectedSemester, 10);
      setPracticeQuestions(qs);
      setPracticeSkill(skill);
      setPracticeIndex(0);
      setPracticeAnswers(new Map());
      setPracticeSubmitted(false);
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleExitPractice = () => {
    setPracticeSkill(null);
    setPracticeQuestions([]);
    setPracticeIndex(0);
    setPracticeAnswers(new Map());
    setPracticeSubmitted(false);
  };

  const practiceCorrectCount = (() => {
    let count = 0;
    practiceQuestions.forEach((q, i) => {
      const ans = practiceAnswers.get(i);
      if (ans !== undefined && (q.choices[ans] === q.correctAnswer || String(q.choices[ans]) === String(q.correctAnswer))) {
        count++;
      }
    });
    return count;
  })();

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
      
      // Compute skill breakdown for LINE message
      const skillStats: Record<string, { correct: number; total: number }> = {};
      questions.forEach((q, i) => {
        const skill = q.skill || 'unknown';
        if (!skillStats[skill]) skillStats[skill] = { correct: 0, total: 0 };
        skillStats[skill].total++;
        const userAnswerIndex = answers.get(i);
        if (userAnswerIndex !== undefined) {
          const userAnswerValue = q.choices[userAnswerIndex];
          if (userAnswerValue === q.correctAnswer || String(userAnswerValue) === String(q.correctAnswer)) {
            skillStats[skill].correct++;
          }
        }
      });
      const skillBreakdown = Object.entries(skillStats).map(([skill, s]) => ({
        skill: skillNamesTh[skill] || skill,
        percentage: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
        correct: s.correct,
        total: s.total,
      }));

      // Capture radar chart as image and upload to storage
      let chartImageUrl: string | undefined;
      if (radarChartRef.current) {
        try {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(radarChartRef.current, {
            backgroundColor: '#ffffff',
            scale: 4,
            useCORS: true,
            width: radarChartRef.current.scrollWidth,
            height: radarChartRef.current.scrollHeight,
          });
          const blob = await new Promise<Blob>((resolve) => 
            canvas.toBlob((b) => resolve(b!), 'image/png', 0.9)
          );
          const fileName = `radar_${userId}_${Date.now()}.png`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('chart-images')
            .upload(fileName, blob, { contentType: 'image/png', upsert: true });
          
          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage
              .from('chart-images')
              .getPublicUrl(fileName);
            chartImageUrl = urlData.publicUrl;
          } else {
            console.warn('Chart upload failed:', uploadError);
          }
        } catch (captureErr) {
          console.warn('Chart capture failed:', captureErr);
        }
      }

      // Build comparison data for LINE message
      let comparisonData: any = null;
      if (previousSkillBreakdown && previousSkillBreakdown.length > 0) {
        // Convert previous breakdown to Thai skill names
        const prevBreakdownTh = previousSkillBreakdown.map(s => ({
          skill: skillNamesTh[s.skill] || s.skill,
          percentage: s.percentage,
        }));
        
        // Build comparison items
        const comparisonItems = skillBreakdown.map(current => {
          const prev = prevBreakdownTh.find(p => p.skill === current.skill);
          const prevPct = prev ? prev.percentage : null;
          const change = prevPct !== null ? current.percentage - prevPct : null;
          return {
            skill: current.skill,
            currentPct: current.percentage,
            previousPct: prevPct,
            change,
          };
        });

        const improved = comparisonItems.filter(c => c.change !== null && c.change > 0).length;
        const declined = comparisonItems.filter(c => c.change !== null && c.change < 0).length;
        const stable = comparisonItems.filter(c => c.change !== null && c.change === 0).length;

        comparisonData = { items: comparisonItems, improved, declined, stable };
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-line-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          exerciseType: `แบบทดสอบวัดระดับ ป.${selectedGrade} เทอม ${selectedSemester}`,
          nickname: profile?.nickname || 'นักเรียน',
          correctAnswers,
          totalQuestions: questions.length,
          percentage: Math.round(score),
          timeTaken: `${Math.floor(timeTaken / 60)} นาที ${timeTaken % 60} วินาที`,
          skillBreakdown,
          isAssessment: true,
          chartImageUrl,
          comparisonData,
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

              {selectedGrade !== 3 && selectedGrade !== 7 && (
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
              )}

              {selectedGrade === 3 && (
                <div>
                  <Label className="text-lg mb-3 block font-semibold">ประเภทการสอบ</Label>
                  <RadioGroup value={assessmentType} onValueChange={(v) => {
                    setAssessmentType(v as 'semester1' | 'semester2' | 'nt');
                    if (v === 'semester1') setSelectedSemester(1);
                    if (v === 'semester2') setSelectedSemester(2);
                  }}>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                        <RadioGroupItem value="semester1" id="type-sem1" />
                        <Label htmlFor="type-sem1" className="flex-1 cursor-pointer font-medium">ภาคเรียนที่ 1</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                        <RadioGroupItem value="semester2" id="type-sem2" />
                        <Label htmlFor="type-sem2" className="flex-1 cursor-pointer font-medium">ภาคเรียนที่ 2</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 hover:border-yellow-500 transition-all cursor-pointer bg-gradient-to-r from-yellow-50 to-orange-50">
                        <RadioGroupItem value="nt" id="type-nt" />
                        <Label htmlFor="type-nt" className="flex-1 cursor-pointer font-medium flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          <span className="text-yellow-900">สอบวัดระดับชาติ (NT)</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedGrade === 3 && assessmentType === 'nt' && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-300">
                  <Label className="text-base mb-3 block font-semibold text-yellow-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    เลือกปีการศึกษาข้อสอบ NT
                  </Label>
                  <RadioGroup value={selectedNTYear} onValueChange={setSelectedNTYear}>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-3 p-3 border-2 border-yellow-400 rounded-lg hover:bg-yellow-100 transition-all cursor-pointer bg-white">
                        <RadioGroupItem value="mixed" id="year-mixed" />
                        <Label htmlFor="year-mixed" className="flex-1 cursor-pointer font-medium text-sm">
                          🎲 สุ่มผสมทุกปี (2564, 2565, 2566, 2567) - แนะนำ
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 transition-all cursor-pointer">
                        <RadioGroupItem value="2564" id="year-2564" />
                        <Label htmlFor="year-2564" className="flex-1 cursor-pointer font-medium text-sm">
                          📅 ปีการศึกษา 2564
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 transition-all cursor-pointer">
                        <RadioGroupItem value="2565" id="year-2565" />
                        <Label htmlFor="year-2565" className="flex-1 cursor-pointer font-medium text-sm">
                          📅 ปีการศึกษา 2565
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 transition-all cursor-pointer">
                        <RadioGroupItem value="2566" id="year-2566" />
                        <Label htmlFor="year-2566" className="flex-1 cursor-pointer font-medium text-sm">
                          📅 ปีการศึกษา 2566
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 border-green-400 rounded-lg hover:bg-green-50 hover:border-green-500 transition-all cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50">
                        <RadioGroupItem value="2567" id="year-2567" />
                        <Label htmlFor="year-2567" className="flex-1 cursor-pointer font-medium text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-green-600" />
                          <span className="text-green-900">ปีการศึกษา 2567 (ล่าสุด)</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedGrade === 3 && assessmentType === 'nt' && !showTopicOutline ? (
                <>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className="w-7 h-7 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">📋 ข้อมูลการสอบ</h3>
                        <p className="text-xs text-yellow-700">สอบวัดระดับชาติ (NT) ป.3</p>
                      </div>
                    </div>
                    <ul className="space-y-1 text-sm text-yellow-800">
                      <li>• จำนวนข้อสอบ: 30 ข้อ</li>
                      <li>• รูปแบบ: เลือกตัวเลือก 4 ข้อ</li>
                      <li>• คะแนนเต็ม: 100 คะแนน</li>
                      <li>• เวลา: 90 นาที</li>
                      <li>• แบ่งเป็น 7 หมวดหมู่</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => setShowTopicOutline(true)} 
                    className="w-full py-6 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    size="lg"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    ดูหัวข้อการสอบ
                  </Button>
                </>
              ) : selectedGrade === 3 && assessmentType === 'nt' && showTopicOutline ? (
                <>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-300">
                    <h3 className="font-semibold mb-4 text-yellow-900 flex items-center gap-2 text-lg">
                      <Trophy className="w-5 h-5" />
                      แผนผังหัวข้อการสอบ NT
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📚</span>
                            <span className="font-semibold text-gray-800">1. Counting & Patterns</span>
                          </div>
                          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">5 ข้อ</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">เปรียบเทียบขนาด, แนบกฎ, ตำแหน่งจำนัด</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🧮</span>
                            <span className="font-semibold text-gray-800">2. Fractions</span>
                          </div>
                          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">6 ข้อ</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">เศษส่วน, บวก-ลบ, โจทย์ปัญหา</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💰</span>
                            <span className="font-semibold text-gray-800">3. Money</span>
                          </div>
                          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">4 ข้อ</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">ชื่นเชย, ทอนเงิน, ซื้อของ</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⏰</span>
                            <span className="font-semibold text-gray-800">4. Time</span>
                          </div>
                          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">4 ข้อ</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">อ่านนาฬิกา, ระยะเวลา, ตารางเวลา</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📏</span>
                            <span className="font-semibold text-gray-800">5. Measurement</span>
                          </div>
                          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">4 ข้อ</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">วัดความยาว, แปลงหน่วย, เส้นรอบรูป</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔷</span>
                            <span className="font-semibold text-gray-800">6. Shapes</span>
                          </div>
                          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">3 ข้อ</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">รูปเรขาคณิต, สมมาตร</p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📊</span>
                            <span className="font-semibold text-gray-800">7. Data Presentation</span>
                          </div>
                          <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">4 ข้อ</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">อ่านตาราง, กราฟ, แปลความหมาย</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-yellow-300">
                      <p className="text-sm text-yellow-800 font-medium">รวมทั้งหมด: 30 ข้อ</p>
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
                      className="flex-1 py-6 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                      size="lg"
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      เริ่มทำข้อสอบ
                    </Button>
                  </div>
                </>
              ) : !showTopicOutline ? (
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
          {/* Quiz History Preview on Test Tab */}
          {(user?.id || registrationId) && (
            <div className="mt-8">
              <Card className="border-2 border-indigo-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700 text-lg">
                    <BarChart3 className="w-5 h-5" />
                    📋 ประวัติการทำแบบทดสอบล่าสุด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuizHistory userId={user?.id || registrationId || ''} compact />
                </CardContent>
              </Card>
            </div>
          )}
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
              {/* Exam title header */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-bold text-purple-900">
                  ชั้น ประถมศึกษาปีที่ {selectedGrade} 
                  {assessmentType === 'nt' ? ' สอบวัดระดับชาติ NT' : ` ภาคเรียนที่ ${selectedSemester}`}
                </h2>
              </div>

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
                  {/* Question Metadata Tags */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-blue-300 text-blue-700 font-medium">
                        {currentQuestion.difficulty === 'easy' ? 'ง่าย' : currentQuestion.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-purple-300 text-purple-700 font-medium">
                        ป.{selectedGrade} {assessmentType === 'nt' ? 'NT' : `เทอม ${selectedSemester}`}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-green-300 text-green-700 font-medium">
                        {t(`skills:skills.${currentQuestion.skill}.title`, { defaultValue: skillNamesTh[currentQuestion.skill] || currentQuestion.skill })}
                      </span>
                    </div>
                    {(() => {
                      const gradeKey = `grade${selectedGrade}`;
                      const semesterKey = assessmentType === 'nt' ? 'nt' : `semester${selectedSemester}`;
                      const skills = curriculumConfig[gradeKey]?.[semesterKey] || [];
                      const skillConfig = skills.find(s => s.skill === currentQuestion.skill);
                      return skillConfig?.description ? (
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                          <span className="font-semibold">คำอธิบาย:</span> {skillConfig.description}
                        </p>
                      ) : null;
                    })()}
                  </div>

                  {/* AI Image Toggle */}
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">ภาพ AI</span>
                    <Switch 
                      checked={showAIImages} 
                      onCheckedChange={(v) => {
                        setShowAIImages(v);
                        localStorage.setItem('quiz-ai-images', String(v));
                      }}
                    />
                  </div>

                  <div className="bg-white p-6 rounded-lg border-2 border-purple-200 space-y-4">
                    {/* AI Generated Image */}
                    {showAIImages && currentQuestion.imagePrompt && (
                      <div className="flex justify-center mb-4">
                        {aiImageLoading ? (
                          <Skeleton className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl" />
                        ) : aiImageUrl ? (
                          <img 
                            src={aiImageUrl} 
                            alt="ภาพประกอบโจทย์" 
                            className="w-72 h-72 sm:w-80 sm:h-80 object-contain rounded-2xl shadow-lg border-2 border-purple-200"
                          />
                        ) : null}
                      </div>
                    )}
                    {currentQuestion.clockDisplay && (
                      <ClockDisplay 
                        hour={currentQuestion.clockDisplay.hour} 
                        minute={currentQuestion.clockDisplay.minute}
                      />
                    )}
                    {renderQuestionText(currentQuestion.question)}
                    <div className="flex justify-end pt-2">
                      <ReadAloudButton text={currentQuestion.question} />
                    </div>
                  </div>

                  <RadioGroup 
                    key={`question-${currentIndex}-${answers.get(currentIndex) ?? 'none'}`}
                    value={answers.get(currentIndex) !== undefined ? String(answers.get(currentIndex)) : undefined}
                    onValueChange={(v) => {
                      const choiceIndex = parseInt(v, 10);
                      console.log('📝 Answer selected:', { 
                        questionIndex: currentIndex, 
                        choiceIndex, 
                        choiceValue: currentQuestion.choices[choiceIndex] 
                      });
                      setAnswer(currentIndex, choiceIndex);
                    }}
                  >
                    <div className="space-y-3">
                      {(currentQuestion.choices.length >= 4 
                        ? currentQuestion.choices 
                        : [...currentQuestion.choices, ...Array(4 - currentQuestion.choices.length).fill('ตัวเลือก')].slice(0, 4)
                      ).map((choice, idx) => {
                        const isSelected = answers.get(currentIndex) === idx;
                        return (
                          <div 
                            key={`q${currentIndex}-choice${idx}`}
                            className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-400 shadow-sm' 
                                : 'border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                            }`}
                          >
                            <RadioGroupItem value={String(idx)} id={`q${currentIndex}-choice${idx}`} />
                            <Label htmlFor={`q${currentIndex}-choice${idx}`} className="flex-1 cursor-pointer">
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

  // Results Screen - use history data if available, otherwise compute from quiz state
  const correctAnswers = historyMode && historyData ? historyData.correctAnswers : calculateCorrectAnswers();
  const totalQuestions = historyMode && historyData ? historyData.totalQuestions : questions.length;
  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const displayScore = historyMode && historyData ? historyData.score : score;
  const displayTimeTaken = historyMode && historyData ? historyData.timeTaken : timeTaken;
  const evaluation = evaluateAssessment(displayScore);

  // Calculate skill breakdown
  const calculateSkillBreakdown = () => {
    if (historyMode && historyData) {
      return historyData.skillBreakdown;
    }
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
      
      {/* Practice Mode Overlay */}
      {practiceSkill && (
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2 text-purple-600">
                  <BookOpen className="w-6 h-6" />
                  ฝึกทักษะ: {skillNamesTh[practiceSkill] || practiceSkill}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleExitPractice}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!practiceSubmitted ? (
                <>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>ข้อที่ {practiceIndex + 1} / {practiceQuestions.length}</span>
                    <span>{practiceAnswers.size} ตอบแล้ว</span>
                  </div>
                  <Progress value={((practiceIndex + 1) / practiceQuestions.length) * 100} className="h-2" />

                  {practiceQuestions[practiceIndex] && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        {renderQuestionText(practiceQuestions[practiceIndex].question)}
                      </div>

                      {practiceQuestions[practiceIndex].clockDisplay && (
                        <div className="flex justify-center">
                          <ClockDisplay
                            hour={practiceQuestions[practiceIndex].clockDisplay!.hour}
                            minute={practiceQuestions[practiceIndex].clockDisplay!.minute}
                            size={120}
                          />
                        </div>
                      )}

                      <RadioGroup
                        value={practiceAnswers.get(practiceIndex)?.toString() || ''}
                        onValueChange={(v) => {
                          const newMap = new Map(practiceAnswers);
                          newMap.set(practiceIndex, parseInt(v));
                          setPracticeAnswers(newMap);
                        }}
                      >
                        <div className="grid gap-2">
                          {practiceQuestions[practiceIndex].choices.map((choice, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 transition-all cursor-pointer ${
                                practiceAnswers.get(practiceIndex) === idx ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                              }`}
                            >
                              <RadioGroupItem value={String(idx)} id={`practice-${practiceIndex}-${idx}`} />
                              <Label htmlFor={`practice-${practiceIndex}-${idx}`} className="flex-1 cursor-pointer text-lg">
                                {renderChoice(choice)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>

                      <div className="flex justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setPracticeIndex(Math.max(0, practiceIndex - 1))}
                          disabled={practiceIndex === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> ข้อก่อนหน้า
                        </Button>
                        {practiceIndex === practiceQuestions.length - 1 ? (
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={async () => {
                              setPracticeSubmitted(true);
                              // Save practice result to Supabase
                              const userId = user?.id || registrationId;
                              if (userId && practiceSkill) {
                                const correct = (() => {
                                  let c = 0;
                                  practiceQuestions.forEach((q, i) => {
                                    const ans = practiceAnswers.get(i);
                                    if (ans !== undefined && (q.choices[ans] === q.correctAnswer || String(q.choices[ans]) === String(q.correctAnswer))) c++;
                                  });
                                  return c;
                                })();
                                const accuracy = Math.round((correct / practiceQuestions.length) * 100);
                                try {
                                  await supabase.from('practice_sessions').insert({
                                    user_id: userId,
                                    skill_name: practiceSkill,
                                    difficulty: 'mixed',
                                    problems_attempted: practiceQuestions.length,
                                    problems_correct: correct,
                                    accuracy,
                                    time_spent: 0,
                                    hints_used: 0,
                                  });
                                } catch (err) {
                                  console.error('Failed to save practice session:', err);
                                }
                              }
                            }}
                            disabled={practiceAnswers.get(practiceIndex) === undefined}
                          >
                            ดูผลคะแนน
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setPracticeIndex(practiceIndex + 1)}
                            disabled={practiceAnswers.get(practiceIndex) === undefined}
                          >
                            ข้อถัดไป <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Practice Results
                <div className="text-center space-y-6">
                  <div className="text-6xl">
                    {practiceCorrectCount >= 8 ? '🎉' : practiceCorrectCount >= 5 ? '👍' : '📚'}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-600">
                      {practiceCorrectCount}/{practiceQuestions.length}
                    </p>
                    <p className="text-lg text-gray-600 mt-1">
                      {Math.round((practiceCorrectCount / practiceQuestions.length) * 100)}% ถูกต้อง
                    </p>
                  </div>
                  <p className="text-gray-600">
                    {practiceCorrectCount >= 8 ? 'ยอดเยี่ยม! คุณเข้าใจทักษะนี้ดีมาก' :
                     practiceCorrectCount >= 5 ? 'ดี! แต่ยังมีจุดที่ควรฝึกเพิ่ม' :
                     'ควรทบทวนและฝึกฝนเพิ่มเติม'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleExitPractice}>
                      กลับดูผลสอบ
                    </Button>
                    <Button onClick={() => handleStartPractice(practiceSkill)}>
                      ฝึกอีกครั้ง
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!practiceSkill && (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            {historyMode && (
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 w-fit"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> กลับหน้าประวัติ
              </Button>
            )}
            <CardTitle className="text-3xl text-center flex items-center justify-center gap-3 text-purple-600">
              <Award className="w-8 h-8 text-yellow-500" />
              ผลการสอบ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-6">
              <div className="text-6xl font-bold text-purple-600 mb-4">
                {displayScore.toFixed(1)}%
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
                  <div className="text-4xl font-bold text-red-600 mb-2">{totalQuestions - correctAnswers}</div>
                  <div className="text-sm text-red-700 font-medium">คำตอบผิด</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>เวลาที่ใช้:</span>
                <span className="font-mono font-semibold">{Math.floor(displayTimeTaken / 60)} นาที {displayTimeTaken % 60} วินาที</span>
              </div>
            </div>

            {/* Button to open detail dialog */}
            {skillBreakdown.length > 0 && (
              <Button
                onClick={() => setShowDetailDialog(true)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center justify-center gap-2"
                size="lg"
              >
                <BarChart3 className="w-5 h-5" />
                ดูรายละเอียดและฝึกทักษะเพิ่ม
              </Button>
            )}

            {/* Detail & Practice Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-purple-600 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    ผลการทดสอบวัดระดับความรู้
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Radar Chart */}
                  <div className="flex justify-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <CompetencyRadarChart
                      skillData={skillBreakdown.map(s => ({
                        skill: skillNamesTh[s.skill] || s.skill,
                        percentage: s.percentage,
                      }))}
                      size="lg"
                      averageScore={displayScore}
                    />
                  </div>
                  <div className="flex justify-center gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> ≥85%</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 50-84%</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &lt;50%</span>
                  </div>

                  {/* Skill Breakdown with Progress Bars */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">คะแนนแยกตามทักษะ</h3>
                    {skillBreakdown.map((item) => (
                      <div key={item.skill} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                            {skillNamesTh[item.skill] || item.skill}
                          </span>
                          <span className={`font-bold text-sm ${
                            item.percentage >= 85 ? 'text-green-600' :
                            item.percentage >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {item.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          value={item.percentage}
                          className="h-3"
                          indicatorClassName={getSkillColor(item.percentage)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Weak Skills Practice Recommendations */}
                  {(() => {
                    const weakSkills = skillBreakdown
                      .filter(s => s.percentage < 85)
                      .sort((a, b) => a.percentage - b.percentage);
                    if (weakSkills.length === 0) return (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          🎉 ยอดเยี่ยม! ทุกทักษะได้คะแนน 85% ขึ้นไป
                        </p>
                      </div>
                    );
                    return (
                      <div className="space-y-3">
                        <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          🎯 แนะนำทักษะที่ควรฝึกเพิ่ม ({weakSkills.length} ทักษะ)
                        </h3>
                        <div className="space-y-2">
                          {weakSkills.map((s) => (
                            <div key={s.skill} className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${s.percentage < 50 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                <span className="font-medium text-sm">{skillNamesTh[s.skill] || s.skill}</span>
                                <span className={`text-xs font-bold ${s.percentage < 50 ? 'text-red-600' : 'text-yellow-600'}`}>
                                  {s.percentage.toFixed(0)}%
                                </span>
                              </div>
                              <Button
                                size="sm"
                                className="text-xs bg-amber-500 hover:bg-amber-600 text-white h-7 px-3"
                                onClick={() => {
                                  setShowDetailDialog(false);
                                  handleStartPractice(s.skill);
                                }}
                                disabled={practiceLoading}
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                ฝึกเลย
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </DialogContent>
            </Dialog>

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

            {/* Competency Radar Chart */}
            {skillBreakdown.length >= 3 && (
              <div className="border-t-2 border-indigo-200 pt-6">
                <div className="flex items-center gap-2 text-xl font-bold text-purple-600 mb-4">
                  <BarChart3 className="w-6 h-6" />
                  <span>ผลการทดสอบวัดระดับความรู้</span>
                </div>
              <div ref={radarChartRef} className="flex justify-center bg-white p-4 rounded-lg">
                  <CompetencyRadarChart
                    skillData={skillBreakdown.map(s => ({
                      skill: skillNamesTh[s.skill] || s.skill,
                      percentage: s.percentage,
                    }))}
                    size="lg"
                    averageScore={displayScore}
                  />
                </div>
                <div className="flex justify-center gap-4 mt-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> ≥85% ดีมาก</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 50-84% ต้องปรับปรุง</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &lt;50% ควรปรับปรุง</span>
                </div>
              </div>
            )}

            {/* Comparison with Previous Assessment */}
            {previousSkillBreakdown && previousSkillBreakdown.length > 0 && skillBreakdown.length >= 3 && (() => {
              // Build comparison data
              const comparisonData: ComparisonSkillItem[] = skillBreakdown.map(current => {
                const prev = previousSkillBreakdown.find(p => p.skill === current.skill);
                return {
                  skill: skillNamesTh[current.skill] || current.skill,
                  current: current.percentage,
                  previous: prev ? prev.percentage : 0,
                };
              });
              
              const currentAvg = comparisonData.reduce((s, d) => s + d.current, 0) / comparisonData.length;
              const previousAvg = comparisonData.reduce((s, d) => s + d.previous, 0) / comparisonData.length;
              
              const improved = comparisonData.filter(d => d.current > d.previous);
              const declined = comparisonData.filter(d => d.current < d.previous);
              const stable = comparisonData.filter(d => d.current === d.previous);

              // Skills to recommend: below 85% or declined
              const recommendSkills = comparisonData
                .filter(d => d.current < 85 || d.current < d.previous)
                .sort((a, b) => a.current - b.current);
              
              return (
                <div className="border-t-2 border-blue-200 pt-6 space-y-4">
                  <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
                    <GitCompareArrows className="w-6 h-6" />
                    <span>เปรียบเทียบกับการสอบครั้งก่อน</span>
                  </div>
                  
                  {/* Overlapping Radar Chart */}
                  <div className="bg-white p-4 rounded-lg border">
                    <ComparisonRadarChart
                      data={comparisonData}
                      currentAvg={currentAvg}
                      previousAvg={previousAvg}
                    />
                  </div>
                  
                  {/* Analysis Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      บทวิเคราะห์การพัฒนา
                    </h4>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{improved.length}</div>
                        <div className="text-xs text-green-700">ดีขึ้น ▲</div>
                      </div>
                      <div className="text-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-600">{stable.length}</div>
                        <div className="text-xs text-gray-700">คงที่ =</div>
                      </div>
                      <div className="text-center bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600">{declined.length}</div>
                        <div className="text-xs text-red-700">ลดลง ▼</div>
                      </div>
                    </div>
                    
                    {/* Detailed comparison table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-200">
                            <th className="text-left py-2 px-2 text-blue-800">ทักษะ</th>
                            <th className="text-center py-2 px-2 text-gray-500">ครั้งก่อน</th>
                            <th className="text-center py-2 px-2 text-blue-700">ครั้งนี้</th>
                            <th className="text-center py-2 px-2">เปลี่ยนแปลง</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonData.map((d, i) => {
                            const diff = d.current - d.previous;
                            return (
                              <tr key={i} className="border-b border-blue-100">
                                <td className="py-2 px-2 font-medium text-gray-800">{d.skill}</td>
                                <td className="text-center py-2 px-2 text-gray-500">{d.previous}%</td>
                                <td className="text-center py-2 px-2 font-semibold">{d.current}%</td>
                                <td className={`text-center py-2 px-2 font-bold ${
                                  diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'
                                }`}>
                                  {diff > 0 ? `▲ +${diff}%` : diff < 0 ? `▼ ${diff}%` : '='}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Practice Recommendations from comparison */}
                  {recommendSkills.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200 space-y-3">
                      <h4 className="font-semibold text-orange-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-600" />
                        🎯 แนะนำทักษะที่ควรฝึกเพิ่ม (จากบทวิเคราะห์)
                        <span className="ml-auto text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
                          {recommendSkills.length} ทักษะ
                        </span>
                      </h4>
                      <p className="text-xs text-orange-700">ทักษะที่ต่ำกว่า 85% หรือลดลงจากครั้งก่อน</p>
                      <div className="space-y-2">
                        {recommendSkills.map((s, i) => {
                          const diff = s.current - s.previous;
                          // Find original skill key for practice
                          const originalSkill = skillBreakdown.find(
                            sb => (skillNamesTh[sb.skill] || sb.skill) === s.skill
                          )?.skill || s.skill;
                          return (
                            <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-orange-100">
                              <div className="flex items-center gap-2 flex-1">
                                {s.current < 50 ? (
                                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                                )}
                                <span className="font-medium text-sm text-gray-800">{s.skill}</span>
                                <span className={`text-xs font-bold ${
                                  s.current < 50 ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {s.current}%
                                </span>
                                {diff !== 0 && (
                                  <span className={`text-xs ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({diff > 0 ? '+' : ''}{diff}%)
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="text-xs bg-orange-500 hover:bg-orange-600 text-white h-7 px-3"
                                onClick={() => handleStartPractice(originalSkill)}
                                disabled={practiceLoading}
                              >
                                <BookOpen className="w-3 h-3 mr-1" />
                                ฝึกเลย
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

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
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {item.percentage >= 80 && '✨ ยอดเยี่ยม! เข้าใจดีมาก'}
                          {item.percentage >= 50 && item.percentage < 80 && '👍 ดี แต่ควรฝึกเพิ่มเติม'}
                          {item.percentage < 50 && '📚 ควรทบทวนและฝึกฝนเพิ่มเติม'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-purple-300 text-purple-600 hover:bg-purple-50"
                          onClick={() => handleStartPractice(item.skill)}
                          disabled={practiceLoading}
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          ฝึกใหม่
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Auto Skill Recommendations - skills below 85% */}
              {(() => {
                const weakSkills = skillBreakdown
                  .filter(s => s.percentage < 85)
                  .sort((a, b) => a.percentage - b.percentage);
                if (weakSkills.length === 0) return (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      🎉 ยอดเยี่ยม!
                    </h4>
                    <p className="text-sm text-green-800">ทุกทักษะได้คะแนน 85% ขึ้นไป ไม่มีทักษะที่ต้องฝึกเพิ่ม</p>
                  </div>
                );
                return (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4 space-y-3">
                    <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      🎯 แนะนำทักษะที่ควรฝึกเพิ่ม
                      <span className="ml-auto text-xs font-normal text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                        {weakSkills.length} ทักษะ
                      </span>
                    </h4>
                    <p className="text-xs text-amber-700">ทักษะที่ได้คะแนนต่ำกว่า 85% ควรฝึกฝนเพิ่มเติม</p>
                    <div className="space-y-2">
                      {weakSkills.map((s) => (
                        <div key={s.skill} className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-100">
                          <div className="flex items-center gap-2">
                            {s.percentage < 50 ? (
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            )}
                            <span className="font-medium text-sm text-gray-800">
                              {skillNamesTh[s.skill] || s.skill}
                            </span>
                            <span className={`text-xs font-bold ${
                              s.percentage < 50 ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {s.percentage.toFixed(0)}%
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="text-xs bg-amber-500 hover:bg-amber-600 text-white h-7 px-3"
                            onClick={() => handleStartPractice(s.skill)}
                            disabled={practiceLoading}
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            ฝึกเลย
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
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
                            {/* Question Metadata Tags */}
                            <div className="mb-3 flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-blue-300 text-blue-700 font-medium">
                                {q.difficulty === 'easy' ? 'ง่าย' : q.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-purple-300 text-purple-700 font-medium">
                                ป.{selectedGrade} {assessmentType === 'nt' ? 'NT' : `เทอม ${selectedSemester}`}
                              </span>
                              <span className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-green-300 text-green-700 font-medium">
                                {t(`skills:skills.${q.skill}.title`, { defaultValue: skillNamesTh[q.skill] || q.skill })}
                              </span>
                              {(() => {
                                const gradeKey = `grade${selectedGrade}`;
                                const semesterKey = assessmentType === 'nt' ? 'nt' : `semester${selectedSemester}`;
                                const skills = curriculumConfig[gradeKey]?.[semesterKey] || [];
                                const skillConfig = skills.find(s => s.skill === q.skill);
                                return skillConfig?.description ? (
                                  <span className="text-xs text-gray-600 w-full mt-1">
                                    : {skillConfig.description}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                            
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
      )}
      <Footer />
    </div>
  );
};

export default Quiz;
