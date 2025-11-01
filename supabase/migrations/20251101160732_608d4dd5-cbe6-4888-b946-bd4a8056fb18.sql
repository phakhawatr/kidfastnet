-- Update admin_get_user_registrations to include subscription and AI fields
CREATE OR REPLACE FUNCTION public.admin_get_user_registrations(admin_email text)
 RETURNS TABLE(
   id uuid, 
   member_id text, 
   nickname text, 
   age integer, 
   grade text, 
   avatar text, 
   learning_style text, 
   parent_email text, 
   parent_phone text, 
   status text, 
   payment_status text, 
   payment_date timestamp with time zone, 
   created_at timestamp with time zone, 
   approved_at timestamp with time zone, 
   approved_by uuid, 
   login_count integer, 
   last_login_at timestamp with time zone,
   subscription_tier text,
   ai_features_enabled boolean,
   ai_monthly_quota integer,
   ai_usage_count integer
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Return all registrations with payment and subscription fields
  RETURN QUERY 
  SELECT 
    ur.id, 
    ur.member_id, 
    ur.nickname, 
    ur.age, 
    ur.grade, 
    ur.avatar, 
    ur.learning_style,
    ur.parent_email, 
    ur.parent_phone, 
    ur.status,
    ur.payment_status,
    ur.payment_date,
    ur.created_at, 
    ur.approved_at, 
    ur.approved_by,
    COALESCE(ur.login_count, 0) as login_count, 
    ur.last_login_at,
    ur.subscription_tier,
    ur.ai_features_enabled,
    ur.ai_monthly_quota,
    ur.ai_usage_count
  FROM public.user_registrations ur
  ORDER BY ur.created_at DESC;
END;
$function$;