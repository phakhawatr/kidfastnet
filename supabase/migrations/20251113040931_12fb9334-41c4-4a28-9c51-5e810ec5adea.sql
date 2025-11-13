-- Drop old policies
DROP POLICY IF EXISTS "Users can insert own assessments" ON level_assessments;
DROP POLICY IF EXISTS "Users can view own assessments" ON level_assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON level_assessments;

-- Create updated policies that support both Supabase auth and localStorage auth
CREATE POLICY "Users can insert own assessments v2"
  ON level_assessments FOR INSERT
  WITH CHECK (
    -- Support Supabase auth (auth.uid)
    (auth.uid()::text = user_id)
    OR
    -- Support localStorage auth (check via user_registrations)
    (user_id IN (
      SELECT id::text FROM user_registrations 
      WHERE parent_email = (auth.jwt() ->> 'email')
    ))
  );

CREATE POLICY "Users can view own assessments v2"
  ON level_assessments FOR SELECT
  USING (
    (auth.uid()::text = user_id)
    OR
    (user_id IN (
      SELECT id::text FROM user_registrations 
      WHERE parent_email = (auth.jwt() ->> 'email')
    ))
  );

CREATE POLICY "Users can update own assessments v2"
  ON level_assessments FOR UPDATE
  USING (
    (auth.uid()::text = user_id)
    OR
    (user_id IN (
      SELECT id::text FROM user_registrations 
      WHERE parent_email = (auth.jwt() ->> 'email')
    ))
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_date 
  ON level_assessments(user_id, completed_at DESC);