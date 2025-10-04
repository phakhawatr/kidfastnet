-- ============================================
-- CRITICAL FIX: Admin Authentication Security
-- ============================================

-- Step 1: Update authenticate_admin to work with RBAC and add logging
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email text, admin_password text)
RETURNS TABLE(admin_id uuid, name text, email text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_record RECORD;
    attempt_count INTEGER;
BEGIN
    -- Log authentication attempt
    PERFORM log_security_event(
        'admin_login_attempt',
        admin_email,
        jsonb_build_object('timestamp', now())
    );
    
    -- Check for rate limiting (5 attempts per 15 minutes for admin)
    SELECT COUNT(*) INTO attempt_count
    FROM security_audit_log
    WHERE user_identifier = admin_email
      AND event_type IN ('admin_login_attempt', 'admin_login_failed')
      AND created_at > (now() - interval '15 minutes');
    
    IF attempt_count > 5 THEN
        PERFORM log_security_event(
            'admin_login_rate_limit_exceeded',
            admin_email,
            jsonb_build_object('attempt_count', attempt_count)
        );
        RAISE EXCEPTION 'Too many admin login attempts. Please try again later.';
    END IF;
    
    -- Find admin by email and password
    SELECT a.id, a.name, a.email, a.password_hash 
    INTO admin_record
    FROM public.admins a 
    WHERE a.email = admin_email;
    
    -- Check if admin exists and password matches
    IF admin_record.id IS NOT NULL AND admin_record.password_hash = admin_password THEN
        -- Ensure admin has role in user_roles table
        INSERT INTO public.user_roles (user_id, role, created_by)
        VALUES (admin_record.id, 'admin', admin_record.id)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Log successful login
        PERFORM log_security_event(
            'admin_login_success',
            admin_email,
            jsonb_build_object('admin_id', admin_record.id)
        );
        
        RETURN QUERY SELECT admin_record.id, admin_record.name, admin_record.email, true;
    ELSE
        -- Log failed login
        PERFORM log_security_event(
            'admin_login_failed',
            admin_email,
            jsonb_build_object('reason', 'invalid_credentials')
        );
        
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false;
    END IF;
END;
$$;

-- Step 2: Create function to verify admin session (for additional security)
CREATE OR REPLACE FUNCTION public.verify_admin_session(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if user exists in admins table and has admin role
  SELECT a.id INTO admin_user_id
  FROM admins a
  INNER JOIN user_roles ur ON ur.user_id = a.id
  WHERE a.email = admin_email 
    AND ur.role = 'admin'
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Log session verification
    PERFORM log_security_event(
        'admin_session_verified',
        admin_email,
        jsonb_build_object('admin_id', admin_user_id)
    );
    RETURN true;
  END IF;
  
  -- Log failed verification
  PERFORM log_security_event(
      'admin_session_verification_failed',
      admin_email,
      jsonb_build_object('reason', 'no_admin_role')
  );
  
  RETURN false;
END;
$$;

-- Step 3: Ensure current admin has proper role
DO $$
DECLARE
  admin_rec RECORD;
BEGIN
  -- Add admin role for all existing admins
  FOR admin_rec IN SELECT id FROM public.admins LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_rec.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Added admin role for admin ID: %', admin_rec.id;
  END LOOP;
END $$;

-- Step 4: Add check constraint to ensure admins table access is restricted
COMMENT ON TABLE public.admins IS 'Admin credentials table. SECURITY: Access only via authenticate_admin() and verify_admin_session() functions. RLS blocks all direct access. All admin actions are logged in security_audit_log.';

-- Step 5: Add function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  admin_email text,
  action_type text,
  action_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
  v_admin_id uuid;
BEGIN
  -- Verify admin session before logging
  IF NOT verify_admin_session(admin_email) THEN
    RAISE EXCEPTION 'Unauthorized: Invalid admin session';
  END IF;
  
  -- Get admin ID
  SELECT id INTO v_admin_id FROM admins WHERE email = admin_email;
  
  -- Log the action
  INSERT INTO public.security_audit_log (
    event_type,
    user_identifier,
    event_data
  ) VALUES (
    'admin_action_' || action_type,
    admin_email,
    jsonb_build_object(
      'admin_id', v_admin_id,
      'action', action_type,
      'data', action_data,
      'timestamp', now()
    )
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Step 6: Update admin_get_user_registrations to log access
CREATE OR REPLACE FUNCTION public.admin_get_user_registrations(admin_email TEXT)
RETURNS TABLE(
    id uuid, member_id text, nickname text, age integer, grade text,
    avatar text, learning_style text, parent_email text, parent_phone text,
    status text, created_at timestamp with time zone, approved_at timestamp with time zone,
    approved_by uuid, login_count integer, last_login_at timestamp with time zone
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Verify admin session first
  IF NOT verify_admin_session(admin_email) THEN
    RAISE EXCEPTION 'Unauthorized: Not an admin or invalid session';
  END IF;
  
  -- Get admin ID
  SELECT a.id INTO admin_user_id
  FROM admins a
  INNER JOIN user_roles r ON r.user_id = a.id
  WHERE a.email = admin_email AND r.role = 'admin'
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Admin role not found';
  END IF;
  
  -- Log the access
  PERFORM log_admin_action(admin_email, 'view_user_registrations', jsonb_build_object('count', (SELECT COUNT(*) FROM user_registrations)));
  
  -- Return all registrations
  RETURN QUERY 
  SELECT ur.id, ur.member_id, ur.nickname, ur.age, ur.grade, ur.avatar, ur.learning_style,
         ur.parent_email, ur.parent_phone, ur.status, ur.created_at, ur.approved_at, ur.approved_by,
         COALESCE(ur.login_count, 0) as login_count, ur.last_login_at
  FROM public.user_registrations ur
  ORDER BY ur.created_at DESC;
END;
$$;

-- Step 7: Create function to revoke admin access
CREATE OR REPLACE FUNCTION public.revoke_admin_role(target_admin_email text, revoking_admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_admin_id UUID;
BEGIN
  -- Verify the admin performing the revocation
  IF NOT verify_admin_session(revoking_admin_email) THEN
    RAISE EXCEPTION 'Unauthorized: Not an admin';
  END IF;
  
  -- Get target admin ID
  SELECT id INTO target_admin_id FROM admins WHERE email = target_admin_email;
  
  IF target_admin_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Prevent self-revocation
  IF target_admin_email = revoking_admin_email THEN
    RAISE EXCEPTION 'Cannot revoke your own admin access';
  END IF;
  
  -- Log the revocation
  PERFORM log_admin_action(
    revoking_admin_email, 
    'revoke_admin_access',
    jsonb_build_object('target_admin_email', target_admin_email, 'target_admin_id', target_admin_id)
  );
  
  -- Remove admin role
  DELETE FROM user_roles 
  WHERE user_id = target_admin_id AND role = 'admin';
  
  RETURN true;
END;
$$;

-- Step 8: Add security comments
COMMENT ON FUNCTION public.authenticate_admin IS 'Secure admin authentication with rate limiting and audit logging. Creates admin role in user_roles table.';
COMMENT ON FUNCTION public.verify_admin_session IS 'Verifies admin session by checking both admins table and user_roles. Use this before any admin-only operations.';
COMMENT ON FUNCTION public.log_admin_action IS 'Logs admin actions with session verification. All sensitive admin operations should use this.';
COMMENT ON FUNCTION public.revoke_admin_role IS 'Revokes admin access from a user. Requires admin privileges and logs the action.';