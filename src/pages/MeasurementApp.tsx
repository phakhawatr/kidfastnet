import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// ================= Utilities =================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateMeasurementProblems(n = 6, level = "easy") {
  const objects = [{
    name: "เด็กหญิง",
    emoji: "👧",
    minHeight: 80,
    maxHeight: 150,
    unit: "cm",
    type: "person"
  }, {
    name: "เด็กชาย",
    emoji: "👦",
    minHeight: 85,
    maxHeight: 155,
    unit: "cm",
    type: "person"
  }, {
    name: "ยีราฟ",
    emoji: "🦒",
    minHeight: 300,
    maxHeight: 500,
    unit: "cm",
    type: "animal"
  }, {
    name: "ต้นไม้",
    emoji: "🌲",
    minHeight: 200,
    maxHeight: 500,
    unit: "cm",
    type: "plant"
  }, {
    name: "อาคาร",
    emoji: "🏢",
    minHeight: 300,
    maxHeight: 500,
    unit: "cm",
    type: "building"
  }, {
    name: "โต๊ะ",
    emoji: "🪑",
    minHeight: 60,
    maxHeight: 90,
    unit: "cm",
    type: "furniture"
  }, {
    name: "ประตู",
    emoji: "🚪",
    minHeight: 180,
    maxHeight: 220,
    unit: "cm",
    type: "structure"
  }, {
    name: "ดินสอ",
    emoji: "✏️",
    minHeight: 15,
    maxHeight: 20,
    unit: "cm",
    type: "object"
  }];
  const problems = [];
  for (let i = 0; i < n; i++) {
    const obj = objects[randInt(0, objects.length - 1)];
    let height;
    if (level === "easy") {
      // Easy: round numbers (10, 20, 50, 100, etc.)
      const baseHeight = randInt(obj.minHeight, obj.maxHeight);
      height = Math.round(baseHeight / 10) * 10;
    } else if (level === "medium") {
      // Medium: 5 cm increments
      const baseHeight = randInt(obj.minHeight, obj.maxHeight);
      height = Math.round(baseHeight / 5) * 5;
    } else {
      // Hard: any whole number
      height = randInt(obj.minHeight, obj.maxHeight);
    }
    problems.push({
      object: obj,
      height: height,
      id: `${obj.name}-${i}`,
      meters: Math.floor(height / 100),
      centimeters: height % 100
    });
  }
  return problems;
}

// ================= Ruler Component =================
function Ruler({
  height,
  maxHeight = 500
}) {
  const rulerHeight = 400;
  const scale = height / maxHeight;
  const pixelHeight = rulerHeight * scale;

  // Generate ruler markings - 50cm intervals
  const markings = [];
  const step = 50; // 50cm intervals

  for (let i = 0; i <= maxHeight / step; i++) {
    const value = i * step;
    const y = rulerHeight - value / maxHeight * rulerHeight + 10; // +10 for top margin
    const isMainMark = i % 5 === 0; // Every 250cm is a major mark
    markings.push(<g key={i}>
        <line x1={isMainMark ? 0 : 10} y1={y} x2={30} y2={y} stroke="#333" strokeWidth={isMainMark ? 2 : 1} />
        {(i % 2 === 0 || isMainMark) && <text x={35} y={y + 4} fontSize="10" fill="#333" className="select-none">
            {value}
          </text>}
      </g>);
  }
  return <div className="flex items-center justify-center">
      <svg width="80" height={rulerHeight + 20} className="border rounded">
        {/* Ruler body */}
        <rect x="0" y="10" width="30" height={rulerHeight} fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
        
        {/* Markings */}
        {markings}
        
        {/* Measurement arrow - starts from 0 (bottom) and points upward */}
        <line x1="40" y1={rulerHeight + 10} x2="40" y2={rulerHeight + 10 - pixelHeight} stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowhead-up)" />
        
        {/* Arrow starting point indicator at 0 */}
        <circle cx="40" cy={rulerHeight + 10} r="2" fill="#dc2626" />
        
        <defs>
          <marker id="arrowhead-up" markerWidth="8" markerHeight="8" refX="4" refY="2" orient="auto">
            <polygon points="4 0, 8 6, 0 6" fill="#dc2626" />
          </marker>
        </defs>
      </svg>
    </div>;
}

// ================= Problem Card =================
function MeasurementCard({
  idx,
  problem,
  answer,
  setAnswer,
  result,
  showAnswer,
  onReset,
  onFirstType
}) {
  const inputRef = useRef(null);
  useEffect(() => {
    if (!answer.meters && !answer.centimeters && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const status = useMemo(() => showAnswer ? "showing" : result, [showAnswer, result]);
  const border = status === "correct" ? "border-green-400" : status === "wrong" ? "border-red-300" : "border-zinc-200";
  const pastel = ["bg-yellow-50", "bg-sky-50", "bg-pink-50", "bg-green-50", "bg-purple-50", "bg-orange-50"];
  const bg = pastel[idx % pastel.length];
  const totalCm = problem.height;
  const displayMeters = problem.meters;
  const displayCm = problem.centimeters;
  return <div className={`rounded-3xl border-2 ${border} ${bg} shadow-md p-6 flex flex-col gap-4`}>
      <div className="text-base text-zinc-600 font-semibold">📏 ข้อ {idx + 1}</div>
      
      {/* Object and ruler */}
      <div className="flex items-end justify-center gap-4">
        <div className="text-center">
          <div className="text-6xl mb-2">{problem.object.emoji}</div>
          <div className="text-sm font-semibold text-zinc-700">{problem.object.name}</div>
        </div>
        
        <Ruler height={problem.height} maxHeight={500} />
        
        {/* Height indicator */}
        <div className="text-right">
          <div className="text-lg font-bold text-red-600">{totalCm} ซม.</div>
          
        </div>
      </div>

      {/* Answer inputs */}
      <div className="space-y-3">
        <div className="text-center text-lg font-semibold">ความสูง</div>
        
        {/* Meters and centimeters input */}
        <div className="flex items-center justify-center gap-2 text-lg">
          <input ref={inputRef} inputMode="numeric" className="w-16 text-center border-2 border-sky-300 rounded-xl py-2 px-2 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="?" value={answer.meters || ""} onChange={e => {
          const v = e.target.value.replace(/\D/g, "");
          if (!answer.meters && !answer.centimeters) onFirstType?.();
          setAnswer(idx, {
            ...answer,
            meters: v
          });
        }} />
          <span className="font-semibold">เมตร</span>
          
          <input inputMode="numeric" className="w-16 text-center border-2 border-sky-300 rounded-xl py-2 px-2 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="?" value={answer.centimeters || ""} onChange={e => {
          const v = e.target.value.replace(/\D/g, "");
          if (!answer.meters && !answer.centimeters) onFirstType?.();
          setAnswer(idx, {
            ...answer,
            centimeters: v
          });
        }} />
          <span className="font-semibold">เซนติเมตร</span>
        </div>

        {/* Total centimeters input */}
        <div className="flex items-center justify-center gap-2 text-lg">
          <span>หรือ เท่ากับ</span>
          <input inputMode="numeric" className="w-20 text-center border-2 border-emerald-300 rounded-xl py-2 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="?" value={answer.totalCm || ""} onChange={e => {
          const v = e.target.value.replace(/\D/g, "");
          if (!answer.meters && !answer.centimeters && !answer.totalCm) onFirstType?.();
          setAnswer(idx, {
            ...answer,
            totalCm: v
          });
        }} />
          <span className="font-semibold">เซนติเมตร</span>
        </div>
      </div>

      {/* Status Message */}
      <div className="h-6 text-sm text-center">
        {status === "correct" && <span className="text-green-600">✅ ถูกต้อง!</span>}
        {status === "wrong" && <span className="text-red-500">❌ ลองใหม่อีกครั้ง</span>}
        {status === "showing" && <div className="text-sky-700">
            <div>คำตอบ: {displayMeters} เมตร {displayCm} เซนติเมตร</div>
            <div>หรือ {totalCm} เซนติเมตร</div>
          </div>}
      </div>

      {/* Reset Button */}
      <button onClick={() => onReset(idx)} className="text-sm px-4 py-2 rounded-full bg-white border hover:bg-zinc-50">
        ล้างคำตอบ
      </button>
    </div>;
}

// ================= Main App =================
export default function MeasurementApp() {
  const [level, setLevel] = useState("easy");
  const [count, setCount] = useState(6);
  const [problems, setProblems] = useState(() => generateMeasurementProblems(6, "easy"));
  const [answers, setAnswers] = useState(() => problems.map(() => ({
    meters: "",
    centimeters: "",
    totalCm: ""
  })));
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
    setAnswers(prev => prev.map((a, i) => i === idx ? val : a));
  }
  function startTimerIfNeeded() {
    if (!startedAt) {
      setStartedAt(Date.now());
      setElapsedMs(0);
    }
  }
  function resetAll() {
    const next = generateMeasurementProblems(count, level);
    setProblems(next);
    setAnswers(next.map(() => ({
      meters: "",
      centimeters: "",
      totalCm: ""
    })));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setElapsedMs(0);
  }
  function applyLevel(lv) {
    setLevel(lv);
    const next = generateMeasurementProblems(count, lv);
    setProblems(next);
    setAnswers(next.map(() => ({
      meters: "",
      centimeters: "",
      totalCm: ""
    })));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setElapsedMs(0);
  }
  function applyCount(n) {
    setCount(n);
    const next = generateMeasurementProblems(n, level);
    setProblems(next);
    setAnswers(next.map(() => ({
      meters: "",
      centimeters: "",
      totalCm: ""
    })));
    setResults(next.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
    setStartedAt(null);
    setElapsedMs(0);
  }
  function checkAnswers() {
    const next = problems.map((p, i) => {
      const userMeters = parseInt(answers[i].meters) || 0;
      const userCm = parseInt(answers[i].centimeters) || 0;
      const userTotalCm = parseInt(answers[i].totalCm) || 0;
      const correctMeters = p.meters;
      const correctCm = p.centimeters;
      const correctTotalCm = p.height;

      // Check if either format is correct
      const metersCorrect = userMeters === correctMeters && userCm === correctCm;
      const totalCmCorrect = userTotalCm === correctTotalCm;
      return metersCorrect || totalCmCorrect ? "correct" : "wrong";
    });
    setResults(next);
    if (next.every(r => r === "correct")) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2500);
    }
  }
  function showAll() {
    setShowAnswers(true);
    setResults(problems.map(() => "pending"));
  }
  function onReset(idx) {
    setAnswers(prev => prev.map((a, i) => i === idx ? {
      meters: "",
      centimeters: "",
      totalCm: ""
    } : a));
    setResults(prev => prev.map((r, i) => i === idx ? "pending" : r));
  }
  function formatMS(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${mm}:${String(ss).padStart(2, "0")}`;
  }
  const Confetti = () => <div className="pointer-events-none fixed inset-0 overflow-hidden flex items-center justify-center">
      <div className="text-6xl animate-bounce">🎉</div>
    </div>;
  return <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-teal-50 text-zinc-800">
      <header className="max-w-6xl mx-auto p-6 pb-2">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/profile" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>กลับ</span>
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2">📏 ฝึกวัดความยาว</h1>
        <p className="text-zinc-600 mt-1 text-base">วัดความสูงและความยาวของวัตถุต่างๆ แล้วเขียนคำตอบเป็นเมตรและเซนติเมตร</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-amber-100 shadow-sm">
            <span className="text-sm text-zinc-600">จำนวนข้อ:</span>
            {[6, 9, 12].map(n => <button key={n} onClick={() => applyCount(n)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${count === n ? "bg-amber-600 text-white border-amber-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>
                {n}
              </button>)}
          </div>

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-2xl px-4 py-3 border-2 border-amber-100 shadow-sm">
            <span className="text-sm text-zinc-600">ระดับ:</span>
            {[{
            key: "easy",
            label: "ง่าย (10ซม.)"
          }, {
            key: "medium",
            label: "ปานกลาง (5ซม.)"
          }, {
            key: "hard",
            label: "ยาก (1ซม.)"
          }].map(lv => <button key={lv.key} onClick={() => applyLevel(lv.key)} className={`px-4 py-2 rounded-full text-base font-semibold border-2 ${level === lv.key ? "bg-teal-600 text-white border-teal-600" : "bg-zinc-50 hover:bg-zinc-100"}`}>
                {lv.label}
              </button>)}
          </div>

          <button onClick={resetAll} className="px-5 py-3 rounded-2xl text-lg bg-amber-600 text-white hover:bg-amber-700 shadow-lg">
            🔄 สุ่มชุดใหม่
          </button>
          <button onClick={checkAnswers} className="px-5 py-3 rounded-2xl text-lg bg-teal-600 text-white hover:bg-teal-700 shadow-lg">
            ✅ ตรวจคำตอบ
          </button>
          <button onClick={showAll} className="px-5 py-3 rounded-2xl text-lg bg-orange-500 text-white hover:bg-orange-600 shadow-lg">
            👀 เฉลยทั้งหมด
          </button>

          {/* Timer */}
          <div className="ml-auto text-base bg-amber-50 border-2 border-amber-200 rounded-full px-4 py-2 font-semibold">
            ⏱️ เวลา: <span className="font-semibold">{formatMS(elapsedMs)}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
          {problems.map((p, i) => <MeasurementCard key={i} idx={i} problem={p} answer={answers[i]} setAnswer={setAnswer} result={results[i]} showAnswer={showAnswers} onReset={onReset} onFirstType={startTimerIfNeeded} />)}
        </div>

        {/* Bottom action bar */}
        <div className="mt-8 flex justify-center">
          <button onClick={checkAnswers} className="px-8 py-4 rounded-3xl text-xl bg-teal-600 text-white hover:bg-teal-700 shadow-lg">
            ✅ ตรวจคำตอบ
          </button>
        </div>

        {/* Tips Section */}
        <section className="mt-10 max-w-5xl text-sm text-zinc-600 leading-relaxed">
          <h2 className="font-semibold text-zinc-800 text-lg mb-3">💡 เคล็ดลับการวัดความยาว</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-zinc-700 mb-2">หน่วยการวัด</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>1 เมตร (ม.) = 100 เซนติเมตร (ซม.)</li>
                <li>1 เซนติเมตร (ซม.) = 10 มิลลิเมตร (มม.)</li>
                <li>1 กิโลเมตร (กม.) = 1,000 เมตร</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-700 mb-2">การแปลงหน่วย</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>250 ซม. = 2 เมตร 50 เซนติเมตร</li>
                <li>3 เมตร 25 ซม. = 325 เซนติเมตร</li>
                <li>ใช้ไม้บรรทัดหรือเมตรวัด</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {celebrate && <Confetti />}

      <footer className="max-w-6xl mx-auto p-6 text-xs text-zinc-500">
        © แบบฝึกหัดการวัดความยาว — เรียนรู้การวัดและแปลงหน่วย
      </footer>
    </div>;
}