-- Create table for LINE message logs
CREATE TABLE line_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_registrations(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  message_data JSONB,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast querying by user and date
CREATE INDEX idx_line_message_logs_user_date 
ON line_message_logs(user_id, sent_at DESC);

-- Enable RLS
ALTER TABLE line_message_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view own line message logs"
ON line_message_logs
FOR SELECT
USING (user_id IN (
  SELECT id FROM user_registrations 
  WHERE parent_email = auth.jwt()->>'email'
));

-- Policy: Allow inserts from service role (edge function)
CREATE POLICY "Allow service role to insert logs"
ON line_message_logs
FOR INSERT
WITH CHECK (true);

-- Function to check LINE message quota
CREATE OR REPLACE FUNCTION check_line_message_quota(p_user_id UUID)
RETURNS TABLE(
  can_send BOOLEAN,
  messages_sent_today INTEGER,
  quota_limit INTEGER,
  remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_messages_today INTEGER;
  v_quota_limit INTEGER := 20;
BEGIN
  -- Count messages sent today (successful only)
  SELECT COUNT(*) INTO v_messages_today
  FROM line_message_logs
  WHERE user_id = p_user_id
    AND sent_at >= CURRENT_DATE
    AND sent_at < CURRENT_DATE + INTERVAL '1 day'
    AND success = true;
  
  -- Return quota status
  RETURN QUERY
  SELECT 
    (v_messages_today < v_quota_limit) as can_send,
    v_messages_today::INTEGER as messages_sent_today,
    v_quota_limit::INTEGER as quota_limit,
    (v_quota_limit - v_messages_today)::INTEGER as remaining;
END;
$$;