-- Secure the admins table by forcing RLS even for service role
-- This prevents any direct access to admin credentials outside of SECURITY DEFINER functions

-- Ensure RLS is enabled on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner and service role (critical for security)
ALTER TABLE public.admins FORCE ROW LEVEL SECURITY;

-- The existing 'deny_all_direct_access' policy already blocks all direct access
-- Admin authentication must go through the authenticate_admin SECURITY DEFINER function only