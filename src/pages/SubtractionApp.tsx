import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// ================= Utilities =================
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rangeForDigits(d: number): { min: number; max: number } {
  const map: Record<number, [number, number]> = { 1: [1, 9], 2: [10, 99], 3: [100, 999] };
  const pair = map[d] || map[2];
  return { min: pair[0], max: pair[1] };
}

// Count column-wise borrows for a sequential subtraction: ops[0] - ops[1] (- ops[2] ...)
function countBorrowsMulti(ops: number[], digits: number): number {
  let borrows = 0;
  let carryBorrow = 0;
  for (let i = 0; i < digits; i++) {
    const pow = Math.pow(10, i);
    const ai = Math.floor(ops[0] / pow) % 10;
    const subSum = ops.slice(1).reduce((s, v) => s + (Math.floor(v / pow) % 10), 0);
    if (ai - carryBorrow < subSum) {
      borrows++;
      carryBorrow = 1;
    } else {
      carryBorrow = 0;
    }
  }
  return borrows;
}

interface ProblemPair {
  a: number;
  b: number;
  c?: number;
}

function pickByDifficulty(level: string, digits: number, allowBorrow: boolean, operands = 2): ProblemPair | null {
  const { min, max } = rangeForDigits(digits);
  let a = randInt(min, max);
  let b = randInt(min, max);
  let c = 0;

  if (operands === 3) c = randInt(min, max);

  // Ensure non-negative result by ordering or rejecting
  if (operands === 2) {
    if (a < b) [a, b] = [b, a];
  } else {
    if (a < b + c) return null;
  }

  const val = operands === 3 ? a - b - c : a - b;
  if (val < 0 || val > 1000) return null;

  const borrows = countBorrowsMulti(operands === 3 ? [a, b, c] : [a, b], digits);

  // Borrow toggle
  if (allowBorrow) {
    if (borrows < 1) return null;
    if (operands === 2 && (a % 10) >= (b % 10)) return null; // ensure ones borrow for 2-operand mode
  } else {
    if (borrows > 0) return null; // no borrow allowed
  }

  // Difficulty tiers (built on top of borrow presence)
  if (level === "easy" && borrows > 0) return null;
  if (level === "medium" && borrows < 1) return null;
  if (level === "hard") {
    if (borrows < 1) return null;
    if (max >= 500 && val < 300) return null; // make hard a bit larger when digits allow
  }

  return operands === 3 ? { a, b, c } : { a, b };
}

function generateSubtractionProblems(n = 15, level = "easy", digits = 2, allowBorrow = true, operands = 2): ProblemPair[] {
  const probs: ProblemPair[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (probs.length < n && guard < 20000) {
    guard++;
    const pair = pickByDifficulty(level, digits, allowBorrow, operands);
    if (!pair) continue;
    const key = operands === 3 ? `${pair.a}-${pair.b}-${pair.c}` : `${pair.a}-${pair.b}`;
    if (used.has(key)) continue;
    used.add(key);
    probs.push(pair);
  }
  // Fallback: relax difficulty but respect borrow toggle & operand count
  const { min, max } = rangeForDigits(digits);
  while (probs.length < n) {
    let a = randInt(min, max);
    let b = randInt(min, max);
    let c = 0;
    if (operands === 2) {
      if (a < b) [a, b] = [b, a];
    } else {
      c = randInt(min, max);
      if (a < b + c) continue;
    }
    const val = operands === 3 ? a - b - c : a - b;
    if (val < 0 || val > 1000) continue;
    const borrows = countBorrowsMulti(operands === 3 ? [a, b, c] : [a, b], digits);
    if (allowBorrow && borrows < 1) continue;
    if (!allowBorrow && borrows > 0) continue;
    const key = operands === 3 ? `${a}-${b}-${c}` : `${a}-${b}`;
    if (used.has(key)) continue;
    used.add(key);
    probs.push(operands === 3 ? { a, b, c } : { a, b });
  }
  return probs;
}

function formatMS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

function calcStars(correct: number, total: number): number {
  const pct = Math.round((correct / Math.max(1, total)) * 100);
  if (pct === 100) return 3;
  if (pct >= 90) return 2;
  if (pct >= 80) return 1;
  return 0;
}

function praiseText(pct: number): string {
  if (pct === 100) return "สุดยอด! ทำได้ครบถ้วน เก่งมาก 👏";
  if (pct >= 90) return "เยี่ยมมาก! ใกล้ 100% แล้ว อีกนิดเดียว 💪";
  if (pct >= 80) return "ดีมาก! พัฒนาขึ้นเรื่อย ๆ สู้ๆ ✨";
  if (pct >= 60) return "เริ่มดีแล้ว ลองทบทวนอีกนิดจะยิ่งดีขึ้น 😊";
  return "ไม่เป็นไร ลองใหม่อีกครั้งนะ เราทำได้! 🌟";
}

function answerToNumber(ansArr: string[], digits: number): number {
  if (!Array.isArray(ansArr)) return NaN;
  if (ansArr.length !== digits) return NaN;
  if (ansArr.some((d) => d === "")) return NaN;
  return parseInt(ansArr.join(""), 10);
}

// ================= One Problem Card =================
interface ProblemCardProps {
  idx: number;
  prob: ProblemPair;
  answer: string[];
  setAnswer: (pIdx: number, dIdx: number, val: string) => void;
  result: string;
  showAnswer: boolean;
  onReset: (idx: number) => void;
  onFirstType?: () => void;
  digits: number;
}

function ProblemCard({ idx, prob, answer, setAnswer, result, showAnswer, onReset, onFirstType, digits }: ProblemCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const empty = !answer || (Array.isArray(answer) && answer.every((d) => !d));
    if (empty && inputRef.current) inputRef.current.focus();
  }, []);

  const status = useMemo(() => (showAnswer ? "showing" : result), [showAnswer, result]);
  const border = status === "correct" ? "border-green-400" : status === "wrong" ? "border-red-300" : "border-zinc-200";

  const correct = prob.a - prob.b - (prob.c != null ? prob.c : 0);

  const pastel = ["bg-yellow-50","bg-sky-50","bg-pink-50","bg-green-50","bg-purple-50"];
  const bg = pastel[idx % pastel.length];

  return (
    <div className={`rounded-3xl border-2 ${border} ${bg} shadow-md p-5 flex flex-col gap-3`}>
      <div className="text-base text-zinc-600">⭐ ข้อ {idx + 1}</div>

      <div className="flex justify-center mt-1 select-none">
        <div>
          {/* Numbers grid */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${digits + 1}, 3rem)` }}>
            <div className="w-12 h-12" />
            {String(prob.a).padStart(digits, " ").split("").map((ch, i) => (
              <div key={`a${i}`} className="w-12 h-12 border border-sky-200 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold">{ch.trim()}</div>
            ))}
            <div className="w-12 h-12 border border-sky-200 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold text-zinc-500">-</div>
            {String(prob.b).padStart(digits, " ").split("").map((ch, i) => (
              <div key={`b${i}`} className="w-12 h-12 border border-sky-200 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold">{ch.trim()}</div>
            ))}
          </div>

          {prob.c != null && (
            <div className="grid gap-1 mt-1" style={{ gridTemplateColumns: `repeat(${digits + 1}, 3rem)` }}>
              <div className="w-12 h-12 border border-sky-200 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold text-zinc-500">-</div>
              {String(prob.c).padStart(digits, " ").split("").map((ch, i) => (
                <div key={`c${i}`} className="w-12 h-12 border border-sky-200 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold">{ch.trim()}</div>
              ))}
            </div>
          )}

          {/* underline */}
          <div className="ml-12 border-t-4 border-zinc-400 mt-2" />

          {/* Answer row */}
          <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${digits + 1}, 3rem)` }}>
            <div className="w-12 h-12" />
            {showAnswer
              ? String(correct).padStart(digits, " ").slice(-digits).split("").map((ch, j) => (
                  <div key={`ans${j}`} className="w-12 h-12 border-2 border-sky-300 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold text-sky-700">{ch.trim()}</div>
                ))
              : Array.from({ length: digits }).map((_, j) => (
                  <input
                    key={`in${j}`}
                    ref={(el) => { if (j === 0) inputRef.current = el; inputRefs.current[j] = el; }}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center border-2 border-sky-300 rounded-md text-3xl font-extrabold text-sky-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-sky-300"
                    value={Array.isArray(answer) ? (answer[j] || "") : ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                      const emptyBefore = !answer || (Array.isArray(answer) && answer.every((d) => !d));
                      if (v && emptyBefore && onFirstType) onFirstType();
                      setAnswer(idx, j, v);
                      if (v && j < digits - 1) {
                        const nxt = inputRefs.current[j + 1];
                        if (nxt) nxt.focus();
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
                      if (e.key === 'ArrowRight' && j < digits - 1) {
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
        {status === "correct" && <span className="text-green-600">✅ ถูกต้อง!</span>}
        {status === "wrong" && <span className="text-red-500">❌ ลองใหม่อีกครั้ง</span>}
        {status === "showing" && <span className="text-sky-700">ตอบ: {correct}</span>}
      </div>

      <div className="flex justify-center">
        <button onClick={() => onReset(idx)} className="text-sm px-4 py-2 rounded-full bg-white border hover:bg-zinc-50">ล้างตอบ</button>
      </div>
    </div>
  );
}

interface HistoryItem {
  ts: number;
  level: string;
  digits?: number;
  count: number;
  durationMs: number;
  correct: number;
  stars: number;
  snapshot?: Array<{
    a: number;
    b: number;
    c?: number;
    answer: string;
    correct: number;
  }>;
}

interface SummaryData {
  correct: number;
  total: number;
  elapsedMs: number;
  level: string;
  count: number;
}

// ================= Main App =================
const SubtractionApp: React.FC = () => {
  const [count, setCount] = useState(15);
  const [level, setLevel] = useState("easy");
  const [digits, setDigits] = useState(2);
  const [allowBorrow, setAllowBorrow] = useState(true);
  const [operands, setOperands] = useState(2); // 2 or 3 numbers
  const [problems, setProblems] = useState(() => generateSubtractionProblems(15, "easy", 2, true, 2));
  const [answers, setAnswers] = useState<string[][]>(() => problems.map(() => Array(digits).fill("")));
  const [results, setResults] = useState<string[]>(() => problems.map(() => "pending"));
  const [showAnswers, setShowAnswers] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // summary modal states
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  // timer states
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  // history of sessions
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

  // keep answers shape in sync with problems/digits
  useEffect(() => {
    setAnswers((prev) => {
      if (!Array.isArray(prev) || prev.length !== problems.length) {
        return problems.map(() => Array(digits).fill(""));
      }
      return prev.map((a) => (Array.isArray(a) && a.length === digits ? a : Array(digits).fill("")));
    });
  }, [problems, digits]);

  // detail modal state for viewing previous results
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<HistoryItem | null>(null);
  function openHistory(i: number) {
    const item = history[i];
    setDetailItem(item || null);
    setDetailOpen(!!item);
  }

  // live timer
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
      const ans = answerToNumber(answers[i], digits);
      const corr = p.c != null ? p.a - p.b - p.c : p.a - p.b;
      return acc + (ans === corr ? 1 : 0);
    }, 0);
    const entry: HistoryItem = { ts: endTs, level, count, durationMs: Math.max(0, duration), correct, stars: calcStars(correct, count) };
    setHistory((prev) => [entry, ...prev].slice(0, 10));
  }

  function saveStats() {
    const end = finishedAt || Date.now();
    const duration = startedAt ? end - startedAt : 0;
    const snapshot = problems.map((p, i) => ({ a: p.a, b: p.b, c: p.c, answer: (answers[i] || []).join(""), correct: p.c != null ? p.a - p.b - p.c : p.a - p.b }));
    const correct2 = snapshot.reduce((t, s, i) => t + ((answerToNumber(answers[i], digits) === s.correct) ? 1 : 0), 0);
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

  function applyNewCount(n: number) { if (startedAt && !showAnswers) finalizeAndLog(Date.now()); setCount(n); regenerate(n, level, digits, allowBorrow, operands); }
  function applyLevel(lv: string) { if (startedAt && !showAnswers) finalizeAndLog(Date.now()); setLevel(lv); regenerate(count, lv, digits, allowBorrow, operands); }
  function applyDigits(d: number) { if (startedAt && !showAnswers) finalizeAndLog(Date.now()); setDigits(d); regenerate(count, level, d, allowBorrow, operands); }
  function applyBorrow(val: boolean) { if (startedAt && !showAnswers) finalizeAndLog(Date.now()); setAllowBorrow(val); regenerate(count, level, digits, val, operands); }
  function applyOperands(k: number) { if (startedAt && !showAnswers) finalizeAndLog(Date.now()); setOperands(k); regenerate(count, level, digits, allowBorrow, k); }

  function resetAll() { if (startedAt && !showAnswers) finalizeAndLog(Date.now()); regenerate(count, level, digits, allowBorrow, operands); }

  function checkAnswers() {
    const next = problems.map((p, i) => {
      const ans = answerToNumber(answers[i], digits);
      const corr = p.c != null ? p.a - p.b - p.c : p.a - p.b;
      return ans === corr ? "correct" : "wrong";
    });
    setResults(next);

    const correctCount = next.filter((r) => r === "correct").length;
    const now = Date.now();
    if (startedAt) setElapsedMs(now - startedAt);
    setSummary({ correct: correctCount, total: problems.length, elapsedMs: startedAt ? now - startedAt : elapsedMs, level, count });
    setShowSummary(true);

    if (next.every((r) => r === "correct")) { setCelebrate(true); setTimeout(() => setCelebrate(false), 2000); } else { setCelebrate(false); }
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
    if (!startedAt) { setElapsedMs(0); setFinishedAt(end); } else { setElapsedMs(end - startedAt); setFinishedAt(end); }

    if (opts.openSummary) { setSummary({ correct: correctNow, total: problems.length, elapsedMs: startedAt ? end - startedAt : 0, level, count }); setShowSummary(true); }
  }

  function onReset(idx: number) { setAnswers((prev) => prev.map((a, i) => (i === idx ? Array(digits).fill("") : a))); setResults((prev) => prev.map((r, i) => (i === idx ? "pending" : r))); }

  function clearHistory() { setHistory([]); try { localStorage.removeItem("sub1000_history"); } catch {} }

  const Confetti = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );

  interface HistoryDetailModalProps {
    open: boolean;
    item: HistoryItem | null;
    onClose: () => void;
  }

  const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ open, item, onClose }) => {
    if (!open || !item) return null;
    const hasSnap = Array.isArray(item.snapshot);
    return (
      <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative z-10 mx-auto my-4 w-[96%] max-w-5xl">
          <div className="rounded-2xl bg-white shadow-xl border flex flex-col overflow-hidden h-[85vh]" style={{ height: '85svh' }}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <div className="font-bold text-lg">ผลการทำที่ผ่านมา • {fmtDate(item.ts)}</div>
              <button onClick={onClose} className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200">ปิด</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
              {!hasSnap ? (
                <div className="text-sm text-zinc-500">รายการนี้ไม่มีข้อมูลโจทย์ที่บันทึกไว้</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.snapshot!.map((s, idx) => {
                    const ok = parseInt(s.answer, 10) === s.correct;
                    return (
                      <div key={idx} className="rounded-2xl border bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-500">ข้อ {idx + 1}</div>
                          <div className={ok ? "text-emerald-600 text-xl" : "text-rose-600 text-xl"}>{ok ? "✅" : "❌"}</div>
                        </div>
                        <div className="text-2xl font-bold my-1">
                          {s.c != null ? (<><span>{s.a}</span> - <span>{s.b}</span> - <span>{s.c}</span> = <span className="text-sky-700">{s.correct}</span></>) : (<><span>{s.a}</span> - <span>{s.b}</span> = <span className="text-sky-700">{s.correct}</span></>)}
                        </div>
                        <div className="text-sm">ตอบของฉัน: <span className={ok ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{s.answer || '—'}</span></div>
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

  interface SummaryModalProps {
    open: boolean;
    onClose: () => void;
    data: SummaryData | null;
    onShowAnswers: () => void;
    alreadyShowing: boolean;
    onSave: () => void;
  }

  const SummaryModal: React.FC<SummaryModalProps> = ({ open, onClose, data, onShowAnswers, alreadyShowing, onSave }) => {
    if (!open || !data) return null;
    const pct = Math.round((data.correct / Math.max(1, data.total)) * 100);
    let icon = "💪";
    let title = "สู้ต่ออีกนิด!";
    let color = "text-rose-600";
    if (pct >= 90) { icon = "🏆"; title = "ยอดเยี่ยม!"; color = "text-emerald-600"; }
    else if (pct >= 70) { icon = "🎯"; title = "ดีมาก!"; color = "text-sky-600"; }
    else if (pct >= 40) { icon = "👍"; title = "ใช้ได้!"; color = "text-amber-600"; }

    const stars = calcStars(data.correct, data.total);
    const msg = praiseText(pct);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white shadow-xl border p-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{icon}</div>
            <div>
              <div className={`text-xl font-bold ${color}`}>{title}</div>
              <div className="text-zinc-500 text-sm">ผลคะแนนและเวลาในรอบนี้</div>
            </div>
          </div>

          <div className="mt-3 flex justify-center items-center gap-1">
            {[0,1,2].map(i => (
              <span key={`star-${i}`} className={i < stars ? 'text-amber-400 text-3xl' : 'text-zinc-300 text-3xl'}>★</span>
            ))}
          </div>
          <div className="text-center text-sm mt-1 text-zinc-600">{msg}</div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-zinc-500">คะแนน</div>
              <div className="text-2xl font-semibold">{data.correct}/{data.total}</div>
              <div className="text-xs text-zinc-400">{Math.round((data.correct / Math.max(1, data.total)) * 100)}%</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-zinc-500">เวลา</div>
              <div className="text-2xl font-semibold">{formatMS(data.elapsedMs)}</div>
              <div className="text-xs text-zinc-400">ระดับ: {data.level === 'easy' ? 'ง่าย' : data.level === 'medium' ? 'ปานกลาง' : 'ยาก'}</div>
            </div>
          </div>

          <div className="mt-5 flex gap-2 justify-end">
            {alreadyShowing ? (
              <div className="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-medium">👀 แสดงเฉลยแล้ว</div>
            ) : (
              <button onClick={onShowAnswers} className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600">ดูเฉลยทั้งหมด</button>
            )}
            <button onClick={() => { if (onSave) onSave(); if (onClose) onClose(); }} className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200">ปิด</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-pink-50 text-zinc-800">
      <header className="max-w-6xl mx-auto p-6 pb-2">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/profile" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white shadow-sm border"
          >
            <ArrowLeft size={20} />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2">➖ การลบที่ผลลัพธ์ไม่เกิน 1,000</h1>
        <p className="text-zinc-600 mt-1 text-base">ตอบผลลัพธ์ของโจทย์ลบ 2 หรือ 3 จำนวน โดยผลลัพธ์ไม่เกิน 1,000</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        {/* === Control Panel === */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* จำนวนข้อ */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนข้อ:</span>
            {[10, 15, 20, 30].map((n) => (
              <button key={n} onClick={() => applyNewCount(n)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${count === n ? "bg-sky-600 text-white border-sky-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>{n}</button>
            ))}
          </div>

          {/* ระดับ */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">ระดับ:</span>
            {[{ key: "easy", label: "ง่าย" }, { key: "medium", label: "ปานกลาง" }, { key: "hard", label: "ยาก" }].map((lv) => (
              <button key={lv.key} onClick={() => applyLevel(lv.key)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${level === lv.key ? "bg-purple-600 text-white border-purple-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>{lv.label}</button>
            ))}
          </div>

          {/* จำนวนหลัก */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนหลัก:</span>
            {[1, 2, 3].map((d) => (
              <button key={d} onClick={() => applyDigits(d)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${digits === d ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>{d} หลัก</button>
            ))}
          </div>

          {/* การยืม */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">การยืม:</span>
            {[{ val: true, label: "มี" }, { val: false, label: "ไม่มี" }].map((opt) => (
              <button key={opt.label} onClick={() => applyBorrow(opt.val)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${allowBorrow === opt.val ? "bg-rose-600 text-white border-rose-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>{opt.label}</button>
            ))}
          </div>

          {/* จำนวนชุดตัวเลข */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนชุดตัวเลข:</span>
            {[{k:2,label:"2 จำนวน"},{k:3,label:"3 จำนวน"}].map(op => (
              <button key={op.k} onClick={() => applyOperands(op.k)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${operands===op.k?"bg-teal-600 text-white border-teal-600":"bg-zinc-50 hover:bg-zinc-100"}`}>{op.label}</button>
            ))}
          </div>

          {/* action buttons */}
          <button onClick={resetAll} className="px-5 py-3 rounded-2xl text-lg bg-sky-600 text-white hover:bg-sky-700 shadow-lg">🔄 สุ่มชุดใหม่ (New Set)</button>
          <button onClick={checkAnswers} className="px-5 py-3 rounded-2xl text-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">✅ ตรวจคำตอบ (Check)</button>
          <button onClick={() => showAll({ openSummary: true })} className="px-5 py-3 rounded-2xl text-lg bg-amber-500 text-white hover:bg-amber-600 shadow-lg">👀 เฉลยทั้งหมด (Show Answers)</button>

          {/* Live timer */}
          <div className="ml-auto text-base bg-sky-50 border-2 border-sky-200 rounded-full px-4 py-2 font-semibold">⏱️ เวลา: <span className="font-semibold">{formatMS(elapsedMs)}</span>{startedAt && !finishedAt && <span className="text-zinc-400"> (นับอยู่)</span>}</div>
        </div>

        {/* Problems grid */}
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
            />
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="mt-6 flex justify-center">
          <button onClick={checkAnswers} className="px-8 py-4 rounded-3xl text-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">✅ ตรวจคำตอบ</button>
        </div>

        {/* History panel */}
        <section className="mt-10 max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-base font-semibold">สถิติรอบที่ผ่านมา</h2>
            <button onClick={clearHistory} className="ml-auto text-xs px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200">ล้างสถิติ</button>
          </div>
          {history.length === 0 ? (
            <div className="text-sm text-zinc-500">ยังไม่มีสถิติ ลองทำโจทย์แล้วกด “ตรวจคำตอบ” แล้วกดปุ่ม “ปิด” เพื่อบันทึก</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-500">
                  <tr>
                    <th className="py-2 pr-3">วันที่/เวลา</th>
                    <th className="py-2 pr-3">ระดับ</th>
                    <th className="py-2 pr-3">จำนวนข้อ</th>
                    <th className="py-2 pr-3">เวลา</th>
                    <th className="py-2 pr-3">คะแนน</th>
                    <th className="py-2 pr-3">ระดับ</th>
                    <th className="py-2 pr-3">ดูผล</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(h.ts)}</td>
                      <td className="py-2 pr-3">{h.level === 'easy' ? 'ง่าย' : h.level === 'medium' ? 'ปานกลาง' : 'ยาก'}</td>
                      <td className="py-2 pr-3">{h.count}</td>
                      <td className="py-2 pr-3">{formatMS(h.durationMs)}</td>
                      <td className="py-2 pr-3">{h.correct}/{h.count}</td>
                      <td className="py-2 pr-3">{[0,1,2].map(s => (<span key={`star-h-${s}`} className={s < (h.stars || 0) ? 'text-amber-400' : 'text-zinc-300'}>★</span>))}</td>
                      <td className="py-2 pr-3"><button onClick={() => openHistory(i)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 hover:shadow-sm transition">👁️ <span className="font-medium">ดูผล</span></button></td>
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
        onSave={saveStats}
        alreadyShowing={showAnswers}
      />

      <footer className="max-w-6xl mx-auto p-6 text-xs text-zinc-500">© Interactive math worksheet — subtraction ≤ 1000.</footer>
    </div>
  );
};

export default SubtractionApp;
