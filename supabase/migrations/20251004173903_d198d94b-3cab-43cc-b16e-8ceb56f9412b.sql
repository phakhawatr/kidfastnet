-- Add back public registration policy
CREATE POLICY "public_can_register"
ON public.user_registrations
FOR INSERT
TO public
WITH CHECK (
  status = 'pending' AND
  approved_by IS NULL AND
  approved_at IS NULL AND
  is_online = false AND
  session_id IS NULL AND
  last_activity_at IS NULL AND
  device_info IS NULL AND
  (login_count IS NULL OR login_count = 0) AND
  last_login_at IS NULL AND
  parent_email ~~ '%@%' AND
  length(parent_email) > 5 AND
  length(password_hash) >= 6 AND
  length(nickname) > 0 AND
  age > 0 AND age < 150 AND
  length(grade) > 0
);