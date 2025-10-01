-- Secure the profiles table to prevent public access to sensitive student and parent data
-- Drop existing policies and recreate them as explicitly PERMISSIVE

DROP POLICY IF EXISTS "authenticated_users_select_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_delete_own_profile" ON public.profiles;

-- Create PERMISSIVE policies that only allow authenticated users to access their own data
CREATE POLICY "authenticated_users_select_own_profile" 
ON public.profiles 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "authenticated_users_insert_own_profile" 
ON public.profiles 
AS PERMISSIVE
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_update_own_profile" 
ON public.profiles 
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_users_delete_own_profile" 
ON public.profiles 
AS PERMISSIVE
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS to apply even for service role and table owner
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;