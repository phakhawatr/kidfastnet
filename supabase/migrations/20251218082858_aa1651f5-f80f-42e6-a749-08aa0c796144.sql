-- Fix RPC function: remove user_roles insert (school_admin uses school_memberships)
CREATE OR REPLACE FUNCTION public.create_school_with_admin(
  p_name TEXT,
  p_code TEXT,
  p_admin_user_id UUID,
  p_address TEXT DEFAULT NULL,
  p_district TEXT DEFAULT NULL,
  p_province TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_school_id UUID;
BEGIN
  -- Insert school
  INSERT INTO schools (name, code, address, district, province, phone, email, is_active)
  VALUES (p_name, p_code, p_address, p_district, p_province, p_phone, p_email, true)
  RETURNING id INTO v_school_id;
  
  -- Add school admin membership (school_admin role is checked via is_school_admin function)
  INSERT INTO school_memberships (school_id, user_id, role, is_active)
  VALUES (v_school_id, p_admin_user_id, 'school_admin', true);
  
  RETURN v_school_id;
END;
$$;