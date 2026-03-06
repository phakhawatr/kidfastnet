

## Plan: Make AI Image Buttons More Visible in Question Bank

### Problem
The "🎨 สร้างภาพ AI" per-question button and "🎨 สร้างภาพ AI ทั้งหมด" bulk button exist but are hidden because:
1. The **bulk button** only appears in the selection bar (when checkboxes are checked)
2. The **per-question button** may not be rendering due to a condition check

The user expects these buttons to be always visible alongside แก้ไข (Edit) and ลบ (Delete).

### Changes

**`src/components/QuestionBankManager.tsx`**:

1. **Add a standalone "สร้างภาพ AI ทั้งหมด" button** near the top action bar (outside the selection-dependent block), so it's always visible. This button will generate images for ALL questions that don't have images yet (not just selected ones).

2. **Ensure the per-question "🎨 สร้างภาพ AI" button** is placed directly in each question card's action buttons row (next to แก้ไข and ลบ), visible when the question has no `image_urls`. Currently it may be conditionally hidden or positioned incorrectly.

3. **Show image thumbnail** on question cards that already have a generated image, so the user can see which questions have images.

### Files to edit
- `src/components/QuestionBankManager.tsx` — Move/add the bulk generate button to always-visible area, ensure per-question button is visible next to Edit/Delete

