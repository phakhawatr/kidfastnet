-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.approve_user_registration(registration_id UUID, admin_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  reg_data RECORD;
BEGIN
  -- Get registration data
  SELECT * INTO reg_data FROM public.user_registrations WHERE id = registration_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update registration status
  UPDATE public.user_registrations 
  SET status = 'approved', approved_by = admin_id, approved_at = now()
  WHERE id = registration_id;
  
  -- Create user profile
  INSERT INTO public.profiles (
    user_id, nickname, age, grade, avatar, learning_style, 
    parent_email, parent_phone, is_approved
  ) VALUES (
    gen_random_uuid(), reg_data.nickname, reg_data.age, reg_data.grade, 
    reg_data.avatar, reg_data.learning_style, reg_data.parent_email, 
    reg_data.parent_phone, true
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;