export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rangeForDigits(d: number): { min: number; max: number } {
  const map: Record<number, [number, number]> = { 1: [1, 9], 2: [10, 99], 3: [100, 999] };
  const pair = map[d] || map[2];
  return { min: pair[0], max: pair[1] };
}

// Count column-wise borrows for a sequential subtraction: ops[0] - ops[1] (- ops[2] ...)
export function countBorrowsMulti(ops: number[], digits: number): number {
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

export interface ProblemPair {
  a: number;
  b: number;
  c?: number;
}

export function pickByDifficulty(level: string, digits: number, allowBorrow: boolean, operands = 2): ProblemPair | null {
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
  if (digits === 1) {
    // For 1-digit numbers, borrowing doesn't apply
    // Skip borrow checks for 1-digit problems
  } else {
    if (allowBorrow) {
      if (borrows < 1) return null;
      if (operands === 2 && (a % 10) >= (b % 10)) return null; // ensure ones borrow for 2-operand mode
    } else {
      if (borrows > 0) return null; // no borrow allowed
    }
  }

  // Difficulty tiers (built on top of borrow presence)
  if (digits === 1) {
    // For 1-digit numbers, borrowing doesn't apply in traditional sense
    if (level === "medium" || level === "hard") {
      // For medium/hard 1-digit, ensure larger numbers
      if (a < 5 || b < 3) return null;
    }
    // Always return for 1-digit numbers (easy, medium, hard)
    return operands === 3 ? { a, b, c } : { a, b };
  } else {
    if (level === "easy" && borrows > 0) return null;
    if (level === "medium" && borrows < 1) return null;
    if (level === "hard") {
      if (borrows < 1) return null;
      if (max >= 500 && val < 300) return null; // make hard a bit larger when digits allow
    }
  }

  return operands === 3 ? { a, b, c } : { a, b };
}

export function generateSubtractionProblems(n = 15, level = "easy", digits = 2, allowBorrow = true, operands = 2): ProblemPair[] {
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
    if (digits === 1) {
      // For 1-digit numbers, skip borrow checks in fallback
    } else {
      if (allowBorrow && borrows < 1) continue;
      if (!allowBorrow && borrows > 0) continue;
    }
    const key = operands === 3 ? `${a}-${b}-${c}` : `${a}-${b}`;
    if (used.has(key)) continue;
    used.add(key);
    probs.push(operands === 3 ? { a, b, c } : { a, b });
  }
  return probs;
}

export function formatMS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export function fmtDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export function calcStars(correct: number, total: number): number {
  const pct = Math.round((correct / Math.max(1, total)) * 100);
  if (pct === 100) return 3;
  if (pct >= 90) return 2;
  if (pct >= 80) return 1;
  return 0;
}

export function praiseText(pct: number): string {
  if (pct === 100) return "สุดยอด! ทำได้ครบถ้วน เก่งมาก 👏";
  if (pct >= 90) return "เยี่ยมมาก! ใกล้ 100% แล้ว อีกนิดเดียว 💪";
  if (pct >= 80) return "ดีมาก! พัฒนาขึ้นเรื่อย ๆ สู้ๆ ✨";
  if (pct >= 60) return "เริ่มดีแล้ว ลองทบทวนอีกนิดจะยิ่งดีขึ้น 😊";
  return "ไม่เป็นไร ลองใหม่อีกครั้งนะ เราทำได้! 🌟";
}

export function answerToNumber(ansArr: string[], digits: number): number {
  if (!Array.isArray(ansArr)) return NaN;
  // Filter out empty strings and use actual filled digits
  const cleanArr = ansArr.filter(d => d !== "");
  if (cleanArr.length === 0) return NaN;
  return parseInt(cleanArr.join(""), 10);
}

export interface HistoryItem {
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

export interface SummaryData {
  correct: number;
  total: number;
  elapsedMs: number;
  level: string;
  count: number;
}