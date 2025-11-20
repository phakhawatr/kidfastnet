-- Create function to assign teacher role (admin only)
CREATE OR REPLACE FUNCTION public.assign_teacher_role(
  p_user_id uuid,
  p_admin_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Verify admin session
  IF NOT verify_admin_session(p_admin_email) THEN
    RAISE EXCEPTION 'Unauthorized: Not an admin or invalid session';
  END IF;
  
  -- Get admin ID
  SELECT id INTO v_admin_id
  FROM admins
  WHERE email = p_admin_email;
  
  IF v_admin_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user exists and is approved
  IF NOT EXISTS (
    SELECT 1 FROM user_registrations 
    WHERE id = p_user_id AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'User not found or not approved';
  END IF;
  
  -- Insert teacher role (ignore if already exists)
  INSERT INTO user_roles (user_id, role, created_by)
  VALUES (p_user_id, 'teacher', v_admin_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_email,
    'assign_teacher_role',
    jsonb_build_object(
      'user_id', p_user_id,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;

-- Create function to remove teacher role (admin only)
CREATE OR REPLACE FUNCTION public.remove_teacher_role(
  p_user_id uuid,
  p_admin_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Verify admin session
  IF NOT verify_admin_session(p_admin_email) THEN
    RAISE EXCEPTION 'Unauthorized: Not an admin or invalid session';
  END IF;
  
  -- Get admin ID
  SELECT id INTO v_admin_id
  FROM admins
  WHERE email = p_admin_email;
  
  IF v_admin_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Delete teacher role
  DELETE FROM user_roles
  WHERE user_id = p_user_id AND role = 'teacher';
  
  -- Log admin action
  PERFORM log_admin_action(
    p_admin_email,
    'remove_teacher_role',
    jsonb_build_object(
      'user_id', p_user_id,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;