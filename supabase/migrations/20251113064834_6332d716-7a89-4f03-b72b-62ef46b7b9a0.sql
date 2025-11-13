-- Create achievements table to store badge definitions
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_th TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table to track earned badges
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_code TEXT NOT NULL REFERENCES public.achievements(code) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  UNIQUE(user_id, achievement_code)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements
  FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (user_id IN (
    SELECT id::text FROM user_registrations 
    WHERE parent_email = (auth.jwt() ->> 'email')
  ));

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id::text FROM user_registrations 
    WHERE parent_email = (auth.jwt() ->> 'email')
  ));

-- Create indexes
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_code ON public.user_achievements(achievement_code);

-- Insert initial achievement definitions
INSERT INTO public.achievements (code, name_th, name_en, description_th, description_en, icon, color, criteria) VALUES
('perfect_score', 'Perfect Score Master', 'Perfect Score Master', 'ทำข้อสอบได้คะแนนเต็ม 100%', 'Achieve a perfect score of 100%', 'trophy', 'gold', '{"type": "score", "value": 100}'),
('speed_solver', 'Speed Solver', 'Speed Solver', 'ทำข้อสอบเสร็จภายใน 10 นาที พร้อมคะแนนมากกว่า 80%', 'Complete assessment in under 10 minutes with 80%+ score', 'zap', 'yellow', '{"type": "speed", "max_time": 600, "min_score": 80}'),
('consistent_learner', 'Consistent Learner', 'Consistent Learner', 'ทำแบบทดสอบติดต่อกัน 5 ครั้ง', 'Complete 5 assessments in a row', 'flame', 'orange', '{"type": "streak", "count": 5}'),
('high_achiever', 'High Achiever', 'High Achiever', 'ได้คะแนน 90% ขึ้นไป 3 ครั้ง', 'Score 90%+ three times', 'star', 'purple', '{"type": "high_score", "count": 3, "min_score": 90}'),
('dedicated_student', 'Dedicated Student', 'Dedicated Student', 'ทำแบบทดสอบครบ 10 ครั้ง', 'Complete 10 assessments', 'book-open', 'blue', '{"type": "total_count", "count": 10}'),
('first_try', 'First Try', 'First Try', 'ทำแบบทดสอบครั้งแรก', 'Complete your first assessment', 'award', 'green', '{"type": "first_attempt"}')
ON CONFLICT (code) DO NOTHING;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(
  p_user_id TEXT,
  p_score NUMERIC,
  p_time_taken INTEGER
)
RETURNS TABLE(new_achievement_code TEXT, new_achievement_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assessment_count INTEGER;
  v_high_score_count INTEGER;
  v_recent_assessments INTEGER;
  v_achievement RECORD;
  v_already_earned BOOLEAN;
BEGIN
  -- Get user statistics
  SELECT COUNT(*) INTO v_assessment_count
  FROM level_assessments
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_high_score_count
  FROM level_assessments
  WHERE user_id = p_user_id AND score >= 90;

  -- Check recent assessments for streak (last 7 days)
  SELECT COUNT(*) INTO v_recent_assessments
  FROM level_assessments
  WHERE user_id = p_user_id 
    AND created_at > now() - interval '7 days';

  -- Check First Try
  IF v_assessment_count = 1 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_code = 'first_try'
    ) INTO v_already_earned;
    
    IF NOT v_already_earned THEN
      INSERT INTO user_achievements (user_id, achievement_code, metadata)
      VALUES (p_user_id, 'first_try', jsonb_build_object('score', p_score))
      ON CONFLICT DO NOTHING;
      
      RETURN QUERY SELECT 'first_try'::TEXT, 'First Try'::TEXT;
    END IF;
  END IF;

  -- Check Perfect Score
  IF p_score >= 100 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_code = 'perfect_score'
    ) INTO v_already_earned;
    
    IF NOT v_already_earned THEN
      INSERT INTO user_achievements (user_id, achievement_code, metadata)
      VALUES (p_user_id, 'perfect_score', jsonb_build_object('score', p_score))
      ON CONFLICT DO NOTHING;
      
      RETURN QUERY SELECT 'perfect_score'::TEXT, 'Perfect Score Master'::TEXT;
    END IF;
  END IF;

  -- Check Speed Solver (under 10 minutes with 80%+ score)
  IF p_time_taken <= 600 AND p_score >= 80 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_code = 'speed_solver'
    ) INTO v_already_earned;
    
    IF NOT v_already_earned THEN
      INSERT INTO user_achievements (user_id, achievement_code, metadata)
      VALUES (p_user_id, 'speed_solver', jsonb_build_object('time', p_time_taken, 'score', p_score))
      ON CONFLICT DO NOTHING;
      
      RETURN QUERY SELECT 'speed_solver'::TEXT, 'Speed Solver'::TEXT;
    END IF;
  END IF;

  -- Check High Achiever (90%+ three times)
  IF v_high_score_count >= 3 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_code = 'high_achiever'
    ) INTO v_already_earned;
    
    IF NOT v_already_earned THEN
      INSERT INTO user_achievements (user_id, achievement_code, metadata)
      VALUES (p_user_id, 'high_achiever', jsonb_build_object('count', v_high_score_count))
      ON CONFLICT DO NOTHING;
      
      RETURN QUERY SELECT 'high_achiever'::TEXT, 'High Achiever'::TEXT;
    END IF;
  END IF;

  -- Check Consistent Learner (5 assessments in last 7 days)
  IF v_recent_assessments >= 5 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_code = 'consistent_learner'
    ) INTO v_already_earned;
    
    IF NOT v_already_earned THEN
      INSERT INTO user_achievements (user_id, achievement_code, metadata)
      VALUES (p_user_id, 'consistent_learner', jsonb_build_object('streak', v_recent_assessments))
      ON CONFLICT DO NOTHING;
      
      RETURN QUERY SELECT 'consistent_learner'::TEXT, 'Consistent Learner'::TEXT;
    END IF;
  END IF;

  -- Check Dedicated Student (10 total assessments)
  IF v_assessment_count >= 10 THEN
    SELECT EXISTS(
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_code = 'dedicated_student'
    ) INTO v_already_earned;
    
    IF NOT v_already_earned THEN
      INSERT INTO user_achievements (user_id, achievement_code, metadata)
      VALUES (p_user_id, 'dedicated_student', jsonb_build_object('total', v_assessment_count))
      ON CONFLICT DO NOTHING;
      
      RETURN QUERY SELECT 'dedicated_student'::TEXT, 'Dedicated Student'::TEXT;
    END IF;
  END IF;

  RETURN;
END;
$$;