-- Update admin authentication to use proper password hashing
-- First, let's update the authenticate_admin function to use proper bcrypt hashing

CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email text, admin_password text)
RETURNS TABLE(admin_id uuid, name text, email text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- Find admin by email
    SELECT a.id, a.name, a.email, a.password_hash 
    INTO admin_record
    FROM public.admins a 
    WHERE a.email = admin_email;
    
    -- Check if admin exists and password matches using crypt function for bcrypt
    IF admin_record.id IS NOT NULL AND admin_record.password_hash = crypt(admin_password, admin_record.password_hash) THEN
        RETURN QUERY SELECT admin_record.id, admin_record.name, admin_record.email, true;
    ELSE
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false;
    END IF;
END;
$$;

-- Update existing admin passwords to use bcrypt hashing
-- This will hash the current plain text passwords
UPDATE public.admins 
SET password_hash = crypt(password_hash, gen_salt('bf'))
WHERE password_hash NOT LIKE '$2%'; -- Only update if not already hashed

-- Add a trigger function to automatically hash admin passwords on insert/update
CREATE OR REPLACE FUNCTION public.hash_admin_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Only hash if the password doesn't start with $2 (bcrypt hash indicator)
  IF NEW.password_hash IS NOT NULL AND NEW.password_hash NOT LIKE '$2%' THEN
    NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS hash_admin_password_trigger ON public.admins;
CREATE TRIGGER hash_admin_password_trigger
    BEFORE INSERT OR UPDATE ON public.admins
    FOR EACH ROW
    EXECUTE FUNCTION public.hash_admin_password();

-- Create a function to create Supabase Auth users from approved registrations
CREATE OR REPLACE FUNCTION public.create_auth_user_from_registration(registration_id uuid, admin_id uuid)
RETURNS TABLE(success boolean, auth_user_id uuid, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    reg_data RECORD;
    new_user_id uuid;
BEGIN
    -- Get registration data
    SELECT * INTO reg_data 
    FROM public.user_registrations 
    WHERE id = registration_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::uuid, 'Registration not found or already processed'::text;
        RETURN;
    END IF;
    
    -- Update registration status to approved
    UPDATE public.user_registrations 
    SET status = 'approved', approved_by = admin_id, approved_at = now()
    WHERE id = registration_id;
    
    -- Create profile record with user info
    INSERT INTO public.profiles (
        user_id, nickname, age, grade, avatar, learning_style, 
        parent_email, parent_phone, is_approved
    ) VALUES (
        gen_random_uuid(), -- Temporary ID until real auth user is created
        reg_data.nickname,
        reg_data.age,
        reg_data.grade,
        reg_data.avatar,
        reg_data.learning_style,
        reg_data.parent_email,
        reg_data.parent_phone,
        true
    );
    
    RETURN QUERY SELECT true, gen_random_uuid(), 'User registration approved. Admin should create auth account manually.'::text;
END;
$$;

-- Update the approve_user_registration function to use the new function
CREATE OR REPLACE FUNCTION public.approve_user_registration(registration_id uuid, admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result_record RECORD;
BEGIN
  -- Use the new function to create auth user
  SELECT * INTO result_record 
  FROM public.create_auth_user_from_registration(registration_id, admin_id);
  
  RETURN result_record.success;
END;
$$;