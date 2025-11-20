-- Fix RLS policy for exam_sessions to allow teachers to view sessions for their exam links
-- Drop the old policy that uses auth.jwt() which doesn't work with custom authentication
DROP POLICY IF EXISTS "Teachers can view sessions for their exam links" ON public.exam_sessions;

-- Create new policy that works with the user_roles table
CREATE POLICY "teachers_can_view_sessions_for_their_exams"
ON public.exam_sessions
FOR SELECT
TO public
USING (
  exam_link_id IN (
    SELECT el.id
    FROM public.exam_links el
    INNER JOIN public.user_roles ur ON el.teacher_id = ur.user_id
    WHERE ur.role = 'teacher'
  )
);