-- Fix security vulnerability in profiles table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Authenticated users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated admins can manage all profiles" ON public.profiles;

-- Create new secure policies with explicit authentication requirements
-- Policy 1: Only authenticated users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Policy 2: Only authenticated users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Policy 3: Only authenticated users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Policy 4: Only authenticated users can delete their own profile
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Fix admins table policies as well for consistency
DROP POLICY IF EXISTS "Authenticated admins can read admin data" ON public.admins;
DROP POLICY IF EXISTS "Authenticated admins can insert admin data" ON public.admins;
DROP POLICY IF EXISTS "Authenticated admins can update admin data" ON public.admins;
DROP POLICY IF EXISTS "Authenticated admins can delete admin data" ON public.admins;

-- Create secure admin policies that explicitly require authentication
CREATE POLICY "Admins can read admin data" 
ON public.admins 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert admin data" 
ON public.admins 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update admin data" 
ON public.admins 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete admin data" 
ON public.admins 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL);