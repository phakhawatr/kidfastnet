-- Update profiles table grade check constraint to allow 'admin' value
-- Drop existing constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_grade_check;

-- Add new constraint that allows admin, 1-6, ป.1 through ป.6
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_grade_check 
CHECK (grade IN ('admin', '1', '2', '3', '4', '5', '6', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'));