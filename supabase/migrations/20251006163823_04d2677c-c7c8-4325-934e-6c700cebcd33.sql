-- Drop existing function
DROP FUNCTION IF EXISTS public.get_user_affiliate_stats(text);

-- Create improved function with better status tracking
CREATE OR REPLACE FUNCTION public.get_user_affiliate_stats(p_user_email text)
RETURNS TABLE(
  affiliate_code text,
  total_referrals bigint,
  paid_referrals bigint,
  total_points bigint,
  pending_referrals bigint,
  awaiting_approval_referrals bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_member_id text;
BEGIN
  -- Get user_id and member_id from email
  SELECT ur.id, ur.member_id INTO v_user_id, v_member_id
  FROM user_registrations ur
  WHERE ur.parent_email = p_user_email
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    v_member_id as affiliate_code,
    COUNT(*)::bigint as total_referrals,
    COUNT(CASE 
      WHEN ur.status = 'approved' AND ur.payment_status = 'paid' 
      THEN 1 
    END)::bigint as paid_referrals,
    (COUNT(CASE WHEN ar.status = 'rewarded' THEN 1 END) * 50)::bigint as total_points,
    COUNT(CASE 
      WHEN ur.status = 'approved' AND ur.payment_status = 'pending' 
      THEN 1 
    END)::bigint as pending_referrals,
    COUNT(CASE 
      WHEN ur.status = 'pending' 
      THEN 1 
    END)::bigint as awaiting_approval_referrals
  FROM affiliate_referrals ar
  INNER JOIN user_registrations ur ON ar.referred_id = ur.id
  WHERE ar.referrer_id = v_user_id;
END;
$function$;