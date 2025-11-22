-- Drop existing policy
DROP POLICY IF EXISTS "teachers_manage_own_questions" ON question_bank;

-- Create separate policies for different operations to be more explicit
-- Policy for SELECT, UPDATE, DELETE
CREATE POLICY "teachers_and_admins_can_manage_questions" 
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
)
WITH CHECK (
  (teacher_id IN (
    SELECT user_roles.user_id
    FROM user_roles
    WHERE user_roles.role = 'teacher'::app_role
  )) 
  OR 
  (admin_id IS NOT NULL AND is_admin(admin_id))
);