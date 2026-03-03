

## Plan: Navigate from QuizHistory to Quiz Results Screen

The issue is that the "ดูรายละเอียดและฝึกทักษะเพิ่ม" button in QuizHistory currently navigates to `/quiz` which shows the **selection screen**. Instead, it should navigate to `/quiz` and directly display the **results screen** (`screen = 'results'`) with the data from that specific historical assessment.

### Changes

**1. `src/components/QuizHistory.tsx`**
- Update the button's `onClick` to pass the full assessment data (score, correct answers, total questions, time taken, assessment_data, grade, semester) via `location.state` with a flag like `showResults: true`.

**2. `src/pages/Quiz.tsx`**
- On mount, check `location.state` for `showResults: true`.
- If present, populate the results-related state variables (`score`, `correctAnswers`, `questions`, `timeTaken`, `skillBreakdown`, `selectedGrade`, `selectedSemester`, etc.) from the passed data.
- Set `screen` to `'results'` immediately so the results view renders with that assessment's data.
- Clear the location state after consuming it to prevent stale data on refresh.

### Technical Detail

The key state variables to populate from `locationState`:
- `score` = assessment record's `score`
- `correctAnswers` = `correct_answers`
- `questions` = reconstructed from `assessment_data` (to get `questions.length`)
- `timeTaken` = `time_taken`
- `skillBreakdown` = computed via the existing `computeSkillBreakdown`-like logic already in Quiz.tsx
- `selectedGrade`, `selectedSemester` from the record
- `screen` = `'results'`

This way clicking the button shows the exact same results page the user sees after completing an exam, with the radar chart, score, skill breakdown, and "ดูรายละเอียดและฝึกทักษะเพิ่ม" popup all working correctly.

