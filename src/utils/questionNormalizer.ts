/**
 * Normalizes question data to ensure consistent format across
 * AI-generated, PDF-imported, and manually created questions.
 * 
 * Handles two common formats:
 * 1. AI-generated: choices: ["5", "6", "7", "8"], correct_answer: "5"
 * 2. PDF-imported: choices: ["A) 5", "B) 6", "C) 7", "D) 8"], correct_answer: "A"
 */

export interface NormalizedQuestion {
  choices: string[];
  correct_answer: string;
  warnings: string[];
}

/**
 * Normalize a question's choices and correct_answer to a consistent format:
 * - Strips "A)", "B)", "C)", "D)" prefixes from choices
 * - Converts letter-only correct_answer (e.g., "A") to actual choice text
 * - Ensures exactly 4 choices
 * - Validates correct_answer matches one of the choices
 */
export function normalizeQuestion(q: {
  choices: any;
  correct_answer: string;
}): NormalizedQuestion {
  const warnings: string[] = [];
  
  // Ensure choices is an array of strings
  let choices: string[] = [];
  if (Array.isArray(q.choices)) {
    choices = q.choices.map((c: any) => (typeof c === 'string' ? c : String(c ?? '')));
  } else if (typeof q.choices === 'object' && q.choices !== null) {
    // Handle object format like { "A": "5", "B": "6", ... }
    choices = Object.values(q.choices).map((c: any) => String(c ?? ''));
  }

  let correctAnswer = q.correct_answer?.toString() || '';

  // Detect if choices have A), B), C), D) prefixes
  const hasLetterPrefixes = choices.some(c => /^[A-Da-d]\)\s*/.test(c));

  if (hasLetterPrefixes) {
    // Save original choices before stripping for correct_answer mapping
    const originalChoices = [...choices];
    
    // Strip A), B), C), D) prefixes
    choices = choices.map(c => c.replace(/^[A-Da-d]\)\s*/, '').trim());

    // If correct_answer is a letter like "A", "B", etc., map to choice text
    if (/^[A-Da-d]$/.test(correctAnswer)) {
      const idx = correctAnswer.toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < choices.length) {
        correctAnswer = choices[idx];
      } else {
        warnings.push(`correct_answer "${correctAnswer}" ไม่สามารถแปลงเป็นตัวเลือกได้`);
      }
    } else {
      // correct_answer might also have a prefix
      correctAnswer = correctAnswer.replace(/^[A-Da-d]\)\s*/, '').trim();
    }
  } else {
    // No letter prefixes - check if correct_answer is a letter
    if (/^[A-Da-d]$/.test(correctAnswer)) {
      const idx = correctAnswer.toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < choices.length) {
        correctAnswer = choices[idx];
      } else {
        warnings.push(`correct_answer "${correctAnswer}" อยู่นอกช่วงตัวเลือก`);
      }
    }
  }

  // Ensure exactly 4 choices
  if (choices.length < 4) {
    warnings.push(`มีตัวเลือกเพียง ${choices.length} ข้อ (ต้องการ 4 ข้อ)`);
    while (choices.length < 4) {
      choices.push(`ตัวเลือก ${choices.length + 1}`);
    }
  } else if (choices.length > 4) {
    warnings.push(`มีตัวเลือก ${choices.length} ข้อ (ตัดให้เหลือ 4 ข้อ)`);
    choices = choices.slice(0, 4);
  }

  // Remove empty choices and replace with placeholders
  choices = choices.map((c, idx) => {
    if (!c || c.trim() === '') {
      warnings.push(`ตัวเลือกข้อ ${idx + 1} ว่างเปล่า`);
      return `ตัวเลือก ${idx + 1}`;
    }
    return c.trim();
  });

  // Validate correct_answer is in choices
  if (correctAnswer && !choices.includes(correctAnswer)) {
    // Try fuzzy match
    const exactMatch = choices.find(
      c => c.toLowerCase() === correctAnswer.toLowerCase()
    );
    if (exactMatch) {
      correctAnswer = exactMatch;
    } else {
      const partialMatch = choices.find(
        c => c.includes(correctAnswer) || correctAnswer.includes(c)
      );
      if (partialMatch) {
        correctAnswer = partialMatch;
        warnings.push(`correct_answer ถูกจับคู่แบบใกล้เคียง: "${partialMatch}"`);
      } else {
        warnings.push(`correct_answer "${correctAnswer}" ไม่ตรงกับตัวเลือกใดเลย - ใช้ตัวเลือกแรก`);
        correctAnswer = choices[0];
      }
    }
  }

  // If correct_answer is still empty, use first choice
  if (!correctAnswer) {
    correctAnswer = choices[0];
    warnings.push('ไม่มี correct_answer - ใช้ตัวเลือกแรก');
  }

  return { choices, correct_answer: correctAnswer, warnings };
}

/**
 * Normalize an array of questions, logging warnings for problematic ones
 */
export function normalizeQuestions(
  questions: Array<{ choices: any; correct_answer: string; [key: string]: any }>
): Array<{ choices: string[]; correct_answer: string; warnings: string[]; [key: string]: any }> {
  return questions.map((q, idx) => {
    const { choices, correct_answer, warnings } = normalizeQuestion(q);
    
    if (warnings.length > 0) {
      console.warn(`Question ${idx + 1} normalization warnings:`, warnings, q.question_text?.substring(0, 50));
    }
    
    return { ...q, choices, correct_answer, warnings };
  });
}

/**
 * Quick check if a question needs normalization
 */
export function questionNeedsNormalization(q: { choices: any; correct_answer: string }): boolean {
  if (!Array.isArray(q.choices)) return true;
  if (q.choices.length !== 4) return true;
  if (q.choices.some((c: any) => typeof c === 'string' && /^[A-Da-d]\)\s*/.test(c))) return true;
  if (/^[A-Da-d]$/.test(q.correct_answer)) return true;
  if (!q.choices.includes(q.correct_answer)) return true;
  return false;
}
