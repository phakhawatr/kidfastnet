-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  streak_warning BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notification preferences
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.user_registrations
      WHERE parent_email = (
        SELECT parent_email FROM public.user_registrations WHERE id = notification_preferences.user_id
      )
    )
  );

-- Policy: Users can insert their own notification preferences
CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.user_registrations
      WHERE parent_email = (
        SELECT parent_email FROM public.user_registrations WHERE id = notification_preferences.user_id
      )
    )
  );

-- Policy: Users can update their own notification preferences
CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.user_registrations
      WHERE parent_email = (
        SELECT parent_email FROM public.user_registrations WHERE id = notification_preferences.user_id
      )
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);