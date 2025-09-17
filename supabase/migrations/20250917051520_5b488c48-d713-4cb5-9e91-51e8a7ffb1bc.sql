-- Remove dangerous public read policies to complete security fix

-- Drop the public read policy on admins table
DROP POLICY IF EXISTS "Public read access to admins" ON public.admins;

-- Drop the public read policy on user_registrations table  
DROP POLICY IF EXISTS "Public read access to registrations" ON public.user_registrations;

-- Drop the public update policy on user_registrations table
DROP POLICY IF EXISTS "Public update access to registrations" ON public.user_registrations;

-- The system now securely uses:
-- 1. authenticate_admin() function for admin login (bypasses RLS)
-- 2. get_user_registrations() function for fetching registration data (bypasses RLS) 
-- 3. approve_user_registration() and reject_user_registration() functions for approvals
-- 4. Public INSERT policy remains for new user registrations

-- Verify no unauthorized access remains
COMMENT ON TABLE public.admins IS 'Secure table - no public access, use authenticate_admin() function';
COMMENT ON TABLE public.user_registrations IS 'Secure table - public can only insert, use get_user_registrations() function for reading';