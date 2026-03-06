

## Investigation Results: AI Image Generation Not Working

### Root Cause Found

The Edge Function `generate-quiz-image` was **not deployed** to Supabase. The code was correct in the repository, but it had never been deployed to the server, so all calls from the frontend were failing silently.

### Fix Applied

I have already deployed the function using the Supabase deployment tool. The function is now live and working correctly.

**Test result**: I tested the function directly with a sample prompt (`🚌 รถบัสสีเหลือง`, skill: `division`) and it returned a successful response with a cached image URL:
```
https://yxvuivtnyrcrtiqxhbkl.supabase.co/storage/v1/object/public/quiz-images/quiz-img-yndfky.png
```

### What You Need to Do

1. **Refresh the quiz page** in the preview
2. **Start a new quiz** (e.g., NT Grade 3)
3. **Toggle "ภาพ AI" on** — images should now appear above each question

### No Code Changes Required

The frontend code (`Quiz.tsx`, `useQuizImage.ts`) and the edge function code were already correct. The only issue was deployment.

