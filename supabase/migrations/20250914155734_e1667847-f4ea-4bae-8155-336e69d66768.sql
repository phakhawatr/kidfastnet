-- Fix security issues by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.reject_user_registration(registration_id UUID, admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_registrations 
  SET status = 'rejected', approved_by = admin_id, approved_at = now()
  WHERE id = registration_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;