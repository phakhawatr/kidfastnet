-- ============================================
-- CRITICAL SECURITY FIX: Customer Data Protection
-- ============================================

-- Step 1: Create app roles enum for RBAC
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'parent', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 4: Fix affiliate_referrals - Remove unrestricted INSERT policy
DROP POLICY IF EXISTS "System can insert referrals" ON public.affiliate_referrals;

-- Create restrictive policy that blocks direct inserts
CREATE POLICY "Block direct referral inserts"
ON public.affiliate_referrals
AS RESTRICTIVE
FOR INSERT
WITH CHECK (false);

-- Step 5: Add permissive SELECT policy for user_registrations
CREATE POLICY "Users can view own registration data"
ON public.user_registrations
FOR SELECT
TO public
USING (
  parent_email = current_setting('request.jwt.claims', true)::json->>'email'
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = (
      SELECT id FROM public.user_registrations 
      WHERE parent_email = current_setting('request.jwt.claims', true)::json->>'email'
      LIMIT 1
    )
    AND ur.role = 'admin'
  )
);

-- Step 6: Create secure admin function
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
  SELECT ur.id INTO admin_user_id
  FROM user_registrations ur
  INNER JOIN user_roles r ON r.user_id = ur.id
  WHERE ur.parent_email = admin_email AND r.role = 'admin'
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Not an admin';
  END IF;
  
  PERFORM log_security_event('admin_view_registrations', admin_email, jsonb_build_object('timestamp', now()));
  
  RETURN QUERY 
  SELECT ur.id, ur.member_id, ur.nickname, ur.age, ur.grade, ur.avatar, ur.learning_style,
         ur.parent_email, ur.parent_phone, ur.status, ur.created_at, ur.approved_at, ur.approved_by,
         COALESCE(ur.login_count, 0) as login_count, ur.last_login_at
  FROM public.user_registrations ur
  ORDER BY ur.created_at DESC;
END;
$$;

-- Step 7: Add server-side rate limiting to authenticate_user
CREATE OR REPLACE FUNCTION public.authenticate_user(user_email text, user_password text)
RETURNS TABLE(user_id uuid, member_id text, nickname text, email text, is_valid boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_record RECORD;
    attempt_count INTEGER;
BEGIN
    PERFORM log_security_event('login_attempt', user_email, jsonb_build_object('timestamp', now()));
    
    SELECT COUNT(*) INTO attempt_count
    FROM security_audit_log
    WHERE user_identifier = user_email
      AND event_type = 'login_attempt'
      AND created_at > (now() - interval '15 minutes');
    
    IF attempt_count > 10 THEN
        PERFORM log_security_event('login_rate_limit_exceeded', user_email, jsonb_build_object('attempt_count', attempt_count));
        RAISE EXCEPTION 'Too many login attempts. Please try again later.';
    END IF;
    
    SELECT ur.id, ur.member_id, ur.nickname, ur.parent_email, ur.password_hash 
    INTO user_record
    FROM public.user_registrations ur 
    WHERE ur.parent_email = user_email AND ur.password_hash = user_password AND ur.status = 'approved';
    
    IF user_record.id IS NOT NULL THEN
        UPDATE public.user_registrations 
        SET is_online = true, login_count = COALESCE(login_count, 0) + 1,
            last_login_at = now(), last_activity_at = now()
        WHERE id = user_record.id;
        
        PERFORM log_security_event('login_success', user_email, jsonb_build_object('user_id', user_record.id));
        RETURN QUERY SELECT user_record.id, user_record.member_id, user_record.nickname, user_record.parent_email, true;
    ELSE
        PERFORM log_security_event('login_failed', user_email, jsonb_build_object('reason', 'invalid_credentials'));
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, false;
    END IF;
END;
$$;

-- Step 8: Fix security_audit_log RLS
CREATE POLICY "Admins can view audit logs"
ON public.security_audit_log
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.user_registrations u ON u.id = ur.user_id
    WHERE u.parent_email = current_setting('request.jwt.claims', true)::json->>'email'
    AND ur.role = 'admin'
  )
);

-- Step 9: Update track_referral_signup
CREATE OR REPLACE FUNCTION public.track_referral_signup(p_referred_email text, p_affiliate_code text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_referrer_id uuid;
  v_referred_id uuid;
BEGIN
  SELECT user_id INTO v_referrer_id FROM affiliate_codes
  WHERE affiliate_code = p_affiliate_code AND is_active = true;
  
  IF v_referrer_id IS NULL THEN
    PERFORM log_security_event('affiliate_invalid_code', p_referred_email, jsonb_build_object('affiliate_code', p_affiliate_code));
    RETURN false;
  END IF;
  
  SELECT id INTO v_referred_id FROM user_registrations WHERE parent_email = p_referred_email;
  IF v_referred_id IS NULL THEN RETURN false; END IF;
  
  IF v_referrer_id = v_referred_id THEN
    PERFORM log_security_event('affiliate_self_referral_blocked', p_referred_email, jsonb_build_object('affiliate_code', p_affiliate_code));
    RETURN false;
  END IF;
  
  PERFORM log_security_event('affiliate_referral_tracked', p_referred_email, jsonb_build_object('affiliate_code', p_affiliate_code, 'referrer_id', v_referrer_id));
  
  INSERT INTO affiliate_referrals (referrer_id, referred_id, affiliate_code, status)
  VALUES (v_referrer_id, v_referred_id, p_affiliate_code, 'pending')
  ON CONFLICT (referred_id) DO NOTHING;
  
  UPDATE user_registrations SET referred_by_code = p_affiliate_code WHERE id = v_referred_id;
  RETURN true;
END;
$$;

-- Step 10: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_identifier ON public.security_audit_log(user_identifier);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);

-- Step 11: Add RLS for user_roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL TO public
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.user_registrations u ON u.id = ur.user_id
    WHERE u.parent_email = current_setting('request.jwt.claims', true)::json->>'email'
    AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.user_registrations u ON u.id = ur.user_id
    WHERE u.parent_email = current_setting('request.jwt.claims', true)::json->>'email'
    AND ur.role = 'admin'
  )
);

-- Step 12: Add documentation
COMMENT ON TABLE public.user_registrations IS 'Sensitive user data. Access controlled by RLS + secure functions.';
COMMENT ON TABLE public.admins IS 'Admin credentials. RLS blocks direct access - use authenticate_admin only.';
COMMENT ON TABLE public.affiliate_referrals IS 'Affiliate tracking. INSERT via track_referral_signup function only.';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check roles (prevents RLS recursion).';
COMMENT ON FUNCTION public.track_referral_signup IS 'Secure function for affiliate referrals with validation and audit logging.';