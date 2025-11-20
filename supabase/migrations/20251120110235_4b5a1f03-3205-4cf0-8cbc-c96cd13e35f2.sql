-- Enable RLS on exam_links if not already enabled
ALTER TABLE public.exam_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "teachers_can_insert_exam_links" ON public.exam_links;
DROP POLICY IF EXISTS "teachers_can_read_own_exam_links" ON public.exam_links;
DROP POLICY IF EXISTS "teachers_can_update_own_exam_links" ON public.exam_links;
DROP POLICY IF EXISTS "teachers_can_delete_own_exam_links" ON public.exam_links;
DROP POLICY IF EXISTS "students_can_read_active_exam_links" ON public.exam_links;

-- Allow teachers to insert their own exam links
CREATE POLICY "teachers_can_insert_exam_links"
ON public.exam_links
FOR INSERT
TO public
WITH CHECK (
  teacher_id IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'teacher'
  )
);

-- Allow teachers to read their own exam links
CREATE POLICY "teachers_can_read_own_exam_links"
ON public.exam_links
FOR SELECT
TO public
USING (
  teacher_id IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'teacher'
  )
);

-- Allow teachers to update their own exam links
CREATE POLICY "teachers_can_update_own_exam_links"
ON public.exam_links
FOR UPDATE
TO public
USING (
  teacher_id IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'teacher'
  )
)
WITH CHECK (
  teacher_id IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'teacher'
  )
);

-- Allow teachers to delete their own exam links
CREATE POLICY "teachers_can_delete_own_exam_links"
ON public.exam_links
FOR DELETE
TO public
USING (
  teacher_id IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'teacher'
  )
);

-- Allow anyone to read active exam links (for students to access exams)
CREATE POLICY "students_can_read_active_exam_links"
ON public.exam_links
FOR SELECT
TO public
USING (status = 'active');