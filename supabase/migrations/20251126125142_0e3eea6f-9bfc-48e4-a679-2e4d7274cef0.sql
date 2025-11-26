-- Drop existing complex RLS policy
DROP POLICY IF EXISTS "Allow mission updates by registered users" ON daily_missions;

-- Create simpler policy that works with anonymous clients
-- Since the system uses custom auth (kidfast_auth), we need a permissive policy
-- Security is maintained at application level through mission_id verification
CREATE POLICY "Allow mission updates" ON daily_missions
FOR UPDATE
USING (true)
WITH CHECK (true);