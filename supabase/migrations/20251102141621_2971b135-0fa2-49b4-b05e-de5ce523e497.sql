-- Create skill_assessments table to track user performance by skill
CREATE TABLE IF NOT EXISTS public.skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  accuracy_rate NUMERIC NOT NULL DEFAULT 0,
  average_time NUMERIC,
  difficulty_level TEXT NOT NULL DEFAULT 'medium',
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_registrations(id) ON DELETE CASCADE
);

-- Create learning_paths table to store AI-generated learning paths
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  path_name TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL,
  skills_to_focus TEXT[] NOT NULL,
  difficulty_progression TEXT NOT NULL,
  estimated_duration INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_registrations(id) ON DELETE CASCADE
);

-- Create practice_sessions table to log each practice session
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  problems_attempted INTEGER NOT NULL,
  problems_correct INTEGER NOT NULL,
  time_spent INTEGER NOT NULL,
  accuracy NUMERIC NOT NULL,
  hints_used INTEGER NOT NULL DEFAULT 0,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_registrations(id) ON DELETE CASCADE
);

-- Create ai_recommendations table to store AI suggestions
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  suggested_difficulty TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 5,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_registrations(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_id ON public.skill_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_skill_name ON public.skill_assessments(skill_name);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_status ON public.learning_paths(status);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_session_date ON public.practice_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_completed ON public.ai_recommendations(is_completed);

-- Enable RLS on all tables
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skill_assessments
CREATE POLICY "Users can view their own skill assessments"
  ON public.skill_assessments FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

CREATE POLICY "Users can insert their own skill assessments"
  ON public.skill_assessments FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

CREATE POLICY "Users can update their own skill assessments"
  ON public.skill_assessments FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

-- RLS Policies for learning_paths
CREATE POLICY "Users can view their own learning paths"
  ON public.learning_paths FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

CREATE POLICY "Users can insert their own learning paths"
  ON public.learning_paths FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

CREATE POLICY "Users can update their own learning paths"
  ON public.learning_paths FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

-- RLS Policies for practice_sessions
CREATE POLICY "Users can view their own practice sessions"
  ON public.practice_sessions FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

CREATE POLICY "Users can insert their own practice sessions"
  ON public.practice_sessions FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can view their own AI recommendations"
  ON public.ai_recommendations FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

CREATE POLICY "Users can update their own AI recommendations"
  ON public.ai_recommendations FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = auth.jwt()->>'email'
  ));

-- Function to update skill assessment stats
CREATE OR REPLACE FUNCTION update_skill_assessment(
  p_user_id UUID,
  p_skill_name TEXT,
  p_correct BOOLEAN,
  p_time_spent INTEGER
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assessment RECORD;
BEGIN
  -- Get current assessment
  SELECT * INTO v_assessment
  FROM skill_assessments
  WHERE user_id = p_user_id AND skill_name = p_skill_name;
  
  IF v_assessment.id IS NULL THEN
    -- Create new assessment
    INSERT INTO skill_assessments (
      user_id, skill_name, total_attempts, correct_attempts, 
      accuracy_rate, average_time, last_practiced_at
    ) VALUES (
      p_user_id, p_skill_name, 1, CASE WHEN p_correct THEN 1 ELSE 0 END,
      CASE WHEN p_correct THEN 100 ELSE 0 END, p_time_spent, now()
    );
  ELSE
    -- Update existing assessment
    UPDATE skill_assessments
    SET 
      total_attempts = total_attempts + 1,
      correct_attempts = correct_attempts + CASE WHEN p_correct THEN 1 ELSE 0 END,
      accuracy_rate = ((correct_attempts::NUMERIC + CASE WHEN p_correct THEN 1 ELSE 0 END) / 
                      (total_attempts::NUMERIC + 1)) * 100,
      average_time = CASE 
        WHEN average_time IS NULL THEN p_time_spent
        ELSE ((average_time * total_attempts) + p_time_spent) / (total_attempts + 1)
      END,
      last_practiced_at = now(),
      updated_at = now()
    WHERE user_id = p_user_id AND skill_name = p_skill_name;
  END IF;
END;
$$;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_learning_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_skill_assessments_updated_at
  BEFORE UPDATE ON skill_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_updated_at();

CREATE TRIGGER trigger_learning_paths_updated_at
  BEFORE UPDATE ON learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_updated_at();

CREATE TRIGGER trigger_ai_recommendations_updated_at
  BEFORE UPDATE ON ai_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_updated_at();