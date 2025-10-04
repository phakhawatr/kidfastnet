-- ============================================
-- FIX: Infinite Recursion and Admin Dashboard
-- ============================================

-- Step 1: Drop all existing problematic policies
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

-- Step 2: Simple policy for users to view their own registration (NO RECURSION)
CREATE POLICY "users_own_data"
ON public.user_registrations
FOR SELECT
USING (parent_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Step 3: Simple policy for admins (checks admins table directly)
CREATE POLICY "admins_all_data"
ON public.user_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Step 4: User roles policies (separate for each operation)
CREATE POLICY "admins_select_roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

CREATE POLICY "admins_insert_roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

CREATE POLICY "admins_update_roles"
ON public.user_roles
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

CREATE POLICY "admins_delete_roles"
ON public.user_roles
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.admin_get_user_registrations(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, jsonb) TO anon, authenticated;