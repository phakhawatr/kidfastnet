

## Problem

Questions from the `question_bank` table frequently have fewer than 4 choices (some have only 1). The `fetchQuestionsFromBank` function in `assessmentUtils.ts` loads them raw without normalization. Additionally, `generateChoices()` with `type='text'` returns only the correct answer (1 choice) because it has no logic for generating wrong text choices.

Database evidence: Multiple NT questions have 1-3 choices (e.g., `choices: [3150]` or `choices: [480, "480 บาท"]`).

## Changes

### 1. `src/utils/assessmentUtils.ts` — Apply normalizer in `fetchQuestionsFromBank`

Import `normalizeQuestion` and apply it to each question's choices/correct_answer after fetching from DB (~line 3857):

```typescript
import { normalizeQuestion } from './questionNormalizer';

// In fetchQuestionsFromBank, after getting data:
const normalized = normalizeQuestion({
  choices: Array.isArray(item.choices) ? item.choices : [],
  correct_answer: String(item.correct_answer || '')
});
const choices = normalized.choices;
```

This ensures all bank questions have exactly 4 choices before they're used in the quiz.

### 2. `src/utils/assessmentUtils.ts` — Fix `generateChoices` for text type

The `generateChoices` function (line 45) returns only 1 choice when `type='text'` because the wrong-choice logic is inside `if (type === 'number')`. Add a text fallback:

```typescript
if (type === 'text') {
  // For text answers, generate simple variations
  while (choices.length < 4) {
    choices.push(`ตัวเลือก ${choices.length + 1}`);
  }
}
```

### 3. `src/pages/Quiz.tsx` — Add safety guard for empty choices

Add a guard in the choices rendering (~line 1124) so if `choices` is empty or has fewer than 4 items, pad it:

```typescript
const safeChoices = currentQuestion.choices.length >= 4 
  ? currentQuestion.choices 
  : [...currentQuestion.choices, ...Array(4 - currentQuestion.choices.length).fill(`ตัวเลือก`)].slice(0, 4);
```

### Files to edit
- **`src/utils/assessmentUtils.ts`** — normalize in `fetchQuestionsFromBank` + fix `generateChoices` text mode
- **`src/pages/Quiz.tsx`** — safety guard for rendering choices

