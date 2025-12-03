import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Upload, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { useMissionMode } from '@/hooks/useMissionMode';
import { MissionCompleteModal } from '@/components/MissionCompleteModal';
import type { QuestionAttempt } from '@/hooks/useTrainingCalendar';

// Types and interfaces
type DivisionType = 'integer' | 'decimal' | 'remainder';

interface Problem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  quotientDigits: string[];
  remainderDigits: string[];
  options?: { quotient: number; remainder: number }[];
}
interface Stats {
  timestamp: number;
  count: number;
  level: string;
  correct: number;
  total: number;
  timeMs: number;
  divisionType?: DivisionType;
  allowDecimals?: boolean; // Keep for backward compatibility
}
type Level = 'easy' | 'medium' | 'hard';

// Main component
const DivisionApp: React.FC = () => {
  const { t } = useTranslation('exercises');
  const navigate = useNavigate();
  
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
  
  // State management
  const [count, setCount] = useState<number>(10);
  const [level, setLevel] = useState<Level>('easy');
  const [divisionType, setDivisionType] = useState<DivisionType>('integer');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<string[][]>([]);
  const [results, setResults] = useState<'pending' | 'checked'>('pending');
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [celebrate, setCelebrate] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // LINE sending states
  const [isSendingLine, setIsSendingLine] = useState(false);
  const [lineSent, setLineSent] = useState(false);
  const [lineQuota, setLineQuota] = useState<{ remaining: number; total: number } | null>(null);
  
  // PDF states
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewContent, setPdfPreviewContent] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Mission mode integration
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();

  // Generate remainder options for multiple choice
  const generateRemainderOptions = (problem: Problem): { quotient: number; remainder: number }[] => {
    const correctQuotient = problem.quotient;
    const correctRemainder = problem.remainder;
    const options = [{ quotient: correctQuotient, remainder: correctRemainder }];
    
    // Generate 3 wrong options with safety counter
    let attempts = 0;
    const maxAttempts = 100;
    
    while (options.length < 4 && attempts < maxAttempts) {
      attempts++;
      
      let wrongQuotient = correctQuotient;
      let wrongRemainder = Math.floor(Math.random() * problem.divisor);
      
      // Vary quotient to ensure more variety
      if (Math.random() > 0.3) {
        const offset = Math.floor(Math.random() * 3) + 1; // 1-3
        wrongQuotient = correctQuotient + (Math.random() > 0.5 ? offset : -offset);
        wrongQuotient = Math.max(0, wrongQuotient); // Ensure non-negative
      }
      
      // Check uniqueness
      const isDuplicate = options.some(opt => 
        opt.quotient === wrongQuotient && opt.remainder === wrongRemainder
      );
      
      if (!isDuplicate && wrongRemainder !== correctRemainder) {
        options.push({ quotient: wrongQuotient, remainder: wrongRemainder });
      }
    }
    
    // Fallback: if we couldn't generate 4 options, fill with simple variations
    while (options.length < 4) {
      const offset = options.length;
      const fallbackQuotient = correctQuotient + (offset % 2 === 0 ? offset : -offset);
      const fallbackRemainder = (correctRemainder + offset) % problem.divisor;
      
      if (!options.some(opt => opt.quotient === fallbackQuotient && opt.remainder === fallbackRemainder)) {
        options.push({ quotient: fallbackQuotient, remainder: fallbackRemainder });
      } else {
        // Last resort: just vary quotient
        options.push({ 
          quotient: Math.max(0, correctQuotient + offset + 1), 
          remainder: fallbackRemainder 
        });
      }
    }
    
    // Shuffle
    return options.sort(() => Math.random() - 0.5);
  };

  // Generate division problems based on level
  const generateDivisionProblem = (level: Level, divType: DivisionType): Problem => {
    let divisor = 2;
    let quotient = 1;
    let dividend = 2;
    let remainder = 0;

    if (divType === 'remainder') {
      // Division with remainder mode
      if (level === 'easy') {
        divisor = Math.floor(Math.random() * 7) + 2; // 2-8
        quotient = Math.floor(Math.random() * 8) + 1; // 1-8
        remainder = Math.floor(Math.random() * (divisor - 1)) + 1; // 1 to (divisor-1)
        dividend = divisor * quotient + remainder;
      } else if (level === 'medium') {
        divisor = Math.floor(Math.random() * 9) + 2; // 2-10
        quotient = Math.floor(Math.random() * 20) + 5; // 5-24
        remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
        dividend = divisor * quotient + remainder;
      } else { // hard
        divisor = Math.floor(Math.random() * 12) + 5; // 5-16
        quotient = Math.floor(Math.random() * 50) + 10; // 10-59
        remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
        dividend = divisor * quotient + remainder;
      }
    } else if (divType === 'decimal') {
      // Exact division mode (original logic)
      if (level === 'easy') {
        // 1-2 digit dividends, single-digit divisors, single-digit quotients
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        quotient = Math.floor(Math.random() * 9) + 1; // 1-9
        dividend = divisor * quotient; // always exact
        // keep dividends reasonably small
        if (dividend > 81) dividend = divisor * Math.max(1, Math.floor(81 / divisor));
      } else if (level === 'medium') {
        // Two-digit dividend ÷ single-digit divisor -> exact
        do {
          divisor = Math.floor(Math.random() * 8) + 2; // 2-9
          quotient = Math.floor(Math.random() * 12) + 2; // 2-13
          dividend = divisor * quotient;
        } while (dividend < 10 || dividend > 99);
      } else if (level === 'hard') {
        // Three-digit dividend -> exact division; divisor can be 2-20, quotient 5-50
        do {
          divisor = Math.floor(Math.random() * 19) + 2; // 2-20
          quotient = Math.floor(Math.random() * 46) + 5; // 5-50
          dividend = divisor * quotient;
        } while (dividend < 100 || dividend > 999);
      }
    } else {
      // Decimal mode - division may not be exact
      if (level === 'easy') {
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        dividend = Math.floor(Math.random() * 81) + 10; // 10-90
      } else if (level === 'medium') {
        divisor = Math.floor(Math.random() * 8) + 2; // 2-9
        dividend = Math.floor(Math.random() * 90) + 10; // 10-99
      } else { // hard
        divisor = Math.floor(Math.random() * 19) + 2; // 2-20
        dividend = Math.floor(Math.random() * 900) + 100; // 100-999
      }
      
      // Calculate decimal result (2 decimal places)
      const decimalResult = (dividend / divisor).toFixed(2);
      quotient = parseFloat(decimalResult);
      remainder = 0; // Not used in decimal mode
    }

    // Format digits
    const quotientStr = quotient.toFixed(divType === 'decimal' ? 2 : 0);
    const quotientDigits = quotientStr.split('');
    const remainderStr = remainder.toString();
    const remainderDigits = remainderStr.split('');

    const problem: Problem = {
      dividend,
      divisor,
      quotient,
      remainder,
      quotientDigits,
      remainderDigits,
    };

    // Generate options for remainder type
    if (divType === 'remainder') {
      problem.options = generateRemainderOptions(problem);
    }

    return problem;
  };

  // Generate division problems based on settings
  const generateDivisionProblems = useCallback((count: number, level: Level, divType: DivisionType): Problem[] => {
    const generatedProblems: Problem[] = [];
    const used = new Set<string>();
    let guard = 0;
    
    while (generatedProblems.length < count && guard < 10000) {
      guard++;
      
      const problem = generateDivisionProblem(level, divType);
      
      // Create unique key to prevent duplicate problems
      const key = `${problem.dividend}÷${problem.divisor}`;
      
      // Skip if duplicate
      if (used.has(key)) continue;
      used.add(key);
      
      generatedProblems.push(problem);
    }
    
    return generatedProblems;
  }, []);

  // Initialize new problem set
  const generateNewSet = useCallback(() => {
    const newProblems = generateDivisionProblems(count, level, divisionType);
    setProblems(newProblems);
    // Simple single answer input per problem
    setAnswers(Array.from({
      length: newProblems.length
    }, () => ['']));
    setResults('pending');
    setCorrectCount(0);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
    setShowAnswers(false);
    setShowResults(false);
    setCelebrate(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [count, level, divisionType, generateDivisionProblems]);

  // Handle answer input
  const handleAnswerChange = (problemIndex: number, value: string) => {
    // Start timer on first input
    if (!startedAt && value !== '') {
      const now = Date.now();
      setStartedAt(now);
      backgroundMusic.play(); // Start background music
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - now);
      }, 100);
    }
    const newAnswers = [...answers];
    newAnswers[problemIndex] = [value];
    setAnswers(newAnswers);
    
    // Auto-focus to next problem when answer length matches expected
    if (divisionType === 'integer' || divisionType === 'decimal') {
      const expectedLength = divisionType === 'decimal' 
        ? problems[problemIndex].quotient.toFixed(2).replace('.', '').length + 1 // include decimal point
        : problems[problemIndex].quotient.toString().length;
      
      if (value.length >= expectedLength) {
        const nextIdx = problemIndex + 1;
        if (nextIdx < problems.length) {
          setTimeout(() => {
            const nextInput = document.getElementById(`answer-${nextIdx}`);
            if (nextInput) nextInput.focus();
          }, 50);
        }
      }
    }
  };

  // Handle option selection for remainder type
  const handleOptionSelect = (problemIndex: number, quotient: number, remainder: number) => {
    if (results === 'checked') return;
    
    // Start timer on first selection
    if (!startedAt) {
      const now = Date.now();
      setStartedAt(now);
      backgroundMusic.play(); // Start background music
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - now);
      }, 100);
    }
    
    const newAnswers = [...answers];
    // Store both quotient and remainder as "quotient-remainder" to ensure uniqueness
    newAnswers[problemIndex] = [`${quotient}-${remainder}`];
    setAnswers(newAnswers);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent, problemIndex: number) => {
    if (e.key === 'Enter') {
      if (problemIndex < problems.length - 1) {
        const nextInput = document.getElementById(`answer-${problemIndex + 1}`);
        nextInput?.focus();
      } else {
        checkAnswers();
      }
    }
  };

  // Check all answers
  const checkAnswers = async () => {
    backgroundMusic.stop();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const now = Date.now();
    setFinishedAt(now);
    let correct = 0;
    problems.forEach((problem, index) => {
      const userAnswer = parseFloat(answers[index][0]) || 0;
      let isCorrect = false;
      
      if (divisionType === 'remainder') {
        // Check if selected option matches correct quotient and remainder
        const selectedAnswer = answers[index][0];
        const correctAnswer = `${problem.quotient}-${problem.remainder}`;
        isCorrect = selectedAnswer === correctAnswer;
      } else if (divisionType === 'decimal') {
        isCorrect = Math.abs(userAnswer - problem.quotient) < 0.01;
      } else {
        // integer type
        isCorrect = userAnswer === problem.quotient && problem.remainder === 0;
      }
      
      if (isCorrect) {
        correct++;
      }
    });
    setCorrectCount(correct);
    setResults('checked');
    
    // If mission mode, complete mission
    if (isMissionMode) {
      const timeSpent = startedAt ? now - startedAt : elapsedMs;
      
      // Build questionAttempts array for parent dashboard
      const questionAttempts: QuestionAttempt[] = problems.map((problem, index) => {
        const userAnswer = answers[index][0] || '';
        let isCorrect = false;
        let correctAnswer = '';
        
        if (divisionType === 'remainder') {
          correctAnswer = `${problem.quotient} เศษ ${problem.remainder}`;
          const expectedAnswer = `${problem.quotient}-${problem.remainder}`;
          isCorrect = userAnswer === expectedAnswer;
        } else if (divisionType === 'decimal') {
          correctAnswer = problem.quotient.toFixed(2);
          isCorrect = Math.abs(parseFloat(userAnswer) - problem.quotient) < 0.01;
        } else {
          correctAnswer = problem.quotient.toString();
          isCorrect = parseFloat(userAnswer) === problem.quotient;
        }
        
        return {
          index: index + 1,
          question: `${problem.dividend} ÷ ${problem.divisor}`,
          userAnswer: userAnswer || '-',
          correctAnswer,
          isCorrect
        };
      });
      
      await handleCompleteMission(correct, problems.length, timeSpent, questionAttempts);
      return;
    }
    
    // Regular mode
    setShowResults(true);
    setLineSent(false); // Reset sent status when checking new answers

    // Save to stats
    const newStat: Stats = {
      timestamp: now,
      count: problems.length,
      level,
      correct,
      total: problems.length,
      timeMs: elapsedMs,
      divisionType
    };
    const updatedStats = [newStat, ...stats].slice(0, 10);
    setStats(updatedStats);
    localStorage.setItem('divisionStats', JSON.stringify(updatedStats));
    
    if (correct === problems.length) {
      setCelebrate(true);
    }
  };

  const handleSendToLine = async () => {
    if (isSendingLine || lineSent) return;
    
    setIsSendingLine(true);
    
    try {
      const authStored = localStorage.getItem('kidfast_auth');
      if (!authStored) {
        alert(`${t('errors.lineNotConnected')}\n${t('errors.connectLineFromProfile')}`);
        setIsSendingLine(false);
        return;
      }

      const authState = JSON.parse(authStored);
      const userId = authState.registrationId;
      const userNickname = localStorage.getItem('user_nickname') || authState.username || t('common.student', { defaultValue: 'นักเรียน' });

      if (!userId) {
        alert(`${t('errors.userNotFound')}\n${t('errors.pleaseLogin')}`);
        setIsSendingLine(false);
        return;
      }

      const timeMs = (finishedAt || Date.now()) - (startedAt || (finishedAt || Date.now()));
      const minutes = Math.floor(timeMs / 60000);
      const seconds = Math.floor((timeMs % 60000) / 1000);
      const timeSpent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const problemsData = problems.map((problem, i) => {
        const userAnswer = answers[i][0] || t('multiplication.noAnswer');
        const correctAnswer = problem.quotient.toString();
        const isCorrect = parseFloat(userAnswer) === problem.quotient;
        
        return {
          questionNumber: i + 1,
          question: `${problem.dividend}÷${problem.divisor}`,
          userAnswer,
          correctAnswer,
          isCorrect
        };
      });

      const levelMap: Record<string, string> = {
        easy: t('common.easy'),
        medium: t('common.medium'),
        hard: t('common.hard')
      };

      const percentage = Math.round((correctCount / problems.length) * 100);

      const { data, error } = await supabase.functions.invoke('send-line-message', {
        body: {
          userId,
          exerciseType: 'division',
          nickname: userNickname,
          score: correctCount,
          total: problems.length,
          percentage,
          timeSpent,
          level: levelMap[level] || level,
          problems: problemsData
        }
      });

      if (error) {
        console.error('LINE Error:', error);
        
        if (data?.error === 'quota_exceeded') {
          alert(data.message || t('errors.quotaExceededDesc', { defaultValue: 'คุณส่งข้อความครบ 20 ครั้งแล้ววันนี้' }));
          setLineQuota({ remaining: 0, total: 20 });
        } else {
          alert(`${t('errors.sendFailed')} ${t('errors.sendFailedDesc')}`);
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

      alert(t('common.sentToLine'));
      setLineSent(true);
      console.log('LINE notification sent successfully');
    } catch (err) {
      console.log('LINE notification error:', err);
      alert(`${t('errors.sendFailed')} ${t('errors.sendFailedDesc')}`);
    } finally {
      setIsSendingLine(false);
    }
  };

  // Show all answers
  const showAllAnswers = () => {
    const newAnswers = problems.map(problem => [problem.quotient.toString()]);
    setAnswers(newAnswers);
    setShowAnswers(true);
  };

  // Print PDF function - Updated to use modal preview
  const printPDF = useCallback(() => {
    const timestamp = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const levelMap: Record<string, string> = {
      easy: t('common.easy'),
      medium: t('common.medium'),
      hard: t('common.hard')
    };

    const problemsPerPage = 20;
    const totalPages = Math.ceil(problems.length / problemsPerPage);
    
    let allPagesHTML = '';
    
    for (let page = 0; page < totalPages; page++) {
      const startIdx = page * problemsPerPage;
      const endIdx = Math.min(startIdx + problemsPerPage, problems.length);
      const pageProblems = problems.slice(startIdx, endIdx);
      
      const problemsHTML = pageProblems.map((problem, idx) => {
        const globalIdx = startIdx + idx;
        return `
          <div style="border: 2px solid #666; padding: 12px; background: white; border-radius: 8px; text-align: center;">
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${t('common.question')} ${globalIdx + 1}</div>
            <div style="font-size: 22px; font-weight: bold; margin: 10px 0; color: #0066cc;">
              ${problem.dividend?.toLocaleString() || '0'} ÷ ${problem.divisor?.toLocaleString() || '0'} =
            </div>
            <div style="display: flex; justify-content: center; gap: 4px; margin-top: 14px;">
              ${Array.from({ length: divisionType === 'decimal' ? 5 : Math.max(2, problem.quotient.toString().length + 1) }).map(() => 
                `<div style="width: ${divisionType === 'decimal' ? '32px' : '36px'}; height: 42px; border: 2px solid #0066cc; border-radius: 6px; background: white;"></div>`
              ).join('')}
            </div>
          </div>
        `;
      }).join('');

      allPagesHTML += `
        <div style="page-break-after: always; padding: 30px; font-family: 'Sarabun', Arial, sans-serif; position: relative; min-height: 297mm;">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #0066cc; padding-bottom: 20px;">
            ${schoolLogo ? `<img src="${schoolLogo}" alt="Logo" style="max-width: 80px; max-height: 80px; margin-bottom: 10px;" />` : ''}
            <h1 style="margin: 10px 0; font-size: 28px; color: #0066cc; font-weight: bold;">
              ${t('division.worksheetTitle')}
            </h1>
            <div style="font-size: 16px; color: #666; margin-top: 8px;">
              ${problems.length} ${t('division.problems')} • ${t('division.level')}: ${levelMap[level] || level} • ${t('division.resultType')}: ${divisionType === 'decimal' ? t('division.decimal') : divisionType === 'remainder' ? t('division.withRemainder') : t('division.integer')}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold;">${t('pdf.studentName')}</span>
              <div style="flex: 1; border-bottom: 2px dotted #999; height: 30px;"></div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold;">${t('pdf.class')}</span>
              <div style="flex: 1; border-bottom: 2px dotted #999; height: 30px;"></div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold;">${t('pdf.school')}</span>
              <div style="flex: 1; border-bottom: 2px dotted #999; height: 30px;"></div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold;">${t('pdf.date')}</span>
              <div style="flex: 1; border-bottom: 2px dotted #999; height: 30px;"></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
            ${problemsHTML}
          </div>

          <div style="position: absolute; bottom: 20px; left: 30px; right: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
            ${t('pdf.footer', { appName: t('division.appName'), date: timestamp, page: page + 1, total: totalPages })}
          </div>
        </div>
      `;
    }

    setPdfPreviewContent(allPagesHTML);
    setShowPdfPreview(true);
  }, [problems, level, schoolLogo]);

  const savePdfFromPreview = async () => {
    const previewElement = document.getElementById('pdf-preview-content');
    if (!previewElement) return;

    try {
      const pages = previewElement.querySelectorAll('[style*="page-break-after"]');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) pdf.addPage();
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      const timestamp = new Date().toLocaleDateString('th-TH');
      pdf.save(`แบบฝึกการหาร_${timestamp}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSchoolLogo('');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // Get card background color based on index
  const getCardBackground = (index: number): string => {
    const colors = ['card-yellow', 'card-blue', 'card-green', 'card-purple', 'card-pink', 'card-orange'];
    return colors[index % colors.length];
  };

  // Format time display
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('divisionStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    generateNewSet();
  }, [generateNewSet]);

  // Update timer display
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  return <div className="min-h-screen bg-white dark:bg-slate-900 p-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-4 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-zinc-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToProfile', { defaultValue: 'กลับหน้าหลัก' })}
          </Button>
          {/* <ThemeToggle /> */}
        </div>

        {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground dark:text-zinc-100 mb-2">{t('division.title')}</h1>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={printPDF} className="text-sm flex items-center gap-2 dark:bg-slate-800 dark:border-slate-600 dark:text-zinc-200" disabled={problems.length === 0}>
                <Printer className="w-4 h-4" />
                {t('pdf.print')}
              </Button>
            <div className="text-lg font-mono bg-card dark:bg-slate-800 dark:border dark:border-slate-700 dark:text-zinc-200 rounded-lg px-4 py-2 shadow-sm">
              {t('results.timeUsed')}: {formatTime(elapsedMs)}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowStats(true)} className="text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-zinc-200">
              {t('results.viewResults')}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card dark:bg-slate-800 dark:border dark:border-slate-700 rounded-2xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Question count */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-zinc-200">{t('settings.problemCount')}:</label>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map(num => <Button key={num} variant={count === num ? "default" : "outline"} size="sm" onClick={() => setCount(num)} className={`flex-1 ${count === num ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 dark:text-zinc-200'}`}>
                    {num}
                  </Button>)}
              </div>
            </div>

            {/* Difficulty level */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-zinc-200">{t('common.difficulty')}:</label>
              <div className="flex gap-2">
                {[{
                key: 'easy',
                label: t('common.easy')
              }, {
                key: 'medium',
                label: t('common.medium')
              }, {
                key: 'hard',
                label: t('common.hard')
              }].map(lvl => <Button key={lvl.key} variant={level === lvl.key ? "secondary" : "outline"} size="sm" onClick={() => setLevel(lvl.key as Level)} className={`flex-1 ${level === lvl.key ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 dark:text-zinc-200'}`}>
                    {lvl.label}
                  </Button>)}
              </div>
            </div>

            {/* Decimal Option */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-zinc-200">{t('division.resultType')}:</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={divisionType === 'integer' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDivisionType('integer')}
                  className={`${divisionType === 'integer' ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 dark:text-zinc-200'}`}
                >
                  {t('division.integer')}
                </Button>
                <Button
                  variant={divisionType === 'decimal' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDivisionType('decimal')}
                  className={`${divisionType === 'decimal' ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 dark:text-zinc-200'}`}
                >
                  {t('division.decimal')}
                </Button>
                <Button
                  variant={divisionType === 'remainder' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDivisionType('remainder')}
                  className={`${divisionType === 'remainder' ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 dark:text-zinc-200'}`}
                >
                  {t('division.withRemainder')}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {/* Actions */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-zinc-200">{t('common.actions', { defaultValue: 'การดำเนินการ' })}:</label>
              <div className="space-y-2">
                <button 
                  onClick={generateNewSet} 
                  className="w-full px-6 py-3.5 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2.5"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
                  }}
                >
                  <span className="text-2xl">✨</span>
                  <span>{t('common.aiGenerate')}</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={checkAnswers} variant="secondary" size="sm" disabled={!startedAt} className="bg-green-600 hover:bg-green-700 text-white">
                    {t('common.checkAnswers')}
                  </Button>
                  <Button onClick={showAllAnswers} variant="secondary" size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    {t('common.showAnswers')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{t('pdf.schoolLogo', { defaultValue: 'โลโก้โรงเรียน' })}:</span>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload-division"
              />
              <label htmlFor="logo-upload-division">
                <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('pdf.uploadLogo')}
                  </span>
                </Button>
              </label>
              {schoolLogo && (
                <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                  <X className="w-4 h-4 mr-1" />
                  {t('pdf.removeLogo')}
                </Button>
              )}
            </div>
            {schoolLogo && (
              <img src={schoolLogo} alt="Logo" className="h-12 w-12 object-contain border rounded p-1" />
            )}
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {problems.map((problem, problemIndex) => <div key={problemIndex} className="bg-card rounded-xl p-6 shadow-lg border-2 border-border">
              {/* Problem in single line format like the image */}
              <div className="flex items-center gap-4 text-xl">
                {/* Problem number in circle - moved to leftmost */}
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                  {problemIndex + 1}
                </div>
                
                {/* Division equation */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-medium text-foreground">
                    {problem.dividend?.toLocaleString() || "0"}
                  </span>
                  <span className="text-2xl font-medium text-foreground">÷</span>
                  <span className="text-2xl font-medium text-foreground">
                    {problem.divisor?.toLocaleString() || "0"}
                  </span>
                  <span className="text-2xl font-medium text-foreground">=</span>
                </div>
              </div>
              
              {/* Answer input/options - placed below the equation */}
              {divisionType === 'remainder' ? (
                // Multiple choice for remainder type
                <div className="mt-4 space-y-2">
                  {problem.options?.map((option, optIdx) => {
                    const isSelected = answers[problemIndex]?.[0] === `${option.quotient}-${option.remainder}`;
                    const isCorrect = option.quotient === problem.quotient && option.remainder === problem.remainder;
                    const showFeedback = results === 'checked';
                    
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(problemIndex, option.quotient, option.remainder)}
                        disabled={results === 'checked'}
                        className={`w-full p-4 text-xl rounded-lg border-2 transition-all font-bold ${
                          showFeedback
                            ? isCorrect
                              ? 'bg-green-100 border-green-500 text-green-900'
                              : isSelected
                              ? 'bg-red-100 border-red-500 text-red-900'
                              : 'bg-background border-muted text-muted-foreground'
                            : isSelected
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-background border-primary/30 hover:border-primary hover:bg-accent'
                        }`}
                      >
                        {option.quotient} เศษ {option.remainder}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Text input for integer and decimal types
                <div className="flex justify-center mt-4">
                  <input 
                    id={`answer-${problemIndex}`} 
                    type="text" 
                    inputMode="decimal"
                    value={answers[problemIndex]?.[0] || ""} 
                    onChange={e => handleAnswerChange(problemIndex, e.target.value)} 
                    onKeyDown={e => handleKeyDown(e, problemIndex)} 
                    disabled={showAnswers} 
                    placeholder={divisionType === 'decimal' ? "0.00" : ""} 
                    className={`${divisionType === 'decimal' ? 'w-24' : 'w-20'} h-12 text-center text-xl font-bold border-2 rounded-lg 
                      ${results === "checked" ? 
                        (divisionType === 'decimal' ? 
                          Math.abs(parseFloat(answers[problemIndex]?.[0]) - problem.quotient) < 0.01 : 
                          parseInt(answers[problemIndex]?.[0]) === problem.quotient && problem.remainder === 0
                        ) ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50" 
                        : "border-input bg-background focus:border-ring focus:ring-2 focus:ring-ring/30"} 
                      transition-all duration-200 focus:outline-none`} 
                  />
                </div>
              )}
            </div>)}
        </div>

        {/* Bottom check button */}
        <div className="text-center">
          <Button onClick={checkAnswers} size="lg" disabled={!startedAt} className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white">
            {t('common.checkAnswers')}
          </Button>
        </div>

        {/* Timer display bottom */}
        <div className="text-center mt-4">
          <div className="text-lg font-mono bg-card rounded-lg px-4 py-2 shadow-sm inline-block">
            {t('results.timeUsed')}: {formatTime(elapsedMs)}
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {celebrate ? `🎉 ${t('results.excellent')}! 🎉` : t('results.summary')}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary">
              {correctCount}/{problems.length}
            </div>
            <div className="text-lg">
              {t('results.score')}: {Math.round(correctCount / problems.length * 100)}%
            </div>
            <div className="text-lg">
              {t('results.timeUsed')}: {formatTime(elapsedMs)}
            </div>
            {celebrate && <div className="text-lg text-green-600 font-medium">
                {t('results.allCorrect')} 🌟
              </div>}
            
            {/* LINE Send Button */}
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
                  <span>{t('common.sending')}</span>
                </>
              ) : lineSent ? (
                <>
                  <span>{t('common.sent')}</span>
                  {lineQuota && (
                    <span className="text-xs opacity-75">
                      ({t('common.remaining')} {lineQuota.remaining}/{lineQuota.total})
                    </span>
                  )}
                </>
              ) : (lineQuota && lineQuota.remaining <= 0) ? (
                <span>{t('common.quotaExceeded')}</span>
              ) : (
                <>
                  <span>{t('common.sendToLine')}</span>
                  {lineQuota && (
                    <span className="text-xs opacity-75">
                      ({lineQuota.remaining}/{lineQuota.total})
                    </span>
                  )}
                </>
              )}
            </button>
            
            <Button onClick={() => setShowResults(false)} className="w-full">
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Modal */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('results.pastStats')} (10 {t('common.recent', { defaultValue: 'ครั้งล่าสุด' })})</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {stats.length === 0 ? <p className="text-center text-muted-foreground py-8">{t('results.noStats')}</p> : <div className="space-y-2">
                {stats.map((stat, index) => <div key={index} className="bg-muted rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{stat.correct}/{stat.total}</span>
                        <span className="text-muted-foreground ml-2">
                          ({Math.round(stat.correct / stat.total * 100)}%)
                        </span>
                      </div>
                       <div className="text-right">
                         <div>{formatTime(stat.timeMs)}</div>
                          <div className="text-xs text-muted-foreground">
                            {stat.count}{t('division.problems')} {stat.level} {stat.divisionType === 'decimal' ? `(${t('division.decimal')})` : stat.divisionType === 'remainder' ? `(${t('division.withRemainder')})` : stat.allowDecimals ? `(${t('division.decimal')})` : ''}
                          </div>
                       </div>
                    </div>
                   </div>)}
              </div>}
          </div>
          <Button onClick={() => setShowStats(false)} className="w-full">
            {t('common.close')}
          </Button>
        </DialogContent>
      </Dialog>
      
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
            generateNewSet();
            setShowMissionComplete(false);
          }}
        />
      )}
      
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
    </div>;
};
export default DivisionApp;