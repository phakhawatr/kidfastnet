-- Create Security Definer Function for user registration
-- This function bypasses RLS policies while maintaining security through triggers
CREATE OR REPLACE FUNCTION public.register_new_user(
  p_nickname text,
  p_age integer,
  p_grade text,
  p_avatar text,
  p_learning_style text,
  p_parent_email text,
  p_parent_phone text,
  p_password text,
  p_affiliate_code text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Insert new user registration with all required fields
  INSERT INTO user_registrations (
    nickname,
    age,
    grade,
    avatar,
    learning_style,
    parent_email,
    parent_phone,
    password_hash,
    status,
    referred_by_code,
    is_online,
    session_id,
    last_activity_at,
    device_info,
    login_count,
    last_login_at,
    approved_by,
    approved_at
  ) VALUES (
    p_nickname,
    p_age,
    p_grade,
    p_avatar,
    p_learning_style,
    p_parent_email,
    p_parent_phone,
    p_password,
    'pending',
    p_affiliate_code,
    false,
    NULL,
    NULL,
    NULL,
    0,
    NULL,
    NULL,
    NULL
  )
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise the exception with more context
    RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.register_new_user TO anon;
GRANT EXECUTE ON FUNCTION public.register_new_user TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.register_new_user IS 'Registers a new user by bypassing RLS policies using SECURITY DEFINER. Validation is still performed by database triggers.';