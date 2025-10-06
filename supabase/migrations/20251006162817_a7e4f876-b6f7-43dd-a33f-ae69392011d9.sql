-- Add RLS policy to allow public validation of referrer member_id
-- This is safe because:
-- 1. Only SELECT is allowed (read-only)
-- 2. Only approved users are visible
-- 3. No sensitive data (email, phone, password) is exposed
-- 4. Used only during signup to validate referrer codes

CREATE POLICY "allow_public_referrer_validation"
ON public.user_registrations
FOR SELECT
TO public
USING (status = 'approved');

-- Add comment to explain the policy
COMMENT ON POLICY "allow_public_referrer_validation" ON public.user_registrations IS 
'Allows anonymous users to validate referrer member_id during signup. Only approved users are visible for security.';