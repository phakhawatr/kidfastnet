

# Add Full Name Field and Save Profile Data to Central Database

## Problem
Currently, profile data (nickname, class, school, profile image) is only saved to `localStorage`, making it device-specific. The user wants:
1. A new "ชื่อ-นามสกุล" (full name) field in the profile edit form
2. All profile data saved to Supabase so it's consistent across devices and accessible from the school admin dashboard

## Plan

### 1. Database Migration
Add new columns to `user_registrations`:
- `full_name` (text, nullable) — ชื่อ-นามสกุล
- `school_name` (text, nullable) — ชื่อโรงเรียน
- `profile_image_url` (text, nullable) — URL ของรูปโปรไฟล์ที่อัปโหลด

Note: `nickname` and `grade` already exist in the table. `studentClass` from localStorage maps to `grade`.

### 2. Profile Image Storage
- Create a Supabase Storage bucket `profile-images` for storing student profile photos
- Upload the image file to storage when saving, and store the public URL in `profile_image_url`

### 3. Update Profile Page (`src/pages/Profile.tsx`)
- Add `fullName` state variable
- Add "ชื่อ-นามสกุล" input field above the nickname field in the edit dialog
- Update `loadProfileData` to fetch `full_name`, `school_name`, `profile_image_url` from `user_registrations` (with localStorage as fallback)
- Update `handleSaveProfile` to:
  - Upload profile image to Supabase Storage if changed
  - Save `full_name`, `nickname`, `grade`, `school_name`, `profile_image_url` to `user_registrations` via Supabase update
  - Keep localStorage sync for offline compatibility

### 4. Update School Admin Student Display
- Update `ClassStudentManager.tsx` to also fetch and display `full_name`, `school_name`, `profile_image_url` from `user_registrations`
- Use `profile_image_url` as an additional fallback for student avatar (after `line_picture_url`)

### Files to Change
- **Database migration**: Add `full_name`, `school_name`, `profile_image_url` columns + create `profile-images` storage bucket
- **`src/pages/Profile.tsx`**: Add full name field, save to DB, load from DB
- **`src/components/ClassStudentManager.tsx`**: Fetch and display new fields

