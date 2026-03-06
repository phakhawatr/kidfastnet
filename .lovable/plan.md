

## Plan: Move AI Image Generation to Question Bank (Pre-generate)

### Problem
Generating images during quiz time is too slow (15-30s per image), disrupting the test-taking experience.

### Solution
Add a "สร้างภาพ AI" button on each question card in the Question Bank. When clicked, it generates the image via the existing `generate-quiz-image` edge function and saves the resulting URL into the question's `image_urls` field in the database. When students take quizzes, the image is already available instantly.

### Changes

**1. `src/components/QuestionBankManager.tsx`**
- Add a "สร้างภาพ AI" button (with `Sparkles` icon) next to each question's action buttons (Edit, Share, Delete area around line 903-960)
- Button shows only when the question has no `image_urls` yet
- When clicked, calls the `generate-quiz-image` edge function with the question text as prompt and skill_name as skill
- On success, updates the question's `image_urls` in the database via `updateQuestion` and refreshes the list
- Shows loading spinner on the button while generating
- Also add a **bulk generate** button for selected questions (using the existing checkbox selection system)

**2. `src/hooks/useQuestionBank.ts`**
- Add a `generateAIImage` function that:
  1. Builds an imagePrompt from the question text (reuse `generateImagePromptFromQuestion` logic or just send the question text directly)
  2. Calls `supabase.functions.invoke('generate-quiz-image', { body: { imagePrompt, skill } })`
  3. On success, updates the question's `image_urls` field with the returned URL
  4. Returns the URL or null on error

**3. `src/pages/Quiz.tsx`**
- Simplify the image display: when `currentQuestion.imagePrompt` starts with `http` (i.e., it's already a stored URL from `image_urls`), display it directly without calling `useQuizImage`
- Keep the existing AI generation as a fallback for questions without pre-generated images, but default the toggle to OFF

**4. `src/utils/assessmentUtils.ts`**
- Update `fetchQuestionsFromBank`: prioritize `image_urls[0]` as the `imagePrompt` (already done), ensuring pre-generated images flow through to the quiz

### UI in Question Bank
Each question card will show:
- If no image: **"🎨 สร้างภาพ AI"** button
- If generating: spinner with "กำลังสร้าง..."
- If image exists: the existing image thumbnail (already implemented)

For bulk: a **"สร้างภาพ AI ทั้งหมด"** button in the bulk actions bar when questions are selected.

### Files to edit
- `src/components/QuestionBankManager.tsx` — Add AI image generation button per question + bulk action
- `src/hooks/useQuestionBank.ts` — Add `generateAIImage` helper function
- `src/pages/Quiz.tsx` — Display pre-stored images directly without edge function call

