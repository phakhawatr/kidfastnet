

## Plan: Fix Question Bank Import Completeness Issues

### Root Problem

There are two inconsistent data formats for questions in the database:

1. **AI-generated questions**: `choices: ["5", "6", "7", "8"]`, `correct_answer: "5"`
2. **PDF-imported questions**: `choices: ["A) 5", "B) 6", "C) 7", "D) 8"]`, `correct_answer: "A"`

When these are imported/copied between banks or used in exams, mismatches occur — choices may appear incomplete, correct answers don't match, and display is inconsistent.

### Changes

**1. Add validation/normalization utility (`src/utils/questionNormalizer.ts` — new file)**

Create a function `normalizeQuestion(question)` that:
- Ensures `choices` array always has exactly 4 items (pads with empty or trims)
- Strips `A)`, `B)`, `C)`, `D)` prefixes from choices if present
- Converts letter-only `correct_answer` (e.g., "A") to actual choice text
- Ensures `correct_answer` matches one of the normalized choices
- Flags questions that can't be fixed (returns `{ normalized, warnings }`)

**2. Apply normalization in `useQuestionBank.ts`**

- In `copySystemQuestion`: normalize before insert
- In `copySharedQuestion`: normalize before insert
- In `createQuestion`: normalize before insert
- In `fetchQuestions` / `fetchSystemQuestions`: normalize after fetch for display consistency

**3. Apply normalization in `ai-generate-questions/index.ts` (edge function)**

- After parsing AI response, validate each question has exactly 4 choices
- Ensure `correct_answer` matches one of the choices
- Fill missing choices if fewer than 4

**4. Apply normalization in `ai-import-pdf-questions/index.ts` (edge function)**

- After parsing, strip "A) / B) / C) / D)" prefixes from choices
- Convert letter-only `correct_answer` to actual choice text
- Ensure exactly 4 choices per question

**5. Update display components for safety**

- In `QuestionBankSelector.tsx`, `SystemQuestionsBrowser.tsx`, `SharedQuestionsBrowser.tsx`, `PublicExam.tsx`, `Quiz.tsx`: add a safety check so if `choices` has fewer than 4 items, pad with placeholder or show a warning badge

### Technical Detail — Normalizer

```typescript
export function normalizeQuestion(q: { choices: string[], correct_answer: string }) {
  let choices = [...(q.choices || [])];
  let correctAnswer = q.correct_answer || '';

  // Strip A), B), C), D) prefixes
  choices = choices.map(c => typeof c === 'string' ? c.replace(/^[A-D]\)\s*/, '').trim() : String(c));

  // Convert letter-only correct_answer to choice text
  if (/^[A-D]$/.test(correctAnswer)) {
    const idx = correctAnswer.charCodeAt(0) - 65;
    if (idx >= 0 && idx < choices.length) {
      correctAnswer = choices[idx];
    }
  } else {
    correctAnswer = correctAnswer.replace(/^[A-D]\)\s*/, '').trim();
  }

  // Ensure exactly 4 choices
  while (choices.length < 4) choices.push('');
  choices = choices.slice(0, 4);

  // Validate correct_answer is in choices
  if (!choices.includes(correctAnswer) && choices.length > 0) {
    // Try fuzzy match
    const match = choices.find(c => c.includes(correctAnswer) || correctAnswer.includes(c));
    if (match) correctAnswer = match;
  }

  return { choices, correct_answer: correctAnswer };
}
```

### Files to create/edit
- **Create**: `src/utils/questionNormalizer.ts`
- **Edit**: `src/hooks/useQuestionBank.ts` (normalize in copy/create/fetch functions)
- **Edit**: `supabase/functions/ai-generate-questions/index.ts` (post-parse validation)
- **Edit**: `supabase/functions/ai-import-pdf-questions/index.ts` (post-parse normalization)
- **Edit**: `src/components/SystemQuestionsBrowser.tsx` (safety display check)
- **Edit**: `src/components/SharedQuestionsBrowser.tsx` (safety display check)
- **Edit**: `src/components/QuestionBankSelector.tsx` (safety display check)

