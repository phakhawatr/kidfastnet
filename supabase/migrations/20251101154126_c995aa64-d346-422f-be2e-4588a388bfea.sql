-- Add subscription and AI features columns to user_registrations
ALTER TABLE user_registrations 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium')),
ADD COLUMN IF NOT EXISTS ai_features_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_monthly_quota INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_quota_reset_date DATE;

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2),
  price_6_months DECIMAL(10,2),
  ai_features_enabled BOOLEAN DEFAULT FALSE,
  ai_monthly_quota INTEGER DEFAULT 0,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view plans
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (true);

-- Insert default plans
INSERT INTO subscription_plans (plan_name, price_monthly, price_6_months, ai_features_enabled, ai_monthly_quota, features) VALUES
('basic', 0, 0, FALSE, 0, '{"access_to_drills": true, "progress_tracking": true, "features": ["แบบฝึกหัดคณิตศาสตร์ทุกประเภท", "ติดตามความก้าวหน้า", "รายงานผลการเรียน"]}'::jsonb),
('premium', 99, 399, TRUE, 100, '{"access_to_drills": true, "progress_tracking": true, "ai_tutor": true, "ai_analytics": true, "adaptive_problems": true, "features": ["แบบฝึกหัดคณิตศาสตร์ทุกประเภท", "ติดตามความก้าวหน้า", "รายงานผลการเรียน", "ครูคณิตศาสตร์ AI (100 ครั้ง/เดือน)", "วิเคราะห์จุดอ่อน-จุดแข็งด้วย AI", "โจทย์ที่ปรับระดับอัตโนมัติ", "รายงานละเอียดสำหรับผู้ปกครอง"]}'::jsonb)
ON CONFLICT (plan_name) DO NOTHING;

-- Create ai_usage_logs table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_registrations(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  tokens_used INTEGER,
  cost_estimate DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ai_usage_logs
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI usage logs
CREATE POLICY "Users can view own AI usage"
  ON ai_usage_logs FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_registrations 
    WHERE parent_email = (auth.jwt() ->> 'email')
  ));

-- Admins can view all AI usage logs
CREATE POLICY "Admins can view all AI usage"
  ON ai_usage_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE email = (auth.jwt() ->> 'email')
  ));

-- Function to check and reset AI quota
CREATE OR REPLACE FUNCTION check_and_reset_ai_quota(p_user_id UUID)
RETURNS TABLE(has_quota BOOLEAN, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get user info
  SELECT 
    ai_features_enabled,
    ai_monthly_quota,
    ai_usage_count,
    ai_quota_reset_date
  INTO v_user
  FROM user_registrations
  WHERE id = p_user_id;

  -- If no reset date set, set it to first day of next month
  IF v_user.ai_quota_reset_date IS NULL THEN
    UPDATE user_registrations
    SET ai_quota_reset_date = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    WHERE id = p_user_id;
    
    v_user.ai_quota_reset_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
  END IF;

  -- Reset quota if past reset date
  IF v_today >= v_user.ai_quota_reset_date THEN
    UPDATE user_registrations
    SET 
      ai_usage_count = 0,
      ai_quota_reset_date = DATE_TRUNC('month', v_today) + INTERVAL '1 month'
    WHERE id = p_user_id;
    
    v_user.ai_usage_count := 0;
  END IF;

  -- Return quota status
  RETURN QUERY
  SELECT 
    v_user.ai_features_enabled AND (v_user.ai_monthly_quota - v_user.ai_usage_count) > 0,
    (v_user.ai_monthly_quota - v_user.ai_usage_count)::INTEGER;
END;
$$;

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tokens_used INTEGER DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update usage count
  UPDATE user_registrations
  SET ai_usage_count = ai_usage_count + 1
  WHERE id = p_user_id;

  -- Log usage
  INSERT INTO ai_usage_logs (user_id, feature_type, tokens_used)
  VALUES (p_user_id, p_feature_type, p_tokens_used);

  RETURN TRUE;
END;
$$;