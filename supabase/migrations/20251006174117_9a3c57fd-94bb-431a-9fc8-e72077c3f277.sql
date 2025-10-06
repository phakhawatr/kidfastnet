-- Fix affiliate reward processing to correctly award points when referred users pay
DROP FUNCTION IF EXISTS public.process_affiliate_reward(text);

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
  v_reward_exists boolean;
BEGIN
  -- Get referred user (must be approved and paid)
  SELECT id INTO v_referred_id
  FROM user_registrations
  WHERE parent_email = p_referred_email 
    AND status = 'approved'
    AND payment_status = 'paid';
  
  IF v_referred_id IS NULL THEN
    RAISE NOTICE 'Referred user not found or not approved/paid: %', p_referred_email;
    RETURN false;
  END IF;
  
  -- Get referral record with status 'pending' (not 'completed')
  SELECT id, referrer_id INTO v_referral_id, v_referrer_id
  FROM affiliate_referrals
  WHERE referred_id = v_referred_id 
    AND status = 'pending';
  
  IF v_referral_id IS NULL THEN
    RAISE NOTICE 'No pending referral found for referred_id: %', v_referred_id;
    RETURN false;
  END IF;
  
  -- Check if reward already exists (prevent duplicates)
  SELECT EXISTS(
    SELECT 1 FROM affiliate_rewards 
    WHERE referral_id = v_referral_id
  ) INTO v_reward_exists;
  
  IF v_reward_exists THEN
    RAISE NOTICE 'Reward already exists for referral_id: %', v_referral_id;
    RETURN false;
  END IF;
  
  -- Update referral status to rewarded
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
  
  RAISE NOTICE 'Successfully awarded 50 points to referrer_id: % for referral_id: %', v_referrer_id, v_referral_id;
  RETURN true;
END;
$$;