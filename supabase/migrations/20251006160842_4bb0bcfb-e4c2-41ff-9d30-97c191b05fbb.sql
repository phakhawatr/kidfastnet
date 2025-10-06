-- Drop and recreate get_affiliate_referrals function with new return columns
DROP FUNCTION IF EXISTS public.get_affiliate_referrals(text);

CREATE OR REPLACE FUNCTION public.get_affiliate_referrals(p_user_email text)
 RETURNS TABLE(
   id uuid, 
   nickname text, 
   parent_email text, 
   signup_date timestamp with time zone, 
   payment_date timestamp with time zone, 
   payment_status text, 
   points_earned integer, 
   referral_status text,
   user_status text,
   approved_at timestamp with time zone
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user_id from email
  SELECT ur.id INTO v_user_id
  FROM user_registrations ur
  WHERE ur.parent_email = p_user_email
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    ur.id,
    ur.nickname,
    ur.parent_email,
    ur.created_at as signup_date,
    ur.payment_date,
    ur.payment_status,
    CASE 
      WHEN ar.status = 'rewarded' THEN 50
      ELSE 0
    END as points_earned,
    ar.status as referral_status,
    ur.status as user_status,
    ur.approved_at
  FROM user_registrations ur
  INNER JOIN affiliate_referrals ar ON ar.referred_id = ur.id
  WHERE ar.referrer_id = v_user_id
  ORDER BY ur.created_at DESC;
END;
$function$;