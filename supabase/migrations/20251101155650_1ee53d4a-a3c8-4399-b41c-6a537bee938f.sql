-- Function to upgrade user to Premium subscription
CREATE OR REPLACE FUNCTION public.upgrade_to_premium(
  p_registration_id uuid,
  p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_admin_email text;
  v_user_email text;
BEGIN
  -- Get admin email
  SELECT email INTO v_admin_email
  FROM admins
  WHERE id = p_admin_id;
  
  IF v_admin_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user email
  SELECT parent_email INTO v_user_email
  FROM user_registrations
  WHERE id = p_registration_id;
  
  IF v_user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update user to Premium subscription
  UPDATE public.user_registrations 
  SET 
    subscription_tier = 'premium',
    ai_features_enabled = true,
    ai_monthly_quota = 100,
    ai_usage_count = 0,
    ai_quota_reset_date = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  WHERE id = p_registration_id 
    AND status = 'approved';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Log admin action
  PERFORM log_admin_action(
    v_admin_email,
    'upgrade_to_premium',
    jsonb_build_object(
      'registration_id', p_registration_id,
      'user_email', v_user_email,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$function$;

-- Function to downgrade user from Premium to Basic
CREATE OR REPLACE FUNCTION public.downgrade_to_basic(
  p_registration_id uuid,
  p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_admin_email text;
  v_user_email text;
BEGIN
  -- Get admin email
  SELECT email INTO v_admin_email
  FROM admins
  WHERE id = p_admin_id;
  
  IF v_admin_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user email
  SELECT parent_email INTO v_user_email
  FROM user_registrations
  WHERE id = p_registration_id;
  
  IF v_user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update user to Basic subscription
  UPDATE public.user_registrations 
  SET 
    subscription_tier = 'basic',
    ai_features_enabled = false,
    ai_monthly_quota = 0,
    ai_usage_count = 0,
    ai_quota_reset_date = NULL
  WHERE id = p_registration_id 
    AND status = 'approved';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Log admin action
  PERFORM log_admin_action(
    v_admin_email,
    'downgrade_to_basic',
    jsonb_build_object(
      'registration_id', p_registration_id,
      'user_email', v_user_email,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$function$;