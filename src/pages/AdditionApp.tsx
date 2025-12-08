import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowLeft, Printer, Upload, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTranslation } from 'react-i18next';
import { useBackgroundMusic } from "../hooks/useBackgroundMusic";
import { BackgroundMusic } from "../components/BackgroundMusic";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { type QuestionAttempt } from '@/hooks/useTrainingCalendar';
import { useRecentApps } from "@/hooks/useRecentApps";
import { MissionCompleteModal } from "@/components/MissionCompleteModal";
import { toast } from "sonner";
import { useMissionMode } from '@/hooks/useMissionMode';

// ================= Utilities =================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function countCarries(a, b) {
  // count column-wise carries in addition (base 10), up to hundreds
  let carry = 0;
  let c = 0;
  for (let i = 0; i < 3; i++) {
    const da = a % 10;
    const db = b % 10;
    if (da + db + c >= 10) {
      carry++;
      c = 1;
    } else {
      c = 0;
    }
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return carry;
}

function rangeForDigits(d) {
  const map = { 1: [1, 9], 2: [10, 99], 3: [100, 999] };
  const pair = map[d] || map[2];
  return { min: pair[0], max: pair[1] };
}

function countCarriesMultiple(numbers) {
  if (numbers.length === 2) return countCarries(numbers[0], numbers[1]);
  if (numbers.length === 3) {
    // For 3 numbers, count carries step by step
    const temp = numbers[0] + numbers[1];
    return countCarries(temp, numbers[2]);
  }
  return 0;
}

function hasUnitsCarry(numbers) {
  // Check if there's a carry from the units place
  const unitsSum = numbers.reduce((sum, num) => sum + (num % 10), 0);
  return unitsSum >= 10;
}

function pickByDifficulty(level, digits, carryOption = "any", operands = 2) {
  const { min, max } = rangeForDigits(digits);
  
  const numbers = [];
  for (let i = 0; i < operands; i++) {
    numbers.push(randInt(min, max));
  }
  
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  if (sum > 1000) return null;

  const carries = countCarriesMultiple(numbers);
  const unitsCarry = hasUnitsCarry(numbers);
  
  // Check carry requirements
  if (carryOption === "none" && carries > 0) return null;
  if (carryOption === "has" && (carries === 0 || !unitsCarry)) return null;
  
  // Check difficulty requirements
  if (level === "easy" && carryOption === "any" && carries > 0) return null;
  if (level === "medium" && carryOption === "any" && carries < 1) return null;
  if (level === "hard") {
    if (carryOption === "any" && carries < 1) return null;
    if (max * operands >= 700 && sum < 700) return null;
  }
  
  return operands === 2 ? { a: numbers[0], b: numbers[1] } : { a: numbers[0], b: numbers[1], c: numbers[2] };
}

function generateAdditionProblems(n = 15, level = "easy", digits = 2, carryOption = "any", operands = 2) {
  const probs = [];
  const used = new Set();
  let guard = 0;
  while (probs.length < n && guard < 20000) {
    guard++;
    const result = pickByDifficulty(level, digits, carryOption, operands);
    if (!result) continue;
    
    let key;
    if (operands === 2) {
      const { a, b } = result;
      const x = Math.min(a, b);
      const y = Math.max(a, b);
      key = x + "+" + y;
      if (used.has(key)) continue;
      used.add(key);
      probs.push({ a, b });
    } else {
      const { a, b, c } = result;
      const nums = [a, b, c].sort((x, y) => x - y);
      key = nums.join("+");
      if (used.has(key)) continue;
      used.add(key);
      probs.push({ a, b, c });
    }
  }
  
  // Fallback: relax to easy constraints with same digits if needed
  const { min, max } = rangeForDigits(digits);
  while (probs.length < n) {
    const numbers = [];
    for (let i = 0; i < operands; i++) {
      numbers.push(randInt(min, max));
    }
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    if (sum > 1000) continue;
    
    let key;
    if (operands === 2) {
      const [a, b] = numbers;
      const x = Math.min(a, b);
      const y = Math.max(a, b);
      key = x + "+" + y;
      if (used.has(key)) continue;
      used.add(key);
      probs.push({ a, b });
    } else {
      const nums = numbers.sort((x, y) => x - y);
      key = nums.join("+");
      if (used.has(key)) continue;
      used.add(key);
      probs.push({ a: numbers[0], b: numbers[1], c: numbers[2] });
    }
  }
  return probs;
}

function formatMS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

// Extra helpers for stars & praise
function calcStars(correct, total) {
  const pct = Math.round((correct / Math.max(1, total)) * 100);
  if (pct === 100) return 3;
  if (pct >= 90) return 2;
  if (pct >= 80) return 1;
  return 0;
}
function praiseText(pct, t) {
  if (pct === 100) return t('praise.perfect');
  if (pct >= 90) return t('praise.excellent');
  if (pct >= 80) return t('praise.good');
  if (pct >= 60) return t('praise.okay');
  return t('praise.tryMore');
}

// convert per-digit answer array to number - now accepts flexible digits
function answerToNumber(ansArr) {
  if (!Array.isArray(ansArr)) return NaN;
  // Filter out empty strings and use actual filled digits
  const cleanArr = ansArr.filter(d => d !== "");
  if (cleanArr.length === 0) return NaN;
  return parseInt(cleanArr.join(""), 10);
}

// Helper function to get actual digits needed for each problem
function getActualDigits(problem, operands) {
  const correctAnswer = operands === 3 ? problem.a + problem.b + problem.c : problem.a + problem.b;
  return String(correctAnswer).length;
}

// Helper function to create answers array with correct number of digits for each problem
function createAnswersArray(problems, operands) {
  return problems.map(prob => {
    const actualDigits = getActualDigits(prob, operands);
    return Array(actualDigits).fill("");
  });
}

// ================= One Problem Card =================
function ProblemCard({ idx, prob, answer, setAnswer, result, showAnswer, onReset, onFirstType, digits, operands, onFocusNextProblem, firstInputRef }) {
  const { t } = useTranslation('exercises');
  const inputRef = useRef(null);
  const inputRefs = useRef([]);
  
  // Calculate correct answer and determine actual digits needed
  const correctAnswer = operands === 3 ? prob.a + prob.b + prob.c : prob.a + prob.b;
  const actualDigits = String(correctAnswer).length;
  
  const [carry, setCarry] = useState(() => Array(actualDigits).fill(""));

  const status = useMemo(() => (showAnswer ? "showing" : result), [showAnswer, result]);
  const border =
    status === "correct" ? "border-green-400" : status === "wrong" ? "border-red-300" : "border-zinc-200";

  const correct = correctAnswer;

  // pastel background per card for kid-friendly feel
  const pastel = ["bg-yellow-50","bg-sky-50","bg-pink-50","bg-green-50","bg-purple-50"];
  const bg = pastel[idx % pastel.length];

  return (
    <div className={`rounded-3xl border-2 ${border} ${bg} dark:bg-slate-800 shadow-md p-5 flex flex-col gap-3`}>
      <div className="text-base text-zinc-600 dark:text-zinc-300">⭐ {t('common.question')} {idx + 1}</div>

      {/* Column format like worksheet image + per-digit answer */}
      <div className="flex justify-center mt-1 select-none">
        <div>
          {/* Carry row (ตัวทด) */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `repeat(${actualDigits + 1}, 3rem)` }}>
            <div className="w-12 h-9" />
            {Array.from({ length: actualDigits }).map((_, j) => (
              <input
                key={`car${j}`}
                inputMode="numeric"
                maxLength={1}
                disabled={showAnswer}
                className={`w-12 h-9 text-center border rounded-md text-xl bg-white dark:bg-slate-700 dark:text-zinc-200 dark:border-slate-600 ${showAnswer ? 'opacity-60 border-zinc-200' : 'border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-500'}`}
                value={carry[j] || ""}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0,1);
                  setCarry((prev) => prev.map((d, k) => (k === j ? v : d)));
                }}
              />
            ))}
          </div>
          {/* Grid for numbers with left + column */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${actualDigits + 1}, 3rem)` }}>
            {/* Row 1: empty plus cell + digits of a */}
            <div className="w-12 h-12" />
            {String(prob.a).padStart(actualDigits, " ").split("").map((ch, i) => (
              <div key={`a${i}`} className="w-12 h-12 border border-sky-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md flex items-center justify-center text-3xl font-extrabold dark:text-zinc-200">{ch.trim()}</div>
            ))}
            {/* Row 2: plus sign + digits of b */}
            <div className="w-12 h-12 border border-sky-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md flex items-center justify-center text-3xl font-extrabold text-zinc-500 dark:text-zinc-400">+</div>
            {String(prob.b).padStart(actualDigits, " ").split("").map((ch, i) => (
              <div key={`b${i}`} className="w-12 h-12 border border-sky-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md flex items-center justify-center text-3xl font-extrabold dark:text-zinc-200">{ch.trim()}</div>
            ))}
            {/* Row 3: plus sign + digits of c (if 3 operands) */}
            {operands === 3 && (
              <>
                <div className="w-12 h-12 border border-sky-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md flex items-center justify-center text-3xl font-extrabold text-zinc-500 dark:text-zinc-400">+</div>
                {String(prob.c).padStart(actualDigits, " ").split("").map((ch, i) => (
                  <div key={`c${i}`} className="w-12 h-12 border border-sky-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md flex items-center justify-center text-3xl font-extrabold dark:text-zinc-200">{ch.trim()}</div>
                ))}
              </>
            )}
          </div>
          {/* underline */}
          <div className="ml-12 border-t-4 border-zinc-400 dark:border-zinc-600 mt-2" />
          {/* Answer row: answer cells (inputs or revealed) */}
          <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${actualDigits + 1}, 3rem)` }}>
            <div className="w-12 h-12" />
            {showAnswer
              ? String(correct).padStart(actualDigits, " ").slice(-actualDigits).split("").map((ch, j) => (
                  <div key={`ans${j}`} className="w-12 h-12 border-2 border-sky-300 dark:border-sky-600 bg-white dark:bg-slate-700 rounded-md flex items-center justify-center text-3xl font-extrabold text-sky-700 dark:text-sky-400">
                    {ch.trim()}
                  </div>
                ))
              : Array.from({ length: actualDigits }).map((_, j) => (
                  <input
                    key={`in${j}`}
                    ref={(el) => { 
                      if (j === 0) {
                        inputRef.current = el;
                        if (firstInputRef) firstInputRef(el);
                      }
                      inputRefs.current[j] = el;
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center border-2 border-sky-300 dark:border-sky-600 rounded-md text-3xl font-extrabold text-sky-700 dark:text-sky-400 bg-white dark:bg-slate-700 shadow focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600"
                    value={Array.isArray(answer) ? (answer[j] || "") : ""}
                    onFocus={() => {
                      // Start music immediately when user focuses on any input field
                      // This ensures music plays after user interaction
                      if (onFirstType) {
                        // Small delay to ensure audio context is ready
                        setTimeout(() => onFirstType(), 50);
                      }
                    }}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                      setAnswer(idx, j, v);
                      if (v) {
                        if (j < actualDigits - 1) {
                          const nxt = inputRefs.current[j + 1];
                          if (nxt) nxt.focus();
                        } else if (onFocusNextProblem) {
                          onFocusNextProblem();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      const curr = (Array.isArray(answer) ? (answer[j] || "") : "");
                      if (e.key === 'Backspace' && !curr) {
                        if (j > 0) {
                          const prev = inputRefs.current[j - 1];
                          if (prev) prev.focus();
                        }
                      }
                      if (e.key === 'ArrowLeft' && j > 0) {
                        const prev = inputRefs.current[j - 1];
                        if (prev) prev.focus();
                      }
                      if (e.key === 'ArrowRight' && j < actualDigits - 1) {
                        const nxt = inputRefs.current[j + 1];
                        if (nxt) nxt.focus();
                      }
                    }}
                  />
                ))}
          </div>
        </div>
      </div>

      <div className="h-6 text-sm text-center">
        {status === "correct" && <span className="text-green-600 dark:text-green-400">✅ {t('common.correct')}</span>}
        {status === "wrong" && <span className="text-red-500 dark:text-red-400">❌ {t('common.tryAgain')}</span>}
        {status === "showing" && <span className="text-sky-700 dark:text-sky-400">{t('common.answer')}: {correct}</span>}
      </div>

      <div className="flex justify-end">
        <button onClick={() => onReset(idx)} className="text-sm px-4 py-2 rounded-full bg-white dark:bg-slate-700 border dark:border-slate-600 hover:bg-zinc-50 dark:hover:bg-slate-600 dark:text-zinc-200">
          {t('common.resetAnswer')}
        </button>
      </div>
    </div>
  );
}

// ================= Main App =================
export default function AdditionApp() {
  const { t } = useTranslation('exercises');
  const [searchParams] = useSearchParams();
  const { trackAppUsage } = useRecentApps();
  
  // Mission mode integration
  const {
    isMissionMode,
    missionId,
    showMissionComplete,
    setShowMissionComplete,
    missionResult,
    handleCompleteMission
  } = useMissionMode();
  
  // Track app usage on mount
  useEffect(() => {
    trackAppUsage('addition');
  }, []);
  
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
  
  const [count, setCount] = useState(15);
  const [level, setLevel] = useState("easy"); // easy | medium | hard
  const [digits, setDigits] = useState(2);
  const [carryOption, setCarryOption] = useState("none"); // "has" | "none" | "any"
  const [operands, setOperands] = useState(2); // 2 | 3
  const [problems, setProblems] = useState(() => generateAdditionProblems(15, "easy", 2, "none", 2));
  const [answers, setAnswers] = useState(() => createAnswersArray(problems, 2));
  const [results, setResults] = useState(() => problems.map(() => "pending")); // pending | correct | wrong
  const [showAnswers, setShowAnswers] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // summary modal states
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  
  // mission complete modal states (removed, using useMissionMode now)
  
  // LINE sending states
  const [isSendingLine, setIsSendingLine] = useState(false);
  const [lineSent, setLineSent] = useState(false);
  const [lineQuota, setLineQuota] = useState(null);
  
  // timer states
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // history of sessions
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("add1000_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // PDF Preview state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewContent, setPdfPreviewContent] = useState('');
  
  // School Logo state
  const [schoolLogo, setSchoolLogo] = useState('');
  const logoInputRef = useRef(null);
  
  // Problem input refs for auto-focus between problems
  const problemInputRefs = useRef([]);

  useEffect(() => {
    try {
      localStorage.setItem("add1000_history", JSON.stringify(history));
    } catch {}
  }, [history]);

  // Load school logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('addition-school-logo');
    if (savedLogo) {
      setSchoolLogo(savedLogo);
    }
  }, []);

  // migrate answers to per-digit arrays on first load
  useEffect(() => {
    setAnswers((prev) => prev.map((a) => (Array.isArray(a) ? a : Array(digits).fill(""))));
  }, []);

  // Force start-at-top and disable automatic scroll restoration
  useEffect(() => {
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch {}
    try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch {}
  }, []);

  // Auto-start from mission params
  useEffect(() => {
    const autoStart = searchParams.get('autoStart');
    const paramLevel = searchParams.get('level');
    const paramCount = searchParams.get('count');
    
    if (autoStart === 'true') {
      const newLevel = paramLevel || 'easy';
      const newCount = paramCount ? parseInt(paramCount) : 15;
      
      // Set level and count
      setLevel(newLevel);
      setCount(newCount);
      
      // Determine carry option based on level
      const newCarryOption = newLevel === 'easy' ? 'none' : 'any';
      setCarryOption(newCarryOption);
      
      // Generate problems with new settings
      const next = generateAdditionProblems(newCount, newLevel, digits, newCarryOption, operands);
      setProblems(next);
      setAnswers(createAnswersArray(next, operands));
      setResults(next.map(() => "pending"));
      setShowAnswers(false);
      setCelebrate(false);
      
      // Start timer immediately
      setStartedAt(Date.now());
      setElapsedMs(0);
      backgroundMusic.play();
    }
  }, []); // Run once on mount

  // keep answers shape in sync with problems - use actual digits needed per problem
  useEffect(() => {
    setAnswers((prev) => {
      if (!Array.isArray(prev) || prev.length !== problems.length) {
        return createAnswersArray(problems, operands);
      }
      return prev.map((a, i) => {
        const actualDigits = getActualDigits(problems[i], operands);
        if (Array.isArray(a) && a.length === actualDigits) return a;
        return Array(actualDigits).fill("");
      });
    });
  }, [problems, operands]);

  // detail modal state for viewing previous results
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  function openHistory(i) {
    const item = history[i];
    setDetailItem(item || null);
    setDetailOpen(!!item);
  }

  // live timer tick (every second while running)
  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, finishedAt]);

  function setAnswer(pIdx, dIdx, val) {
    const digit = (val || "").replace(/\D/g, "").slice(0, 1);
    setAnswers((prev) =>
      prev.map((arr, i) =>
        i === pIdx
          ? (Array.isArray(arr) ? arr.map((d, j) => (j === dIdx ? digit : d)) : [])
          : arr
      )
    );
  }

  function startTimerIfNeeded() {
    if (!startedAt) {
      const now = Date.now();
      setStartedAt(now);
      setElapsedMs(0);
      backgroundMusic.play(); // Start background music
    }
  }

  function finalizeAndLog(endTs = Date.now()) {
    const duration = startedAt ? endTs - startedAt : 0;
    const correct = problems.reduce((acc, p, i) => {
      const ans = answerToNumber(answers[i]);
      const correctAnswer = operands === 3 ? p.a + p.b + p.c : p.a + p.b;
      return acc + (ans === correctAnswer ? 1 : 0);
    }, 0);
    const entry = {
      ts: endTs,
      level,
      count,
      durationMs: Math.max(0, duration),
      correct,
      stars: calcStars(correct, count),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 10)); // keep last 10
  }

  // Manual save with full snapshot of problems & answers
  function saveStats() {
    const end = finishedAt || Date.now();
    const duration = startedAt ? end - startedAt : 0;
  const snapshot = problems.map((p, i) => {
      const correct = operands === 3 ? p.a + p.b + p.c : p.a + p.b;
      return {
        a: p.a,
        b: p.b,
        c: p.c,
        answer: (answers[i] || []).join(""),
        correct
      };
    });
    const correct2 = snapshot.reduce((t, s, i) => t + ((answerToNumber(answers[i]) === s.correct) ? 1 : 0), 0);
    const entry2 = { ts: end, level, digits, count, durationMs: Math.max(0, duration), correct: correct2, stars: calcStars(correct2, count), snapshot };
    setHistory((prev) => [entry2, ...prev].slice(0, 10));
  }

  function applyNewCount(n) {
    if (startedAt && !showAnswers) finalizeAndLog(Date.now());

    setCount(n);
    const next = generateAdditionProblems(n, level, digits, carryOption, operands);
    setProblems(next);
    setAnswers(createAnswersArray(next, operands));

    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
    
    // Enhanced scroll-to-top - immediate scroll to ensure page is always at top
    try { 
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); 
      // Force immediate scroll, then smooth for better UX
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }, 10);
    } catch {}
  }

  function applyLevel(lv) {
    if (startedAt && !showAnswers) finalizeAndLog(Date.now());

    setLevel(lv);
    const next = generateAdditionProblems(count, lv, digits, carryOption, operands);
    setProblems(next);
    setAnswers(createAnswersArray(next, operands));

    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  }

  function applyDigits(d) {
    if (startedAt && !showAnswers) finalizeAndLog(Date.now());

    setDigits(d);
    const next = generateAdditionProblems(count, level, d, carryOption, operands);
    setProblems(next);
    setAnswers(createAnswersArray(next, operands));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  }

  function applyCarryOption(option) {
    if (startedAt && !showAnswers) finalizeAndLog(Date.now());

    setCarryOption(option);
    const next = generateAdditionProblems(count, level, digits, option, operands);
    setProblems(next);
    setAnswers(createAnswersArray(next, operands));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  }

  function applyOperands(newOperandCount) {
    if (startedAt && !showAnswers) finalizeAndLog(Date.now());

    setOperands(newOperandCount);
    const next = generateAdditionProblems(count, level, digits, carryOption, newOperandCount);
    setProblems(next);
    setAnswers(createAnswersArray(next, newOperandCount));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  }

  function resetAll() {
    if (startedAt && !showAnswers) finalizeAndLog(Date.now());

    const next = generateAdditionProblems(count, level, digits, carryOption, operands);
    setProblems(next);
    setAnswers(createAnswersArray(next, operands));

    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  }

  function checkAnswers() {
    const next = problems.map((p, i) => {
      const ans = answerToNumber(answers[i]);
      const correct = operands === 3 ? p.a + p.b + p.c : p.a + p.b;
      return ans === correct ? "correct" : "wrong";
    });
    setResults(next);

    const correctCount = next.filter((r) => r === "correct").length;
    const now = Date.now();
    if (startedAt) setElapsedMs(now - startedAt);
    
    // Save history immediately after checking answers
    const duration = startedAt ? now - startedAt : elapsedMs;
    const snapshot = problems.map((p, i) => {
      const correct = operands === 3 ? p.a + p.b + p.c : p.a + p.b;
      return {
        a: p.a,
        b: p.b,
        c: p.c,
        answer: (answers[i] || []).join(""),
        correct
      };
    });
    const entry = { 
      ts: now, 
      level, 
      digits, 
      count, 
      durationMs: Math.max(0, duration), 
      correct: correctCount, 
      stars: calcStars(correctCount, count), 
      snapshot 
    };
    setHistory((prev) => [entry, ...prev].slice(0, 10));
    
    // Build question attempts for mission tracking
    const questionAttempts: QuestionAttempt[] = problems.map((p, i) => {
      const correct = operands === 3 ? p.a + p.b + p.c : p.a + p.b;
      const userAnswer = answerToNumber(answers[i]);
      const question = operands === 3 
        ? `${p.a} + ${p.b} + ${p.c}` 
        : `${p.a} + ${p.b}`;
      
      return {
        index: i + 1,
        question: question,
        userAnswer: isNaN(userAnswer) ? '' : userAnswer.toString(),
        correctAnswer: correct.toString(),
        isCorrect: userAnswer === correct
      };
    });
    
    // If mission mode, complete mission and show MissionCompleteModal
    if (missionId) {
      handleCompleteMission(correctCount, count, duration, questionAttempts);
      return;
    }
    
    // Otherwise show regular summary modal
    setSummary({
      correct: correctCount,
      total: problems.length,
      elapsedMs: startedAt ? now - startedAt : elapsedMs,
      level,
      count,
    });
    setLineSent(false);
    setShowSummary(true);

    if (next.every((r) => r === "correct")) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2000);
    } else {
      setCelebrate(false);
    }
  }
  
  async function handleSendToLine() {
    if (isSendingLine || lineSent) return;
    
    setIsSendingLine(true);
    
    try {
      const authStored = localStorage.getItem('kidfast_auth');
      if (!authStored) {
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: t('errors.lineNotConnected'),
          description: t('errors.connectLineFirst'),
          variant: "destructive",
        });
        setIsSendingLine(false);
        return;
      }

      const authState = JSON.parse(authStored);
      const userId = authState.registrationId;
      const userNickname = localStorage.getItem('user_nickname') || authState.username || 'นักเรียน';

      if (!userId) {
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: t('errors.userNotFound'),
          description: t('errors.pleaseLogin'),
          variant: "destructive",
        });
        setIsSendingLine(false);
        return;
      }

      // Format time
      const timeMs = startedAt ? Date.now() - startedAt : elapsedMs;
      const minutes = Math.floor(timeMs / 60000);
      const seconds = Math.floor((timeMs % 60000) / 1000);
      const timeSpent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Prepare problems data
      const correctCount = results.filter(r => r === 'correct').length;
      const problemsData = problems.map((p, i) => {
        const userAnswer = (answers[i] || []).join('') || 'ไม่ได้ตอบ';
        const correctAnswer = (operands === 3 ? p.a + p.b + p.c : p.a + p.b).toString();
        const question = operands === 3 
          ? `${p.a}+${p.b}+${p.c}`
          : `${p.a}+${p.b}`;
        
        return {
          questionNumber: i + 1,
          question,
          userAnswer,
          correctAnswer,
          isCorrect: results[i] === 'correct'
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
          exerciseType: 'addition',
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
        
        // Check for quota exceeded
        if (data?.error === 'quota_exceeded') {
          const { toast } = await import('@/hooks/use-toast');
          toast({
            title: t('errors.quotaExceeded'),
            description: data.message || t('errors.quotaExceededDesc'),
            variant: "destructive",
          });
          setLineQuota({ remaining: 0, total: 20 });
        } else {
          const { toast } = await import('@/hooks/use-toast');
          toast({
            title: t('errors.sendFailed'),
            description: t('errors.sendFailedDesc'),
            variant: "destructive",
          });
        }
        setIsSendingLine(false);
        return;
      }

      // Update quota display
      if (data?.quota) {
        setLineQuota({
          remaining: data.quota.remaining,
          total: data.quota.quota_limit
        });
      }

      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: t('common.sendSuccess'),
        description: t('common.sentToLine'),
      });
      
      setLineSent(true);
      console.log('LINE notification sent successfully');
    } catch (err) {
      console.log('LINE notification error:', err);
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: t('errors.sendFailed'),
        description: t('errors.sendFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSendingLine(false);
    }
  }

  function showAll(opts = { openSummary: true }) {
    const end = Date.now();
    const correctNow = problems.reduce((acc, p, i) => {
      const ans = answerToNumber(answers[i]);
      const correct = operands === 3 ? p.a + p.b + p.c : p.a + p.b;
      return acc + (ans === correct ? 1 : 0);
    }, 0);

    setShowAnswers(true);
    setResults(problems.map(() => "pending"));
    if (!startedAt) {
      setElapsedMs(0);
      setFinishedAt(end);
    } else {
      setElapsedMs(end - startedAt);
      setFinishedAt(end);
    }
    // moved: save on modal close instead of here

    if (opts.openSummary) {
      setSummary({ correct: correctNow, total: problems.length, elapsedMs: startedAt ? end - startedAt : 0, level, count });
      setShowSummary(true);
    }
  }

  function onReset(idx) {
    const actualDigits = getActualDigits(problems[idx], operands);
    setAnswers((prev) => prev.map((a, i) => (i === idx ? Array(actualDigits).fill("") : a)));
    setResults((prev) => prev.map((r, i) => (i === idx ? "pending" : r)));
  }

  function clearHistory() {
    setHistory([]);
    try { localStorage.removeItem("add1000_history"); } catch {}
  }

  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      alert(t('pdf.invalidFileType'));
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(t('pdf.fileTooLarge'));
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setSchoolLogo(result);
        localStorage.setItem('addition-school-logo', result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveLogo = () => {
    setSchoolLogo('');
    localStorage.removeItem('addition-school-logo');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  function createProblemCard(prob, idx, operands) {
    // Calculate correct answer and determine actual digits needed
    const correctAnswer = operands === 3 ? prob.a + prob.b + prob.c : prob.a + prob.b;
    const actualDigits = String(correctAnswer).length;
    
    // Convert to string and pad with spaces to ensure correct digit count
    const aStr = prob.a.toString().padStart(actualDigits, ' ');
    const bStr = prob.b.toString().padStart(actualDigits, ' ');
    const cStr = prob.c != null ? prob.c.toString().padStart(actualDigits, ' ') : null;
    
    const aDigits = aStr.split('');
    const bDigits = bStr.split('');
    const cDigits = cStr ? cStr.split('') : null;
    
    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 6px; background: #f0f9ff; font-family: 'Noto Sans Thai', sans-serif;">
        <div style="font-size: 7pt; margin-bottom: 4px; color: #666; display: flex; align-items: center;">
          <span style="color: #0ea5e9; margin-right: 2px; font-size: 9pt;">★</span> ${t('common.question')} ${idx + 1}
        </div>
        
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5px; padding-top: 3px;">
          <!-- Top row (first number) with spacing for plus sign alignment -->
          <div style="display: flex; gap: 2px;">
            <div style="width: 24px; height: 24px; visibility: hidden;"></div>
            ${aDigits.map(digit => `
              <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: white; border: 1.5px solid #e0e0e0; border-radius: 6px; line-height: 1;">
                <span style="transform: translateY(-3.5px); display: inline-block;">${digit.trim() || ''}</span>
              </div>
            `).join('')}
          </div>
          
          <!-- Second row (plus sign + second number) -->
          <div style="display: flex; gap: 2px; align-items: center;">
            <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: #dbeafe; border: 1.5px solid #3b82f6; border-radius: 6px; line-height: 1;">
              <span style="transform: translateY(-5px); display: inline-block;">+</span>
            </div>
            ${bDigits.map(digit => `
              <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: white; border: 1.5px solid #e0e0e0; border-radius: 6px; line-height: 1;">
                <span style="transform: translateY(-3.5px); display: inline-block;">${digit.trim() || ''}</span>
              </div>
            `).join('')}
          </div>
          
          ${cDigits ? `
          <!-- Third row (plus sign + third number) - only for 3-operand problems -->
          <div style="display: flex; gap: 2px; align-items: center;">
            <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: #dbeafe; border: 1.5px solid #3b82f6; border-radius: 6px; line-height: 1;">
              <span style="transform: translateY(-5px); display: inline-block;">+</span>
            </div>
            ${cDigits.map(digit => `
              <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10.5pt; font-weight: bold; background: white; border: 1.5px solid #e0e0e0; border-radius: 6px; line-height: 1;">
                <span style="transform: translateY(-3.5px); display: inline-block;">${digit.trim() || ''}</span>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <!-- Divider line -->
          <div style="width: calc(100% - 3px); height: 1.5px; background: #333; margin: 2px 0;"></div>
          
          <!-- Answer boxes with spacing for alignment -->
          <div style="display: flex; gap: 2px;">
            <div style="width: 24px; height: 24px; visibility: hidden;"></div>
            ${Array(actualDigits).fill(0).map(() => `
              <div style="width: 24px; height: 24px; border: 1.5px solid #93c5fd; border-radius: 6px; background: white;"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function generatePageHTML(pageProblems, startIdx, pageNum, totalPages) {
    return `
      <div style="width: 210mm; min-height: 297mm; background: white; padding: 8mm 20mm; page-break-after: always; font-family: 'Noto Sans Thai', sans-serif;">
        <!-- Header -->
        <div style="margin-bottom: 8mm; position: relative;">
          ${totalPages > 1 ? `<div style="position: absolute; top: 0; right: 0; font-size: 10pt; color: #666;">${t('pdf.page')} ${pageNum}/${totalPages}</div>` : ''}
          
          <div style="display: flex; align-items: flex-start; gap: 8mm; margin-bottom: 6mm;">
            ${schoolLogo ? `
              <!-- Logo in top left -->
              <div style="flex-shrink: 0; margin-top: -2mm;">
                <img src="${schoolLogo}" alt="โลโก้โรงเรียน" style="width: 78px; height: 78px; object-fit: contain; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 5px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" />
              </div>
            ` : ''}
            
            <!-- Main content area -->
            <div style="flex: 1;">
              <!-- Title centered -->
              <div style="font-size: 20pt; font-weight: bold; margin-bottom: 6mm; text-align: center; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 4mm 0;">
                ${t('addition.worksheetTitle')}
              </div>
              
              <!-- School and student info -->
              <div style="display: flex; justify-content: space-between; font-size: 11pt; margin-bottom: 3mm;">
                <div>${t('pdf.studentName')}: _______________________</div>
                <div style="display: flex; gap: 15mm;">
                  <span>${t('pdf.class')}: __________</span>
                  <span>${t('pdf.number')}: __________</span>
                </div>
              </div>
              <div style="font-size: 11pt;">
                ${t('pdf.school')}: _______________________
              </div>
            </div>
          </div>
        </div>

        <!-- Problems Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; max-width: 170mm; margin: 0 auto;">
          ${pageProblems.map((prob, idx) => createProblemCard(prob, startIdx + idx, operands)).join('')}
        </div>
      </div>
    `;
  }

  async function printToPDF() {
    try {
      // Calculate total pages needed (20 problems per page: 4 columns x 5 rows)
      const problemsPerPage = 20;
      const totalPages = Math.ceil(problems.length / problemsPerPage);
      
      // Generate HTML for all pages
      let allPagesHTML = '<div style="font-family: \'Noto Sans Thai\', sans-serif;">';
      
      for (let page = 0; page < totalPages; page++) {
        const startIdx = page * problemsPerPage;
        const endIdx = Math.min(startIdx + problemsPerPage, problems.length);
        const pageProblems = problems.slice(startIdx, endIdx);
        
        allPagesHTML += generatePageHTML(pageProblems, startIdx, page + 1, totalPages);
      }
      
      allPagesHTML += '</div>';
      
      // Store preview content and show preview modal
      setPdfPreviewContent(allPagesHTML);
      setShowPdfPreview(true);
      
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      alert(t('pdf.generationError'));
    }
  }

  async function savePdfFromPreview() {
    try {
      // Create temporary container with preview content
      const printContainer = document.createElement('div');
      printContainer.innerHTML = pdfPreviewContent;
      printContainer.style.cssText = 'position: fixed; top: -10000px; left: -10000px;';
      document.body.appendChild(printContainer);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = printContainer.querySelectorAll('div[style*="page-break-after"]');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      }
      
      pdf.save(`${t('addition.worksheetTitle')}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Cleanup
      document.body.removeChild(printContainer);
      setShowPdfPreview(false);
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert(t('pdf.saveError'));
    }
  }

  const Confetti = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );

  // History Detail Modal (show a saved snapshot)
  const HistoryDetailModal = ({ open, item, onClose }) => {
    if (!open || !item) return null;
    const hasSnap = Array.isArray(item.snapshot);
    return (
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative z-10 mx-auto my-4 w-[96%] max-w-5xl">
          {/* Use svh for mobile dynamic bars + fallback vh */}
          <div className="rounded-2xl bg-white shadow-xl border flex flex-col overflow-hidden h-[85vh]" style={{ height: '85svh' }}>
            {/* Header (sticky) */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div className="font-bold text-lg">{t('results.pastResults')} • {fmtDate(item.ts)}</div>
              <button onClick={onClose} className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200">{t('common.close')}</button>
            </div>

            {/* Scrollable content */}
            <div className="p-4 overflow-y-auto flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
              {!hasSnap ? (
                <div className="text-sm text-zinc-500">{t('results.noDataSaved')}</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.snapshot.map((s, idx) => {
                    const ok = parseInt(s.answer, 10) === s.correct;
                    return (
                      <div key={idx} className="rounded-2xl border bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-500">{t('common.question')} {idx + 1}</div>
                          <div className={ok ? "text-emerald-600 text-xl" : "text-rose-600 text-xl"}>{ok ? "✅" : "❌"}</div>
                        </div>
                        <div className="text-2xl font-bold my-1">
                          {s.c !== undefined ? `${s.a} + ${s.b} + ${s.c}` : `${s.a} + ${s.b}`} = <span className="text-sky-700">{s.correct}</span>
                        </div>
                        <div className="text-sm">{t('results.yourAnswer')}: <span className={ok ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{s.answer || '—'}</span></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PdfPreviewModal = ({ open, onClose, onSave }) => {
    if (!open) return null;
    
    return (
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative z-10 mx-auto my-4 w-[96%] max-w-6xl">
          <div className="rounded-2xl bg-white shadow-xl border flex flex-col overflow-hidden" style={{ height: '90vh' }}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div className="font-bold text-lg">{t('pdf.preview')}</div>
              <div className="flex gap-2">
                <button 
                  onClick={onSave}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  {t('pdf.save')}
                </button>
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200">{t('common.close')}</button>
              </div>
            </div>
            <div 
              className="p-4 overflow-y-auto flex-1 bg-zinc-100"
              dangerouslySetInnerHTML={{ __html: pdfPreviewContent }}
            />
          </div>
        </div>
      </div>
    );
  };

  const SummaryModal = ({ open, onClose, data, onShowAnswers, alreadyShowing, onSave }: any) => {
    if (!open || !data) return null;
    const pct = Math.round((data.correct / Math.max(1, data.total)) * 100);
    let icon = "💪";
    let title = t('results.keepTrying');
    let color = "text-rose-600";
    if (pct >= 90) { icon = "🏆"; title = t('results.excellent'); color = "text-emerald-600"; }
    else if (pct >= 70) { icon = "🎯"; title = t('results.greatJob'); color = "text-sky-600"; }
    else if (pct >= 40) { icon = "👍"; title = t('results.notBad'); color = "text-amber-600"; }

    const stars = calcStars(data.correct, data.total);
    const msg = praiseText(pct, t);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white shadow-xl border p-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{icon}</div>
            <div>
              <div className={`text-xl font-bold ${color}`}>{title}</div>
              <div className="text-zinc-500 text-sm">{t('results.summary')}</div>
            </div>
          </div>

          <div className="mt-3 flex justify-center items-center gap-1">
            {[0,1,2].map(i => (
              <span key={`${i}-${digits}`} className={i < stars ? 'text-amber-400 text-3xl' : 'text-zinc-300 text-3xl'}>★</span>
            ))}
          </div>
          <div className="text-center text-sm mt-1 text-zinc-600">{msg}</div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-zinc-500">{t('results.score')}</div>
              <div className="text-2xl font-semibold">{data.correct}/{data.total}</div>
              <div className="text-xs text-zinc-400">{pct}%</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-zinc-500">{t('results.timeUsed')}</div>
              <div className="text-2xl font-semibold">{formatMS(data.elapsedMs)}</div>
              <div className="text-xs text-zinc-400">{t('common.difficulty')}: {t(`common.${data.level}`)}</div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
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
                  <span>✅ {t('common.sent')}</span>
                  {lineQuota && (
                    <span className="text-xs opacity-75">
                      ({t('common.remaining')} {lineQuota.remaining}/{lineQuota.total})
                    </span>
                  )}
                </>
              ) : (lineQuota && lineQuota.remaining <= 0) ? (
                <span>🚫 {t('common.quotaExceeded')}</span>
              ) : (
                <>
                  <span>📤 {t('common.sendToLine')}</span>
                  {lineQuota && (
                    <span className="text-xs opacity-75">
                      ({lineQuota.remaining}/{lineQuota.total})
                    </span>
                  )}
                </>
              )}
            </button>
            
            {/* Existing buttons */}
            <div className="flex gap-2 justify-end">
              {alreadyShowing ? (
                <div className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-medium">👀 {t('common.answersShown')}</div>
              ) : (
                <button onClick={onShowAnswers} className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600">{t('common.showAllAnswers')}</button>
              )}
              <button onClick={onClose} className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200">{t('common.close')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-zinc-800 dark:text-zinc-100 transition-colors">
      <header className="max-w-6xl mx-auto p-6 pb-2">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link 
            to="/profile" 
            className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-zinc-50 dark:hover:bg-slate-600 hover:border-zinc-400 dark:hover:border-slate-500 transition-all text-zinc-700 dark:text-zinc-200 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.backToProfile')}</span>
          </Link>
          {/* <ThemeToggle /> */}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2">🧮 {t('addition.title')}</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-base">{t('addition.subtitle')}</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        {/* Logo Upload Section */}
        <div className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-4 border-2 border-sky-100 dark:border-slate-600 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('pdf.uploadLogo')}</h3>
              {schoolLogo && (
                <img 
                  src={schoolLogo} 
                  alt={t('pdf.schoolLogo')} 
                  className="w-12 h-12 object-contain border border-zinc-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 p-1"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload-addition"
              />
              <label
                htmlFor="logo-upload-addition"
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 cursor-pointer flex items-center gap-2 text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                {schoolLogo ? t('pdf.changeLogo') : t('pdf.uploadLogo')}
              </label>
              {schoolLogo && (
                <button
                  onClick={handleRemoveLogo}
                  className="px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-2 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  {t('pdf.removeLogo')}
                </button>
              )}
              <button
                onClick={printToPDF}
                disabled={problems.length === 0}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-md"
              >
                <Printer className="w-4 h-4" />
                {t('pdf.print')} ({problems.length} {t('common.problems')})
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{t('pdf.supportedFormats')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 dark:border-slate-600 shadow-sm">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{t('settings.problemCount')}:</span>
            {[10, 15, 30, 40].map((n) => (
              <button
                key={n}
                onClick={() => applyNewCount(n)}
                className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                  count === n ? "bg-sky-600 text-white border-sky-600" : "bg-zinc-50 dark:bg-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-600 dark:text-zinc-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 dark:border-slate-600 shadow-sm">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{t('common.difficulty')}:</span>
            {[
              { key: "easy", label: t('common.easy') },
              { key: "medium", label: t('common.medium') },
              { key: "hard", label: t('common.hard') },
            ].map((lv) => (
              <button
                key={lv.key}
                onClick={() => applyLevel(lv.key)}
                className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                  level === lv.key ? "bg-purple-600 text-white border-purple-600" : "bg-zinc-50 dark:bg-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-600 dark:text-zinc-200"
                }`}
              >
                {lv.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 dark:border-slate-600 shadow-sm">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{t('common.digits')}:</span>
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => applyDigits(d)}
                className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                  digits === d ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-50 dark:bg-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-600 dark:text-zinc-200"
                }`}
              >
                {d} {t('common.digit')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 dark:border-slate-600 shadow-sm">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{t('addition.carryOption')}:</span>
            <button
              onClick={() => applyCarryOption("has")}
              className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                carryOption === "has" ? "bg-red-500 text-white border-red-500" : "bg-zinc-50 dark:bg-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-600 border-zinc-200 dark:border-slate-600 dark:text-zinc-200"
              }`}
            >
              {t('addition.hasCarry')}
            </button>
            <button
              onClick={() => applyCarryOption("none")}
              className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                carryOption === "none" ? "bg-red-500 text-white border-red-500" : "bg-zinc-50 dark:bg-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-600 border-zinc-200 dark:border-slate-600 dark:text-zinc-200"
              }`}
            >
              {t('addition.noCarry')}
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 dark:border-slate-600 shadow-sm">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{t('addition.operands')}:</span>
            <button
              onClick={() => applyOperands(2)}
              className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                operands === 2 ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-50 dark:bg-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-600 border-zinc-200 dark:border-slate-600 dark:text-zinc-200"
              }`}
            >
              {t('addition.twoNumbers')}
            </button>
            <button
              onClick={() => applyOperands(3)}
              className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                operands === 3 ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-50 dark:bg-slate-700 hover:bg-zinc-100 dark:hover:bg-slate-600 border-zinc-200 dark:border-slate-600 dark:text-zinc-200"
              }`}
            >
              {t('addition.threeNumbers')}
            </button>
          </div>

          <button 
            onClick={resetAll} 
            className="px-6 py-3 rounded-full text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #a855f7 100%)',
            }}
          >
            <span className="text-2xl">✨</span>
            <span>{t('common.aiGenerate')}</span>
          </button>
          <button onClick={checkAnswers} className="px-5 py-3 rounded-2xl text-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
            ✅ {t('common.checkAnswers')}
          </button>
          <button onClick={() => showAll({ openSummary: true })} className="px-5 py-3 rounded-2xl text-lg bg-amber-500 text-white hover:bg-amber-600 shadow-lg">
            👀 {t('common.showAnswers')}
          </button>

          {/* Live timer always visible */}
          <div className="ml-auto text-base bg-sky-50 dark:bg-slate-700 border-2 border-sky-200 dark:border-slate-600 rounded-full px-4 py-2 font-semibold dark:text-zinc-200">
            ⏱️ {t('results.timeUsed')}: <span className="font-semibold">{formatMS(elapsedMs)}</span>
            {startedAt && !finishedAt && <span className="text-zinc-400 dark:text-zinc-500"> ({t('common.counting')})</span>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <ProblemCard
              key={i}
              idx={i}
              prob={p}
              answer={answers[i]}
              setAnswer={setAnswer}
              result={results[i]}
              showAnswer={showAnswers}
              onReset={onReset}
              onFirstType={startTimerIfNeeded}
              digits={digits}
              operands={operands}
              firstInputRef={(el) => { problemInputRefs.current[i] = el; }}
              onFocusNextProblem={() => {
                const nextIdx = i + 1;
                if (nextIdx < problems.length) {
                  const nextInput = problemInputRefs.current[nextIdx];
                  if (nextInput) nextInput.focus();
                }
              }}
            />
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="mt-6 flex justify-center">
          <button onClick={checkAnswers} className="px-8 py-4 rounded-3xl text-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
            ✅ {t('common.checkAnswers')}
          </button>
        </div>

        {/* History panel */}
        <section className="mt-10 max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-base font-semibold">{t('results.pastStats')}</h2>
            <button onClick={clearHistory} className="ml-auto text-xs px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200">{t('results.clearStats')}</button>
          </div>
          {history.length === 0 ? (
            <div className="text-sm text-zinc-500">ยังไม่มีสถิติ ลองทำโจทย์แล้วกด “ตรวจคำตอบ” แล้วกดปุ่ม “ปิด” เพื่อบันทึก</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-2 pr-3">{t('results.dateTime')}</th>
                    <th className="py-2 pr-3">{t('common.difficulty')}</th>
                    <th className="py-2 pr-3">{t('settings.problemCount')}</th>
                    <th className="py-2 pr-3">{t('results.timeUsed')}</th>
                    <th className="py-2 pr-3">{t('results.score')}</th>
                    <th className="py-2 pr-3">{t('results.rating')}</th>
                    <th className="py-2 pr-3">{t('results.viewResults')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(h.ts)}</td>
                      <td className="py-2 pr-3">{t(`common.${h.level}`)}</td>
                      <td className="py-2 pr-3">{h.count}</td>
                      <td className="py-2 pr-3">{formatMS(h.durationMs)}</td>
                      <td className="py-2 pr-3">{h.correct}/{h.count}</td>
                      <td className="py-2 pr-3">
                        {[0,1,2].map(i => (
                          <span key={i} className={i < (h.stars || 0) ? 'text-amber-400' : 'text-zinc-300'}>★</span>
                        ))}
                      </td>
                      <td className="py-2 pr-3"><button onClick={() => openHistory(i)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 hover:shadow-sm transition">👁️ <span className="font-medium">{t('results.view')}</span></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {celebrate && <Confetti />}

      <HistoryDetailModal open={detailOpen} item={detailItem} onClose={() => setDetailOpen(false)} />

      <SummaryModal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        data={summary}
        onShowAnswers={() => showAll({ openSummary: false })}
        alreadyShowing={showAnswers}
      />

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
            // Reset for retry
            resetAll();
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

      <PdfPreviewModal
        open={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        onSave={savePdfFromPreview}
      />

      <footer className="max-w-6xl mx-auto p-6 text-xs text-zinc-500">© Interactive math worksheet — addition ≤ 1000.</footer>
    </div>
  );
}
