-- Update the status column to allow suspended value
-- Since the column is already text, we just need to add functions

-- Create function to suspend/unsuspend user registration
CREATE OR REPLACE FUNCTION public.toggle_user_suspension(registration_id uuid, admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_status text;
BEGIN
  -- Get current status
  SELECT status INTO current_status 
  FROM public.user_registrations 
  WHERE id = registration_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Toggle between approved and suspended
  IF current_status = 'approved' THEN
    UPDATE public.user_registrations 
    SET status = 'suspended', approved_by = admin_id, approved_at = now()
    WHERE id = registration_id;
  ELSIF current_status = 'suspended' THEN
    UPDATE public.user_registrations 
    SET status = 'approved', approved_by = admin_id, approved_at = now()
    WHERE id = registration_id;
  ELSE
    -- Can only suspend/unsuspend approved or suspended users
    RETURN false;
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Create function to delete user registration
CREATE OR REPLACE FUNCTION public.delete_user_registration(registration_id uuid, admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete the registration record
  DELETE FROM public.user_registrations 
  WHERE id = registration_id;
  
  -- Also delete from profiles if exists (cleanup)
  DELETE FROM public.profiles 
  WHERE user_id = registration_id;
  
  RETURN FOUND;
END;
$$;