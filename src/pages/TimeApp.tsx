import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowLeft, Printer, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslation } from 'react-i18next';
import { useMissionMode } from "@/hooks/useMissionMode";
import { useRecentApps } from "@/hooks/useRecentApps";
import { MissionCompleteModal } from "@/components/MissionCompleteModal";
import { type QuestionAttempt } from "@/hooks/useTrainingCalendar";

// ---------- Types ----------
type TimePeriod = 'am' | 'pm' | 'mix';
type TimeFormat = '12h' | '24h';
type TimeData = { h: number; m: number; period: 'am' | 'pm'; h24: number };

// ---------- Utilities ----------
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate 24-hour format from 12-hour format
function to24Hour(h: number, period: 'am' | 'pm'): number {
  if (period === 'am') {
    return h === 12 ? 0 : h;
  } else {
    return h === 12 ? 12 : h + 12;
  }
}

function generateRandomTimes(n = 6, timePeriod: TimePeriod = 'mix'): TimeData[] {
  const times: TimeData[] = [];
  const used = new Set();
  while (times.length < n) {
    const h = randInt(1, 12);
    const m = randInt(0, 59);
    
    // Determine period based on selection
    let period: 'am' | 'pm';
    if (timePeriod === 'mix') {
      period = Math.random() > 0.5 ? 'am' : 'pm';
    } else {
      period = timePeriod;
    }
    
    const h24 = to24Hour(h, period);
    const key = `${h}:${m}:${period}`;
    if (!used.has(key)) {
      used.add(key);
      times.push({ h, m, period, h24 });
    }
  }
  return times;
}

const pad2 = (n) => String(n).padStart(2, "0");

function normalizeHour12(val) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return NaN;
  if (n === 0) return 12; // treat 0 as 12
  if (n < 0) return NaN;
  // Allow 1..12 only
  return ((n - 1) % 12) + 1; // 12->12, 13->1, etc., but UI limits to 1..12
}

function normalizeHour24(val) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return NaN;
  if (n < 0 || n > 23) return NaN;
  return n;
}

// ---------- Clock (SVG) ----------
function Clock({ hour, minute }) {
  const size = 180;
  const r = 80;
  const cx = size / 2;
  const cy = size / 2;

  const minuteAngle = minute * 6; // 360/60
  const hourAngle = (hour % 12) * 30 + minute * 0.5; // 360/12 + minute offset

  const hand = (angle, length, width) => {
    const rad = (Math.PI / 180) * (angle - 90);
    const x = cx + length * Math.cos(rad);
    const y = cy + length * Math.sin(rad);
    return (
      <line x1={cx} y1={cy} x2={x} y2={y} strokeWidth={width} stroke="currentColor" strokeLinecap="round" />
    );
  };

  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const ang = (Math.PI / 30) * i; // 2π/60 * i
    const isHourTick = i % 5 === 0;
    const r1 = r - (isHourTick ? 8 : 4);
    const x1 = cx + r1 * Math.cos(ang - Math.PI / 2);
    const y1 = cy + r1 * Math.sin(ang - Math.PI / 2);
    const x2 = cx + r * Math.cos(ang - Math.PI / 2);
    const y2 = cy + r * Math.sin(ang - Math.PI / 2);
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeOpacity={isHourTick ? 0.8 : 0.35}
        strokeWidth={isHourTick ? 2 : 1}
      />
    );
  }

  const numbers = [];
  for (let n = 1; n <= 12; n++) {
    const ang = (Math.PI / 6) * n; // 2π/12 * n
    const rnum = r - 22;
    const x = cx + rnum * Math.cos(ang - Math.PI / 2);
    const y = cy + rnum * Math.sin(ang - Math.PI / 2) + 4; // slight vertical adjust
    numbers.push(
      <text key={n} x={x} y={y} textAnchor="middle" className="text-[12px] select-none">
        {n}
      </text>
    );
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto text-zinc-700">
      <circle cx={cx} cy={cy} r={r + 6} fill="white" stroke="currentColor" strokeWidth="2.5" />
      {ticks}
      {numbers}
      {/* hands */}
      <g>
        {hand(hourAngle, r * 0.55, 4.5)}
        {hand(minuteAngle, r * 0.8, 3)}
        <circle cx={cx} cy={cy} r={3.5} fill="currentColor" />
      </g>
    </svg>
  );
}

// ---------- Period Badge ----------
function PeriodBadge({ period, timeFormat }: { period: 'am' | 'pm'; timeFormat: TimeFormat }) {
  if (period === 'am') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
        ☀️ กลางวัน {timeFormat === '12h' ? '(AM)' : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
      🌙 กลางคืน {timeFormat === '12h' ? '(PM)' : ''}
    </span>
  );
}

// ---------- One Card ----------
function Card({ idx, time, answer, setAnswer, result, showAnswer, onReset, timeFormat }: {
  idx: number;
  time: TimeData;
  answer: { h: string; m: string };
  setAnswer: (idx: number, val: { h: string; m: string }) => void;
  result: string;
  showAnswer: boolean;
  onReset: (idx: number) => void;
  timeFormat: TimeFormat;
}) {
  const { t } = useTranslation('exercises');
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // autofocus first empty field
    if (!answer.h && hourRef.current) hourRef.current.focus();
  }, []);

  const status = useMemo(() => {
    if (showAnswer) return "showing";
    return result; // 'pending' | 'correct' | 'wrong'
  }, [showAnswer, result]);

  const border =
    status === "correct"
      ? "border-green-400"
      : status === "wrong"
      ? "border-red-300"
      : "border-zinc-200";

  // Format answer display based on time format
  const getAnswerDisplay = () => {
    if (timeFormat === '24h') {
      return `${pad2(time.h24)}:${pad2(time.m)} น.`;
    }
    return `${time.h}:${pad2(time.m)} (${time.period === 'am' ? 'AM' : 'PM'})`;
  };

  return (
    <div className={`rounded-2xl border ${border} bg-white shadow-sm p-4 flex flex-col items-center gap-3`}> 
      {/* Period Badge above clock */}
      <div className="text-center">
        <PeriodBadge period={time.period} timeFormat={timeFormat} />
      </div>
      
      <div className="w-full max-w-[220px]">
        <Clock hour={time.h} minute={time.m} />
      </div>

      <div className="text-center text-sm text-zinc-500">{t('time.clock')} {idx + 1}</div>

      <div className="flex items-center gap-1 text-2xl">
        <input
          ref={hourRef}
          inputMode="numeric"
          maxLength={2}
          className="w-16 text-center border rounded-xl py-2 px-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder={timeFormat === '24h' ? '0-23' : t('time.hour')}
          value={answer.h}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            const v2 = v.slice(0, 2);
            setAnswer(idx, { ...answer, h: v2 });
            if (v2.length === 2 && minuteRef.current) minuteRef.current.focus();
          }}
        />
        <span className="px-1">:</span>
        <input
          ref={minuteRef}
          inputMode="numeric"
          maxLength={2}
          className="w-16 text-center border rounded-xl py-2 px-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder={t('time.minute')}
          value={answer.m}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setAnswer(idx, { ...answer, m: v.slice(0, 2) });
          }}
        />
      </div>

      <div className="h-6 text-sm">
        {status === "correct" && <span className="text-green-600">✅ {t('common.correct')}</span>}
        {status === "wrong" && <span className="text-red-500">❌ {t('common.tryAgain')}</span>}
        {status === "showing" && (
          <span className="text-sky-700">{t('time.answer')}: {getAnswerDisplay()}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onReset(idx)}
          className="text-xs px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200"
        >
          {t('time.clearAnswer')}
        </button>
      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function TimeApp() {
  const { t } = useTranslation('exercises');
  const { trackAppUsage } = useRecentApps();
  
  useEffect(() => {
    trackAppUsage('time');
  }, []);
  
  // Mission mode integration
  const {
    isMissionMode,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  const [questionCount, setQuestionCount] = useState(10);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('mix');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [times, setTimes] = useState<TimeData[]>(() => generateRandomTimes(10, 'mix'));
  const [answers, setAnswers] = useState(() => times.map(() => ({ h: "", m: "" })));
  const [results, setResults] = useState(() => times.map(() => "pending"));
  const [showAnswers, setShowAnswers] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  
  // PDF states
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewContent, setPdfPreviewContent] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Ensure page starts at top when component mounts
  useEffect(() => {
    // Force scroll to top with multiple methods
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);

  function setAnswer(idx: number, val: { h: string; m: string }) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? val : a)));
  }

  function resetAll(count = questionCount, period = timePeriod) {
    const newTimes = generateRandomTimes(count, period);
    setTimes(newTimes);
    setAnswers(newTimes.map(() => ({ h: "", m: "" })));
    setResults(newTimes.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
  }
  
  function handleTimePeriodChange(period: TimePeriod) {
    setTimePeriod(period);
    resetAll(questionCount, period);
  }
  
  function handleTimeFormatChange(format: TimeFormat) {
    setTimeFormat(format);
    // Reset answers when format changes
    setAnswers(times.map(() => ({ h: "", m: "" })));
    setResults(times.map(() => "pending"));
    setShowAnswers(false);
  }

  function handleQuestionCountChange(newCount: number) {
    setQuestionCount(newCount);
    resetAll(newCount, timePeriod);
    // Force scroll to top with multiple methods to ensure it works
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  async function checkAnswers() {
    if (!startedAt) setStartedAt(Date.now());
    
    const newResults = times.map((t, i) => {
      const mm = parseInt(answers[i].m, 10);
      if (isNaN(mm) || mm < 0 || mm > 59) return "wrong";
      
      if (timeFormat === '24h') {
        const hh = normalizeHour24(answers[i].h);
        if (isNaN(hh)) return "wrong";
        return hh === t.h24 && mm === t.m ? "correct" : "wrong";
      } else {
        const hh = normalizeHour12(answers[i].h);
        if (isNaN(hh)) return "wrong";
        return hh === t.h && mm === t.m ? "correct" : "wrong";
      }
    });
    setResults(newResults);
    
    const correctCount = newResults.filter((r) => r === "correct").length;
    
    // Mission mode
    if (isMissionMode) {
      const timeSpent = Date.now() - (startedAt || Date.now());
      
      // Build questionAttempts for parent dashboard
      const questionAttempts: QuestionAttempt[] = times.map((t, i) => {
        const periodText = t.period === 'am' ? 'กลางวัน' : 'กลางคืน';
        const questionText = timeFormat === '24h'
          ? `นาฬิกาแสดงเวลา ${pad2(t.h24)}:${pad2(t.m)} น. (${periodText})`
          : `นาฬิกาแสดงเวลา ${t.h} นาฬิกา ${t.m} นาที (${periodText})`;
        const correctAnswer = timeFormat === '24h'
          ? `${pad2(t.h24)}:${pad2(t.m)}`
          : `${t.h}:${pad2(t.m)} (${t.period.toUpperCase()})`;
        
        return {
          index: i + 1,
          question: questionText,
          userAnswer: `${answers[i].h || '-'}:${answers[i].m || '-'}`,
          correctAnswer: correctAnswer,
          isCorrect: newResults[i] === 'correct'
        };
      });
      
      await handleCompleteMission(correctCount, times.length, timeSpent, questionAttempts);
      return;
    }

    // Regular mode
    if (newResults.every((r) => r === "correct")) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2500);
    } else {
      setCelebrate(false);
    }
  }

  function showAll() {
    setShowAnswers(true);
    setResults(times.map(() => "pending"));
  }

  function onReset(idx) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? { h: "", m: "" } : a)));
    setResults((prev) => prev.map((r, i) => (i === idx ? "pending" : r)));
  }

  // PDF Functions
  const printPDF = () => {
    const timestamp = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const problemsPerPage = 16;
    const totalPages = Math.ceil(times.length / problemsPerPage);
    
    let allPagesHTML = '';
    
    for (let page = 0; page < totalPages; page++) {
      const startIdx = page * problemsPerPage;
      const endIdx = Math.min(startIdx + problemsPerPage, times.length);
      const pageTimes = times.slice(startIdx, endIdx);
      
      const clocksHTML = pageTimes.map((time, idx) => {
        const globalIdx = startIdx + idx;
        
        // Generate SVG clock
        const size = 160;
        const r = 70;
        const cx = size / 2;
        const cy = size / 2;
        const minuteAngle = time.m * 6;
        const hourAngle = (time.h % 12) * 30 + time.m * 0.5;
        
        const hand = (angle: number, length: number, width: number) => {
          const rad = (Math.PI / 180) * (angle - 90);
          const x = cx + length * Math.cos(rad);
          const y = cy + length * Math.sin(rad);
          return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke-width="${width}" stroke="black" stroke-linecap="round" />`;
        };
        
        let ticksHTML = '';
        for (let i = 0; i < 60; i++) {
          const ang = (Math.PI / 30) * i;
          const isHourTick = i % 5 === 0;
          const r1 = r - (isHourTick ? 8 : 4);
          const x1 = cx + r1 * Math.cos(ang - Math.PI / 2);
          const y1 = cy + r1 * Math.sin(ang - Math.PI / 2);
          const x2 = cx + r * Math.cos(ang - Math.PI / 2);
          const y2 = cy + r * Math.sin(ang - Math.PI / 2);
          ticksHTML += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-opacity="${isHourTick ? 0.8 : 0.35}" stroke-width="${isHourTick ? 2 : 1}" />`;
        }
        
        let numbersHTML = '';
        for (let n = 1; n <= 12; n++) {
          const ang = (Math.PI / 6) * n;
          const rnum = r - 22;
          const x = cx + rnum * Math.cos(ang - Math.PI / 2);
          const y = cy + rnum * Math.sin(ang - Math.PI / 2) + 4;
          numbersHTML += `<text x="${x}" y="${y}" text-anchor="middle" font-size="12px" fill="black">${n}</text>`;
        }

        // Period badge styling
        const periodBadge = time.period === 'am' 
          ? `<div style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 500; margin-bottom: 4px;">☀️ กลางวัน ${timeFormat === '12h' ? '(AM)' : ''}</div>`
          : `<div style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 9999px; background: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 500; margin-bottom: 4px;">🌙 กลางคืน ${timeFormat === '12h' ? '(PM)' : ''}</div>`;

        const hourHint = timeFormat === '24h' ? '(0-23)' : '(1-12)';

        return `
          <div style="border: 2px solid #666; padding: 10px; background: white; border-radius: 8px; display: flex; flex-direction: column; align-items: center;">
            ${periodBadge}
            <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;">นาฬิกา ${globalIdx + 1}</div>
            <div style="display: flex; justify-content: flex-start; align-items: center; width: 100%; padding-left: 15px;">
              <svg viewBox="0 0 ${size} ${size}" width="140" height="140" style="display: block;">
                <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="white" stroke="black" stroke-width="2.5" />
                ${ticksHTML}
                ${numbersHTML}
                ${hand(hourAngle, r * 0.55, 4.5)}
                ${hand(minuteAngle, r * 0.8, 3)}
                <circle cx="${cx}" cy="${cy}" r="3.5" fill="black" />
              </svg>
            </div>
            <div style="margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 6px; font-size: 16px;">
              <div style="width: 45px; height: 40px; border: 2px solid #0ea5e9; border-radius: 6px; background: white; position: relative;">
                <span style="position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%); font-size: 9px; color: #666;">${hourHint}</span>
              </div>
              <span style="font-weight: bold;">:</span>
              <div style="width: 45px; height: 40px; border: 2px solid #0ea5e9; border-radius: 6px; background: white;"></div>
            </div>
          </div>
        `;
      }).join('');

      allPagesHTML += `
        <div style="page-break-after: always; padding: 30px; font-family: 'Sarabun', Arial, sans-serif; position: relative; min-height: 297mm;">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px;">
            ${schoolLogo ? `<img src="${schoolLogo}" alt="Logo" style="max-width: 80px; max-height: 80px; margin-bottom: 10px;" />` : ''}
            <h1 style="margin: 10px 0; font-size: 28px; color: #0ea5e9; font-weight: bold;">
              ⏰ ฝึกอ่านเวลา
            </h1>
            <div style="font-size: 16px; color: #666; margin-top: 8px;">
              ${times.length} ข้อ • อ่านเวลาจากนาฬิกาและเขียนเป็นตัวเลข
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

          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            ${clocksHTML}
          </div>

          <div style="position: absolute; bottom: 20px; left: 30px; right: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
            สร้างโดยแอปฝึกอ่านเวลา | ${timestamp} | หน้า ${page + 1}/${totalPages}
          </div>
        </div>
      `;
    }

    setPdfPreviewContent(allPagesHTML);
    setShowPdfPreview(true);
  };

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
      pdf.save(`แบบฝึกอ่านเวลา_${timestamp}.pdf`);
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

  // tiny confetti
  const Confetti = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-zinc-800">
      <header className="max-w-6xl mx-auto p-6 pb-2">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/profile" 
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">{t('time.title')} ⏰ – {t('time.subtitle')}</h1>
        <p className="text-zinc-600 mt-1 text-sm">
          {t('time.description')}. {t('time.example')}: <code>7:05</code>
        </p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => resetAll()}
            className="px-6 py-3 rounded-full text-base font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
            }}
          >
            <span className="text-xl">✨</span>
            <span>AI สร้างโจทย์ใหม่</span>
          </button>
          <Button onClick={printPDF} variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            พิมพ์ PDF
          </Button>
          <button
            onClick={checkAnswers}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow"
          >
            ✅ ตรวจคำตอบ (Check)
          </button>
          <button
            onClick={showAll}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow"
          >
            👀 เฉลยทั้งหมด (Show Answers)
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">{t('time.questionCount')}:</span>
            {[10, 15, 20, 30].map((count) => (
              <button
                key={count}
                onClick={() => handleQuestionCountChange(count)}
                className={`px-3 py-2 rounded-xl text-sm shadow transition-colors ${
                  questionCount === count
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          
          {/* Time Format Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">บอกเวลา:</span>
            {([
              { value: '12h' as TimeFormat, label: '🕐 12 ชั่วโมง' },
              { value: '24h' as TimeFormat, label: '🕛 24 ชั่วโมง' },
            ]).map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeFormatChange(option.value)}
                className={`px-3 py-2 rounded-xl text-sm shadow transition-colors ${
                  timeFormat === option.value
                    ? 'bg-sky-600 text-white'
                    : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Time Period Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">ช่วงเวลา:</span>
            {([
              { value: 'am' as TimePeriod, label: '☀️ กลางวัน (AM)' },
              { value: 'pm' as TimePeriod, label: '🌙 กลางคืน (PM)' },
              { value: 'mix' as TimePeriod, label: '🔀 ผสม (Mix)' },
            ]).map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimePeriodChange(option.value)}
                className={`px-3 py-2 rounded-xl text-sm shadow transition-colors ${
                  timePeriod === option.value
                    ? option.value === 'am' 
                      ? 'bg-amber-500 text-white' 
                      : option.value === 'pm' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-teal-600 text-white'
                    : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white/70 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">โลโก้โรงเรียน:</span>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload-time"
            />
            <label htmlFor="logo-upload-time">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {times.map((t, i) => (
            <Card
              key={i}
              idx={i}
              time={t}
              result={results[i]}
              showAnswer={showAnswers}
              answer={answers[i]}
              setAnswer={setAnswer}
              onReset={onReset}
              timeFormat={timeFormat}
            />
          ))}
        </div>

        {/* PDF Preview Modal */}
        {showPdfPreview && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-sky-600 to-blue-600 text-white p-6 rounded-t-2xl z-10">
                <h2 className="text-2xl font-bold mb-4">📄 ตัวอย่าง PDF ก่อนพิมพ์</h2>
                <div className="flex gap-3">
                  <Button onClick={savePdfFromPreview} size="lg" className="bg-white text-sky-600 hover:bg-sky-50 font-bold">
                    <Printer className="w-5 h-5 mr-2" />
                    💾 บันทึก PDF
                  </Button>
                  <Button onClick={() => setShowPdfPreview(false)} size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white">
                    ❌ ปิด
                  </Button>
                </div>
              </div>
              <div id="pdf-preview-content" className="bg-gray-100" dangerouslySetInnerHTML={{ __html: pdfPreviewContent }} />
            </div>
          </div>
        )}

        <section className="mt-8 max-w-3xl text-sm text-zinc-600 leading-relaxed">
          <h2 className="font-semibold text-zinc-800">เคล็ดลับการสอน (Tips for Grown‑ups)</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>บอกน้องว่า <strong>เข็มนาที</strong> (ยาว) ชี้เลขที่คูณ 5 = นาที เช่น เลข 3 คือ 15 นาที</li>
            <li><strong>เข็มชั่วโมง</strong> (สั้น) จะค่อย ๆ ขยับตามนาที—ถ้าเกินครึ่งชั่วโมง เข็มจะเลยเลขชั่วโมงไปแล้ว</li>
            <li>ให้เด็กออกเสียงเวลา เช่น "เจ็ดนาฬิกา ห้านาที" เพื่อช่วยจดจำ</li>
          </ul>
        </section>
      </main>

      {celebrate && <Confetti />}
      
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
            resetAll();
            setShowMissionComplete(false);
          }}
        />
      )}

      <footer className="max-w-6xl mx-auto p-6 text-xs text-zinc-500">
        © Interactive worksheet for kids — You can set your own times using the buttons above.
      </footer>
    </div>
  );
}