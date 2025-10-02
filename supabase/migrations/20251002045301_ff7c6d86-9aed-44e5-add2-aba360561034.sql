-- Update the generate_affiliate_code function to handle existing codes properly
CREATE OR REPLACE FUNCTION public.generate_affiliate_code(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_code text;
  v_exists boolean;
  v_existing_code text;
BEGIN
  -- Check if user already has an affiliate code
  SELECT affiliate_code INTO v_existing_code
  FROM affiliate_codes
  WHERE user_id = p_user_id;
  
  -- If code exists, return it
  IF v_existing_code IS NOT NULL THEN
    RETURN v_existing_code;
  END IF;
  
  -- Generate new code
  LOOP
    -- Generate 8 character code
    v_code := upper(substring(md5(random()::text || p_user_id::text || now()::text) from 1 for 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM affiliate_codes WHERE affiliate_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  -- Insert the code with ON CONFLICT to handle race conditions
  INSERT INTO affiliate_codes (user_id, affiliate_code)
  VALUES (p_user_id, v_code)
  ON CONFLICT (user_id) DO UPDATE SET affiliate_code = EXCLUDED.affiliate_code
  RETURNING affiliate_code INTO v_code;
  
  RETURN v_code;
END;
$function$;