-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(p_admin_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admins
    WHERE id = p_admin_id
  )
$$;

-- Drop existing policy
DROP POLICY IF EXISTS "teachers_manage_own_questions" ON question_bank;

-- Create new policy using the security definer function
CREATE POLICY "teachers_manage_own_questions" 
ON question_bank 
FOR ALL 
USING (
  (teacher_id IN (
    SELECT user_roles.user_id
    FROM user_roles
    WHERE user_roles.role = 'teacher'::app_role
  )) 
  OR 
  (admin_id IS NOT NULL AND is_admin(admin_id))
);