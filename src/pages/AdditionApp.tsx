import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

function pickByDifficulty(level, digits) {
  const { min, max } = rangeForDigits(digits);
  const a = randInt(min, max);
  const b = randInt(min, max);
  const s = a + b;
  if (s > 1000) return null;

  const carries = countCarries(a, b);
  if (level === "easy" && carries > 0) return null; // no carry
  if (level === "medium" && carries < 1) return null; // at least one carry
  if (level === "hard") {
    if (carries < 1) return null;
    // only require near-1000 when digits allow it
    if (max * 2 >= 700 && s < 700) return null;
  }
  return { a, b };
}

function generateAdditionProblems(n = 15, level = "easy", digits = 2) {
  const probs = [];
  const used = new Set();
  let guard = 0;
  while (probs.length < n && guard < 20000) {
    guard++;
    const pair = pickByDifficulty(level, digits);
    if (!pair) continue;
    const { a, b } = pair;
    const x = Math.min(a, b);
    const y = Math.max(a, b);
    const key = x + "+" + y;
    if (used.has(key)) continue;
    used.add(key);
    probs.push({ a, b });
  }
  // Fallback: relax to easy constraints with same digits if needed
  const { min, max } = rangeForDigits(digits);
  while (probs.length < n) {
    const a = randInt(min, max);
    const b = randInt(min, max);
    if (a + b > 1000) continue;
    const x = Math.min(a, b);
    const y = Math.max(a, b);
    const key = x + "+" + y;
    if (used.has(key)) continue;
    used.add(key);
    probs.push({ a, b });
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
function praiseText(pct) {
  if (pct === 100) return "สุดยอด! ทำได้ครบถ้วน เก่งมาก 👏";
  if (pct >= 90) return "เยี่ยมมาก! ใกล้ 100% แล้ว อีกนิดเดียว 💪";
  if (pct >= 80) return "ดีมาก! พัฒนาขึ้นเรื่อย ๆ สู้ๆ ✨";
  if (pct >= 60) return "เริ่มดีแล้ว ลองทบทวนอีกนิดจะยิ่งดีขึ้น 😊";
  return "ไม่เป็นไร ลองใหม่อีกครั้งนะ เราทำได้! 🌟";
}

// convert per-digit answer array to number
function answerToNumber(ansArr, digits) {
  if (!Array.isArray(ansArr)) return NaN;
  if (ansArr.length !== digits) return NaN;
  if (ansArr.some((d) => d === "")) return NaN;
  return parseInt(ansArr.join(""), 10);
}

// ================= One Problem Card =================
function ProblemCard({ idx, prob, answer, setAnswer, result, showAnswer, onReset, onFirstType, digits }) {
  const inputRef = useRef(null);
  const inputRefs = useRef([]);
  const [carry, setCarry] = useState(() => Array(digits).fill(""));

  useEffect(() => {
    const empty = !answer || (Array.isArray(answer) && answer.every((d) => !d));
    if (empty && inputRef.current) inputRef.current.focus();
  }, []);

  const status = useMemo(() => (showAnswer ? "showing" : result), [showAnswer, result]);
  const border =
    status === "correct" ? "border-green-400" : status === "wrong" ? "border-red-300" : "border-zinc-200";

  const correct = prob.a + prob.b;

  // pastel background per card for kid-friendly feel
  const pastel = ["bg-yellow-50","bg-sky-50","bg-pink-50","bg-green-50","bg-purple-50"];
  const bg = pastel[idx % pastel.length];

  return (
    <div className={`rounded-3xl border-2 ${border} ${bg} shadow-md p-5 flex flex-col gap-3`}>
      <div className="text-base text-zinc-600">⭐ ข้อ {idx + 1}</div>

      {/* Column format like worksheet image + per-digit answer */}
      <div className="flex justify-center mt-1 select-none">
        <div>
          {/* Carry row (ตัวทด) */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `repeat(${digits + 1}, 3rem)` }}>
            <div className="w-12 h-9" />
            {Array.from({ length: digits }).map((_, j) => (
              <input
                key={`car${j}`}
                inputMode="numeric"
                maxLength={1}
                disabled={showAnswer}
                className={`w-12 h-9 text-center border rounded-md text-xl bg-white ${showAnswer ? 'opacity-60 border-zinc-200' : 'border-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-200'}`}
                value={carry[j] || ""}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0,1);
                  setCarry((prev) => prev.map((d, k) => (k === j ? v : d)));
                }}
              />
            ))}
          </div>
          {/* Grid for a and b with left + column */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${digits + 1}, 3rem)` }}>
            {/* Row 1: empty plus cell + digits of a */}
            <div className="w-12 h-12" />
            {String(prob.a).padStart(digits, " ").split("").map((ch, i) => (
              <div key={`a${i}`} className="w-12 h-12 border border-sky-200 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold">{ch.trim()}</div>
            ))}
            {/* Row 2: plus sign + digits of b */}
            <div className="w-12 h-12 border border-sky-200 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold text-zinc-500">+</div>
            {String(prob.b).padStart(digits, " ").split("").map((ch, i) => (
              <div key={`b${i}`} className="w-12 h-12 border border-sky-200 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold">{ch.trim()}</div>
            ))}
          </div>
          {/* underline */}
          <div className="ml-12 border-t-4 border-zinc-400 mt-2" />
          {/* Row 3: answer cells (inputs or revealed) */}
          <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `repeat(${digits + 1}, 3rem)` }}>
            <div className="w-12 h-12" />
            {showAnswer
              ? String((prob.a + prob.b)).padStart(digits, " ").slice(-digits).split("").map((ch, j) => (
                  <div key={`c${j}`} className="w-12 h-12 border-2 border-sky-300 bg-white rounded-md flex items-center justify-center text-3xl font-extrabold text-sky-700">
                    {ch.trim()}
                  </div>
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
                      if (v && emptyBefore) onFirstType?.();
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
        <button onClick={() => onReset(idx)} className="text-sm px-4 py-2 rounded-full bg-white border hover:bg-zinc-50">
          ล้างตอบ
        </button>
      </div>
    </div>
  );
}

// ================= Main App =================
export default function AdditionApp() {
  const [count, setCount] = useState(15);
  const [level, setLevel] = useState("easy"); // easy | medium | hard
  const [digits, setDigits] = useState(2);
  const [problems, setProblems] = useState(() => generateAdditionProblems(15, "easy", 2));
  const [answers, setAnswers] = useState(() => problems.map(() => Array(digits).fill("")));
  const [results, setResults] = useState(() => problems.map(() => "pending")); // pending | correct | wrong
  const [showAnswers, setShowAnswers] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // summary modal states
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  
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

  useEffect(() => {
    try {
      localStorage.setItem("add1000_history", JSON.stringify(history));
    } catch {}
  }, [history]);

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
    }
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  }

  function finalizeAndLog(endTs = Date.now()) {
    const duration = startedAt ? endTs - startedAt : 0;
    const correct = problems.reduce((acc, p, i) => {
      const ans = answerToNumber(answers[i], digits);
      return acc + (ans === p.a + p.b ? 1 : 0);
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
    const snapshot = problems.map((p, i) => ({ a: p.a, b: p.b, answer: (answers[i] || []).join(""), correct: p.a + p.b }));
    const correct2 = snapshot.reduce((t, s, i) => t + ((answerToNumber(answers[i], digits) === s.correct) ? 1 : 0), 0);
    const entry2 = { ts: end, level, digits, count, durationMs: Math.max(0, duration), correct: correct2, stars: calcStars(correct2, count), snapshot };
    setHistory((prev) => [entry2, ...prev].slice(0, 10));
  }

  function applyNewCount(n) {
    if (startedAt && !showAnswers) finalizeAndLog(Date.now());

    setCount(n);
    const next = generateAdditionProblems(n, level, digits);
    setProblems(next);
    setAnswers(next.map(() => Array(digits).fill("")));

    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setFinishedAt(null);
    setElapsedMs(0);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  }

  function applyLevel(lv) {
    if (startedAt && !showAnswers) finalizeAndLog(Date.now());

    setLevel(lv);
    const next = generateAdditionProblems(count, lv, digits);
    setProblems(next);
    setAnswers(next.map(() => Array(digits).fill("")));

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
    const next = generateAdditionProblems(count, level, d);
    setProblems(next);
    setAnswers(next.map(() => Array(d).fill("")));
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

    const next = generateAdditionProblems(count, level, digits);
    setProblems(next);
    setAnswers(next.map(() => Array(digits).fill("")));

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
      const ans = answerToNumber(answers[i], digits);
      return ans === p.a + p.b ? "correct" : "wrong";
    });
    setResults(next);

    const correctCount = next.filter((r) => r === "correct").length;
    const now = Date.now();
    if (startedAt) setElapsedMs(now - startedAt);
    setSummary({
      correct: correctCount,
      total: problems.length,
      elapsedMs: startedAt ? now - startedAt : elapsedMs,
      level,
      count,
    });
    setShowSummary(true);

    if (next.every((r) => r === "correct")) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2000);
    } else {
      setCelebrate(false);
    }
  }

  function showAll(opts = { openSummary: true }) {
    const end = Date.now();
    const correctNow = problems.reduce((acc, p, i) => {
      const ans = answerToNumber(answers[i], digits);
      return acc + (ans === p.a + p.b ? 1 : 0);
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
    setAnswers((prev) => prev.map((a, i) => (i === idx ? Array(digits).fill("") : a)));
    setResults((prev) => prev.map((r, i) => (i === idx ? "pending" : r)));
  }

  function clearHistory() {
    setHistory([]);
    try { localStorage.removeItem("add1000_history"); } catch {}
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
              <div className="font-bold text-lg">ผลการทำที่ผ่านมา • {fmtDate(item.ts)}</div>
              <button onClick={onClose} className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200">ปิด</button>
            </div>

            {/* Scrollable content */}
            <div className="p-4 overflow-y-auto flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
              {!hasSnap ? (
                <div className="text-sm text-zinc-500">รายการนี้ไม่มีข้อมูลโจทย์ที่บันทึกไว้</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.snapshot.map((s, idx) => {
                    const ok = parseInt(s.answer, 10) === s.correct;
                    return (
                      <div key={idx} className="rounded-2xl border bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-500">ข้อ {idx + 1}</div>
                          <div className={ok ? "text-emerald-600 text-xl" : "text-rose-600 text-xl"}>{ok ? "✅" : "❌"}</div>
                        </div>
                        <div className="text-2xl font-bold my-1">{s.a} + {s.b} = <span className="text-sky-700">{s.correct}</span></div>
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

  const SummaryModal = ({ open, onClose, data, onShowAnswers, alreadyShowing, onSave }) => {
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
              <span key={`${i}-${digits}`} className={i < stars ? 'text-amber-400 text-3xl' : 'text-zinc-300 text-3xl'}>★</span>
            ))}
          </div>
          <div className="text-center text-sm mt-1 text-zinc-600">{msg}</div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-zinc-500">คะแนน</div>
              <div className="text-2xl font-semibold">{data.correct}/{data.total}</div>
              <div className="text-xs text-zinc-400">{pct}%</div>
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
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับ</span>
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2">🧮 การบวกที่ผลบวกไม่เกิน 1,000</h1>
        <p className="text-zinc-600 mt-1 text-base">ตอบผลลัพธ์ของโจทย์บวก 2 จำนวน โดยผลบวกไม่เกิน 1,000</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนข้อ:</span>
            {[10, 15, 20, 30].map((n) => (
              <button
                key={n}
                onClick={() => applyNewCount(n)}
                className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                  count === n ? "bg-sky-600 text-white border-sky-600" : "bg-zinc-50 hover:bg-zinc-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">ระดับ:</span>
            {[
              { key: "easy", label: "ง่าย" },
              { key: "medium", label: "ปานกลาง" },
              { key: "hard", label: "ยาก" },
            ].map((lv) => (
              <button
                key={lv.key}
                onClick={() => applyLevel(lv.key)}
                className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                  level === lv.key ? "bg-purple-600 text-white border-purple-600" : "bg-zinc-50 hover:bg-zinc-100"
                }`}
              >
                {lv.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-sky-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนหลัก:</span>
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => applyDigits(d)}
                className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                  digits === d ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-50 hover:bg-zinc-100"
                }`}
              >
                {d} หลัก
              </button>
            ))}
          </div>

          <button onClick={resetAll} className="px-5 py-3 rounded-2xl text-lg bg-sky-600 text-white hover:bg-sky-700 shadow-lg">
            🔄 สุ่มชุดใหม่ (New Set)
          </button>
          <button onClick={checkAnswers} className="px-5 py-3 rounded-2xl text-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
            ✅ ตรวจคำตอบ (Check)
          </button>
          <button onClick={() => showAll({ openSummary: true })} className="px-5 py-3 rounded-2xl text-lg bg-amber-500 text-white hover:bg-amber-600 shadow-lg">
            👀 เฉลยทั้งหมด (Show Answers)
          </button>

          {/* Live timer always visible */}
          <div className="ml-auto text-base bg-sky-50 border-2 border-sky-200 rounded-full px-4 py-2 font-semibold">
            ⏱️ เวลา: <span className="font-semibold">{formatMS(elapsedMs)}</span>
            {startedAt && !finishedAt && <span className="text-zinc-400"> (นับอยู่)</span>}
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
            />
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="mt-6 flex justify-center">
          <button onClick={checkAnswers} className="px-8 py-4 rounded-3xl text-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
            ✅ ตรวจคำตอบ
          </button>
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
                      <td className="py-2 pr-3">
                        {[0,1,2].map(i => (
                          <span key={i} className={i < (h.stars || 0) ? 'text-amber-400' : 'text-zinc-300'}>★</span>
                        ))}
                      </td>
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

      <footer className="max-w-6xl mx-auto p-6 text-xs text-zinc-500">© Interactive math worksheet — addition ≤ 1000.</footer>
    </div>
  );
}
