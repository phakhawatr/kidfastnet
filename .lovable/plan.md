

## Problem

The quiz image on `/quiz` is displayed too small (`w-72 h-72` / `w-80 h-80` = ~288-320px fixed square) as shown in image 1. The user wants it displayed larger and full-width like image 2.

## Plan

**File: `src/pages/Quiz.tsx`**

Update the image CSS classes in both the pre-stored image block (line 1134) and the AI-generated image block (lines 1142, 1147) to be full-width and responsive instead of fixed small squares:

1. **Pre-stored image** (line 1134): Change `w-72 h-72 sm:w-80 sm:h-80 object-contain` → `w-full max-w-2xl object-contain`
2. **AI skeleton** (line 1142): Change `w-72 h-72 sm:w-80 sm:h-80 rounded-2xl` → `w-full max-w-2xl h-80 rounded-2xl`
3. **AI image** (line 1147): Change `w-72 h-72 sm:w-80 sm:h-80 object-contain` → `w-full max-w-2xl object-contain`

This makes images scale to fill the card width (up to ~672px) while maintaining aspect ratio, matching image 2's layout.

