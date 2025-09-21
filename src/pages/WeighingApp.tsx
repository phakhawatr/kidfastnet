import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// ================= Utilities =================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateWeighingProblems(n = 6, level = "easy") {
  const objects = [
    { name: "กะหล่ำปลี", emoji: "🥬", minWeight: 1, maxWeight: 3 },
    { name: "ส้มโอ", emoji: "🍊", minWeight: 0.5, maxWeight: 2 },
    { name: "ฟักทong", emoji: "🎃", minWeight: 1, maxWeight: 4 },
    { name: "เกลือ", emoji: "🧂", minWeight: 0.5, maxWeight: 1 },
    { name: "แอปเปิ้ล", emoji: "🍎", minWeight: 0.2, maxWeight: 0.8 },
    { name: "มะนาว", emoji: "🍋", minWeight: 0.1, maxWeight: 0.5 },
    { name: "กล้วย", emoji: "🍌", minWeight: 0.5, maxWeight: 1.5 },
    { name: "มะม่วง", emoji: "🥭", minWeight: 0.3, maxWeight: 1.2 },
  ];

  const problems = [];
  
  for (let i = 0; i < n; i++) {
    const obj = objects[randInt(0, objects.length - 1)];
    let weight;
    
    if (level === "easy") {
      // Easy: whole numbers only (0.5, 1, 1.5, 2, etc.)
      weight = (randInt(obj.minWeight * 2, obj.maxWeight * 2) / 2);
    } else if (level === "medium") {
      // Medium: 0.1 increments
      weight = (randInt(obj.minWeight * 10, obj.maxWeight * 10) / 10);
    } else {
      // Hard: 0.05 increments
      weight = (randInt(obj.minWeight * 20, obj.maxWeight * 20) / 20);
    }
    
    problems.push({
      object: obj,
      weight: Math.round(weight * 100) / 100, // Round to 2 decimal places
      id: `${obj.name}-${i}`,
    });
  }
  
  return problems;
}

function formatWeight(weight) {
  return weight % 1 === 0 ? `${weight}` : weight.toFixed(weight * 10 % 1 === 0 ? 1 : 2);
}

// ================= Scale Component =================
function WeighingScale({ weight, maxWeight = 5 }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  
  // Calculate angle for the needle (0-5 kg scale)
  const angle = (weight / maxWeight) * 180 - 90; // -90 to 90 degrees
  
  // Draw scale markings
  const ticks = [];
  for (let i = 0; i <= maxWeight; i++) {
    const tickAngle = (i / maxWeight) * 180 - 90;
    const tickRad = (Math.PI / 180) * tickAngle;
    const innerR = r - 10;
    const outerR = r;
    
    const x1 = cx + innerR * Math.cos(tickRad);
    const y1 = cy + innerR * Math.sin(tickRad);
    const x2 = cx + outerR * Math.cos(tickRad);
    const y2 = cy + outerR * Math.sin(tickRad);
    
    ticks.push(
      <g key={i}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x={cx + (r + 15) * Math.cos(tickRad)}
          y={cy + (r + 15) * Math.sin(tickRad)}
          textAnchor="middle"
          dy="0.35em"
          className="text-sm font-semibold"
        >
          {i}
        </text>
      </g>
    );
  }
  
  // Needle
  const needleRad = (Math.PI / 180) * angle;
  const needleX = cx + (r - 20) * Math.cos(needleRad);
  const needleY = cy + (r - 20) * Math.sin(needleRad);
  
  return (
    <div className="flex flex-col items-center">
      {/* Scale platform */}
      <div className="w-32 h-6 bg-gray-300 border-2 border-gray-400 rounded-lg mb-2"></div>
      
      {/* Scale dial */}
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto text-zinc-700 max-w-[160px]">
        {/* Scale face */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="white"
          stroke="currentColor"
          strokeWidth="3"
        />
        
        {/* Scale markings */}
        {ticks}
        
        {/* Scale label */}
        <text
          x={cx}
          y={cy - 25}
          textAnchor="middle"
          className="text-xs font-semibold"
        >
          กิโลกรัม
        </text>
        
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="red"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Center dot */}
        <circle
          cx={cx}
          cy={cy}
          r="4"
          fill="red"
        />
        
        {/* Base */}
        <path
          d={`M ${cx - r - 10} ${cy} L ${cx - r - 5} ${cy + 20} L ${cx + r + 5} ${cy + 20} L ${cx + r + 10} ${cy} Z`}
          fill="#ddd"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

// ================= Problem Card =================
function WeighingCard({ idx, problem, answer, setAnswer, result, showAnswer, onReset, onFirstType }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!answer && inputRef.current) inputRef.current.focus();
  }, []);

  const status = useMemo(() => (showAnswer ? "showing" : result), [showAnswer, result]);
  const border =
    status === "correct" ? "border-green-400" : status === "wrong" ? "border-red-300" : "border-zinc-200";

  const pastel = ["bg-yellow-50", "bg-sky-50", "bg-pink-50", "bg-green-50", "bg-purple-50", "bg-orange-50"];
  const bg = pastel[idx % pastel.length];

  return (
    <div className={`rounded-3xl border-2 ${border} ${bg} shadow-md p-6 flex flex-col gap-4`}>
      <div className="text-base text-zinc-600 font-semibold">⚖️ ข้อ {idx + 1}</div>
      
      {/* Object on scale */}
      <div className="text-center">
        <div className="text-6xl mb-2">{problem.object.emoji}</div>
        <div className="text-lg font-semibold text-zinc-700 mb-4">{problem.object.name}</div>
        
        {/* Weighing Scale */}
        <WeighingScale weight={problem.weight} maxWeight={5} />
      </div>

      {/* Answer Input */}
      <div className="text-center">
        <div className="text-lg mb-2">หนัก</div>
        <div className="flex items-center justify-center gap-2">
          <input
            ref={inputRef}
            inputMode="decimal"
            className="w-20 text-center text-xl border-2 border-sky-300 rounded-xl py-2 px-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="?"
            value={answer}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, "");
              if (v === "" || /^\d*\.?\d*$/.test(v)) {
                if (!answer) onFirstType?.();
                setAnswer(idx, v);
              }
            }}
          />
          <span className="text-lg font-semibold">กิโลกรัม</span>
        </div>
      </div>

      {/* Status Message */}
      <div className="h-6 text-sm text-center">
        {status === "correct" && <span className="text-green-600">✅ ถูกต้อง!</span>}
        {status === "wrong" && <span className="text-red-500">❌ ลองใหม่อีกครั้ง</span>}
        {status === "showing" && (
          <span className="text-sky-700">คำตอบ: {formatWeight(problem.weight)} กิโลกรัม</span>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => onReset(idx)}
        className="text-sm px-4 py-2 rounded-full bg-white border hover:bg-zinc-50"
      >
        ล้างคำตอบ
      </button>
    </div>
  );
}

// ================= Main App =================
export default function WeighingApp() {
  const [level, setLevel] = useState("easy");
  const [count, setCount] = useState(6);
  const [problems, setProblems] = useState(() => generateWeighingProblems(6, "easy"));
  const [answers, setAnswers] = useState(() => problems.map(() => ""));
  const [results, setResults] = useState(() => problems.map(() => "pending"));
  const [showAnswers, setShowAnswers] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // Timer states
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  function setAnswer(idx, val) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? val : a)));
  }

  function startTimerIfNeeded() {
    if (!startedAt) {
      setStartedAt(Date.now());
      setElapsedMs(0);
    }
  }

  function resetAll() {
    const next = generateWeighingProblems(count, level);
    setProblems(next);
    setAnswers(next.map(() => ""));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setElapsedMs(0);
  }

  function applyLevel(lv) {
    setLevel(lv);
    const next = generateWeighingProblems(count, lv);
    setProblems(next);
    setAnswers(next.map(() => ""));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setElapsedMs(0);
  }

  function applyCount(n) {
    setCount(n);
    const next = generateWeighingProblems(n, level);
    setProblems(next);
    setAnswers(next.map(() => ""));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setElapsedMs(0);
  }

  function checkAnswers() {
    const next = problems.map((p, i) => {
      const userAnswer = parseFloat(answers[i]);
      if (isNaN(userAnswer)) return "wrong";
      const tolerance = level === "easy" ? 0.1 : level === "medium" ? 0.05 : 0.02;
      return Math.abs(userAnswer - p.weight) <= tolerance ? "correct" : "wrong";
    });
    setResults(next);

    if (next.every((r) => r === "correct")) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2500);
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

  function formatMS(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${mm}:${String(ss).padStart(2, "0")}`;
  }

  const Confetti = () => (
    <div className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-blue-50 text-zinc-800">
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
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2">⚖️ ฝึกชั่งน้ำหนัก</h1>
        <p className="text-zinc-600 mt-1 text-base">อ่านค่าน้ำหนักจากเครื่องชั่งและเขียนคำตอบเป็นกิโลกรัม</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-emerald-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนข้อ:</span>
            {[6, 9, 12].map((n) => (
              <button
                key={n}
                onClick={() => applyCount(n)}
                className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${
                  count === n ? "bg-emerald-600 text-white border-emerald-600" : "bg-zinc-50 hover:bg-zinc-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-emerald-100 shadow-sm">
            <span className="text-sm text-zinc-600">ระดับ:</span>
            {[
              { key: "easy", label: "ง่าย (0.5kg)" },
              { key: "medium", label: "ปานกลาง (0.1kg)" },
              { key: "hard", label: "ยาก (0.05kg)" },
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

          <button onClick={resetAll} className="px-5 py-3 rounded-2xl text-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
            🔄 สุ่มชุดใหม่
          </button>
          <button onClick={checkAnswers} className="px-5 py-3 rounded-2xl text-lg bg-sky-600 text-white hover:bg-sky-700 shadow-lg">
            ✅ ตรวจคำตอบ
          </button>
          <button onClick={showAll} className="px-5 py-3 rounded-2xl text-lg bg-amber-500 text-white hover:bg-amber-600 shadow-lg">
            👀 เฉลยทั้งหมด
          </button>

          {/* Timer */}
          <div className="ml-auto text-base bg-emerald-50 border-2 border-emerald-200 rounded-full px-4 py-2 font-semibold">
            ⏱️ เวลา: <span className="font-semibold">{formatMS(elapsedMs)}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <WeighingCard
              key={i}
              idx={i}
              problem={p}
              answer={answers[i]}
              setAnswer={setAnswer}
              result={results[i]}
              showAnswer={showAnswers}
              onReset={onReset}
              onFirstType={startTimerIfNeeded}
            />
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="mt-8 flex justify-center">
          <button onClick={checkAnswers} className="px-8 py-4 rounded-3xl text-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
            ✅ ตรวจคำตอบ
          </button>
        </div>

        {/* Tips Section */}
        <section className="mt-10 max-w-4xl text-sm text-zinc-600 leading-relaxed">
          <h2 className="font-semibold text-zinc-800 text-lg mb-3">💡 เคล็ดลับการอ่านเครื่องชั่ง</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="list-disc pl-6 space-y-2">
              <li>ดูตำแหน่งเข็มชี้ที่หน่วยกิโลกรัม (kg)</li>
              <li>เข็มชี้ตรงเลข = น้ำหนักเท่ากับเลขนั้น</li>
              <li>เข็มชี้ระหว่างเลข = น้ำหนักอยู่ระหว่างเลขนั้น</li>
            </ul>
            <ul className="list-disc pl-6 space-y-2">
              <li>1 กิโลกรัม = 1,000 กรัม</li>
              <li>0.5 กิโลกรัม = 500 กรัม (ครึ่งกิโลกรัม)</li>
              <li>ระวังทศนิยม เช่น 1.5 kg = 1 กิโลกรัมครึ่ง</li>
            </ul>
          </div>
        </section>
      </main>

      {celebrate && <Confetti />}

      <footer className="max-w-6xl mx-auto p-6 text-xs text-zinc-500">
        © แบบฝึกหัดการชั่งน้ำหนัก — เรียนรู้การอ่านเครื่องชั่งและหน่วยกิโลกรัม
      </footer>
    </div>
  );
}