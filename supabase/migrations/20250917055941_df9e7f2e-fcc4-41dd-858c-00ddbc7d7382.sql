-- CRITICAL SECURITY FIX: Secure Admin and User Registration Tables
-- This migration adds proper Row Level Security policies to protect sensitive data

-- 1. First, ensure RLS is enabled on critical tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing dangerous public policies
DROP POLICY IF EXISTS "Public read access to admins" ON public.admins;
DROP POLICY IF EXISTS "Public read access to registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Public update access to registrations" ON public.user_registrations;

-- 3. Create a function to check if current user is an authenticated admin
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- This function can only return true for authenticated admin sessions
  -- In this system, admins use the authenticate_admin function which doesn't use auth.uid()
  -- So we'll return false by default for RLS, letting SECURITY DEFINER functions bypass this
  RETURN false;
END;
$$;

-- 4. Create secure RLS policies for admins table
-- Only authenticated admins can read admin data
CREATE POLICY "Authenticated admins can read admin data" 
ON public.admins 
FOR SELECT 
USING (public.is_authenticated_admin());

-- Only authenticated admins can modify admin data
CREATE POLICY "Authenticated admins can update admin data" 
ON public.admins 
FOR UPDATE 
USING (public.is_authenticated_admin());

-- Only authenticated admins can insert new admins
CREATE POLICY "Authenticated admins can insert admin data" 
ON public.admins 
FOR INSERT 
WITH CHECK (public.is_authenticated_admin());

-- Only authenticated admins can delete admin data
CREATE POLICY "Authenticated admins can delete admin data" 
ON public.admins 
FOR DELETE 
USING (public.is_authenticated_admin());

-- 5. Create secure RLS policies for user_registrations table
-- Only authenticated admins can read registration data
CREATE POLICY "Authenticated admins can read registrations" 
ON public.user_registrations 
FOR SELECT 
USING (public.is_authenticated_admin());

-- Only authenticated admins can update registration status
CREATE POLICY "Authenticated admins can update registrations" 
ON public.user_registrations 
FOR UPDATE 
USING (public.is_authenticated_admin());

-- Keep public insert for new registrations (signup process)
CREATE POLICY "Public can insert new registrations" 
ON public.user_registrations 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated admins can delete registrations
CREATE POLICY "Authenticated admins can delete registrations" 
ON public.user_registrations 
FOR DELETE 
USING (public.is_authenticated_admin());

-- 6. Ensure our authentication functions can still work
-- The authenticate_admin and other SECURITY DEFINER functions will bypass RLS
-- This is secure because they contain their own access controls

-- 7. Add comments for documentation
COMMENT ON TABLE public.admins IS 'SECURED: Admin table with RLS policies - access via authenticate_admin() function only';
COMMENT ON TABLE public.user_registrations IS 'SECURED: User registrations with RLS policies - admins access via get_user_registrations() function';
COMMENT ON FUNCTION public.authenticate_admin(text, text) IS 'SECURITY DEFINER function to authenticate admins - bypasses RLS safely';
COMMENT ON FUNCTION public.get_user_registrations() IS 'SECURITY DEFINER function for admins to read registrations - bypasses RLS safely';

-- 8. Verify security: These queries should now return empty results for non-admin users
-- SELECT * FROM admins; -- Should return nothing for public users
-- SELECT * FROM user_registrations; -- Should return nothing for public users