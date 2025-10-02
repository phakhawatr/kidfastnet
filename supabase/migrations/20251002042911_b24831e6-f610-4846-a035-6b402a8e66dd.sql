-- Phase 1: Add affiliate fields to user_registrations
ALTER TABLE public.user_registrations 
ADD COLUMN IF NOT EXISTS referred_by_code text,
ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- Create affiliate_codes table
CREATE TABLE IF NOT EXISTS public.affiliate_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  affiliate_code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  affiliate_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

-- Create user_points table
CREATE TABLE IF NOT EXISTS public.user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create affiliate_rewards table
CREATE TABLE IF NOT EXISTS public.affiliate_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_registrations(id) ON DELETE CASCADE,
  referral_id uuid NOT NULL REFERENCES public.affiliate_referrals(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 50,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_codes
CREATE POLICY "Users can view their own affiliate code"
  ON public.affiliate_codes FOR SELECT
  USING (user_id = (SELECT id FROM public.user_registrations WHERE parent_email = auth.jwt()->>'email' LIMIT 1));

CREATE POLICY "Users can insert their own affiliate code"
  ON public.affiliate_codes FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM public.user_registrations WHERE parent_email = auth.jwt()->>'email' LIMIT 1));

-- RLS Policies for affiliate_referrals
CREATE POLICY "Users can view their own referrals"
  ON public.affiliate_referrals FOR SELECT
  USING (referrer_id = (SELECT id FROM public.user_registrations WHERE parent_email = auth.jwt()->>'email' LIMIT 1));

CREATE POLICY "System can insert referrals"
  ON public.affiliate_referrals FOR INSERT
  WITH CHECK (true);

-- RLS Policies for user_points
CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (user_id = (SELECT id FROM public.user_registrations WHERE parent_email = auth.jwt()->>'email' LIMIT 1));

CREATE POLICY "Users can update their own points"
  ON public.user_points FOR UPDATE
  USING (user_id = (SELECT id FROM public.user_registrations WHERE parent_email = auth.jwt()->>'email' LIMIT 1));

CREATE POLICY "System can insert points"
  ON public.user_points FOR INSERT
  WITH CHECK (true);

-- RLS Policies for affiliate_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.affiliate_rewards FOR SELECT
  USING (user_id = (SELECT id FROM public.user_registrations WHERE parent_email = auth.jwt()->>'email' LIMIT 1));

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    -- Generate 8 character code
    v_code := upper(substring(md5(random()::text || p_user_id::text || now()::text) from 1 for 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM affiliate_codes WHERE affiliate_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  -- Insert the code
  INSERT INTO affiliate_codes (user_id, affiliate_code)
  VALUES (p_user_id, v_code)
  ON CONFLICT (user_id) DO UPDATE SET affiliate_code = v_code;
  
  RETURN v_code;
END;
$$;

-- Function to get affiliate referrals for a user
CREATE OR REPLACE FUNCTION public.get_affiliate_referrals(p_user_email text)
RETURNS TABLE(
  id uuid,
  nickname text,
  parent_email text,
  signup_date timestamp with time zone,
  payment_date timestamp with time zone,
  payment_status text,
  points_earned integer,
  referral_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    ar.status as referral_status
  FROM user_registrations ur
  INNER JOIN affiliate_referrals ar ON ar.referred_id = ur.id
  WHERE ar.referrer_id = v_user_id
  ORDER BY ur.created_at DESC;
END;
$$;

-- Function to track referral signup
CREATE OR REPLACE FUNCTION public.track_referral_signup(p_referred_email text, p_affiliate_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_referred_id uuid;
BEGIN
  -- Get referrer user_id from affiliate code
  SELECT user_id INTO v_referrer_id
  FROM affiliate_codes
  WHERE affiliate_code = p_affiliate_code AND is_active = true;
  
  IF v_referrer_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get referred user_id
  SELECT id INTO v_referred_id
  FROM user_registrations
  WHERE parent_email = p_referred_email;
  
  IF v_referred_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Prevent self-referral
  IF v_referrer_id = v_referred_id THEN
    RETURN false;
  END IF;
  
  -- Insert referral record
  INSERT INTO affiliate_referrals (referrer_id, referred_id, affiliate_code, status)
  VALUES (v_referrer_id, v_referred_id, p_affiliate_code, 'pending')
  ON CONFLICT (referred_id) DO NOTHING;
  
  -- Update user_registrations with referred_by_code
  UPDATE user_registrations
  SET referred_by_code = p_affiliate_code
  WHERE id = v_referred_id;
  
  RETURN true;
END;
$$;

-- Function to process affiliate reward
CREATE OR REPLACE FUNCTION public.process_affiliate_reward(p_referred_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referred_id uuid;
  v_referrer_id uuid;
  v_referral_id uuid;
BEGIN
  -- Get referred user
  SELECT id INTO v_referred_id
  FROM user_registrations
  WHERE parent_email = p_referred_email AND payment_status = 'paid';
  
  IF v_referred_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get referral record
  SELECT id, referrer_id INTO v_referral_id, v_referrer_id
  FROM affiliate_referrals
  WHERE referred_id = v_referred_id AND status = 'completed';
  
  IF v_referral_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update referral status
  UPDATE affiliate_referrals
  SET status = 'rewarded'
  WHERE id = v_referral_id;
  
  -- Add reward record
  INSERT INTO affiliate_rewards (user_id, referral_id, points)
  VALUES (v_referrer_id, v_referral_id, 50);
  
  -- Update user points
  INSERT INTO user_points (user_id, total_points)
  VALUES (v_referrer_id, 50)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + 50,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Function to get user affiliate stats
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
    ac.affiliate_code,
    COUNT(ar.id) as total_referrals,
    COUNT(CASE WHEN ur.payment_status = 'paid' THEN 1 END) as paid_referrals,
    COALESCE(up.total_points, 0) as total_points,
    COUNT(CASE WHEN ur.payment_status = 'pending' THEN 1 END) as pending_referrals
  FROM affiliate_codes ac
  LEFT JOIN affiliate_referrals ar ON ar.referrer_id = ac.user_id
  LEFT JOIN user_registrations ur ON ur.id = ar.referred_id
  LEFT JOIN user_points up ON up.user_id = ac.user_id
  WHERE ac.user_id = v_user_id
  GROUP BY ac.affiliate_code, up.total_points;
END;
$$;