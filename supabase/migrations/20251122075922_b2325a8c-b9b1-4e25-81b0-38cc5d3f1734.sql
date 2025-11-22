-- Add admin support to question_bank table
-- Allow questions to be created by either teachers or admins

-- Add admin_id column
ALTER TABLE public.question_bank 
ADD COLUMN admin_id uuid REFERENCES public.user_registrations(id) ON DELETE CASCADE;

-- Add is_system_question column
ALTER TABLE public.question_bank 
ADD COLUMN is_system_question boolean DEFAULT false;

-- Make teacher_id nullable (was NOT NULL before)
ALTER TABLE public.question_bank 
ALTER COLUMN teacher_id DROP NOT NULL;

-- Add check constraint to ensure at least one of teacher_id or admin_id is present
ALTER TABLE public.question_bank
ADD CONSTRAINT question_bank_creator_check 
CHECK (teacher_id IS NOT NULL OR admin_id IS NOT NULL);

-- Update RLS policies for admin access
DROP POLICY IF EXISTS "teachers_manage_own_questions" ON public.question_bank;

-- Allow teachers to manage their own questions
CREATE POLICY "teachers_manage_own_questions" 
ON public.question_bank
FOR ALL
USING (
  teacher_id IN (
    SELECT user_id FROM user_roles WHERE role = 'teacher'::app_role
  )
  OR
  admin_id IN (
    SELECT id FROM user_registrations WHERE grade = 'admin'
  )
);