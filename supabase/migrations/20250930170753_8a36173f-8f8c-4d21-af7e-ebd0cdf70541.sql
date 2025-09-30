-- Drop all existing insecure RLS policies on admins table
DROP POLICY IF EXISTS "Admins can read admin data" ON public.admins;
DROP POLICY IF EXISTS "Admins can insert admin data" ON public.admins;
DROP POLICY IF EXISTS "Admins can update admin data" ON public.admins;
DROP POLICY IF EXISTS "Admins can delete admin data" ON public.admins;

-- Create a restrictive policy that denies all direct access
-- All admin operations must go through SECURITY DEFINER functions
CREATE POLICY "Admins table is not directly accessible"
ON public.admins
FOR ALL
USING (false)
WITH CHECK (false);

-- Ensure the authenticate_admin function can still access the table
-- (it already has SECURITY DEFINER which bypasses RLS)

-- Add a comment to document the security model
COMMENT ON TABLE public.admins IS 'Admin table with strict RLS. All operations must use SECURITY DEFINER functions like authenticate_admin(). Direct client access is prohibited.';