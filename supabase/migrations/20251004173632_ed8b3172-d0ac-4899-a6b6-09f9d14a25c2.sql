-- ============================================
-- FIX: Infinite Recursion and Admin Dashboard (Corrected)
-- ============================================

-- Step 1: Drop ALL existing problematic policies
DROP POLICY IF EXISTS "Users can view own registration data" ON public.user_registrations;
DROP POLICY IF EXISTS "Users can view own registration via email" ON public.user_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "users_view_own_registration" ON public.user_registrations;
DROP POLICY IF EXISTS "admins_view_all_registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can modify roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_view_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins_manage_user_roles" ON public.user_roles;

-- Step 2: Create simple SELECT policy for regular users
CREATE POLICY "users_view_own_registration"
ON public.user_registrations
FOR SELECT
TO public
USING (
  parent_email = current_setting('request.jwt.claims', true)::json->>'email'
);

-- Step 3: Create admin SELECT policy
CREATE POLICY "admins_view_all_registrations"
ON public.user_registrations
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Step 4: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_get_user_registrations(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, jsonb) TO anon, authenticated;

-- Step 5: Create policies for user_roles
CREATE POLICY "admins_view_user_roles"
ON public.user_roles
FOR SELECT
TO public
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

CREATE POLICY "admins_insert_user_roles"
ON public.user_roles
FOR INSERT
TO public
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

CREATE POLICY "admins_update_user_roles"
ON public.user_roles
FOR UPDATE
TO public
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

CREATE POLICY "admins_delete_user_roles"
ON public.user_roles
FOR DELETE
TO public
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);