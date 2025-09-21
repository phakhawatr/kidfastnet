import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// ---------- Utilities ----------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomProblems(n = 6) {
  const problems = [];
  for (let i = 0; i < n; i++) {
    const a = randInt(1, 20);
    const b = randInt(1, 20);
    problems.push({ a, b, answer: a + b });
  }
  return problems;
}

const exampleProblems = [
  { a: 5, b: 3, answer: 8 },
  { a: 12, b: 7, answer: 19 },
  { a: 8, b: 4, answer: 12 },
  { a: 15, b: 6, answer: 21 },
  { a: 9, b: 9, answer: 18 },
  { a: 11, b: 5, answer: 16 },
];

// ---------- Problem Card ----------
function ProblemCard({ idx, problem, answer, setAnswer, result, showAnswer, onReset }) {
  const inputRef = useRef(null);

  useEffect(() => {
    // autofocus first empty field
    if (!answer && inputRef.current) inputRef.current.focus();
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

  return (
    <div className={`rounded-2xl border ${border} bg-white shadow-sm p-6 flex flex-col items-center gap-4`}>
      <div className="text-center text-sm text-zinc-500">โจทย์ที่ {idx + 1}</div>
      
      {/* Problem Display */}
      <div className="text-center">
        <div className="text-4xl font-bold text-zinc-800 mb-2">
          {problem.a} + {problem.b}
        </div>
        <div className="text-2xl text-zinc-600">=</div>
      </div>

      {/* Answer Input */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          inputMode="numeric"
          maxLength={3}
          className="w-20 text-center text-2xl border rounded-xl py-3 px-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="?"
          value={answer}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setAnswer(idx, v.slice(0, 3));
          }}
        />
      </div>

      {/* Status Message */}
      <div className="h-6 text-sm">
        {status === "correct" && <span className="text-green-600">✅ ถูกต้อง!</span>}
        {status === "wrong" && <span className="text-red-500">❌ ลองใหม่อีกครั้ง</span>}
        {status === "showing" && (
          <span className="text-sky-700">คำตอบ: {problem.answer}</span>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => onReset(idx)}
        className="text-xs px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200"
      >
        ล้างคำตอบ
      </button>
    </div>
  );
}

// ---------- Main Addition App ----------
export default function AdditionApp() {
  const [problems, setProblems] = useState(() => generateRandomProblems(6));
  const [answers, setAnswers] = useState(() => problems.map(() => ""));
  const [results, setResults] = useState(() => problems.map(() => "pending"));
  const [showAnswers, setShowAnswers] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  function setAnswer(idx, val) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? val : a)));
  }

  function resetAll(toProblems = null) {
    const newProblems = toProblems ?? generateRandomProblems(6);
    setProblems(newProblems);
    setAnswers(newProblems.map(() => ""));
    setResults(newProblems.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
  }

  function checkAnswers() {
    const newResults = problems.map((p, i) => {
      const userAnswer = parseInt(answers[i], 10);
      if (isNaN(userAnswer)) return "wrong";
      return userAnswer === p.answer ? "correct" : "wrong";
    });
    setResults(newResults);

    if (newResults.every((r) => r === "correct")) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2500);
    } else {
      setCelebrate(false);
    }
  }

  function showAll() {
    setShowAnswers(true);
    setResults(problems.map(() => "pending"));
  }

  function onReset(idx) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? "" : a)));
    setResults((prev) => prev.map((r, i) => (i === idx ? "pending" : r)));
  }

  // Confetti component
  const Confetti = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white text-zinc-800">
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
        <h1 className="text-2xl sm:text-3xl font-bold">ฝึกการบวกเลข ➕ – Addition Practice</h1>
        <p className="text-zinc-600 mt-1 text-sm">
          คำนวณผลบวกของเลขสองตัว เขียนคำตอบในช่องที่กำหนด
        </p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => resetAll()}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow"
          >
            🔄 สุ่มโจทย์ใหม่ (New Problems)
          </button>
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
          <button
            onClick={() => resetAll(exampleProblems)}
            className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 shadow"
          >
            📄 โหลดโจทย์ตัวอย่าง (Load Examples)
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <ProblemCard
              key={i}
              idx={i}
              problem={p}
              result={results[i]}
              showAnswer={showAnswers}
              answer={answers[i]}
              setAnswer={setAnswer}
              onReset={onReset}
            />
          ))}
        </div>

        <section className="mt-8 max-w-3xl text-sm text-zinc-600 leading-relaxed">
          <h2 className="font-semibold text-zinc-800">เคล็ดลับการสอน (Tips for Teachers)</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>เริ่มจากตัวเลขเล็กๆ ก่อน แล้วค่อยเพิ่มความยาก</li>
            <li>ให้เด็กใช้นิ้วหรือของเล่นช่วยนับในตอนเริ่มต้น</li>
            <li>ฝึกให้จำรูปแบบการบวกที่เจอบ่อยๆ เช่น 5+5=10, 10+10=20</li>
            <li>ชมเชยเมื่อทำถูก และให้กำลังใจเมื่อทำผิด</li>
          </ul>
        </section>
      </main>

      {celebrate && <Confetti />}

      <footer className="max-w-6xl mx-auto p-6 text-xs text-zinc-500">
        © แบบฝึกหัดคณิตศาสตร์สำหรับเด็ก — สามารถสุ่มโจทย์ใหม่ได้ตลอดเวลา
      </footer>
    </div>
  );
}