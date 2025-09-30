-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated admins can read registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Authenticated admins can update registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Public can insert new registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Authenticated admins can delete registrations" ON public.user_registrations;

-- Policy 1: Admin read access via SECURITY DEFINER functions only
CREATE POLICY "admins_read_via_functions_only"
ON public.user_registrations
FOR SELECT
USING (false);
-- Admins use get_user_registrations() function which bypasses RLS

-- Policy 2: Admin update access via SECURITY DEFINER functions only
CREATE POLICY "admins_update_via_functions_only"
ON public.user_registrations
FOR UPDATE
USING (false);
-- Admins use approve/reject/suspend functions which bypass RLS

-- Policy 3: Admin delete access via SECURITY DEFINER functions only
CREATE POLICY "admins_delete_via_functions_only"
ON public.user_registrations
FOR DELETE
USING (false);
-- Admins use delete_user_registration() function which bypasses RLS

-- Policy 4: Public can insert new registrations with strict field restrictions
CREATE POLICY "public_can_register_with_restrictions"
ON public.user_registrations
FOR INSERT
WITH CHECK (
  -- Ensure status is always 'pending' for new registrations
  status = 'pending' AND
  -- Prevent privilege escalation
  approved_by IS NULL AND
  approved_at IS NULL AND
  -- Prevent session manipulation
  is_online = false AND
  session_id IS NULL AND
  last_activity_at IS NULL AND
  device_info IS NULL AND
  -- Prevent login stat manipulation
  (login_count IS NULL OR login_count = 0) AND
  last_login_at IS NULL AND
  -- Require valid email format (basic check)
  parent_email LIKE '%@%' AND
  length(parent_email) > 5 AND
  -- Require password
  length(password_hash) >= 6 AND
  -- Require basic user info
  length(nickname) > 0 AND
  age > 0 AND age < 150 AND
  length(grade) > 0
);

-- Policy 5: Users can view ONLY their own registration by email (for status checking)
CREATE POLICY "users_can_view_own_registration"
ON public.user_registrations
FOR SELECT
USING (
  -- Allow viewing own registration only via authenticate_user function
  -- This policy is for post-authentication status checks only
  false
);
-- Users check status via authenticate_user() function which bypasses RLS

-- Add table comment for security documentation
COMMENT ON TABLE public.user_registrations IS 'User registration data with strict RLS. Public can INSERT with field restrictions. All other operations require SECURITY DEFINER functions (authenticate_user, get_user_registrations, approve_user_registration, etc.) to ensure proper authorization.';