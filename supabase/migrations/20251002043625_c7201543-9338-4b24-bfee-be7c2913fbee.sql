-- Fix RLS policies for affiliate tables to avoid subquery issues

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own affiliate code" ON public.affiliate_codes;
DROP POLICY IF EXISTS "Users can insert their own affiliate code" ON public.affiliate_codes;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.affiliate_referrals;
DROP POLICY IF EXISTS "Users can view their own points" ON public.user_points;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.affiliate_rewards;

-- Create security definer function to check if user owns the affiliate code
CREATE OR REPLACE FUNCTION public.is_user_affiliate_owner(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_registrations
    WHERE id = p_user_id
    AND parent_email = auth.jwt()->>'email'
  )
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view their own affiliate code"
  ON public.affiliate_codes FOR SELECT
  USING (is_user_affiliate_owner(user_id));

CREATE POLICY "Users can insert their own affiliate code"
  ON public.affiliate_codes FOR INSERT
  WITH CHECK (is_user_affiliate_owner(user_id));

CREATE POLICY "Users can update their own affiliate code"
  ON public.affiliate_codes FOR UPDATE
  USING (is_user_affiliate_owner(user_id));

CREATE POLICY "Users can view their own referrals"
  ON public.affiliate_referrals FOR SELECT
  USING (is_user_affiliate_owner(referrer_id));

CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (is_user_affiliate_owner(user_id));

CREATE POLICY "Users can view their own rewards"
  ON public.affiliate_rewards FOR SELECT
  USING (is_user_affiliate_owner(user_id));

-- Make affiliate codes publicly readable for validation during signup
CREATE POLICY "Anyone can read affiliate codes for validation"
  ON public.affiliate_codes FOR SELECT
  USING (true);

-- Update get_user_affiliate_stats to handle null cases better
CREATE OR REPLACE FUNCTION public.get_user_affiliate_stats(p_user_email text)
RETURNS TABLE(
  affiliate_code text,
  total_referrals bigint,
  paid_referrals bigint,
  total_points integer,
  pending_referrals bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_code text;
BEGIN
  -- Get user_id from email
  SELECT ur.id INTO v_user_id
  FROM user_registrations ur
  WHERE ur.parent_email = p_user_email
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No user found with email: %', p_user_email;
    RETURN;
  END IF;
  
  -- Get affiliate code
  SELECT ac.affiliate_code INTO v_code
  FROM affiliate_codes ac
  WHERE ac.user_id = v_user_id;
  
  RETURN QUERY
  SELECT 
    COALESCE(v_code, ''),
    COUNT(DISTINCT ar.id),
    COUNT(DISTINCT CASE WHEN ur.payment_status = 'paid' THEN ar.id END),
    COALESCE(up.total_points, 0),
    COUNT(DISTINCT CASE WHEN ur.payment_status = 'pending' THEN ar.id END)
  FROM affiliate_codes ac
  LEFT JOIN affiliate_referrals ar ON ar.referrer_id = ac.user_id
  LEFT JOIN user_registrations ur ON ur.id = ar.referred_id
  LEFT JOIN user_points up ON up.user_id = ac.user_id
  WHERE ac.user_id = v_user_id
  GROUP BY ac.affiliate_code, up.total_points;
  
  -- If no affiliate code exists yet, return zeros
  IF NOT FOUND THEN
    RETURN QUERY SELECT ''::text, 0::bigint, 0::bigint, 0::integer, 0::bigint;
  END IF;
END;
$$;