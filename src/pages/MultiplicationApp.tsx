import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, RotateCcw, CheckCircle2, Timer, PlayCircle, RefreshCw, Printer, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import { BackgroundMusic } from '../components/BackgroundMusic';

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
  // Background music with 3 track options - beautiful instrumental music
  const backgroundMusic = useBackgroundMusic([
    { 
      id: 'happy', 
      name: 'เพลงสนุกสนาน', 
      url: 'https://cdn.pixabay.com/download/audio/2021/02/16/audio_24e50c19e6.mp3'
    },
    { 
      id: 'calm', 
      name: 'เพลงผ่อนคลาย', 
      url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_d1718ab41b.mp3'
    },
    { 
      id: 'focus', 
      name: 'เพลงเน้นสมาธิ', 
      url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c48f87a7d7.mp3'
    }
  ]);
  
  const { toast } = useToast();
  const [problemCount, setProblemCount] = useState(15);
  const [difficulty, setDifficulty] = useState('ง่าย');
  const [dimensions, setDimensions] = useState<[number, number]>([1, 1]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [results, setResults] = useState<('correct' | 'incorrect' | null)[][][]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // PDF and Logo states
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewContent, setPdfPreviewContent] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);

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
    const ranges = {
      'ง่าย': [0, 6],
      'ปานกลาง': [0, 8],
      'ยาก': [1, 9]
    };
    
    const [min, max] = ranges[difficulty as keyof typeof ranges];
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
  const checkAnswers = () => {
    if (!problems.length) return;
    
    backgroundMusic.stop(); // Stop background music when checking
    
    let allCorrect = true;
    const newResults = [...results];
    
    problems.forEach((problem, problemIdx) => {
      // Check partial products
      problem.partialProducts.forEach((correctProduct, rowIdx) => {
        const userAnswer = answers[problemIdx].partialProducts[rowIdx].join('');
        const isCorrect = userAnswer === correctProduct;
        
        for (let digitIdx = 0; digitIdx < correctProduct.length; digitIdx++) {
          if (newResults[problemIdx][rowIdx]) {
            newResults[problemIdx][rowIdx][digitIdx] = isCorrect ? 'correct' : 'incorrect';
          }
        }
        
        if (!isCorrect) allCorrect = false;
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
      
      if (!isCorrect) allCorrect = false;
    });
    
    setResults(newResults);
    
    if (allCorrect) {
      setIsCompleted(true);
      setShowCelebration(true);
      toast({
        title: "🎉 ยอดเยี่ยม!",
        description: "คุณทำได้ครบทุกข้อแล้ว!",
      });
      
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      toast({
        title: "ลองอีกครั้ง",
        description: "ยังมีคำตอบที่ไม่ถูกต้องอยู่",
        variant: "destructive",
      });
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
      title: "📝 เฉลยคำตอบ",
      description: "แสดงคำตอบที่ถูกต้องทั้งหมดแล้ว",
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
          <div style="font-weight: bold; margin-bottom: 0px; font-size: 14px;">ข้อ ${index + 1}</div>
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
          <div style="font-weight: bold; margin-bottom: 0px; font-size: 14px;">ข้อ ${index + 1}</div>
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
          <h1 style="margin: 8px 0; font-size: 20px;">แบบฝึกหัดการคูณ</h1>
          <div style="display: flex; justify-content: space-around; margin-top: 8px; font-size: 12px;">
            <div>ชื่อ-สกุล: ________________________</div>
            <div>โรงเรียน: ________________________</div>
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
        title: "✅ บันทึกสำเร็จ",
        description: "ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้าง PDF ได้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/profile" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">การคูณแนวตั้ง</h1>
            <p className="text-muted-foreground">ฝึกการคูณแบบยาวตามหลักคณิตศาสตร์</p>
          </div>
          
          {/* Timer */}
          <div className="ml-auto flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-md">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="font-mono text-lg font-semibold text-blue-600">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Logo Upload Section */}
        <div className="card-glass p-4 mb-6">
          <label className="block text-sm font-medium mb-3">อัพโหลดโลโก้โรงเรียน</label>
          {schoolLogo ? (
            <div className="relative inline-block">
              <img 
                src={schoolLogo} 
                alt="School Logo" 
                className="h-20 w-auto object-contain border-2 border-gray-200 rounded-lg p-2"
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
              เลือกรูปภาพ
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
        <div className="card-glass p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Problem Count */}
            <div>
              <label className="block text-sm font-medium mb-2">จำนวนข้อ</label>
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
              <label className="block text-sm font-medium mb-2">ระดับ</label>
              <div className="flex flex-wrap gap-1">
                {['ง่าย', 'ปานกลาง', 'ยาก'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`chip ${difficulty === level ? 'active' : ''}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium mb-2">มิติจำนวน</label>
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
              <span className="hidden sm:inline">AI สร้างโจทย์ใหม่</span>
              <span className="sm:hidden">AI สร้าง</span>
            </button>
            <button 
              onClick={checkAnswers} 
              className="px-6 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              }}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>ตรวจคำตอบ</span>
            </button>
            <button 
              onClick={showAnswers} 
              className="px-6 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              }}
            >
              <PlayCircle className="w-5 h-5" />
              <span>เฉลยคำตอบ</span>
            </button>
            <button 
              onClick={printToPDF} 
              className="px-6 py-4 rounded-full text-base font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              <Printer className="w-5 h-5" />
              <span>พิมพ์ PDF</span>
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
                  ปิด
                </button>
                <button
                  onClick={savePdfFromPreview}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  บันทึก PDF
                </button>
              </div>
            </div>
          </div>
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