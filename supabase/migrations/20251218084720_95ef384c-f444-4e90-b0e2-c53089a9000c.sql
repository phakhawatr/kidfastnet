-- Add INSERT policy for classes table (Platform Admin uses custom auth, not Supabase auth)
CREATE POLICY "Allow public insert classes"
ON public.classes
FOR INSERT
WITH CHECK (is_active = true);

-- Add UPDATE policy for classes table
CREATE POLICY "Allow public update classes"
ON public.classes
FOR UPDATE
USING (is_active = true)
WITH CHECK (is_active = true);

-- Add DELETE policy for classes table (soft delete via is_active)
CREATE POLICY "Allow public delete classes"
ON public.classes
FOR DELETE
USING (is_active = true);

-- Add INSERT policy for school_memberships
CREATE POLICY "Allow public insert school_memberships"
ON public.school_memberships
FOR INSERT
WITH CHECK (is_active = true);

-- Add UPDATE policy for school_memberships
CREATE POLICY "Allow public update school_memberships"
ON public.school_memberships
FOR UPDATE
USING (is_active = true)
WITH CHECK (is_active = true);

-- Add DELETE policy for school_memberships
CREATE POLICY "Allow public delete school_memberships"
ON public.school_memberships
FOR DELETE
USING (is_active = true);

-- Add INSERT policy for class_students
CREATE POLICY "Allow public insert class_students"
ON public.class_students
FOR INSERT
WITH CHECK (is_active = true);

-- Add UPDATE policy for class_students
CREATE POLICY "Allow public update class_students"
ON public.class_students
FOR UPDATE
USING (is_active = true)
WITH CHECK (is_active = true);

-- Add DELETE policy for class_students  
CREATE POLICY "Allow public delete class_students"
ON public.class_students
FOR DELETE
USING (is_active = true);