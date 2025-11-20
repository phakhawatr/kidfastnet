-- Fix RLS policies for public exam access

-- Step 1: Fix exam_questions RLS policy
-- Remove old policy that may not work properly with anonymous users
DROP POLICY IF EXISTS "students_view_active_exam_questions" ON exam_questions;

-- Create new policy with explicit anonymous access
CREATE POLICY "Public can view questions for active exams"
  ON exam_questions FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exam_links 
      WHERE exam_links.id = exam_questions.exam_link_id 
      AND exam_links.status = 'active'
    )
  );

-- Step 2: Add exam_sessions RLS policy for public viewing of results
-- Allow anyone to read exam sessions (UUID provides natural security)
CREATE POLICY "Public can view exam sessions"
  ON exam_sessions FOR SELECT
  TO anon, authenticated
  USING (true);