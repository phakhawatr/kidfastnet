import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, RotateCcw, CheckCircle2, Timer, PlayCircle, RefreshCw, Printer, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import { useSearchParams } from 'react-router-dom';

interface Problem {
  multiplicand: string;
  multiplier: string;
  partialProducts: string[];
  finalAnswer: string;
  dimensions: [number, number];
}

interface Answer {
  partialProducts: string[][];
  finalAnswer: string[];
}

const MultiplicationApp = () => {
  const { t } = useTranslation('exercises');
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Mission mode integration
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  // Background music with 3 track options - beautiful instrumental music
  const backgroundMusic = useBackgroundMusic([
    { 
      id: 'happy', 
      name: t('common.musicHappy', { defaultValue: 'เพลงสนุกสนาน' }), 
      url: 'https://cdn.pixabay.com/download/audio/2021/02/16/audio_24e50c19e6.mp3'
    },
    { 
      id: 'calm', 
      name: t('common.musicCalm', { defaultValue: 'เพลงผ่อนคลาย' }), 
      url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_d1718ab41b.mp3'
    },
    { 
      id: 'focus', 
      name: t('common.musicFocus', { defaultValue: 'เพลงเน้นสมาธิ' }), 
      url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c48f87a7d7.mp3'
    }
  ]);
  const [problemCount, setProblemCount] = useState(15);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [dimensions, setDimensions] = useState<[number, number]>([1, 1]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [results, setResults] = useState<('correct' | 'incorrect' | null)[][][]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // LINE sending states
  const [isSendingLine, setIsSendingLine] = useState(false);
  const [lineSent, setLineSent] = useState(false);
  const [lineQuota, setLineQuota] = useState<{ remaining: number; total: number } | null>(null);
  
  // PDF and Logo states
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewContent, setPdfPreviewContent] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Problem input refs for auto-focus between problems
  const problemInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, isCompleted]);

  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate random number based on difficulty
  const generateNumber = (digits: number): string => {
    const ranges: Record<'easy' | 'medium' | 'hard', number[]> = {
      easy: [0, 6],
      medium: [0, 8],
      hard: [1, 9]
    };
    
    const [min, max] = ranges[difficulty];
    let result = '';
    
    for (let i = 0; i < digits; i++) {
      if (i === 0) {
        // First digit cannot be 0
        result += Math.floor(Math.random() * (max - 1)) + 1;
      } else {
        result += Math.floor(Math.random() * (max - min + 1)) + min;
      }
    }
    
    return result;
  };

  // Calculate long multiplication
  const calculateLongMultiplication = (multiplicand: string, multiplier: string) => {
    const partialProducts: string[] = [];
    const multiplicandNum = parseInt(multiplicand);
    
    // Calculate partial products for each digit of multiplier (from right to left)
    for (let i = multiplier.length - 1; i >= 0; i--) {
      const digit = parseInt(multiplier[i]);
      const product = multiplicandNum * digit;
      const positionFromRight = multiplier.length - 1 - i; // 0 for units, 1 for tens, 2 for hundreds, etc.
      
      if (product === 0) {
        partialProducts.push('0');
      } else {
        // Add trailing zeros based on position
        const zeros = '0'.repeat(positionFromRight);
        partialProducts.push(product.toString() + zeros);
      }
    }
    
    // Calculate final answer
    const finalAnswer = partialProducts.reduce((sum, product) => {
      return (parseInt(sum) + parseInt(product)).toString();
    }, '0');
    
    return { partialProducts, finalAnswer };
  };

  // Generate new problems
  const generateProblems = useCallback(() => {
    const newProblems: Problem[] = [];
    
    for (let i = 0; i < problemCount; i++) {
      const multiplicand = generateNumber(dimensions[0]);
      const multiplier = generateNumber(dimensions[1]);
      const { partialProducts, finalAnswer } = calculateLongMultiplication(multiplicand, multiplier);
      
      newProblems.push({
        multiplicand,
        multiplier,
        partialProducts,
        finalAnswer,
        dimensions
      });
    }
    
    setProblems(newProblems);
    
    // Initialize answers and results
    const newAnswers: Answer[] = newProblems.map(problem => ({
      partialProducts: problem.partialProducts.map(product => new Array(product.length).fill('')),
      finalAnswer: new Array(problem.finalAnswer.length).fill('')
    }));
    
    const newResults: ('correct' | 'incorrect' | null)[][][] = newProblems.map(problem => [
      ...problem.partialProducts.map(product => new Array(product.length).fill(null) as ('correct' | 'incorrect' | null)[]),
      new Array(problem.finalAnswer.length).fill(null) as ('correct' | 'incorrect' | null)[]
    ]);
    
    setAnswers(newAnswers);
    setResults(newResults);
    setIsCompleted(false);
    setShowCelebration(false);
    setStartTime(null);
    setCurrentTime(0);
  }, [problemCount, difficulty, dimensions]);

  // Initialize problems on component mount and when settings change
  useEffect(() => {
    generateProblems();
  }, [generateProblems]);

  // Force scroll to top when component mounts
  useEffect(() => {
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch {}
    try { 
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); 
    } catch {}
  }, []);

  // Load logo from localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem('schoolLogo');
    if (savedLogo) {
      setSchoolLogo(savedLogo);
    }
  }, []);

  // Start timer on first input
  const startTimer = () => {
    if (!startTime) {
      setStartTime(Date.now());
      backgroundMusic.play(); // Start background music
    }
  };

  // Update answer
  const updateAnswer = (problemIdx: number, rowIdx: number, digitIdx: number, value: string) => {
    startTimer();
    
    if (!/^\d*$/.test(value)) return;
    
    const newAnswers = [...answers];
    
    if (rowIdx < problems[problemIdx].partialProducts.length) {
      // Partial product answer
      newAnswers[problemIdx].partialProducts[rowIdx][digitIdx] = value;
    } else {
      // Final answer
      newAnswers[problemIdx].finalAnswer[digitIdx] = value;
    }
    
    setAnswers(newAnswers);
  };

  // Check answers
  const checkAnswers = async () => {
    if (!problems.length) return;
    
    backgroundMusic.stop(); // Stop background music when checking
    
    let allCorrect = true;
    let correctCount = 0;
    const newResults = [...results];
    
    problems.forEach((problem, problemIdx) => {
      // Check partial products
      let problemCorrect = true;
      problem.partialProducts.forEach((correctProduct, rowIdx) => {
        const userAnswer = answers[problemIdx].partialProducts[rowIdx].join('');
        const isCorrect = userAnswer === correctProduct;
        
        for (let digitIdx = 0; digitIdx < correctProduct.length; digitIdx++) {
          if (newResults[problemIdx][rowIdx]) {
            newResults[problemIdx][rowIdx][digitIdx] = isCorrect ? 'correct' : 'incorrect';
          }
        }
        
        if (!isCorrect) {
          allCorrect = false;
          problemCorrect = false;
        }
      });
      
      // Check final answer
      const userFinalAnswer = answers[problemIdx].finalAnswer.join('');
      const isCorrect = userFinalAnswer === problem.finalAnswer;
      const finalRowIdx = problem.partialProducts.length;
      
      for (let digitIdx = 0; digitIdx < problem.finalAnswer.length; digitIdx++) {
        if (newResults[problemIdx][finalRowIdx]) {
          newResults[problemIdx][finalRowIdx][digitIdx] = isCorrect ? 'correct' : 'incorrect';
        }
      }
      
      if (!isCorrect) {
        allCorrect = false;
        problemCorrect = false;
      }
      
      if (problemCorrect) correctCount++;
    });
    
    setResults(newResults);
    setLineSent(false); // Reset sent status when checking new answers
    
    // If mission mode, complete mission
    if (isMissionMode) {
      const duration = startTime ? Date.now() - startTime : currentTime;
      await handleCompleteMission(correctCount, problems.length, duration);
      return;
    }
    
    // Otherwise, show regular results modal
    setShowResultsModal(true);
    
    if (allCorrect) {
      setIsCompleted(true);
      setShowCelebration(true);
      toast({
        title: `🎉 ${t('results.excellent')}`,
        description: t('results.allCorrect'),
      });
      
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      toast({
        title: t('common.tryAgain'),
        description: t('results.someIncorrect'),
        variant: "destructive",
      });
    }
  };

  const handleSendToLine = async () => {
    if (isSendingLine || lineSent) return;
    
    setIsSendingLine(true);
    
    try {
      const authStored = localStorage.getItem('kidfast_auth');
      if (!authStored) {
        toast({
          title: t('errors.lineNotConnected'),
          description: t('errors.connectLineFromProfile'),
          variant: "destructive",
        });
        setIsSendingLine(false);
        return;
      }

      const authState = JSON.parse(authStored);
      const userId = authState.registrationId;
      const userNickname = localStorage.getItem('user_nickname') || authState.username || t('common.student', { defaultValue: 'นักเรียน' });

      if (!userId) {
        toast({
          title: t('errors.userNotFound'),
          description: t('errors.pleaseLogin'),
          variant: "destructive",
        });
        setIsSendingLine(false);
        return;
      }

      const timeSpent = formatTime(currentTime);

      // Count correct problems
      let correctCount = 0;
      const problemsData = problems.map((problem, idx) => {
        const userFinalAnswer = answers[idx].finalAnswer.join('');
        const isCorrect = userFinalAnswer === problem.finalAnswer;
        if (isCorrect) correctCount++;
        
        const question = `${problem.multiplicand}×${problem.multiplier}`;
        
        return {
          questionNumber: idx + 1,
          question,
          userAnswer: userFinalAnswer || t('multiplication.noAnswer'),
          correctAnswer: problem.finalAnswer,
          isCorrect
        };
      });

      const levelMap: Record<'easy' | 'medium' | 'hard', string> = {
        easy: t('common.easy'),
        medium: t('common.medium'),
        hard: t('common.hard')
      };

      const percentage = Math.round((correctCount / problems.length) * 100);

      const { data, error } = await supabase.functions.invoke('send-line-message', {
        body: {
          userId,
          exerciseType: 'multiplication',
          nickname: userNickname,
          score: correctCount,
          total: problems.length,
          percentage,
          timeSpent,
          level: levelMap[difficulty] || difficulty,
          problems: problemsData
        }
      });

      if (error) {
        console.error('LINE Error:', error);
        
        if (data?.error === 'quota_exceeded') {
          toast({
            title: t('errors.quotaExceeded'),
            description: data.message || t('errors.quotaExceededDesc', { defaultValue: 'คุณส่งข้อความครบ 20 ครั้งแล้ววันนี้' }),
            variant: "destructive",
          });
          setLineQuota({ remaining: 0, total: 20 });
        } else {
          toast({
            title: t('errors.sendFailed'),
            description: t('errors.sendFailedDesc'),
            variant: "destructive",
          });
        }
        setIsSendingLine(false);
        return;
      }

      if (data?.quota) {
        setLineQuota({
          remaining: data.quota.remaining,
          total: data.quota.quota_limit
        });
      }

      toast({
        title: t('common.sendSuccess', { defaultValue: '✅ ส่งสำเร็จ' }),
        description: t('common.sentToLine'),
      });
      
      setLineSent(true);
      console.log('LINE notification sent successfully');
    } catch (err) {
      console.log('LINE notification error:', err);
      toast({
        title: t('errors.sendFailed'),
        description: t('errors.sendFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSendingLine(false);
    }
  };

  // Reset specific problem
  const resetProblem = (problemIdx: number) => {
    const newAnswers = [...answers];
    const newResults = [...results];
    
    newAnswers[problemIdx] = {
      partialProducts: problems[problemIdx].partialProducts.map(product => new Array(product.length).fill('')),
      finalAnswer: new Array(problems[problemIdx].finalAnswer.length).fill('')
    };
    
    newResults[problemIdx] = [
      ...problems[problemIdx].partialProducts.map(product => new Array(product.length).fill(null) as ('correct' | 'incorrect' | null)[]),
      new Array(problems[problemIdx].finalAnswer.length).fill(null) as ('correct' | 'incorrect' | null)[]
    ];
    
    setAnswers(newAnswers);
    setResults(newResults);
  };

  // Show all answers
  const showAnswers = () => {
    const newAnswers = [...answers];
    const newResults = [...results];
    
    problems.forEach((problem, problemIdx) => {
      // Fill partial products
      problem.partialProducts.forEach((product, rowIdx) => {
        newAnswers[problemIdx].partialProducts[rowIdx] = product.split('');
        newResults[problemIdx][rowIdx] = new Array(product.length).fill('correct');
      });
      
      // Fill final answer
      newAnswers[problemIdx].finalAnswer = problem.finalAnswer.split('');
      newResults[problemIdx][problem.partialProducts.length] = new Array(problem.finalAnswer.length).fill('correct');
    });
    
    setAnswers(newAnswers);
    setResults(newResults);
    setIsCompleted(true);
    
    toast({
      title: t('common.showAnswersTitle', { defaultValue: '📝 เฉลยคำตอบ' }),
      description: t('common.showAnswersDesc', { defaultValue: 'แสดงคำตอบที่ถูกต้องทั้งหมดแล้ว' }),
    });
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSchoolLogo(base64);
        localStorage.setItem('schoolLogo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logo removal
  const handleRemoveLogo = () => {
    setSchoolLogo(null);
    localStorage.removeItem('schoolLogo');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // Create problem card HTML for PDF
  const createProblemCard = (problem: Problem, index: number): string => {
    if (problem.dimensions[0] === 1 && problem.dimensions[1] === 1) {
      // Simple format for 1x1
      return `
        <div style="border: 2px solid #666; padding: 8px; background: white; border-radius: 6px; page-break-inside: avoid;">
          <div style="font-weight: bold; margin-bottom: 0px; font-size: 14px;">${t('common.question')} ${index + 1}</div>
          <div style="text-align: center; font-size: 20px; font-weight: bold; margin: -1px 0;">
            ${problem.multiplicand} × ${problem.multiplier} =
          </div>
          <div style="display: flex; justify-content: center; gap: 3px; margin-top: 10px;">
            ${problem.finalAnswer.split('').map(() => 
              '<div style="width: 28px; height: 28px; border: 1px solid #999; border-radius: 4px;"></div>'
            ).join('')}
          </div>
        </div>
      `;
    } else {
      // Complex format with partial products
      const maxWidth = Math.max(
        problem.multiplicand.length + problem.multiplier.length,
        problem.finalAnswer.length
      );
      
      return `
        <div style="border: 2px solid #666; padding: 8px; background: white; border-radius: 6px; page-break-inside: avoid;">
          <div style="font-weight: bold; margin-bottom: 0px; font-size: 14px;">${t('common.question')} ${index + 1}</div>
          <div style="font-family: monospace; font-size: 14px; margin-top: -6px;">
            <!-- Multiplicand -->
            <div style="display: flex; justify-content: flex-end; gap: 3px; padding: 0px 0;">
              ${problem.multiplicand.toString().split('').map(digit => 
                `<span style="width: 22px; text-align: center; font-size: 14px; font-weight: bold; display: inline-block;">${digit}</span>`
              ).join('')}
            </div>
            <!-- Multiplier -->
            <div style="display: flex; justify-content: flex-end; gap: 3px; padding: 3px 0; border-bottom: 2px solid #000; margin-bottom: 5px;">
              <span style="width: 16px; font-size: 14px; font-weight: bold; text-align: right;">×</span>
              ${problem.multiplier.toString().split('').map(digit => 
                `<span style="width: 22px; text-align: center; font-size: 14px; font-weight: bold; display: inline-block;">${digit}</span>`
              ).join('')}
            </div>
            <!-- Partial Products -->
            ${problem.partialProducts.map((product, idx) => `
              <div style="display: flex; justify-content: flex-end; gap: 3px; margin: 3px 0;">
                <span style="width: 16px; font-size: 12px;">${idx === 0 ? '+' : ''}</span>
                ${product.split('').map(() => 
                  '<div style="width: 22px; height: 22px; border: 1px solid #999; border-radius: 3px; display: inline-block;"></div>'
                ).join('')}
              </div>
            `).join('')}
            <!-- Final Line -->
            <div style="border-top: 2px solid #000; margin: 3px 0;"></div>
            <!-- Final Answer -->
            <div style="display: flex; justify-content: flex-end; gap: 3px; margin-top: 8px;">
              ${problem.finalAnswer.split('').map(() => 
                '<div style="width: 22px; height: 22px; border: 2px solid #666; border-radius: 3px; display: inline-block;"></div>'
              ).join('')}
            </div>
          </div>
        </div>
      `;
    }
  };

  // Generate page HTML
  const generatePageHTML = (startIdx: number, endIdx: number): string => {
    const pageProblems = problems.slice(startIdx, endIdx);
    
    return `
      <div style="width: 210mm; min-height: 297mm; padding: 8mm; background: white; position: relative;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #333;">
          ${schoolLogo ? `<img src="${schoolLogo}" style="height: 50px; margin-bottom: 8px;" />` : ''}
          <h1 style="margin: 8px 0; font-size: 20px;">${t('multiplication.worksheetTitle')}</h1>
          <div style="display: flex; justify-content: space-around; margin-top: 8px; font-size: 12px;">
            <div>${t('pdf.studentName')} ________________________</div>
            <div>${t('pdf.school')} ________________________</div>
          </div>
        </div>
        
        <!-- Problems Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
          ${pageProblems.map((problem, idx) => createProblemCard(problem, startIdx + idx)).join('')}
        </div>
      </div>
    `;
  };

  // Print to PDF
  const printToPDF = async () => {
    const problemsPerPage = 20;
    const totalPages = Math.ceil(problems.length / problemsPerPage);
    
    let allPagesHTML = '<div style="font-family: Arial, sans-serif;">';
    
    for (let page = 0; page < totalPages; page++) {
      const startIdx = page * problemsPerPage;
      const endIdx = Math.min(startIdx + problemsPerPage, problems.length);
      allPagesHTML += generatePageHTML(startIdx, endIdx);
      
      if (page < totalPages - 1) {
        allPagesHTML += '<div style="page-break-after: always;"></div>';
      }
    }
    
    allPagesHTML += '</div>';
    
    setPdfPreviewContent(allPagesHTML);
    setShowPdfPreview(true);
  };

  // Save PDF from preview
  const savePdfFromPreview = async () => {
    const previewElement = document.getElementById('pdf-preview-content');
    if (!previewElement) return;

    try {
      const pages = previewElement.querySelectorAll('div[style*="210mm"]') as NodeListOf<HTMLElement>;
      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }

      pdf.save('multiplication-worksheet.pdf');
      setShowPdfPreview(false);
      
      toast({
        title: t('common.saveSuccess', { defaultValue: '✅ บันทึกสำเร็จ' }),
        description: t('pdf.downloaded', { defaultValue: 'ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว' }),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('common.error', { defaultValue: '❌ เกิดข้อผิดพลาด' }),
        description: t('pdf.generationError', { defaultValue: 'ไม่สามารถสร้าง PDF ได้' }),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/profile" className="btn-secondary dark:bg-slate-700 dark:border-slate-600 dark:text-zinc-200 dark:hover:bg-slate-600">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary dark:text-zinc-100 mb-2">{t('multiplication.title')}</h1>
            <p className="text-muted-foreground dark:text-zinc-400">{t('multiplication.subtitle')}</p>
          </div>
          
          {/* <ThemeToggle /> */}
          
          {/* Timer */}
          <div className="ml-auto flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow-md dark:border dark:border-slate-700">
            <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Logo Upload Section */}
        <div className="card-glass dark:bg-slate-800/80 dark:border-slate-700 p-4 mb-6">
          <label className="block text-sm font-medium mb-3 dark:text-zinc-200">{t('pdf.uploadLogo')}</label>
          {schoolLogo ? (
            <div className="relative inline-block">
              <img 
                src={schoolLogo} 
                alt="School Logo" 
                className="h-20 w-auto object-contain border-2 border-gray-200 dark:border-slate-600 rounded-lg p-2 dark:bg-slate-700"
              />
              <button
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {t('common.selectImage', { defaultValue: 'เลือกรูปภาพ' })}
            </button>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* Controls */}
        <div className="card-glass dark:bg-slate-800/80 dark:border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Problem Count */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-zinc-200">{t('settings.problemCount')}</label>
              <div className="flex flex-wrap gap-1">
                {[10, 15, 30, 40].map(count => (
                  <button
                    key={count}
                    onClick={() => setProblemCount(count)}
                    className={`chip ${problemCount === count ? 'active' : ''}`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('common.difficulty')}</label>
              <div className="flex flex-wrap gap-1">
                {(['easy', 'medium', 'hard'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`chip ${difficulty === level ? 'active' : ''}`}
                  >
                    {t(`common.${level}`)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('common.dimensions', { defaultValue: 'มิติจำนวน' })}</label>
              <div className="flex flex-wrap gap-1">
                {[[1,1], [2,1], [3,1], [2,2], [3,2], [3,3]].map(([d1, d2]) => (
                  <button
                    key={`${d1}x${d2}`}
                    onClick={() => setDimensions([d1, d2])}
                    className={`chip ${dimensions[0] === d1 && dimensions[1] === d2 ? 'active' : ''}`}
                  >
                    {d1}×{d2}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-glass p-6 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={generateProblems} 
              className="px-6 py-4 rounded-full text-base font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
              }}
            >
              <span className="text-2xl">✨</span>
              <span className="hidden sm:inline">{t('common.aiGenerate')}</span>
              <span className="sm:hidden">{t('common.aiGenerateShort', { defaultValue: 'AI สร้าง' })}</span>
            </button>
            <button 
              onClick={checkAnswers} 
              className="px-6 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              }}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('common.checkAnswers')}</span>
            </button>
            <button 
              onClick={showAnswers} 
              className="px-6 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              }}
            >
              <PlayCircle className="w-5 h-5" />
              <span>{t('common.showAnswers')}</span>
            </button>
            <button 
              onClick={printToPDF} 
              className="px-6 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              <Printer className="w-5 h-5" />
              <span>{t('pdf.print')}</span>
            </button>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {problems.map((problem, problemIdx) => (
            <div key={problemIdx} className="card-glass p-6">
              {/* Problem Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">ข้อ {problemIdx + 1}</h3>
                <button
                  onClick={() => resetProblem(problemIdx)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              
              {/* Problem Display */}
              <div className="text-center mb-6">
                <span className="text-2xl font-bold text-blue-600">
                  {problem.multiplicand} × {problem.multiplier} = 
                </span>
                <div className="inline-block w-20 h-10 border-2 border-dashed border-gray-300 ml-2 rounded"></div>
              </div>
              
              {/* Long Multiplication Grid */}
              <div className="bg-white rounded-lg p-4 font-mono text-xl">
                {/* Calculate grid width based on maximum digits needed */}
                {(() => {
                  // Special case for 1x1 multiplication - simpler layout
                  if (problem.dimensions[0] === 1 && problem.dimensions[1] === 1) {
                    const maxWidth = Math.max(
                      problem.multiplicand.length,
                      problem.multiplier.length,
                      problem.finalAnswer.length
                    ) + 1; // +1 for operator column
                    
                    return (
                      <div className="space-y-2">
                        {/* Multiplicand Row */}
                        <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                          <div></div> {/* Operator column placeholder */}
                          {Array.from({length: maxWidth - 1 - problem.multiplicand.length}).map((_, i) => (
                            <div key={i}></div>
                          ))}
                          {problem.multiplicand.split('').map((digit, i) => (
                            <div key={i} className="text-center py-2 font-bold text-xl">
                              {digit}
                            </div>
                          ))}
                        </div>
                        
                        {/* Multiplier Row */}
                        <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                          <div className="text-center py-2 font-bold text-xl">×</div>
                          {Array.from({length: maxWidth - 1 - problem.multiplier.length}).map((_, i) => (
                            <div key={i}></div>
                          ))}
                          {problem.multiplier.split('').map((digit, i) => (
                            <div key={i} className="text-center py-2 font-bold text-xl">
                              {digit}
                            </div>
                          ))}
                        </div>
                        
                        {/* Separator Line */}
                        <div className="border-t-2 border-black my-2"></div>
                        
                        {/* Final Answer Row */}
                        {dimensions[0] === 1 && dimensions[1] === 1 ? (
                          // Special layout for 1x1 - compact answer boxes
                          <div className="flex justify-end">
                            <div className="flex gap-1">
                              {problem.finalAnswer.split('').map((digit, digitIdx) => (
                                <input
                                   key={digitIdx}
                                  type="text"
                                  maxLength={1}
                                  ref={(el) => {
                                    if (digitIdx === 0) problemInputRefs.current[problemIdx] = el;
                                  }}
                                  value={answers[problemIdx]?.finalAnswer[digitIdx] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d$/.test(value)) {
                                      const newAnswer = [...answers];
                                       if (!newAnswer[problemIdx]) {
                                         newAnswer[problemIdx] = { 
                                           partialProducts: [],
                                           finalAnswer: new Array(problem.finalAnswer.length).fill('') 
                                         };
                                       }
                                      newAnswer[problemIdx].finalAnswer[digitIdx] = value;
                                      setAnswers(newAnswer);
                                      
                                      // Auto-focus to next problem if last digit
                                      if (value && digitIdx === problem.finalAnswer.length - 1) {
                                        const nextIdx = problemIdx + 1;
                                        if (nextIdx < problems.length) {
                                          setTimeout(() => {
                                            const nextInput = problemInputRefs.current[nextIdx];
                                            if (nextInput) nextInput.focus();
                                          }, 50);
                                        }
                                      }
                                    }
                                  }}
                                  className={`w-12 h-12 text-center border-2 rounded font-mono text-xl font-bold ${
                                    results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'correct' 
                                      ? 'bg-green-100 border-green-500' 
                                      : results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'incorrect'
                                      ? 'bg-red-100 border-red-500 animate-pulse'
                                      : 'border-purple-300 focus:border-purple-500'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          // Original grid layout for other table types
                          <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                            <div></div>
                            {/* Right-align the answer boxes by adding empty spaces */}
                            {Array.from({length: maxWidth - 1 - problem.finalAnswer.length}).map((_, i) => (
                              <div key={i}></div>
                            ))}
                            {/* Separate input boxes for each digit */}
                            {problem.finalAnswer.split('').map((digit, digitIdx) => (
                              <input
                                key={digitIdx}
                                type="text"
                                maxLength={1}
                                ref={(el) => {
                                  if (digitIdx === 0) problemInputRefs.current[problemIdx] = el;
                                }}
                                value={answers[problemIdx]?.finalAnswer[digitIdx] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || /^\d$/.test(value)) {
                                    const newAnswer = [...answers];
                                     if (!newAnswer[problemIdx]) {
                                       newAnswer[problemIdx] = { 
                                         partialProducts: [],
                                         finalAnswer: new Array(problem.finalAnswer.length).fill('') 
                                       };
                                     }
                                    newAnswer[problemIdx].finalAnswer[digitIdx] = value;
                                    setAnswers(newAnswer);
                                    
                                    // Auto-focus to next problem if last digit
                                    if (value && digitIdx === problem.finalAnswer.length - 1) {
                                      const nextIdx = problemIdx + 1;
                                      if (nextIdx < problems.length) {
                                        setTimeout(() => {
                                          const nextInput = problemInputRefs.current[nextIdx];
                                          if (nextInput) nextInput.focus();
                                        }, 50);
                                      }
                                    }
                                  }
                                }}
                                className={`w-12 h-12 text-center border-2 rounded font-mono text-xl font-bold ${
                                  results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'correct' 
                                    ? 'bg-green-100 border-green-500' 
                                    : results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'incorrect'
                                    ? 'bg-red-100 border-red-500 animate-pulse'
                                    : 'border-purple-300 focus:border-purple-500'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // Original complex layout for multi-digit multiplication
                  const maxWidth = Math.max(
                    problem.multiplicand.length + problem.multiplier.length,
                    problem.finalAnswer.length
                  ) + 1; // +1 for plus sign column
                  
                  return (
                    <div className="space-y-2">
                      {/* Multiplicand Row */}
                      <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                        <div></div> {/* Plus sign column placeholder */}
                        {Array.from({length: maxWidth - 1 - problem.multiplicand.length}).map((_, i) => (
                          <div key={i}></div>
                        ))}
                        {problem.multiplicand.split('').map((digit, i) => (
                          <div key={i} className="text-center py-2 font-bold text-xl">
                            {digit}
                          </div>
                        ))}
                      </div>
                      
                      {/* Multiplier Row */}
                      <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                        <div className="text-center py-2 font-bold text-xl">×</div>
                        {Array.from({length: maxWidth - 1 - problem.multiplier.length}).map((_, i) => (
                          <div key={i}></div>
                        ))}
                        {problem.multiplier.split('').map((digit, i) => (
                          <div key={i} className="text-center py-2 font-bold text-xl">
                            {digit}
                          </div>
                        ))}
                      </div>
                      
                      {/* Separator Line */}
                      <div className="border-t-2 border-black my-2"></div>
                      
                      {/* Partial Products */}
                      {problem.partialProducts.map((product, rowIdx) => {
                        const actualProduct = product === '0' ? '0' : product;
                        // Calculate how many spaces from the right edge
                        const emptySpaces = maxWidth - 1 - actualProduct.length;
                        
                        return (
                          <div key={rowIdx} className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                            <div className="text-center py-2 font-bold text-xl">
                              {rowIdx === 0 ? '+' : ''}
                            </div>
                            {/* Empty spaces to right-align the partial product */}
                            {Array.from({length: emptySpaces}).map((_, i) => (
                              <div key={i}></div>
                            ))}
                            {/* Input fields for each digit of the partial product */}
                            {actualProduct.split('').map((digit, digitIdx) => (
                              <input
                                key={digitIdx}
                                type="text"
                                maxLength={1}
                                value={answers[problemIdx]?.partialProducts[rowIdx]?.[digitIdx] || ''}
                                onChange={(e) => updateAnswer(problemIdx, rowIdx, digitIdx, e.target.value)}
                                className={`w-12 h-12 text-center border rounded font-mono text-xl ${
                                  results[problemIdx]?.[rowIdx]?.[digitIdx] === 'correct' 
                                    ? 'bg-green-100 border-green-500' 
                                    : results[problemIdx]?.[rowIdx]?.[digitIdx] === 'incorrect'
                                    ? 'bg-red-100 border-red-500 animate-pulse'
                                    : 'border-gray-300 focus:border-blue-500'
                                }`}
                              />
                            ))}
                          </div>
                        );
                      })}
                      
                      {/* Final Separator Line */}
                      <div className="border-t-2 border-black my-2"></div>
                      
                      {/* Final Answer Row */}
                      <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${maxWidth}, 1fr)`}}>
                        <div></div>
                        {Array.from({length: maxWidth - 1 - problem.finalAnswer.length}).map((_, i) => (
                          <div key={i}></div>
                        ))}
                        {problem.finalAnswer.split('').map((digit, digitIdx) => (
                          <input
                            key={digitIdx}
                            type="text"
                            maxLength={1}
                            value={answers[problemIdx]?.finalAnswer[digitIdx] || ''}
                            onChange={(e) => updateAnswer(problemIdx, problem.partialProducts.length, digitIdx, e.target.value)}
                            className={`w-12 h-12 text-center border-2 rounded font-mono text-xl font-bold ${
                              results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'correct' 
                                ? 'bg-green-100 border-green-500' 
                                : results[problemIdx]?.[problem.partialProducts.length]?.[digitIdx] === 'incorrect'
                                ? 'bg-red-100 border-red-500 animate-pulse'
                                : 'border-purple-300 focus:border-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center gap-4 items-center">
          <button onClick={checkAnswers} className="btn-primary">
            <CheckCircle2 className="w-5 h-5" />
            ตรวจคำตอบ
          </button>
          <button onClick={showAnswers} className="btn-secondary">
            <PlayCircle className="w-5 h-5" />
            เฉลยคำตอบ
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="w-4 h-4" />
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
        </div>

        {/* Results Modal */}
        {showResultsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4">
              <div className="text-4xl mb-4">{isCompleted ? '🎉' : '📊'}</div>
              <h2 className="text-2xl font-bold mb-4">{isCompleted ? 'ยอดเยี่ยม!' : 'ผลการตรวจ'}</h2>
              <div className="space-y-3 mb-6">
                <div className="text-5xl font-bold text-primary">
                  {problems.filter((p, idx) => answers[idx].finalAnswer.join('') === p.finalAnswer).length}/{problems.length}
                </div>
                <div className="text-lg">
                  คะแนน: {Math.round((problems.filter((p, idx) => answers[idx].finalAnswer.join('') === p.finalAnswer).length / problems.length) * 100)}%
                </div>
                <div className="text-lg">
                  เวลา: {formatTime(currentTime)}
                </div>
              </div>
              
              {/* LINE Send Button */}
              <div className="space-y-3">
                <button 
                  onClick={handleSendToLine}
                  disabled={isSendingLine || lineSent || (lineQuota && lineQuota.remaining <= 0)}
                  className={`w-full px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                    lineSent 
                      ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed'
                      : (lineQuota && lineQuota.remaining <= 0)
                      ? 'bg-red-100 text-red-600 cursor-not-allowed'
                      : isSendingLine
                      ? 'bg-green-400 text-white cursor-wait'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isSendingLine ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>กำลังส่ง...</span>
                    </>
                  ) : lineSent ? (
                    <>
                      <span>✅ ส่งแล้ว</span>
                      {lineQuota && (
                        <span className="text-xs opacity-75">
                          (เหลือ {lineQuota.remaining}/{lineQuota.total})
                        </span>
                      )}
                    </>
                  ) : (lineQuota && lineQuota.remaining <= 0) ? (
                    <span>🚫 ส่งครบ 20 ครั้งแล้ววันนี้</span>
                  ) : (
                    <>
                      <span>📤 ส่งผลให้ผู้ปกครองทาง LINE</span>
                      {lineQuota && (
                        <span className="text-xs opacity-75">
                          ({lineQuota.remaining}/{lineQuota.total})
                        </span>
                      )}
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowResultsModal(false)}
                  className="w-full px-4 py-3 rounded-xl font-medium bg-zinc-100 hover:bg-zinc-200"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Celebration Modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4 animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">ยอดเยี่ยม!</h2>
              <p className="text-gray-600 mb-4">
                คุณทำได้ครบทุกข้อใน {formatTime(currentTime)}
              </p>
              <button 
                onClick={() => setShowCelebration(false)}
                className="btn-primary"
              >
                ดำเนินการต่อ
              </button>
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPdfPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold">ตัวอย่าง PDF</h3>
                <button
                  onClick={() => setShowPdfPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div 
                  id="pdf-preview-content"
                  dangerouslySetInnerHTML={{ __html: pdfPreviewContent }}
                />
              </div>
              <div className="p-4 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowPdfPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('pdf.cancel')}
                </button>
                <button
                  onClick={savePdfFromPreview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('pdf.downloadPdf')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mission Complete Modal */}
        {missionResult && (
          <MissionCompleteModal
            open={showMissionComplete}
            onOpenChange={setShowMissionComplete}
            stars={missionResult.stars}
            correct={missionResult.correct}
            total={missionResult.total}
            timeSpent={missionResult.timeSpent}
            isPassed={missionResult.isPassed}
            onRetry={() => {
              generateProblems();
              setShowMissionComplete(false);
            }}
          />
        )}
      </main>

      <BackgroundMusic
        isPlaying={backgroundMusic.isPlaying}
        isEnabled={backgroundMusic.isEnabled}
        volume={backgroundMusic.volume}
        selectedTrackId={backgroundMusic.selectedTrackId}
        tracks={backgroundMusic.tracks}
        onToggle={backgroundMusic.toggleEnabled}
        onVolumeChange={backgroundMusic.changeVolume}
        onTrackChange={backgroundMusic.changeTrack}
      />

      <Footer />
    </div>
  );
};

export default MultiplicationApp;