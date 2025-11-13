-- Create level_assessments table
CREATE TABLE IF NOT EXISTS level_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  grade INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  total_questions INTEGER DEFAULT 30,
  correct_answers INTEGER DEFAULT 0,
  score DECIMAL(5,2),
  time_taken INTEGER,
  assessment_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_level_assessments_user ON level_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_level_assessments_grade_semester ON level_assessments(grade, semester);

-- Enable RLS
ALTER TABLE level_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own assessments"
  ON level_assessments FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can insert own assessments"
  ON level_assessments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));

CREATE POLICY "Users can update own assessments"
  ON level_assessments FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id = current_setting('request.jwt.claim.sub', true));