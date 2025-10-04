-- ============================================
-- FIX: Infinite Recursion in RLS & Admin Function Issues
-- ============================================

-- Step 1: Drop the problematic policy causing infinite recursion
DROP POLICY IF EXISTS "Users can view own registration data" ON public.user_registrations;

-- Step 2: Create a simpler, non-recursive policy for user_registrations
-- Users can view their OWN data directly without complex subqueries
CREATE POLICY "Users can view own registration via email"
ON public.user_registrations
FOR SELECT
TO public
USING (
  parent_email = current_setting('request.jwt.claims', true)::json->>'email'
);

-- Step 3: Create separate policy for admins (simpler check)
CREATE POLICY "Admins can view all registrations"
ON public.user_registrations
FOR SELECT
TO public
USING (
  -- Check if current user has admin role directly
  EXISTS (
    SELECT 1 
    FROM public.admins a
    WHERE a.email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Step 4: Grant explicit permissions to anon role for the function
GRANT EXECUTE ON FUNCTION public.admin_get_user_registrations(text) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_get_user_registrations(text) TO authenticated;

-- Step 5: Ensure user_roles policies don't cause recursion
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view roles"
ON public.user_roles
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

CREATE POLICY "Admins can modify roles"
ON public.user_roles
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.email = current_setting('request.jwt.claims', true)::json->>'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Step 6: Add comments for documentation
COMMENT ON POLICY "Users can view own registration via email" ON public.user_registrations IS 'Allows users to view their own registration by matching parent_email with JWT email claim. Non-recursive.';
COMMENT ON POLICY "Admins can view all registrations" ON public.user_registrations IS 'Allows admins to view all registrations by checking admins table directly. Non-recursive.';