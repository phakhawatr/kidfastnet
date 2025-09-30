-- Drop all existing RLS policies on admins table (including any restrictive ones)
DROP POLICY IF EXISTS "Admins can read admin data" ON public.admins;
DROP POLICY IF EXISTS "Admins can insert admin data" ON public.admins;
DROP POLICY IF EXISTS "Admins can update admin data" ON public.admins;
DROP POLICY IF EXISTS "Admins can delete admin data" ON public.admins;
DROP POLICY IF EXISTS "Admins table is not directly accessible" ON public.admins;

-- Create a single restrictive policy that denies all direct access
-- All admin operations must go through SECURITY DEFINER functions
CREATE POLICY "deny_all_direct_access"
ON public.admins
FOR ALL
USING (false)
WITH CHECK (false);

-- Add documentation
COMMENT ON TABLE public.admins IS 'Admin authentication table. Direct access is prohibited. All operations must use SECURITY DEFINER functions like authenticate_admin() which bypass RLS for secure server-side authentication.';