

## Plan: Fix Incomplete Choices in Exam Questions

### Root Cause

Questions are stored and loaded WITHOUT normalization in the exam flow. The `questionNormalizer.ts` utility exists but is not used in these critical paths:

1. **Saving to `exam_questions`** (TeacherDashboard.tsx) — questions from question bank or AI generation are inserted raw, potentially with fewer than 4 choices or prefixed choices
2. **Loading from `exam_questions`** (PublicExam.tsx) — custom questions are loaded and displayed without normalization, so if data has only 1 choice, only 1 is shown (as seen in the screenshot)
3. **Adding bank questions to exams** (TeacherDashboard.tsx) — same issue when copying from question_bank to exam_questions

### Changes

**1. `src/pages/PublicExam.tsx`** — Normalize when loading custom questions

In `loadCustomQuestions` (~line 188), apply `normalizeQuestion` to each question's `choices` and `correct_answer` before setting state:

```typescript
import { normalizeQuestion } from '@/utils/questionNormalizer';

// In loadCustomQuestions, after fetching data:
const formattedQuestions = data.map(q => {
  const normalized = normalizeQuestion({
    choices: q.choices as string[],
    correct_answer: q.correct_answer
  });
  return {
    ...existing fields,
    choices: normalized.choices,
    correctAnswer: normalized.correct_answer,
  };
});
```

**2. `src/pages/TeacherDashboard.tsx`** — Normalize when saving questions to exam_questions

- At line ~327 (creating exam with preview questions): normalize `q.choices` and `q.correctAnswer` before insert
- At line ~586 (adding bank questions to exam): normalize `q.choices` and `q.correct_answer` before insert

**3. `src/hooks/useTeacherExams.ts`** — Normalize when fetching exam questions for teacher review

In `fetchExamQuestions`, normalize choices after fetching from DB.

### Files to edit
- **`src/pages/PublicExam.tsx`** — normalize on load
- **`src/pages/TeacherDashboard.tsx`** — normalize on save (2 locations)
- **`src/hooks/useTeacherExams.ts`** — normalize on fetch

