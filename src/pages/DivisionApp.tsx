import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Upload, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import { BackgroundMusic } from '../components/BackgroundMusic';

// Types and interfaces
interface Problem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  quotientDigits: string[];
  remainderDigits: string[];
}
interface Stats {
  timestamp: number;
  count: number;
  level: string;
  correct: number;
  total: number;
  timeMs: number;
  allowDecimals?: boolean;
}
type Level = 'easy' | 'medium' | 'hard';

// Main component
const DivisionApp: React.FC = () => {
  // Background music with 3 track options
  const backgroundMusic = useBackgroundMusic([
    { 
      id: 'happy', 
      name: 'เพลงสนุกสนาน', 
      url: 'https://freesound.org/data/previews/320/320655_5260872-lq.mp3'
    },
    { 
      id: 'calm', 
      name: 'เพลงผ่อนคลาย', 
      url: 'https://freesound.org/data/previews/442/442816_5121236-lq.mp3'
    },
    { 
      id: 'focus', 
      name: 'เพลงเน้นสมาธิ', 
      url: 'https://freesound.org/data/previews/415/415564_6387345-lq.mp3'
    }
  ]);
  
  const navigate = useNavigate();
  
  // State management
  const [count, setCount] = useState<number>(10);
  const [level, setLevel] = useState<Level>('easy');
  const [allowDecimals, setAllowDecimals] = useState<boolean>(false);
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
  
  // PDF states
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewContent, setPdfPreviewContent] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Generate division problems based on level
  const generateDivisionProblem = (level: Level, allowDecimals: boolean): Problem => {
    let divisor = 2;
    let quotient = 1;
    let dividend = 2;
    let remainder = 0;

    if (!allowDecimals) {
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

    return {
      dividend,
      divisor,
      quotient,
      remainder,
      quotientDigits: quotient.toString().split(''),
      remainderDigits: []
    };
  };

  // Generate division problems based on settings
  const generateDivisionProblems = useCallback((count: number, level: Level, allowDecimals: boolean): Problem[] => {
    const generatedProblems: Problem[] = [];
    for (let i = 0; i < count; i++) {
      generatedProblems.push(generateDivisionProblem(level, allowDecimals));
    }
    return generatedProblems;
  }, []);

  // Initialize new problem set
  const generateNewSet = useCallback(() => {
    const newProblems = generateDivisionProblems(count, level, allowDecimals);
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
  }, [count, level, allowDecimals, generateDivisionProblems]);

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
  const checkAnswers = () => {
    backgroundMusic.stop(); // Stop background music
    
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
      
      if (allowDecimals) {
        // Allow small margin of error for decimal answers (±0.01)
        isCorrect = Math.abs(userAnswer - problem.quotient) < 0.01;
      } else {
        isCorrect = userAnswer === problem.quotient && problem.remainder === 0;
      }
      
      if (isCorrect) {
        correct++;
      }
    });
    setCorrectCount(correct);
    setResults('checked');
    setShowResults(true);

    // Save to stats
    const newStat: Stats = {
      timestamp: now,
      count: problems.length,
      level,
      correct,
      total: problems.length,
      timeMs: elapsedMs,
      allowDecimals
    };
    const updatedStats = [newStat, ...stats].slice(0, 10);
    setStats(updatedStats);
    localStorage.setItem('divisionStats', JSON.stringify(updatedStats));
    if (correct === problems.length) {
      setCelebrate(true);
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
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">ข้อ ${globalIdx + 1}</div>
            <div style="font-size: 22px; font-weight: bold; margin: 10px 0; color: #0066cc;">
              ${problem.dividend?.toLocaleString() || '0'} ÷ ${problem.divisor?.toLocaleString() || '0'} =
            </div>
            <div style="display: flex; justify-content: center; gap: 4px; margin-top: 14px;">
              ${Array.from({ length: allowDecimals ? 5 : Math.max(2, problem.quotient.toString().length + 1) }).map(() => 
                `<div style="width: ${allowDecimals ? '32px' : '36px'}; height: 42px; border: 2px solid #0066cc; border-radius: 6px; background: white;"></div>`
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
              ✏️ แบบฝึกหัดการหาร
            </h1>
            <div style="font-size: 16px; color: #666; margin-top: 8px;">
              ${problems.length} ข้อ • ระดับ: ${level === 'easy' ? 'ง่าย' : level === 'medium' ? 'ปานกลาง' : 'ยาก'} • ผลลัพธ์: ${allowDecimals ? 'ทศนิยม' : 'จำนวนเต็ม'}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold;">ชื่อ-สกุล:</span>
              <div style="flex: 1; border-bottom: 2px dotted #999; height: 30px;"></div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold;">ชั้น:</span>
              <div style="flex: 1; border-bottom: 2px dotted #999; height: 30px;"></div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold;">โรงเรียน:</span>
              <div style="flex: 1; border-bottom: 2px dotted #999; height: 30px;"></div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold;">วันที่:</span>
              <div style="flex: 1; border-bottom: 2px dotted #999; height: 30px;"></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
            ${problemsHTML}
          </div>

          <div style="position: absolute; bottom: 20px; left: 30px; right: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
            สร้างโดยแอปฝึกการหาร | ${timestamp} | หน้า ${page + 1}/${totalPages}
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
  return <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับหน้าหลัก
          </Button>
        </div>

        {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">เทคนิคการหารระดับโปร</h1>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={printPDF} className="text-sm flex items-center gap-2" disabled={problems.length === 0}>
                <Printer className="w-4 h-4" />
                พิมพ์ PDF
              </Button>
            <div className="text-lg font-mono bg-card rounded-lg px-4 py-2 shadow-sm">
              เวลา: {formatTime(elapsedMs)}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowStats(true)} className="text-sm">
              ดูผล
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-2xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Question count */}
            <div>
              <label className="block text-sm font-medium mb-2">จำนวนข้อ:</label>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map(num => <Button key={num} variant={count === num ? "default" : "outline"} size="sm" onClick={() => setCount(num)} className={`flex-1 ${count === num ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {num}
                  </Button>)}
              </div>
            </div>

            {/* Difficulty level */}
            <div>
              <label className="block text-sm font-medium mb-2">ระดับ:</label>
              <div className="flex gap-2">
                {[{
                key: 'easy',
                label: 'ง่าย'
              }, {
                key: 'medium',
                label: 'ปานกลาง'
              }, {
                key: 'hard',
                label: 'ยาก'
              }].map(lvl => <Button key={lvl.key} variant={level === lvl.key ? "secondary" : "outline"} size="sm" onClick={() => setLevel(lvl.key as Level)} className={`flex-1 ${level === lvl.key ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    {lvl.label}
                  </Button>)}
              </div>
            </div>

            {/* Decimal Option */}
            <div>
              <label className="block text-sm font-medium mb-2">ผลลัพธ์เป็นทศนิยม:</label>
              <div className="flex gap-2">
                <Button
                  variant={!allowDecimals ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAllowDecimals(false)}
                  className={`flex-1 ${!allowDecimals ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  ไม่มี
                </Button>
                <Button
                  variant={allowDecimals ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAllowDecimals(true)}
                  className={`flex-1 ${allowDecimals ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  มี
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {/* Actions */}
            <div>
              <label className="block text-sm font-medium mb-2">การดำเนินการ:</label>
              <div className="space-y-2">
                <button 
                  onClick={generateNewSet} 
                  className="w-full px-6 py-3.5 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2.5"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
                  }}
                >
                  <span className="text-2xl">✨</span>
                  <span>AI สร้างโจทย์ใหม่</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={checkAnswers} variant="secondary" size="sm" disabled={!startedAt} className="bg-green-600 hover:bg-green-700 text-white">
                    ตรวจ
                  </Button>
                  <Button onClick={showAllAnswers} variant="secondary" size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    เฉลย
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="bg-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">โลโก้โรงเรียน:</span>
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
                    อัพโหลด
                  </span>
                </Button>
              </label>
              {schoolLogo && (
                <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                  <X className="w-4 h-4 mr-1" />
                  ลบ
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
              
              {/* Answer input box - placed below the equation */}
              <div className="flex justify-center mt-4">
                <input 
                  id={`answer-${problemIndex}`} 
                  type="text" 
                  inputMode="decimal"
                  value={answers[problemIndex]?.[0] || ""} 
                  onChange={e => handleAnswerChange(problemIndex, e.target.value)} 
                  onKeyDown={e => handleKeyDown(e, problemIndex)} 
                  disabled={showAnswers} 
                  placeholder={allowDecimals ? "0.00" : ""} 
                  className={`${allowDecimals ? 'w-24' : 'w-20'} h-12 text-center text-xl font-bold border-2 rounded-lg 
                    ${results === "checked" ? 
                      (allowDecimals ? 
                        Math.abs(parseFloat(answers[problemIndex]?.[0]) - problem.quotient) < 0.01 : 
                        parseInt(answers[problemIndex]?.[0]) === problem.quotient && problem.remainder === 0
                      ) ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50" 
                      : "border-input bg-background focus:border-ring focus:ring-2 focus:ring-ring/30"} 
                    transition-all duration-200 focus:outline-none`} 
                />
              </div>
            </div>)}
        </div>

        {/* Bottom check button */}
        <div className="text-center">
          <Button onClick={checkAnswers} size="lg" disabled={!startedAt} className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white">
            ตรวจคำตอบ
          </Button>
        </div>

        {/* Timer display bottom */}
        <div className="text-center mt-4">
          <div className="text-lg font-mono bg-card rounded-lg px-4 py-2 shadow-sm inline-block">
            เวลา: {formatTime(elapsedMs)}
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {celebrate ? '🎉 ยอดเยี่ยม! 🎉' : 'ผลการตรวจ'}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary">
              {correctCount}/{problems.length}
            </div>
            <div className="text-lg">
              คะแนน: {Math.round(correctCount / problems.length * 100)}%
            </div>
            <div className="text-lg">
              เวลา: {formatTime(elapsedMs)}
            </div>
            {celebrate && <div className="text-lg text-green-600 font-medium">
                ทำได้ถูกต้องทุกข้อ! 🌟
              </div>}
            <Button onClick={() => setShowResults(false)} className="w-full">
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Modal */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>สถิติการทำแบบฝึกหัด (10 ครั้งล่าสุด)</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {stats.length === 0 ? <p className="text-center text-muted-foreground py-8">ยังไม่มีสถิติ</p> : <div className="space-y-2">
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
                           {stat.count}ข้อ {stat.level} {stat.allowDecimals ? '(ทศนิยม)' : ''}
                         </div>
                       </div>
                    </div>
                   </div>)}
              </div>}
          </div>
          <Button onClick={() => setShowStats(false)} className="w-full">
            ปิด
          </Button>
        </DialogContent>
      </Dialog>
      
      <BackgroundMusic
        isPlaying={backgroundMusic.isPlaying}
        isEnabled={backgroundMusic.isEnabled}
        volume={backgroundMusic.volume}
        selectedTrackId={backgroundMusic.selectedTrackId}
        tracks={backgroundMusic.tracks}
        isUnlocked={backgroundMusic.isUnlocked}
        onToggle={backgroundMusic.toggleEnabled}
        onVolumeChange={backgroundMusic.changeVolume}
        onTrackChange={backgroundMusic.changeTrack}
      />
    </div>;
};
export default DivisionApp;