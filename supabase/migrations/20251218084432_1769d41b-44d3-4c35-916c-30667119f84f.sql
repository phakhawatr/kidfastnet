-- Fix infinite recursion in classes and class_students RLS policies
-- The issue: classes policy references class_students, and class_students policy references classes

-- Step 1: Create helper functions to break the recursion cycle

-- Function to check if user is enrolled in a class (without triggering RLS on class_students)
CREATE OR REPLACE FUNCTION public.is_student_in_class(_student_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_students
    WHERE student_id = _student_id
      AND class_id = _class_id
      AND is_active = true
  )
$$;

-- Function to check if user is teacher of a class (without triggering RLS on classes)
CREATE OR REPLACE FUNCTION public.is_class_teacher(_teacher_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes
    WHERE id = _class_id
      AND teacher_id = _teacher_id
  )
$$;

-- Function to get user's class IDs as student
CREATE OR REPLACE FUNCTION public.get_student_class_ids(_student_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT class_id
  FROM public.class_students
  WHERE student_id = _student_id
    AND is_active = true
$$;

-- Function to get user's class IDs as teacher
CREATE OR REPLACE FUNCTION public.get_teacher_class_ids(_teacher_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.classes
  WHERE teacher_id = _teacher_id
$$;

-- Step 2: Drop problematic policies
DROP POLICY IF EXISTS "Students can view enrolled classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage their class students" ON public.class_students;

-- Step 3: Recreate policies using security definer functions

-- Classes: Students can view classes they're enrolled in
CREATE POLICY "Students can view enrolled classes"
ON public.classes
FOR SELECT
USING (id IN (SELECT get_student_class_ids(auth.uid())));

-- Class_students: Teachers can manage students in their classes
CREATE POLICY "Teachers can manage their class students"
ON public.class_students
FOR ALL
USING (is_class_teacher(auth.uid(), class_id))
WITH CHECK (is_class_teacher(auth.uid(), class_id));

-- Step 4: Add permissive SELECT policies for anonymous access (Platform Admin uses custom auth)
-- This allows the AdminSchoolManagement page to read data

CREATE POLICY "Allow public read schools"
ON public.schools
FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow public read classes"  
ON public.classes
FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow public read school_memberships"
ON public.school_memberships
FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow public read class_students"
ON public.class_students
FOR SELECT
USING (is_active = true);