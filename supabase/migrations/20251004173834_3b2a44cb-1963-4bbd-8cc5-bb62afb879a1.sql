-- Drop ALL user_roles policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
    END LOOP;
END $$;

-- Drop ALL user_registrations policies  
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_registrations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_registrations', pol.policyname);
    END LOOP;
END $$;

-- NOW create fresh, simple policies
CREATE POLICY "users_view_own_data"
ON public.user_registrations
FOR SELECT
TO public
USING (parent_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "admins_view_all_data"
ON public.user_registrations
FOR SELECT
TO public
USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
);

CREATE POLICY "admins_select_roles"
ON public.user_roles FOR SELECT TO public
USING (EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "admins_insert_roles"
ON public.user_roles FOR INSERT TO public
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "admins_update_roles"
ON public.user_roles FOR UPDATE TO public
USING (EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email'))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "admins_delete_roles"
ON public.user_roles FOR DELETE TO public
USING (EXISTS (SELECT 1 FROM public.admins WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.admin_get_user_registrations(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(text, text, jsonb) TO anon, authenticated;