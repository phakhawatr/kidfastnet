-- Drop existing complex SELECT policy that causes issues with anonymous users
DROP POLICY IF EXISTS "Users can view own missions" ON daily_missions;

-- Create simpler SELECT policy that works with anonymous access
CREATE POLICY "Allow mission reads" ON daily_missions
FOR SELECT
USING (true);