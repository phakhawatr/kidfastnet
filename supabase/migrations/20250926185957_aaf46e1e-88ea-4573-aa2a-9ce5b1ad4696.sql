-- Fix RLS policies on profiles table to prevent unauthorized access to parent contact information

-- Drop existing policies that might be vulnerable
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile only" ON public.profiles;

-- Create more secure policies that explicitly check authentication and user ownership
CREATE POLICY "Authenticated users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

CREATE POLICY "Authenticated users can update own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

CREATE POLICY "Authenticated users can insert own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = user_id::text);

-- Add policy to allow admins to manage all profiles for admin dashboard
CREATE POLICY "Authenticated admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (is_authenticated_admin())
WITH CHECK (is_authenticated_admin());

-- Ensure no access for anonymous users by default (this is implicit but good to be explicit)
-- RLS is already enabled, so anonymous users will be denied by default