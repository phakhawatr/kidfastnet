-- Drop the existing policy
DROP POLICY IF EXISTS "teachers_manage_own_questions" ON question_bank;

-- Create updated policy that correctly checks admins table for admin_id
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
  (admin_id IN (
    SELECT admins.id
    FROM admins
  ))
);