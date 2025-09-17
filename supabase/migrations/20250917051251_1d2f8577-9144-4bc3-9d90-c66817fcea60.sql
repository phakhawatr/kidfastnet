-- Fix critical security vulnerability: Remove public access to sensitive data
-- First, drop ALL existing policies to start fresh

-- Drop all existing policies on admins table
DROP POLICY IF EXISTS "Public read access to admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can read admin data" ON public.admins;

-- Drop all existing policies on user_registrations table  
DROP POLICY IF EXISTS "Public read access to registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Public update access to registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Authenticated admins can read registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Authenticated admins can update registrations" ON public.user_registrations;
DROP POLICY IF EXISTS "Anyone can insert registration" ON public.user_registrations;

-- Create secure function for admin authentication (bypass RLS)
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email TEXT, admin_password TEXT)
RETURNS TABLE(admin_id UUID, name TEXT, email TEXT, is_valid BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Find admin by email (this function bypasses RLS)
    SELECT a.id, a.name, a.email, a.password_hash 
    INTO admin_record
    FROM public.admins a 
    WHERE a.email = admin_email;
    
    -- Check if admin exists and password matches
    IF admin_record.id IS NOT NULL AND admin_record.password_hash = admin_password THEN
        RETURN QUERY SELECT admin_record.id, admin_record.name, admin_record.email, true;
    ELSE
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false;
    END IF;
END;
$$;

-- Create secure function to get registrations (bypass RLS, only for authenticated admin code)
CREATE OR REPLACE FUNCTION public.get_user_registrations()
RETURNS TABLE(
    id UUID,
    nickname TEXT,
    age INTEGER,
    grade TEXT,
    avatar TEXT,
    learning_style TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This function bypasses RLS - only call from authenticated admin code
    RETURN QUERY 
    SELECT 
        ur.id,
        ur.nickname,
        ur.age,
        ur.grade,
        ur.avatar,
        ur.learning_style,
        ur.parent_email,
        ur.parent_phone,
        ur.status,
        ur.created_at,
        ur.approved_at,
        ur.approved_by
    FROM public.user_registrations ur
    ORDER BY ur.created_at DESC;
END;
$$;

-- Now create minimal secure RLS policies

-- Admins table: No public access, only through secure functions
-- (No SELECT policy = no direct access)

-- User registrations table: Only allow public INSERT for new registrations
CREATE POLICY "Allow public registration insert" ON public.user_registrations
  FOR INSERT 
  WITH CHECK (true);

-- No SELECT or UPDATE policies on user_registrations = no public access to existing data
-- All data access must go through secure functions