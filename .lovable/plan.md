

# Fix Student Name and Avatar Display in School Admin Dashboard

## Problem
The ClassStudentManager component in `/school-admin` displays:
- The `avatar` field as raw text (e.g., "tiger") instead of a proper image
- Only the nickname, without a profile picture

The Profile page shows a real photo from `line_picture_url` and the nickname correctly.

## Solution
Update `src/components/ClassStudentManager.tsx` to:

1. **Fetch `line_picture_url`** from `user_registrations` alongside `nickname`, `parent_email`, and `avatar`
2. **Display profile image**: Use `line_picture_url` as the student's photo (with `<img>` tag in a rounded circle), falling back to the avatar emoji character if no photo exists
3. **Fix avatar emoji mapping**: The `avatar` field stores values like "tiger", "cat", etc. Map these to their corresponding emoji characters for the fallback display (e.g., "tiger" → "🐯", "cat" → "🐱")

## Files to Change

**`src/components/ClassStudentManager.tsx`**
- Add `line_picture_url` to the `ClassStudent` interface
- Update the `fetchStudents` query to also select `line_picture_url`
- Update the student row rendering (line ~220-224) to show `<img>` from `line_picture_url` when available, otherwise show the mapped avatar emoji as fallback in a styled circle

## Avatar Emoji Mapping
Will add a small mapping object for common avatar values (tiger, cat, dog, rabbit, bear, monkey, elephant, panda, etc.) to their emoji equivalents. This matches how the Profile page handles avatar display.

