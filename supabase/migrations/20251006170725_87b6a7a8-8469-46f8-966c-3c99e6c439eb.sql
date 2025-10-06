-- Create function to mark payment as completed and process affiliate rewards
CREATE OR REPLACE FUNCTION public.mark_payment_completed(
  p_registration_id uuid,
  p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_parent_email text;
  v_admin_email text;
BEGIN
  -- Get parent email and admin email
  SELECT parent_email INTO v_parent_email
  FROM user_registrations
  WHERE id = p_registration_id;
  
  SELECT email INTO v_admin_email
  FROM admins
  WHERE id = p_admin_id;
  
  IF v_parent_email IS NULL OR v_admin_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update payment status and date
  UPDATE public.user_registrations 
  SET 
    payment_status = 'paid',
    payment_date = now()
  WHERE id = p_registration_id 
    AND status = 'approved'
    AND payment_status = 'pending';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Process affiliate reward (50 points to referrer)
  PERFORM process_affiliate_reward(v_parent_email);
  
  -- Log admin action
  PERFORM log_admin_action(
    v_admin_email,
    'mark_payment_completed',
    jsonb_build_object(
      'registration_id', p_registration_id,
      'parent_email', v_parent_email,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;

-- Create function to reset payment status
CREATE OR REPLACE FUNCTION public.reset_payment_status(
  p_registration_id uuid,
  p_admin_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_admin_email text;
BEGIN
  -- Get admin email
  SELECT email INTO v_admin_email
  FROM admins
  WHERE id = p_admin_id;
  
  IF v_admin_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Reset payment status and date
  UPDATE public.user_registrations 
  SET 
    payment_status = 'pending',
    payment_date = NULL
  WHERE id = p_registration_id 
    AND status = 'approved'
    AND payment_status = 'paid';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Log admin action
  PERFORM log_admin_action(
    v_admin_email,
    'reset_payment_status',
    jsonb_build_object(
      'registration_id', p_registration_id,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;