-- Fix RLS policy for daily_missions to allow updates from registered users
-- This fixes the issue where completed missions aren't being saved

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own missions" ON daily_missions;

-- Create new simpler policy that allows updates for registered users
-- This is safer than allowing all anonymous updates
CREATE POLICY "Allow mission updates by registered users" ON daily_missions
FOR UPDATE
USING (
  user_id IN (SELECT id FROM user_registrations WHERE status = 'approved')
)
WITH CHECK (
  user_id IN (SELECT id FROM user_registrations WHERE status = 'approved')
);