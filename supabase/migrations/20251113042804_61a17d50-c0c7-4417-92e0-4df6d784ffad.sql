-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own assessments v2" ON level_assessments;
DROP POLICY IF EXISTS "Users can update own assessments v2" ON level_assessments;
DROP POLICY IF EXISTS "Users can view own assessments v2" ON level_assessments;

-- Create new policy for INSERT (v3)
-- Supports both localStorage auth (user_registrations) and Supabase auth (auth.uid)
CREATE POLICY "Users can insert own assessments v3" ON level_assessments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_registrations 
      WHERE (id)::text = user_id
        AND status = 'approved'
    )
    OR
    ((auth.uid())::text = user_id)
  );

-- Create new policy for SELECT (v3)
CREATE POLICY "Users can view own assessments v3" ON level_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM user_registrations 
      WHERE (id)::text = user_id
    )
    OR
    ((auth.uid())::text = user_id)
  );

-- Create new policy for UPDATE (v3)
CREATE POLICY "Users can update own assessments v3" ON level_assessments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM user_registrations 
      WHERE (id)::text = user_id
    )
    OR
    ((auth.uid())::text = user_id)
  );