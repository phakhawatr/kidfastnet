import { useState, useEffect } from "react";
import { 
  generateSubtractionProblems, 
  answerToNumber, 
  calcStars, 
  type ProblemPair, 
  type HistoryItem, 
  type SummaryData 
} from "../utils/subtractionUtils";
import { supabase } from "@/integrations/supabase/client";

export function useSubtractionGame() {
  const [count, setCount] = useState(15);
  const [level, setLevel] = useState("easy");
  const [digits, setDigits] = useState(2);
  const [allowBorrow, setAllowBorrow] = useState(true);
  const [operands, setOperands] = useState(2);
  const [problems, setProblems] = useState(() => generateSubtractionProblems(15, "easy", 2, true, 2));
  const [answers, setAnswers] = useState<string[][]>(() => problems.map(() => Array(2).fill("")));
  const [results, setResults] = useState<string[]>(() => problems.map(() => "pending"));
  const [showAnswers, setShowAnswers] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // Summary modal states
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  // LINE sending states (for manual send)
  const [isSendingLine, setIsSendingLine] = useState(false);
  const [lineSent, setLineSent] = useState(false);
  const [lineQuota, setLineQuota] = useState<{ remaining: number; total: number } | null>(null);

  // Timer states
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // History of sessions
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem("sub1000_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem("sub1000_history", JSON.stringify(history)); } catch {}
  }, [history]);

  // Force start-at-top and disable automatic scroll restoration
  useEffect(() => {
    try { if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual"; } catch {}
    try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch {}
  }, []);

  // Keep answers shape in sync with problems/digits - handled by regenerate function

  // Live timer
  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt, finishedAt]);

  function setAnswer(pIdx: number, dIdx: number, val: string) {
    const digit = (val || "").replace(/\D/g, "").slice(0, 1);
    setAnswers((prev) => prev.map((arr, i) => (i === pIdx ? (Array.isArray(arr) ? arr.map((d, j) => (j === dIdx ? digit : d)) : []) : arr)));
  }

  function startTimerIfNeeded() {
    if (!startedAt) { setStartedAt(Date.now()); setElapsedMs(0); }
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
  }

  function finalizeAndLog(endTs = Date.now()) {
    const duration = startedAt ? endTs - startedAt : 0;
    const correct = problems.reduce((acc, p, i) => {
      const userAns = answerToNumber(answers[i], digits);
      const corr = p.c != null ? p.a - p.b - p.c : p.a - p.b;
      const isCorrect = !isNaN(userAns) && userAns === corr;
      return acc + (isCorrect ? 1 : 0);
    }, 0);
    const entry: HistoryItem = { ts: endTs, level, count, durationMs: Math.max(0, duration), correct, stars: calcStars(correct, count) };
    setHistory((prev) => [entry, ...prev].slice(0, 10));
  }

  function saveStats() {
    const end = finishedAt || Date.now();
    const duration = startedAt ? end - startedAt : 0;
    const snapshot = problems.map((p, i) => ({ a: p.a, b: p.b, c: p.c, answer: (answers[i] || []).join(""), correct: p.c != null ? p.a - p.b - p.c : p.a - p.b }));
    const correct2 = snapshot.reduce((t, s, i) => {
      const userAns = answerToNumber(answers[i], digits);
      const isCorrect = !isNaN(userAns) && userAns === s.correct;
      return t + (isCorrect ? 1 : 0);
    }, 0);
    const entry2: HistoryItem = { ts: end, level, digits, count, durationMs: Math.max(0, duration), correct: correct2, stars: calcStars(correct2, count), snapshot };
    setHistory((prev) => [entry2, ...prev].slice(0, 10));
  }

  function regenerate(n = count, lv = level, d = digits, borrow = allowBorrow, ops = operands) {
    const next = generateSubtractionProblems(n, lv, d, borrow, ops);
    setProblems(next);
    setAnswers(next.map(() => Array(d).fill("")));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
  }

  function applyNewCount(n: number) { 
    if (startedAt && !showAnswers) finalizeAndLog(Date.now()); 
    setCount(n); 
    regenerate(n, level, digits, allowBorrow, operands); 
    // Scroll to top after changing problem count
    setTimeout(() => {
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
    }, 100);
  }

  function applyLevel(lv: string) { 
    if (startedAt && !showAnswers) finalizeAndLog(Date.now()); 
    setLevel(lv); 
    regenerate(count, lv, digits, allowBorrow, operands); 
  }

  function applyDigits(d: number) { 
    if (startedAt && !showAnswers) finalizeAndLog(Date.now()); 
    setDigits(d); 
    regenerate(count, level, d, allowBorrow, operands); 
  }

  function applyBorrow(val: boolean) { 
    if (startedAt && !showAnswers) finalizeAndLog(Date.now()); 
    setAllowBorrow(val); 
    regenerate(count, level, digits, val, operands); 
  }

  function applyOperands(k: number) { 
    if (startedAt && !showAnswers) finalizeAndLog(Date.now()); 
    setOperands(k); 
    regenerate(count, level, digits, allowBorrow, k); 
  }

  function resetAll() { 
    if (startedAt && !showAnswers) finalizeAndLog(Date.now()); 
    regenerate(count, level, digits, allowBorrow, operands); 
  }

  function checkAnswers() {
    console.log('🔍 useSubtractionGame.checkAnswers called');
    console.log('📊 Current state:', {
      problemsCount: problems.length,
      answersCount: answers.length,
      digits,
      level,
      count
    });
    
    const next = problems.map((p, i) => {
      const userAns = answerToNumber(answers[i], digits);
      const corr = p.c != null ? p.a - p.b - p.c : p.a - p.b;
      const isCorrect = !isNaN(userAns) && userAns === corr;
      
      // Enhanced logging for debugging
      if (i < 3) { // Log first 3 problems
        console.log(`📝 Problem ${i + 1}:`, {
          problem: p,
          answerArray: answers[i],
          parsedAnswer: userAns,
          correctAnswer: corr,
          isCorrect
        });
      }
      
      if (!isCorrect && i < 10) { // Log first 10 incorrect
        console.log(`❌ Problem ${i + 1} incorrect:`, {
          problem: p,
          answerArray: answers[i],
          parsedAnswer: userAns,
          correctAnswer: corr
        });
      }
      
      return isCorrect ? "correct" : "wrong";
    });
    setResults(next);

    const correctCount = next.filter((r) => r === "correct").length;
    const now = Date.now();
    if (startedAt) setElapsedMs(now - startedAt);
    
    console.log('✅ checkAnswers completed:', {
      correctCount,
      totalProblems: problems.length,
      accuracy: ((correctCount / problems.length) * 100).toFixed(2) + '%',
      timeMs: startedAt ? now - startedAt : elapsedMs
    });
    
    setSummary({ correct: correctCount, total: problems.length, elapsedMs: startedAt ? now - startedAt : elapsedMs, level, count });
    setLineSent(false); // Reset sent status when checking new answers
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
        alert('⚠️ ยังไม่ได้เชื่อมต่อบัญชี LINE\nกรุณาไปที่หน้าโปรไฟล์เพื่อเชื่อมต่อบัญชี LINE');
        setIsSendingLine(false);
        return;
      }

      const authState = JSON.parse(authStored);
      const userId = authState.registrationId;
      const userNickname = localStorage.getItem('user_nickname') || authState.username || 'นักเรียน';

      if (!userId) {
        alert('⚠️ ไม่พบข้อมูลผู้ใช้\nกรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        setIsSendingLine(false);
        return;
      }

      // Format time
      const timeMs = startedAt ? Date.now() - startedAt : elapsedMs;
      const minutes = Math.floor(timeMs / 60000);
      const seconds = Math.floor((timeMs % 60000) / 1000);
      const timeSpent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Prepare problems data with current results
      const correctCount = results.filter(r => r === 'correct').length;
      const problemsData = problems.map((p, i) => {
        const userAnswer = answers[i].join('') || 'ไม่ได้ตอบ';
        const correctAnswer = (p.c != null ? p.a - p.b - p.c : p.a - p.b).toString();
        const question = p.c != null 
          ? `${p.a}-${p.b}-${p.c}`
          : `${p.a}-${p.b}`;
        
        return {
          questionNumber: i + 1,
          question,
          userAnswer,
          correctAnswer,
          isCorrect: results[i] === 'correct'
        };
      });

      // Map level to Thai
      const levelMap: Record<string, string> = {
        easy: 'ง่าย',
        medium: 'ปานกลาง',
        hard: 'ยาก'
      };

      const percentage = Math.round((correctCount / problems.length) * 100);

      // Invoke edge function
      const { data, error } = await supabase.functions.invoke('send-line-message', {
        body: {
          userId,
          exerciseType: 'subtraction',
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
          alert(data.message || 'คุณส่งข้อความครบ 20 ครั้งแล้ววันนี้');
          setLineQuota({ remaining: 0, total: 20 });
        } else {
          alert('❌ ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง');
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

      alert('✅ ส่งผลการทำแบบฝึกหัดไปยัง LINE แล้ว');
      setLineSent(true);
      console.log('LINE notification sent successfully');
    } catch (err) {
      console.log('LINE notification error:', err);
      alert('❌ ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSendingLine(false);
    }
  }

  function showAll(opts = { openSummary: true }) {
    const end = Date.now();
    const correctNow = problems.reduce((acc, p, i) => {
      const ans = answerToNumber(answers[i], digits);
      const corr = p.c != null ? p.a - p.b - p.c : p.a - p.b;
      return acc + (ans === corr ? 1 : 0);
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

    if (opts.openSummary) { 
      setSummary({ correct: correctNow, total: problems.length, elapsedMs: startedAt ? end - startedAt : 0, level, count }); 
      setShowSummary(true); 
    }
  }

  function onReset(idx: number) { 
    setAnswers((prev) => prev.map((a, i) => (i === idx ? Array(digits).fill("") : a))); 
    setResults((prev) => prev.map((r, i) => (i === idx ? "pending" : r))); 
  }

  function clearHistory() { 
    setHistory([]); 
    try { localStorage.removeItem("sub1000_history"); } catch {} 
  }

  return {
    // State
    count, level, digits, allowBorrow, operands, problems, answers, results,
    showAnswers, celebrate, showSummary, summary, startedAt, finishedAt, 
    elapsedMs, history, isSendingLine, lineSent, lineQuota,
    
    // Actions
    setAnswer, startTimerIfNeeded, applyNewCount, applyLevel, applyDigits,
    applyBorrow, applyOperands, resetAll, checkAnswers, showAll, onReset,
    clearHistory, saveStats, setShowSummary, setSummary, handleSendToLine,
  };
}
