-- Create notification_job_logs table for tracking job execution
CREATE TABLE public.notification_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  users_found INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_skipped INTEGER DEFAULT 0,
  skip_reasons JSONB DEFAULT '[]'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_job_logs ENABLE ROW LEVEL SECURITY;

-- Allow Edge Functions to insert logs (using service role)
CREATE POLICY "Allow service role to insert job logs"
ON public.notification_job_logs
FOR INSERT
WITH CHECK (true);

-- Allow admins to view job logs
CREATE POLICY "Admins can view job logs"
ON public.notification_job_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email')
  )
);

-- Create index for faster queries
CREATE INDEX idx_notification_job_logs_job_name ON public.notification_job_logs(job_name);
CREATE INDEX idx_notification_job_logs_triggered_at ON public.notification_job_logs(triggered_at DESC);