-- Create progress_view_tokens table for temporary public access
CREATE TABLE IF NOT EXISTS public.progress_view_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  accessed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.progress_view_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to verify tokens (needed for public access)
CREATE POLICY "Anyone can verify valid tokens"
  ON public.progress_view_tokens
  FOR SELECT
  USING (expires_at > now());

-- Policy: System can insert tokens
CREATE POLICY "System can insert tokens"
  ON public.progress_view_tokens
  FOR INSERT
  WITH CHECK (true);

-- Policy: System can update access time
CREATE POLICY "System can update tokens"
  ON public.progress_view_tokens
  FOR UPDATE
  USING (true);

-- Create index for faster token lookups
CREATE INDEX idx_progress_view_tokens_token ON public.progress_view_tokens(token);
CREATE INDEX idx_progress_view_tokens_expires ON public.progress_view_tokens(expires_at);

-- Function to clean up expired tokens (optional, for housekeeping)
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.progress_view_tokens
  WHERE expires_at < now() - INTERVAL '1 day';
END;
$$;