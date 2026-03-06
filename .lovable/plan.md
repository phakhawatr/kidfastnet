

## Plan: Generate AI Images for Quiz Questions

### Concept

Use the Lovable AI Gateway with `google/gemini-3-pro-image-preview` (Nano Banana Pro) to generate illustrative images for quiz questions. The `AssessmentQuestion` interface already has an `imagePrompt` field that many questions populate with emoji-based descriptions -- we can use these as prompts for image generation.

### Architecture

```text
Quiz.tsx                    Edge Function                  Gemini Image API
   |                             |                              |
   |-- POST /generate-quiz-image |                              |
   |   { imagePrompt, skill }   -->  Build child-friendly      |
   |                             |   prompt + call gateway  --> |
   |                             |                              |
   |                             | <-- base64 image ---------- |
   |                             |                              |
   | <-- { imageUrl } --------- |   Upload to Supabase Storage |
   |                             |   return public URL          |
   |   Display image above       |                              |
   |   question text             |                              |
```

### Changes

**1. Create Edge Function `supabase/functions/generate-quiz-image/index.ts`**

- Accepts `{ imagePrompt, questionText, skill }` 
- Builds a child-friendly image prompt: "Cute cartoon illustration for a Thai elementary math quiz. Topic: [skill]. Scene: [imagePrompt]. Style: colorful, simple, kid-friendly, no text in image."
- Calls `google/gemini-3-pro-image-preview` via Lovable AI Gateway with `modalities: ["image", "text"]`
- Receives base64 image, uploads to Supabase Storage bucket `quiz-images`
- Returns the public URL
- Includes caching: check if an image for the same prompt already exists before generating

**2. Create `src/hooks/useQuizImage.ts`**

- Custom hook that takes an `imagePrompt` string
- Calls the edge function, manages loading/error state
- Uses a local Map cache to avoid re-fetching for same prompts within a session
- Returns `{ imageUrl, isLoading }`

**3. Update `src/pages/Quiz.tsx`**

- Import `useQuizImage` hook
- When `currentQuestion.imagePrompt` exists, show generated image above the question text
- Display a loading skeleton while the image generates
- Add a toggle button so users can enable/disable image generation (to save costs/time)
- Store preference in localStorage

**4. Create Supabase Storage bucket**

- Bucket name: `quiz-images`, public access for reading

**5. Update `supabase/config.toml`**

- Add the new edge function entry

### Edge Function Implementation Detail

```typescript
// Key logic in generate-quiz-image/index.ts
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-3-pro-image-preview",
    messages: [{
      role: "user",
      content: `Create a cute, colorful cartoon illustration for a Thai elementary school math quiz. 
Topic: ${skill}. Scene: ${imagePrompt}. 
Style: simple shapes, bright colors, kid-friendly, NO text or numbers in the image.`
    }],
    modalities: ["image", "text"]
  })
});

// Extract base64 -> upload to storage -> return URL
```

### Quiz.tsx Rendering

```typescript
// Above question text, when imagePrompt exists and images enabled:
{showImages && currentQuestion.imagePrompt && (
  <div className="flex justify-center mb-4">
    {imageLoading ? (
      <Skeleton className="w-48 h-48 rounded-xl" />
    ) : imageUrl ? (
      <img src={imageUrl} alt="ภาพประกอบโจทย์" className="w-48 h-48 object-contain rounded-xl shadow-md" />
    ) : null}
  </div>
)}
```

### Cost Consideration

- Image generation is optional, controlled by a toggle (default: off)
- Images are cached in Supabase Storage so the same prompt won't regenerate
- Only generates when `imagePrompt` field is non-empty

### Files to create/edit
- **Create**: `supabase/functions/generate-quiz-image/index.ts`
- **Create**: `src/hooks/useQuizImage.ts`
- **Edit**: `src/pages/Quiz.tsx` (add image display + toggle)
- **Edit**: `supabase/config.toml` (add function entry)

