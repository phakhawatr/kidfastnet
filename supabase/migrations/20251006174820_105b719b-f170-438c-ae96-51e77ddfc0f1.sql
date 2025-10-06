-- Retroactively process affiliate rewards for all paid referred users
-- This script will award 50 points for each referred user who is approved and paid
-- but hasn't received their reward yet

DO $$
DECLARE
  v_referral RECORD;
  v_points_to_add INTEGER;
BEGIN
  -- Loop through all pending referrals where the referred user is approved and paid
  FOR v_referral IN
    SELECT 
      ar.id as referral_id,
      ar.referrer_id,
      ar.referred_id,
      ur.parent_email as referred_email
    FROM affiliate_referrals ar
    INNER JOIN user_registrations ur ON ar.referred_id = ur.id
    WHERE ar.status = 'pending'
      AND ur.status = 'approved'
      AND ur.payment_status = 'paid'
      AND NOT EXISTS (
        SELECT 1 FROM affiliate_rewards 
        WHERE referral_id = ar.id
      )
  LOOP
    -- Update referral status to rewarded
    UPDATE affiliate_referrals
    SET status = 'rewarded'
    WHERE id = v_referral.referral_id;
    
    -- Add reward record
    INSERT INTO affiliate_rewards (user_id, referral_id, points)
    VALUES (v_referral.referrer_id, v_referral.referral_id, 50);
    
    -- Update user points (insert or update)
    INSERT INTO user_points (user_id, total_points)
    VALUES (v_referral.referrer_id, 50)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_points = user_points.total_points + 50,
      updated_at = now();
    
    RAISE NOTICE 'Processed reward for referral_id: %, referrer_id: %, referred: %', 
      v_referral.referral_id, v_referral.referrer_id, v_referral.referred_email;
  END LOOP;
  
  RAISE NOTICE 'Retroactive affiliate reward processing completed';
END $$;