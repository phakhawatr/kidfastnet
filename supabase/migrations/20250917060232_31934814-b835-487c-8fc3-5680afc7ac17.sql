-- FINAL SECURITY FIX: Secure Profiles Table
-- This addresses the remaining warning about profile data access

-- Create secure RLS policies for profiles table
-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- Keep existing policies for SELECT and UPDATE that already check user ownership

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'SECURED: Profiles table with complete RLS policies - users can only access their own data';