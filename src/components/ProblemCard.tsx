import React, { useMemo, useRef, useEffect } from "react";
import type { ProblemPair } from "../utils/subtractionUtils";

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

export function ProblemCard({ 
  idx, prob, answer, setAnswer, result, showAnswer, onReset, onFirstType, digits 
}: ProblemCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
                    onFocus={() => {
                      // Start music immediately when user focuses on any input field
                      if (onFirstType) onFirstType();
                    }}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 1);
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