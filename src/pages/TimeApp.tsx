import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// ---------- Utilities ----------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomTimes(n = 6) {
  const times = [];
  const used = new Set();
  while (times.length < n) {
    const h = randInt(1, 12);
    const m = randInt(0, 59);
    const key = `${h}:${m}`;
    if (!used.has(key)) {
      used.add(key);
      times.push({ h, m });
    }
  }
  return times;
}

const exampleTimes = [
  // A preset resembling the worksheet style (you can change anytime)
  { h: 10, m: 40 },
  { h: 3, m: 20 },
  { h: 1, m: 11 },
  { h: 3, m: 15 },
  { h: 7, m: 5 },
  { h: 1, m: 35 },
];

const pad2 = (n) => String(n).padStart(2, "0");

function normalizeHour12(val) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return NaN;
  if (n === 0) return 12; // treat 0 as 12
  if (n < 0) return NaN;
  // Allow 1..12 only
  return ((n - 1) % 12) + 1; // 12->12, 13->1, etc., but UI limits to 1..12
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

// ---------- One Card ----------
function Card({ idx, time, answer, setAnswer, result, showAnswer, onReset }) {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

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

  return (
    <div className={`rounded-2xl border ${border} bg-white shadow-sm p-4 flex flex-col items-center gap-3`}> 
      <div className="w-full max-w-[220px]">
        <Clock hour={time.h} minute={time.m} />
      </div>

      <div className="text-center text-sm text-zinc-500">นาฬิกา {idx + 1}</div>

      <div className="flex items-center gap-1 text-2xl">
        <input
          ref={hourRef}
          inputMode="numeric"
          maxLength={2}
          className="w-16 text-center border rounded-xl py-2 px-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="ชม."
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
          placeholder="นาที"
          value={answer.m}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setAnswer(idx, { ...answer, m: v.slice(0, 2) });
          }}
        />
      </div>

      <div className="h-6 text-sm">
        {status === "correct" && <span className="text-green-600">✅ ถูกต้อง!</span>}
        {status === "wrong" && <span className="text-red-500">❌ ลองใหม่อีกครั้ง</span>}
        {status === "showing" && (
          <span className="text-sky-700">คำตอบ: {time.h}:{pad2(time.m)}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onReset(idx)}
          className="text-xs px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200"
        >
          ล้างคำตอบ
        </button>
      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function TimeApp() {
  const [questionCount, setQuestionCount] = useState(10);
  const [times, setTimes] = useState(() => generateRandomTimes(10));
  const [answers, setAnswers] = useState(() => times.map(() => ({ h: "", m: "" })));
  const [results, setResults] = useState(() => times.map(() => "pending"));
  const [showAnswers, setShowAnswers] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  function setAnswer(idx, val) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? val : a)));
  }

  function resetAll(count = questionCount) {
    const newTimes = generateRandomTimes(count);
    setTimes(newTimes);
    setAnswers(newTimes.map(() => ({ h: "", m: "" })));
    setResults(newTimes.map(() => "pending"));
    setShowAnswers(false);
    setCelebrate(false);
  }

  function handleQuestionCountChange(newCount) {
    setQuestionCount(newCount);
    resetAll(newCount);
    // Force scroll to top with multiple methods to ensure it works
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  function checkAnswers() {
    const newResults = times.map((t, i) => {
      const hh = normalizeHour12(answers[i].h);
      const mm = parseInt(answers[i].m, 10);
      if (isNaN(hh) || isNaN(mm)) return "wrong";
      if (mm < 0 || mm > 59) return "wrong";
      return hh === t.h && mm === t.m ? "correct" : "wrong";
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
    setResults(times.map(() => "pending"));
  }

  function onReset(idx) {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? { h: "", m: "" } : a)));
    setResults((prev) => prev.map((r, i) => (i === idx ? "pending" : r)));
  }

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
            <span>กลับ</span>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">ฝึกอ่านเวลา ⏰ – Telling Time to the Minute</h1>
        <p className="text-zinc-600 mt-1 text-sm">
          เขียนเวลาให้ตรงกับนาฬิกาในรูปแบบ <strong>ชั่วโมง:นาที</strong> (12-hour). ตัวอย่าง: <code>7:05</code>
        </p>
      </header>

      <main className="max-w-6xl mx-auto p-6 pt-3">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => resetAll()}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow"
          >
            🔄 สุ่มชุดใหม่ (New Times)
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
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">จำนวนข้อ:</span>
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
            />
          ))}
        </div>

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

      <footer className="max-w-6xl mx-auto p-6 text-xs text-zinc-500">
        © Interactive worksheet for kids — You can set your own times using the buttons above.
      </footer>
    </div>
  );
}