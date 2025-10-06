-- Drop and recreate track_referral_signup to use member_id instead of affiliate_code
DROP FUNCTION IF EXISTS public.track_referral_signup(text, text);

CREATE OR REPLACE FUNCTION public.track_referral_signup(
  p_referred_email text,
  p_referrer_member_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_referred_id uuid;
BEGIN
  -- Find referrer by member_id
  SELECT id INTO v_referrer_id
  FROM user_registrations
  WHERE member_id = p_referrer_member_id
    AND status = 'approved'
  LIMIT 1;
  
  IF v_referrer_id IS NULL THEN
    RAISE NOTICE 'Referrer not found for member_id: %', p_referrer_member_id;
    RETURN;
  END IF;
  
  -- Find referred user
  SELECT id INTO v_referred_id
  FROM user_registrations
  WHERE parent_email = p_referred_email
  LIMIT 1;
  
  IF v_referred_id IS NULL THEN
    RAISE NOTICE 'Referred user not found: %', p_referred_email;
    RETURN;
  END IF;
  
  -- Insert referral record (use member_id as affiliate_code for backward compatibility)
  INSERT INTO affiliate_referrals (referrer_id, referred_id, affiliate_code, status)
  VALUES (v_referrer_id, v_referred_id, p_referrer_member_id, 'pending')
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Referral tracked: referrer_id=%, referred_id=%, member_id=%', 
    v_referrer_id, v_referred_id, p_referrer_member_id;
END;
$$;

-- Update get_user_affiliate_stats to work with member_id
DROP FUNCTION IF EXISTS public.get_user_affiliate_stats(text);

CREATE OR REPLACE FUNCTION public.get_user_affiliate_stats(p_user_email text)
RETURNS TABLE(
  affiliate_code text,
  total_referrals bigint,
  paid_referrals bigint,
  total_points bigint,
  pending_referrals bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    COUNT(CASE WHEN ur.payment_status = 'paid' THEN 1 END)::bigint as paid_referrals,
    (COUNT(CASE WHEN ar.status = 'rewarded' THEN 1 END) * 50)::bigint as total_points,
    COUNT(CASE WHEN ur.payment_status = 'pending' THEN 1 END)::bigint as pending_referrals
  FROM affiliate_referrals ar
  INNER JOIN user_registrations ur ON ar.referred_id = ur.id
  WHERE ar.referrer_id = v_user_id;
END;
$$;