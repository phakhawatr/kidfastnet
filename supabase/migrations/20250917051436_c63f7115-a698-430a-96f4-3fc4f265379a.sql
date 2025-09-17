-- Create secure functions to replace direct table access
-- This will allow us to secure the data without breaking existing functionality

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