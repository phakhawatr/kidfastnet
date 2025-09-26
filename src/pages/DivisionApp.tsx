import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
}
type Level = 'easy' | 'medium' | 'hard';

// Main component
const DivisionApp: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [count, setCount] = useState<number>(10);
  const [level, setLevel] = useState<Level>('easy');
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

  // Generate division problems based on level (all exact divisions, no remainder)
  const generateDivisionProblem = (level: Level): Problem => {
    let divisor = 2;
    let quotient = 1;
    let dividend = 2;
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
    const remainder = 0; // ensure exact division for all levels

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
  const generateDivisionProblems = useCallback((count: number, level: Level): Problem[] => {
    const generatedProblems: Problem[] = [];
    for (let i = 0; i < count; i++) {
      generatedProblems.push(generateDivisionProblem(level));
    }
    return generatedProblems;
  }, []);

  // Initialize new problem set
  const generateNewSet = useCallback(() => {
    const newProblems = generateDivisionProblems(count, level);
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
  }, [count, level, generateDivisionProblems]);

  // Handle answer input
  const handleAnswerChange = (problemIndex: number, value: string) => {
    // Start timer on first input
    if (!startedAt && value !== '') {
      const now = Date.now();
      setStartedAt(now);
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const now = Date.now();
    setFinishedAt(now);
    let correct = 0;
    problems.forEach((problem, index) => {
      const userAnswer = parseInt(answers[index][0]) || 0;
      if (userAnswer === problem.quotient && problem.remainder === 0) {
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
      timeMs: elapsedMs
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

  // Print PDF function
  const printPDF = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>แบบฝึกหัดการคูณ</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Sarabun', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .info {
            font-size: 14px;
            color: #666;
          }
          .problems-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 20px;
          }
          .problem {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
            background: #fafafa;
            page-break-inside: avoid;
            text-align: center;
          }
          .problem-header {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 16px;
            color: #333;
          }
          .problem-number {
            width: 25px;
            height: 25px;
            background: #007bff;
            color: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 8px;
          }
          .division-equation {
            font-size: 18px;
            margin: 10px 0;
            color: #007bff;
            font-weight: 500;
          }
          .answer-boxes {
            display: flex;
            justify-content: center;
            gap: 5px;
            margin-top: 15px;
          }
          .answer-box {
            width: 35px;
            height: 35px;
            border: 2px solid #333;
            background: white;
            border-radius: 4px;
          }
          @media print {
            .problems-grid {
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
            }
            .problem {
              padding: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">แบบฝึกหัดการหาร</div>
          <div class="info">
            จำนวนข้อ: ${count} ข้อ | ระดับ: ${level}
          </div>
          <div class="info">
            ชื่อ: __________________ วันที่: __________
          </div>
        </div>
        
        <div class="problems-grid">
          ${problems.map((problem, index) => `
            <div class="problem">
              <div class="problem-header">
                <span class="problem-number">${index + 1}</span>ข้อ ${index + 1}
              </div>
              <div class="division-equation">
                ${problem.dividend?.toLocaleString() || '0'} ÷ ${problem.divisor?.toLocaleString() || '0'} =
              </div>
              <div class="answer-boxes">
                ${Array.from({
      length: Math.max(2, problem.quotient.toString().length)
    }, () => '<div class="answer-box"></div>').join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="footer">
          สร้างจากเว็บฝึกการหาร | พิมพ์เมื่อ: ${new Date().toLocaleDateString('th-TH')}
        </div>
        
        <div class="no-print" style="position: fixed; top: 10px; right: 10px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">พิมพ์</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">ปิด</button>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
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
            <Button variant="outline" size="sm" onClick={printPDF} className="text-sm" disabled={problems.length === 0}>
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

            {/* Actions */}
            <div>
              <label className="block text-sm font-medium mb-2">การดำเนินการ:</label>
              <div className="space-y-2">
                <Button onClick={generateNewSet} variant="default" size="sm" className="w-full bg-teal-200 hover:bg-teal-100">
                  สุ่มชุดใหม่
                </Button>
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
                <input id={`answer-${problemIndex}`} type="number" min={0} step={1} value={answers[problemIndex]?.[0] || ""} onChange={e => handleAnswerChange(problemIndex, e.target.value)} onKeyDown={e => handleKeyDown(e, problemIndex)} disabled={showAnswers} placeholder="" className={`w-20 h-12 text-center text-xl font-bold border-2 rounded-lg 
                    ${results === "checked" ? parseInt(answers[problemIndex]?.[0]) === problem.quotient && problem.remainder === 0 ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50" : "border-input bg-background focus:border-ring focus:ring-2 focus:ring-ring/30"} 
                    transition-all duration-200 focus:outline-none`} />
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
                           {stat.count}ข้อ {stat.level}
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
    </div>;
};
export default DivisionApp;